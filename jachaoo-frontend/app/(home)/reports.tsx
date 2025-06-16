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
  StyleSheet,
  Text,
  View,
} from "react-native";

// Make sure these are in your app.json or environment variables
const CLOUDINARY_CLOUD_NAME = "drgny2hcw"; // Replace with your cloud name
const CLOUDINARY_UPLOAD_PRESET = "medical_reports_mobile"; // Replace with your preset
const API_BASE_URL = "http://192.168.1.68:5000/api"; // Replace with your backend URL

export default function ReportAnalysis() {
  const { userId, getToken } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<{
    url: string;
    cloudinaryId: string;
  } | null>(null);

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
      const response = await fetch(`http://192.168.1.68:5000/api/reports`, {
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
      });

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
      const dbResult = await saveToDatabase(
        cloudinaryResult.url,
        cloudinaryResult.cloudinaryId
      );
      setUploadProgress(0.9);

      setReportData({
        url: cloudinaryResult.url,
        cloudinaryId: cloudinaryResult.cloudinaryId,
      });

      Alert.alert("Success", "Report uploaded and saved successfully!");
      setUploadProgress(1);
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
    <View style={styles.container}>
      <Text style={styles.title}>Upload Medical Report</Text>

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
        <View style={styles.progressContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text>Uploading: {Math.round(uploadProgress * 100)}%</Text>
        </View>
      )}

      {image && !isLoading && (
        <Button
          title="Upload Report"
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
          <Text numberOfLines={1} style={styles.urlText}>
            URL: {reportData.url.substring(0, 30)}...
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});

// import * as ImagePicker from "expo-image-picker";
// import { useState } from "react";
// import {
//   ActivityIndicator,
//   Button,
//   Image,
//   StyleSheet,
//   Text,
//   View,
// } from "react-native";

// export default function ReportAnalysis() {
//   const [image, setImage] = useState<string | null>(null);
//   const [result, setResult] = useState<any>(null);
//   const [loading, setLoading] = useState(false);

