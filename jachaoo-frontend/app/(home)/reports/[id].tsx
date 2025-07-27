// Your imports stay the same
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

  const handleDelete = async () => {
    Alert.alert(
      "Delete Report",
      "Are you sure you want to delete this report? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
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

  const renderAnalysisText = (text: string) => {
    if (!text)
      return <Text style={styles.regularText}>No analysis available</Text>;

    return (
      <View>
        {text.split("\n").map((line, index) => {
          if (line.match(/^\d+\.\s/)) {
            return (
              <Text key={index} style={styles.sectionHeading}>
                {line}
              </Text>
            );
          } else if (
            line.match(/^[A-Z][a-z]+:$/) &&
            !line.startsWith("Benefits:")
          ) {
            return (
              <Text key={index} style={styles.subHeading}>
                {line}
              </Text>
            );
          } else if (line.startsWith("- ")) {
            return (
              <Text key={index} style={styles.bulletPoint}>
                {"\u2022"} {line.substring(2)}
              </Text>
            );
          } else if (line.startsWith("Benefits:")) {
            return (
              <Text key={index} style={styles.benefitsText}>
                {line}
              </Text>
            );
          } else if (line.match(/^\d+\)/)) {
            return (
              <Text key={index} style={styles.numberedStep}>
                {line}
              </Text>
            );
          } else {
            return (
              <Text key={index} style={styles.regularText}>
                {line}
              </Text>
            );
          }
        })}
      </View>
    );
  };

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

        <View style={styles.reportInfo}>
          <Text style={styles.reportName}>{report.reportName}</Text>
          <Text style={styles.labName}>{report.labName}</Text>
          <Text style={styles.date}>
            {new Date(report.createdAt).toLocaleDateString()}
          </Text>
        </View>

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
            <MaterialIcons name="zoom-in" size={20} color="white" />
            <Text style={styles.zoomHintText}>Pinch to zoom</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.analysisContainer}>
          <Text style={styles.analysisTitle}>Analysis Results</Text>
          {renderAnalysisText(report.analysis)}
        </View>

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
  container: { flex: 1, padding: 16, marginTop: 20, marginBottom: 40 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: "#ffebee",
    borderRadius: 8,
    marginTop: 15,
  },

  reportInfo: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },
  reportName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  labName: {
    fontSize: 16,
    color: "#555",
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: "#666",
  },

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
    padding: 6,
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
    backgroundColor: "#000000aa",
    borderRadius: 30,
    padding: 8,
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
  sectionHeading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e88e5",
    marginTop: 20,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#bbdefb",
    paddingBottom: 4,
  },
  subHeading: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3748",
    marginTop: 12,
    marginBottom: 4,
  },
  bulletPoint: {
    fontSize: 15,
    lineHeight: 24,
    marginLeft: 8,
    marginVertical: 2,
    color: "#4a5568",
  },
  benefitsText: {
    fontSize: 15,
    fontStyle: "italic",
    color: "#2e7d32",
    backgroundColor: "#e8f5e9",
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    marginBottom: 12,
  },
  numberedStep: {
    fontSize: 15,
    lineHeight: 24,
    marginLeft: 8,
    marginVertical: 2,
    color: "#4a5568",
  },
  regularText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#4a5568",
    marginVertical: 2,
  },
});
