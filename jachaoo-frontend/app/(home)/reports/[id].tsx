import { useAuth } from "@clerk/clerk-expo";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import ImageViewer from "react-native-image-zoom-viewer";

export default function ReportDetail() {
  const { id } = useLocalSearchParams();
  const { getToken } = useAuth();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [zoomVisible, setZoomVisible] = useState(false);
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.shouldRefresh) {
      // This forces the gallery to refresh when we come back to it
      router.setParams({ shouldRefresh: undefined });
    }
  }, [params]);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = await getToken();
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/reports/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        setReport(data);
      } catch (error) {
        console.error("Failed to fetch report:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  if (loading || !report) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const images = [
    {
      url: report.url,
      props: {
        source: { uri: report.url },
      },
    },
  ];

  const handleDelete = async () => {
    Alert.alert(
      "Delete Report",
      "Are you sure you want to delete this report? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: deleteReport,
        },
      ]
    );
  };

  const deleteReport = async () => {
    try {
      setDeleting(true);
      const token = await getToken();

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/reports/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete report");
      }

      // Navigate back to gallery with refresh
      router.replace({
        pathname: "/(home)/reports",
        params: { shouldRefresh: "true" },
      });
    } catch (error) {
      console.error("Delete failed:", error);
      Alert.alert("Error", "Failed to delete report");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color="#2980b9" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            disabled={deleting}
            style={styles.deleteButton}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#ff4444" />
            ) : (
              <MaterialIcons name="delete" size={24} color="#ff4444" />
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.reportName}>{report.reportName}</Text>
        <Text style={styles.labName}>{report.labName}</Text>
        <Text style={styles.date}>
          {new Date(report.createdAt).toLocaleDateString()}
        </Text>

        {/* Clickable thumbnail that opens zoom viewer */}
        <TouchableOpacity
          onPress={() => setZoomVisible(true)}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: report.url }}
            style={styles.imageThumbnail}
            resizeMode="contain"
          />
          <View style={styles.zoomHint}>
            <MaterialIcons name="zoom-in" size={24} color="white" />
            <Text style={styles.zoomHintText}>Pinch to zoom</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.analysisContainer}>
          <Text style={styles.analysisTitle}>Analysis Results</Text>
          <Text style={styles.analysisText}>
            {report.analysis || "No analysis available"}
          </Text>
        </View>

        {/* Zoomable image modal */}
        <Modal visible={zoomVisible} transparent={true}>
          <ImageViewer
            imageUrls={images}
            enableSwipeDown
            onSwipeDown={() => setZoomVisible(false)}
            swipeDownThreshold={50}
            renderHeader={() => (
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setZoomVisible(false)}
              >
                <MaterialIcons name="close" size={30} color="white" />
              </TouchableOpacity>
            )}
            renderIndicator={() => null}
          />
        </Modal>
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  // container: { flex: 1, padding: 16 },
  image: {
    width: "100%",
    height: undefined, // Let height adjust based on aspect ratio
    aspectRatio: 1, // Default to square, adjust as needed
    borderRadius: 8,
  },
  analysisContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#f0f8ff",
    borderRadius: 8,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1e88e5",
  },
  analysisText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  reportName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  labName: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  container: { flex: 1, padding: 16 },
  imageThumbnail: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    marginVertical: 10,
  },
  zoomHint: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 5,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  zoomHintText: {
    color: "white",
    marginLeft: 5,
    fontSize: 12,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 5,
  },
});
