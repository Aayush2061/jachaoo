// app/(home)/reports/analyze.tsx
import { useAuth, useUser } from "@clerk/clerk-expo";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ReportAnalysis() {
  const { user } = useUser();
  const router = useRouter();
  const { userId, getToken } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reportName, setReportName] = useState("");
  const [labName, setLabName] = useState("");
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(
    null
  );
  const [mediaPermission, setMediaPermission] = useState<boolean | null>(null);
  const [errors, setErrors] = useState({
    reportName: false,
    labName: false,
  });
  const reportNameRef = useRef<TextInput>(null);
  const labNameRef = useRef<TextInput>(null);

  // Add this validation function
  const validateForm = () => {
    const newErrors = {
      reportName: reportName.trim() === "",
      labName: labName.trim() === "",
    };

    setErrors(newErrors);

    if (newErrors.reportName || newErrors.labName) {
      // Focus on the first error field
      if (newErrors.reportName) {
        reportNameRef.current?.focus();
      } else if (newErrors.labName) {
        labNameRef.current?.focus();
      }
      return false;
    }

    return true;
  };

  useEffect(() => {
    const checkPermissions = async () => {
      const { status: cameraStatus } =
        await ImagePicker.getCameraPermissionsAsync();
      setCameraPermission(cameraStatus === "granted");

      const { status: mediaStatus } =
        await ImagePicker.getMediaLibraryPermissionsAsync();
      setMediaPermission(mediaStatus === "granted");
    };

    checkPermissions();
  }, []);

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        if (!user?.id) return;

        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/health/${user.id}`
        );
        const data = await response.json();
        setHealthData(data);
      } catch (error) {
        console.error("Error fetching health data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
  }, [user?.id]);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    setCameraPermission(status === "granted");
    return status === "granted";
  };

  const requestMediaPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    setMediaPermission(status === "granted");
    return status === "granted";
  };

  const takePhoto = async () => {
    try {
      const hasPermission =
        cameraPermission || (await requestCameraPermission());
      if (!hasPermission) {
        Alert.alert(
          "Permission required",
          "Please enable camera access in settings"
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const pickImage = async () => {
    try {
      const hasPermission = mediaPermission || (await requestMediaPermission());
      if (!hasPermission) {
        Alert.alert(
          "Permission required",
          "Please enable photo library access in settings"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const compressImage = async (uri: string) => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1000 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      return manipResult.uri;
    } catch (error: any) {
      throw new Error(`Compression failed: ${error.message}`);
    }
  };

  const uploadToCloudinary = async (uri: string) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const formData = new FormData();
      formData.append("file", `data:image/jpeg;base64,${base64}`);
      formData.append(
        "upload_preset",
        process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET
      );
      formData.append("folder", `user_${userId}/reports`);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        { method: "POST", body: formData }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Upload failed");

      return {
        url: data.secure_url,
        cloudinaryId: data.public_id,
      };
    } catch (error: any) {
      throw new Error(`Upload failed: ${error.message}`);
    }
  };

  const analyzeAndSaveReport = async (
    imageUrl: string,
    cloudinaryId: string
  ) => {
    try {
      const token = await getToken();

      const healthConditions = {
        diabetes: healthData?.diabetes || "Don't know",
        hypertension: healthData?.bloodPressure || "Don't know",
        smoker: healthData?.smoker || "Don't know",
      };

      const analysisResponse = await fetch(
        `${process.env.EXPO_PUBLIC_FLASK_API_URL}/reports/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            url: imageUrl,
            ...healthConditions,
          }),
        }
      );

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json();
        console.error("Flask analysis error:", errorData);
        throw new Error(errorData.message || "Analysis failed");
      }

      const analysisData = await analysisResponse.json();

      const saveResponse = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/reports`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            url: imageUrl,
            cloudinaryId: cloudinaryId,
            analysis: analysisData.analysis,
            reportName,
            labName,
          }),
        }
      );

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        console.error("Node.js save error:", errorData);
        throw new Error(errorData.error || "Failed to save report");
      }

      const savedReport = await saveResponse.json();
      return savedReport;
    } catch (error: any) {
      console.error("Full error in analyzeAndSaveReport:", error);
      throw new Error(`Analysis failed: ${error.message}`);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!image || !userId) return;

    // Validate form before proceeding
    if (!validateForm()) {
      Alert.alert(
        "Missing Information",
        "Please fill in all required fields before submitting."
      );
      return;
    }

    setIsLoading(true);
    try {
      const compressedUri = await compressImage(image);
      const cloudinaryData = await uploadToCloudinary(compressedUri);
      const savedReport = await analyzeAndSaveReport(
        cloudinaryData.url,
        cloudinaryData.cloudinaryId
      );

      router.replace({
        pathname: `/(home)/reports/${savedReport._id}`,
        params: { shouldRefresh: "true" },
      });

      setTimeout(
        () => Alert.alert("Success", "Report analyzed successfully!"),
        500
      );
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#f7f9fc", "#eef2f5"]}
      style={styles.gradientContainer}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Analyze Medical Report</Text>

        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Report Details</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Report Type *</Text>
            <TextInput
              ref={reportNameRef}
              style={[styles.input, errors.reportName && styles.inputError]}
              placeholder="e.g., Blood Test, Thyroid Test"
              value={reportName}
              onChangeText={(text) => {
                setReportName(text);
                setErrors((prev) => ({ ...prev, reportName: false }));
              }}
              placeholderTextColor="#999"
            />
            {errors.reportName && (
              <Text style={styles.errorText}>Report type is required</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Lab Name *</Text>
            <TextInput
              ref={labNameRef}
              style={[styles.input, errors.labName && styles.inputError]}
              placeholder="e.g., City Lab, Health Diagnostics"
              value={labName}
              onChangeText={(text) => {
                setLabName(text);
                setErrors((prev) => ({ ...prev, labName: false }));
              }}
              placeholderTextColor="#999"
            />
            {errors.labName && (
              <Text style={styles.errorText}>Lab name is required</Text>
            )}
          </View>

          <Text style={styles.sectionTitle}>Upload Report</Text>
          <Text style={styles.subtitle}>
            Take a photo or select from your gallery
          </Text>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cameraButton]}
              onPress={takePhoto}
              disabled={isLoading}
            >
              <MaterialIcons name="photo-camera" size={24} color="white" />
              <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.galleryButton]}
              onPress={pickImage}
              disabled={isLoading}
            >
              <MaterialIcons name="photo-library" size={24} color="white" />
              <Text style={styles.buttonText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>

          {image && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: image }}
                style={styles.imagePreview}
                resizeMode="contain"
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => setImage(null)}
              >
                <MaterialIcons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
          )}

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4a90e2" />
              <Text style={styles.loadingText}>Processing your report...</Text>
            </View>
          ) : image ? (
            <TouchableOpacity
              style={styles.analyzeButton}
              onPress={handleUploadAndAnalyze}
              disabled={isLoading}
            >
              <Text style={styles.analyzeButtonText}>
                <FontAwesome name="magic" size={16} color="white" /> Analyze
                Report
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 24,
    color: "#2c3e50",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 12,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#34495e",
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderColor: "#dfe6e9",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    backgroundColor: "#f8f9fa",
    fontSize: 15,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: "48%",
  },
  cameraButton: {
    backgroundColor: "#4a90e2",
  },
  galleryButton: {
    backgroundColor: "#00b894",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 8,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 20,
  },
  imagePreview: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dfe6e9",
  },
  removeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    marginVertical: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#7f8c8d",
  },
  analyzeButton: {
    backgroundColor: "#6c5ce7",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  analyzeButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  inputError: {
    borderColor: "#e74c3c",
    backgroundColor: "#fadbd8",
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