//   const pickImage = async () => {
//     // Request permission
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== "granted") {
//       alert("Permission to access photos is required!");
//       return;
//     }

//     // Pick image
//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       quality: 0.8,
//     });

//     if (!result.canceled) {
//       setImage(result.assets[0].uri);
//       setResult(null); // Reset previous results
//     }
//   };

//   const analyzeReport = () => {
//     if (!image) return;

//     setLoading(true);

//     // Mock analysis (replace with actual API call later)
//     setTimeout(() => {
//       setResult({
//         lab_report_analysis: [
//           "Hemoglobin (12.4 g/dL) - Slightly low, possible mild anemia",
//           "WBC (6.2 x10³/µL) - Within normal range",
//         ],
//         diet_plan: {
//           breakfast: "1 cup oatmeal with berries (rich in iron)",
//           lunch: "Grilled chicken with spinach salad (iron-rich foods)",
//         },
//       });
//       setLoading(false);
//     }, 2000); // Simulate network delay
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Upload Medical Report</Text>

//       <Button title="Select Report Image" onPress={pickImage} color="#4A90E2" />

//       {image && (
//         <View style={styles.imageContainer}>
//           <Image source={{ uri: image }} style={styles.image} />
//           <Button
//             title="Analyze Report"
//             onPress={analyzeReport}
//             color="#28a745"
//           />
//         </View>
//       )}

//       {loading && (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#4A90E2" />
//           <Text>Analyzing report...</Text>
//         </View>
//       )}

//       {result && (
//         <View style={styles.resultContainer}>
//           <Text style={styles.resultTitle}>Analysis Results:</Text>

//           <Text style={styles.sectionTitle}>Lab Findings:</Text>
//           {result.lab_report_analysis?.map((item: string, index: number) => (
//             <Text key={index} style={styles.resultText}>
//               • {item}
//             </Text>
//           ))}

//           <Text style={styles.sectionTitle}>Diet Suggestions:</Text>
//           <Text style={styles.resultText}>
//             Breakfast: {result.diet_plan?.breakfast}
//           </Text>
//           <Text style={styles.resultText}>
//             Lunch: {result.diet_plan?.lunch}
//           </Text>
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: "#f8f9fa",
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "bold",
//     marginBottom: 20,
//     textAlign: "center",
//     color: "#333",
//   },
//   imageContainer: {
//     marginTop: 20,
//     alignItems: "center",
//   },
//   image: {
//     width: 300,
//     height: 200,
//     resizeMode: "contain",
//     marginBottom: 15,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#ddd",
//   },
//   loadingContainer: {
//     marginTop: 20,
//     alignItems: "center",
//   },
//   resultContainer: {
//     marginTop: 20,
//     padding: 15,
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#ddd",
//   },
//   resultTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 10,
//     color: "#333",
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginTop: 10,
//     color: "#444",
//   },
//   resultText: {
//     marginVertical: 4,
//     color: "#555",
//   },
// });

// import * as FileSystem from "expo-file-system";
// import * as ImageManipulator from "expo-image-manipulator";
// import * as ImagePicker from "expo-image-picker";
// import * as MediaLibrary from "expo-media-library";
// import React, { useState } from "react";
// import { Alert, Button, Image, ScrollView, Text, View } from "react-native";

// export default function ImageCompressorTest() {
//   const [original, setOriginal] = useState(null);
//   const [compressed, setCompressed] = useState(null);
//   const [originalInfo, setOriginalInfo] = useState(null);
//   const [compressedInfo, setCompressedInfo] = useState(null);

//   const pickImage = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       allowsEditing: false,
//       quality: 1,
//     });

//     if (!result.canceled) {
//       const uri = result.assets[0].uri;
//       setOriginal(uri);
//       await getImageInfo(uri, setOriginalInfo);
//       compressImage(uri);
//     }
//   };

//   const getImageInfo = async (uri, setInfo) => {
//     const { size } = await FileSystem.getInfoAsync(uri, { size: true });
//     const manipResult = await ImageManipulator.manipulateAsync(uri, [], {});
//     const { width, height } = manipResult;
//     setInfo({
//       width,
//       height,
//       sizeKB: (size / 1024).toFixed(2),
//     });
//   };

//   const compressImage = async (uri) => {
//     try {
//       const manipulated = await ImageManipulator.manipulateAsync(
//         uri,
//         [
//           {
//             resize: { width: 1000 }, // Resize width to 1000px
//           },
//         ],
//         {
//           compress: 0.7, // 60% quality
//           format: ImageManipulator.SaveFormat.JPEG,
//         }
//       );
//       setCompressed(manipulated.uri);
//       await getImageInfo(manipulated.uri, setCompressedInfo);
//     } catch (error) {
//       Alert.alert("Compression Error", error.message);
//     }
//   };

//   const saveCompressed = async () => {
//     if (!compressed) return;

//     const { status } = await MediaLibrary.requestPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert(
//         "Permission Required",
//         "Please grant gallery permission to save the image."
//       );
//       return;
//     }

//     try {
//       await MediaLibrary.saveToLibraryAsync(compressed);
//       Alert.alert("Success", "Compressed image saved to gallery!");
//     } catch (error) {
//       Alert.alert("Error", "Failed to save image: " + error.message);
//     }
//   };

//   return (
//     <ScrollView style={{ flex: 1, padding: 20 }}>
//       <Button title="Pick an Image" onPress={pickImage} />

//       {original && originalInfo && (
//         <View style={{ marginVertical: 20 }}>
//           <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
//             Original Image:
//           </Text>
//           <Image
//             source={{ uri: original }}
//             style={{ height: 200, resizeMode: "contain" }}
//           />
//           <Text>Size: {originalInfo.sizeKB} KB</Text>
//           <Text>
//             Dimensions: {originalInfo.width} x {originalInfo.height}
//           </Text>
//         </View>
//       )}

//       {compressed && compressedInfo && (
//         <View style={{ marginVertical: 20 }}>
//           <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
//             Compressed Image:
//           </Text>
//           <Image
//             source={{ uri: compressed }}
//             style={{ height: 200, resizeMode: "contain" }}
//           />
//           <Text>Size: {compressedInfo.sizeKB} KB</Text>
//           <Text>
//             Dimensions: {compressedInfo.width} x {compressedInfo.height}
//           </Text>
//           <Button title="Save to Gallery" onPress={saveCompressed} />
//         </View>
//       )}
//     </ScrollView>
//   );
// }
