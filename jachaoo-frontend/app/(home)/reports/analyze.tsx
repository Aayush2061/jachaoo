// app/(home)/reports/analyze.tsx
import { useAuth } from "@clerk/clerk-expo";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function ReportAnalysis() {
  const router = useRouter();
  const { userId, getToken } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reportName, setReportName] = useState("");
  const [labName, setLabName] = useState("");

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please enable photo library access");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
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

      // 1. Get analysis from Flask
      console.log("Getting analysis from Flask...");
      const analysisResponse = await fetch(
        `${process.env.EXPO_PUBLIC_FLASK_API_URL}/reports/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ url: imageUrl }),
        }
      );

      // Check Flask response
      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json();
        console.error("Flask analysis error:", errorData);
        throw new Error(errorData.message || "Analysis failed");
      }

      const analysisData = await analysisResponse.json();
      console.log("Analysis received:", analysisData);

      // 2. Save to Node.js backend
      console.log("Saving to Node.js backend...");
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
            cloudinaryId: cloudinaryId, // Now using the passed parameter
            analysis: analysisData.analysis,
            reportName,
            labName,
          }),
        }
      );

      // Check Node.js response
      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        console.error("Node.js save error:", errorData);
        throw new Error(errorData.error || "Failed to save report");
      }

      const savedReport = await saveResponse.json();
      console.log("Report saved:", savedReport);
      return savedReport;
    } catch (error: any) {
      console.error("Full error in analyzeAndSaveReport:", error);
      throw new Error(`Analysis failed: ${error.message}`);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!image || !userId) return;

    setIsLoading(true);
    try {
      // 1. Compress image
      const compressedUri = await compressImage(image);

      // 2. Upload to Cloudinary
      const cloudinaryData = await uploadToCloudinary(compressedUri);

      // 3. Analyze and save to your database
      const savedReport = await analyzeAndSaveReport(
        cloudinaryData.url,
        cloudinaryData.cloudinaryId // Add this parameter
      );

      // 4. Redirect to detail view
      //   router.push(`/(home)/reports/${savedReport._id}`);
      // Reset navigation stack so back button goes to reports gallery
      router.replace({
        pathname: `/(home)/reports/${savedReport._id}`,
        params: { shouldRefresh: "true" }, // Force refresh gallery
      });

      // Optional: Show success message
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Medical Report Analysis</Text>
      <Text style={styles.label}>Report Type</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Blood Test, Thyroid Test"
        value={reportName}
        onChangeText={setReportName}
      />

      <Text style={styles.label}>Lab Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., City Lab, Health Diagnostics"
        value={labName}
        onChangeText={setLabName}
      />

      <Button
        title="Select Report Image"
        onPress={pickImage}
        disabled={isLoading}
      />

      {image && (
        <Image
          source={{ uri: image }}
          style={styles.imagePreview}
          resizeMode="contain"
        />
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text>Processing...</Text>
        </View>
      )}

      {image && !isLoading && (
        <Button
          title="Upload & Analyze"
          onPress={handleUploadAndAnalyze}
          color="#28a745"
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  imagePreview: {
    width: "100%",
    height: 300,
    marginVertical: 20,
    borderRadius: 8,
  },
  loadingContainer: {
    marginVertical: 20,
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
});
