import { useAuth } from "@clerk/clerk-expo";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Make sure these are in your app.json or environment variables
const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME; // Replace with your cloud name
const CLOUDINARY_UPLOAD_PRESET = `${process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET}`; // Replace with your preset

export default function ReportAnalysis() {
  // console.log(process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
  const { userId, getToken } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<{
    url: string;
    cloudinaryId: string;
  } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      // Add folder parameter instead of custom path
      formData.append("folder", `user_${userId}/reports`);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Cloudinary error details:", data);
        throw new Error(data.error?.message || "Upload failed");
      }

      return {
        url: data.secure_url,
        cloudinaryId: data.public_id, // This will be the auto-generated ID
      };
    } catch (error: any) {
      console.error("Full upload error:", error);
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  };

  const saveToDatabase = async (url: string, cloudinaryId: string) => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/reports`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId,
            cloudinaryId,
            url,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save to database");
      }

      return await response.json();
    } catch (error: any) {
      console.error("Database save error:", error);
      throw new Error(`Database save failed: ${error.message}`);
    }
  };

  const analyzeReport = async (imageUrl: string) => {
    try {
      setIsAnalyzing(true);
      const token = await getToken();

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_FLASK_API_URL}/reports/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            url: imageUrl,
          }),
        }
      );

      // Add these debug logs:
      const responseText = await response.text();
      console.log("RAW RESPONSE:", responseText);
      console.log("STATUS:", response.status);

      const data = JSON.parse(responseText);
      console.log("PARSED DATA:", data);

      if (!response.ok) {
        throw new Error(data.message || "Analysis failed");
      }

      setAnalysisResult(data);
      return data;
    } catch (error) {
      console.error("Analysis error:", error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageUpload = async () => {
    if (!image || !userId) return;

    setIsLoading(true);
    setUploadProgress(0);

    try {
      // 1. Compress image
      const compressedUri = await compressImage(image);
      setUploadProgress(0.2);

      // 2. Upload to Cloudinary
      const cloudinaryResult = await uploadToCloudinary(compressedUri);
      setUploadProgress(0.6);

      // 3. Save to database
      await saveToDatabase(cloudinaryResult.url, cloudinaryResult.cloudinaryId);
      setUploadProgress(0.8);

      // 4. Analyze the report
      await analyzeReport(cloudinaryResult.url);
      setUploadProgress(1);

      setReportData({
        url: cloudinaryResult.url,
        cloudinaryId: cloudinaryResult.cloudinaryId,
      });

      Alert.alert("Success", "Report uploaded and analyzed successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

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
      setReportData(null);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Medical Report Analysis</Text>

      <Button
        title="Select Report Image"
        onPress={pickImage}
        disabled={isLoading || isAnalyzing}
      />

      {image && (
        <Image
          source={{ uri: image }}
          style={styles.imagePreview}
          resizeMode="contain"
        />
      )}

      {(isLoading || isAnalyzing) && (
        <View style={styles.progressContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text>
            {isAnalyzing ? "Analyzing..." : "Uploading..."}{" "}
            {Math.round(uploadProgress * 100)}%
          </Text>
        </View>
      )}

      {image && !isLoading && !isAnalyzing && (
        <Button
          title="Upload & Analyze Report"
          onPress={handleImageUpload}
          color="#28a745"
        />
      )}

      {reportData && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>Upload successful!</Text>
          <Text numberOfLines={1} style={styles.urlText}>
            Cloudinary ID: {reportData.cloudinaryId}
          </Text>
        </View>
      )}

      {analysisResult?.status === "success" ? (
        <View style={styles.analysisContainer}>
          <Text style={styles.analysisTitle}>Analysis Results</Text>
          <ScrollView
            style={styles.analysisScrollView}
            contentContainerStyle={styles.analysisContent}
          >
            <Text style={styles.analysisText}>{analysisResult.analysis}</Text>
          </ScrollView>
        </View>
      ) : (
        <Text style={styles.noResultsText}>
          {analysisResult?.status === "error"
            ? analysisResult.message
            : "No analysis available"}
        </Text>
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
    color: "#333",
  },
  imagePreview: {
    width: "100%",
    height: 300,
    marginVertical: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  progressContainer: {
    marginVertical: 20,
    alignItems: "center",
  },
  successContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#e6f7e6",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#c3e6cb",
  },
  successText: {
    color: "#155724",
    fontWeight: "bold",
  },
  urlText: {
    color: "#155724",
    marginTop: 5,
    fontSize: 12,
  },
  analysisContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#e7f5ff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d0ebff",
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1864ab",
  },
  analysisText: {
    color: "#364fc7",
    lineHeight: 20,
    marginBottom: 4,
  },
  sectionHeader: {
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 10,
    color: "#1c7ed6",
  },
  listItem: {
    marginLeft: 15,
  },
  analysisScrollView: {
    // maxHeight: 400, // Increased height
    width: "100%",
  },
  analysisContent: {
    paddingBottom: 20, // Add padding for scroll
  },
  noResultsText: {
    color: "#6c757d",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
});
