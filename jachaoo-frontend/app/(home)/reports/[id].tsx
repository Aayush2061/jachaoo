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
        console.log("Fetched report:", data);
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

  // Improved text rendering with better structure
  const renderAnalysisText = (text: string) => {
    if (!text) {
      return (
        <View style={styles.noAnalysisContainer}>
          <MaterialIcons name="info-outline" size={24} color="#6b7280" />
          <Text style={styles.noAnalysisText}>No analysis available</Text>
        </View>
      );
    }

    const sections = parseAnalysisText(text);

    return (
      <View style={styles.analysisContent}>
        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            {renderSection(section)}
          </View>
        ))}
      </View>
    );
  };

  // Parse the analysis text into structured sections
  const parseAnalysisText = (text: string) => {
    const lines = text.split("\n").filter((line) => line.trim());
    const sections: Array<{ title: string; type: string; content: any[] }> = [];
    let currentSection: any = null;

    lines.forEach((line) => {
      // Check for main section headings
      if (
        line.includes("Lab Report Analysis") ||
        line.includes("Personalized Diet Plan") ||
        line.includes("Exercise Recommendations") ||
        line.includes("Lifestyle Improvements")
      ) {
        if (currentSection) sections.push(currentSection);

        currentSection = {
          title: line,
          type: getSectionType(line),
          content: [],
        };
      }
      // Check for sub-sections (Breakfast, Lunch, Dinner, Morning, Evening, Weekly Plan)
      else if (
        line.match(
          /^(Breakfast|Lunch|Dinner|Morning|Evening|Weekly Plan|Diet Tips|General Diet Tips)/
        ) &&
        !line.startsWith("- ") &&
        !line.startsWith("Benefits:")
      ) {
        if (currentSection) {
          currentSection.content.push({
            type: "subheading",
            text: line.replace(":", ""),
          });
        }
      }
      // Check for bullet points
      else if (line.startsWith("- ")) {
        if (currentSection) {
          currentSection.content.push({
            type: "bullet",
            text: line.substring(2),
          });
        }
      }
      // Check for benefits
      else if (line.startsWith("Benefits:")) {
        if (currentSection) {
          currentSection.content.push({
            type: "benefits",
            text: line,
          });
        }
      }
      // Regular text
      else if (currentSection && line.trim()) {
        currentSection.content.push({
          type: "regular",
          text: line,
        });
      }
    });

    if (currentSection) sections.push(currentSection);
    return sections;
  };

  const getSectionType = (title: string): string => {
    if (title.includes("Lab Report Analysis")) return "lab";
    if (title.includes("Personalized Diet Plan")) return "diet";
    if (title.includes("Exercise Recommendations")) return "exercise";
    if (title.includes("Lifestyle Improvements")) return "lifestyle";
    return "general";
  };

  const renderSection = (section: any) => {
    return (
      <View style={[styles.sectionContainer, styles[`${section.type}Section`]]}>
        <Text style={styles.sectionTitle}>{section.title}</Text>

        {section.content.map((item: any, index: number) => {
          switch (item.type) {
            case "subheading":
              return (
                <Text key={index} style={styles.subHeading}>
                  {item.text}
                </Text>
              );
            case "bullet":
              return (
                <View key={index} style={styles.bulletContainer}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.bulletText}>{item.text}</Text>
                </View>
              );
            case "benefits":
              return (
                <View key={index} style={styles.benefitsContainer}>
                  <MaterialIcons name="star" size={16} color="#f59e0b" />
                  <Text style={styles.benefitsText}>{item.text}</Text>
                </View>
              );
            case "regular":
              return (
                <Text key={index} style={styles.regularText}>
                  {item.text}
                </Text>
              );
            default:
              return null;
          }
        })}
      </View>
    );
  };

  if (loading || !report) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading report...</Text>
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
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color="#3b82f6" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            disabled={deleting}
            style={styles.deleteButton}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <MaterialIcons name="delete-outline" size={24} color="#ef4444" />
            )}
          </TouchableOpacity>
        </View>

        {/* Report Info Card */}
        <View style={styles.reportInfoCard}>
          <Text style={styles.reportName}>{report.reportName}</Text>
          <View style={styles.labInfo}>
            <MaterialIcons name="science" size={16} color="#6b7280" />
            <Text style={styles.labName}>{report.labName}</Text>
          </View>
          <View style={styles.dateInfo}>
            <MaterialIcons name="event" size={16} color="#6b7280" />
            <Text style={styles.date}>
              {new Date(report.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>

        {/* Report Image */}
        <TouchableOpacity
          onPress={() => setZoomVisible(true)}
          activeOpacity={0.9}
          style={styles.imageContainer}
        >
          <Image
            source={{ uri: report.url }}
            style={styles.imageThumbnail}
            resizeMode="contain"
          />
          <View style={styles.zoomOverlay}>
            <MaterialIcons name="zoom-in" size={24} color="white" />
            <Text style={styles.zoomHintText}>Tap to view full screen</Text>
          </View>
        </TouchableOpacity>

        {/* Analysis Results */}
        <View style={styles.analysisContainer}>
          <View style={styles.analysisHeader}>
            <MaterialIcons name="analytics" size={24} color="#3b82f6" />
            <Text style={styles.analysisTitle}>Analysis Results</Text>
          </View>
          {renderAnalysisText(report.analysis)}
        </View>
        <Text style={styles.disclaimerText}>
          Report results are not a substitute for professional medical advice,
          diagnosis, or treatment. Always consult a licensed healthcare provider
          for health decisions.
        </Text>

        {/* Image Zoom Modal */}
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
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
    fontFamily: "Poppins-Regular",
  },

  // Header Styles
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // Report Info Card
  reportInfoCard: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  reportName: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  labInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  labName: {
    fontSize: 16,
    color: "#6b7280",
    marginLeft: 8,
    fontFamily: "Poppins-Regular",
  },
  dateInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  date: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 8,
    fontFamily: "Poppins-Regular",
  },

  // Image Styles
  imageContainer: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 24,
    backgroundColor: "#f1f5f9",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  imageThumbnail: {
    width: "100%",
    height: 300,
  },
  zoomOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  zoomHintText: {
    color: "white",
    marginLeft: 8,
    fontSize: 14,
    fontFamily: "Poppins-Medium",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 20,
    padding: 8,
  },

  // Analysis Container
  analysisContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  analysisHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#f1f5f9",
  },
  analysisTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: "#1f2937",
    marginLeft: 12,
  },
  analysisContent: {
    gap: 24,
  },

  // Section Styles
  sectionContainer: {
    gap: 12,
  },
  labSection: {
    // Specific styles for lab section if needed
  },
  dietSection: {
    // Specific styles for diet section if needed
  },
  exerciseSection: {
    // Specific styles for exercise section if needed
  },
  lifestyleSection: {
    // Specific styles for lifestyle section if needed
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#3b82f6",
    marginBottom: 8,
  },
  subHeading: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#1f2937",
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },

  // Text Elements
  bulletContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
    paddingLeft: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: "#3b82f6",
    marginRight: 12,
    lineHeight: 22,
    fontFamily: "Poppins-Regular",
  },
  bulletText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#4b5563",
    flex: 1,
    fontFamily: "Poppins-Regular",
  },
  benefitsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f0fdf4",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#10b981",
    marginVertical: 8,
  },
  benefitsText: {
    fontSize: 15,
    lineHeight: 20,
    color: "#065f46",
    marginLeft: 8,
    flex: 1,
    fontStyle: "italic",
    fontFamily: "Poppins-Regular",
  },
  regularText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#6b7280",
    marginVertical: 2,
    fontFamily: "Poppins-Regular",
  },

  // No Analysis State
  noAnalysisContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
  },
  noAnalysisText: {
    fontSize: 16,
    color: "#6b7280",
    marginLeft: 12,
    fontFamily: "Poppins-Regular",
  },
  disclaimerText: {
    marginTop: 12,
    fontSize: 12,
    color: "#555",
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    lineHeight: 16,
    marginBottom: 30,
  },
});
