import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";

export default function DailyResult() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        if (params.analysis) {
          const newAnalysis = JSON.parse(params.analysis as string);
          await storeAnalysis(newAnalysis);
          setAnalysis(newAnalysis);
          return;
        }

        const storedAnalysis = await getStoredAnalysis();
        if (storedAnalysis) {
          setAnalysis(storedAnalysis);
        }
      } catch (error) {
        console.error("Error loading analysis:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [params.analysis]);

  const storeAnalysis = async (analysisData: any) => {
    try {
      const dataToStore = {
        ...analysisData,
        storedDate: new Date().toISOString().split("T")[0],
      };
      await AsyncStorage.setItem("dailyAnalysis", JSON.stringify(dataToStore));
    } catch (error) {
      console.error("Error storing analysis:", error);
    }
  };

  const getStoredAnalysis = async () => {
    try {
      const storedData = await AsyncStorage.getItem("dailyAnalysis");
      if (!storedData) return null;

      const parsedData = JSON.parse(storedData);
      const today = new Date().toISOString().split("T")[0];

      if (parsedData.storedDate === today) {
        return parsedData;
      }
      return null;
    } catch (error) {
      console.error("Error retrieving analysis:", error);
      return null;
    }
  };

  const formatAnalysisText = (rawText: string) => {
    return rawText.replace(/Moods Logged: \[(.*?)\]/, (_, moods) => {
      const items = moods
        .split(",")
        .map((m) => `- ${m.trim().replace(/['"]+/g, "")}`);
      return `**Moods Logged:**\n${items.join("\n")}`;
    });
  };

  const navigateToTracker = () => {
    router.push("/(home)/periods/daily-symptoms");
  };

  if (loading) {
    return (
      <LinearGradient
        colors={["#FFF2F8", "#F2F0FF"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color="#B76CFD" />
        <Text style={styles.loadingText}>Loading your analysis...</Text>
      </LinearGradient>
    );
  }

  if (!analysis) {
    return (
      <LinearGradient
        colors={["#FFF2F8", "#F2F0FF"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.emptyContainer}>
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="calendar-outline" size={48} color="#B76CFD" />
            </View>
            <Text style={styles.emptyTitle}>No Analysis Available</Text>
            <Text style={styles.emptyText}>
              Track your symptoms today to get a personalized analysis of your
              menstrual cycle.
            </Text>
            <TouchableOpacity
              style={styles.trackButton}
              onPress={navigateToTracker}
            >
              <Text style={styles.trackButtonText}>Track Symptoms</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  if (analysis.error) {
    return (
      <LinearGradient
        colors={["#FFF2F8", "#F2F0FF"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ flex: 1 }}
      >
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#FF5C8D" />
          </View>
          <Text style={styles.errorTitle}>Analysis Error</Text>
          <Text style={styles.errorText}>{analysis.error}</Text>
          <TouchableOpacity
            style={styles.trackButton}
            onPress={navigateToTracker}
          >
            <Text style={styles.trackButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#FFF2F8", "#F2F0FF"]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#B76CFD" />
          </Pressable>
          <Text style={styles.title}>Your Daily Analysis</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.contentContainer}>
          {/* Analysis Card */}
          <View style={styles.resultCard}>
            <Markdown style={markdownStyles}>
              {formatAnalysisText(analysis.result)}
            </Markdown>
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimer}>
              Results are not a substitute for professional medical advice,
              diagnosis, or treatment. Consult a healthcare provider for any
              health decisions.
            </Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 40,
    paddingTop: 20,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(183,108,253,0.06)",
    shadowColor: "#B76CFD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(183,108,253,0.08)",
  },
  title: {
    fontSize: 22,
    fontFamily: "Poppins-SemiBold",
    color: "#2D2D2D",
    letterSpacing: 0.3,
  },
  dateContainer: {
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#B76CFD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(183,108,253,0.04)",
  },
  date: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#8B8691",
  },
  resultCard: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#B76CFD",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(183,108,253,0.04)",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#8B8691",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyCard: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 24,
    padding: 32,
    width: "100%",
    maxWidth: 350,
    alignItems: "center",
    shadowColor: "#B76CFD",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(183,108,253,0.08)",
  },
  emptyIconContainer: {
    backgroundColor: "rgba(183,108,253,0.08)",
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: "Poppins-SemiBold",
    color: "#2D2D2D",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#8B8691",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorIconContainer: {
    backgroundColor: "rgba(255,92,141,0.08)",
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 22,
    fontFamily: "Poppins-SemiBold",
    color: "#FF5C8D",
    marginBottom: 12,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  trackButton: {
    backgroundColor: "#B76CFD",
    borderRadius: 28,
    padding: 18,
    width: "100%",
    maxWidth: 250,
    alignItems: "center",
    shadowColor: "#B76CFD",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  trackButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "Poppins-SemiBold",
  },
  disclaimerContainer: {
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "rgba(183,108,253,0.06)",
  },
  disclaimer: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "#8B8691",
    textAlign: "center",
    lineHeight: 20,
  },
});

const markdownStyles = {
  body: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#2D2D2D",
    lineHeight: 26,
  },
  heading1: {
    fontSize: 22,
    fontFamily: "Poppins-SemiBold",
    color: "#FF5C8D",
    marginBottom: 16,
    marginTop: 8,
  },
  heading2: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#B76CFD",
    marginTop: 20,
    marginBottom: 12,
  },
  strong: {
    fontFamily: "Poppins-SemiBold",
    color: "#2D2D2D",
  },
  bullet_list: {
    marginBottom: 16,
  },
  list_item: {
    marginBottom: 10,
    flexDirection: "row",
  },
  paragraph: {
    marginBottom: 16,
  },
  link: {
    color: "#B76CFD",
    fontFamily: "Poppins-Medium",
    textDecorationLine: "underline",
  },
  em: {
    fontFamily: "Poppins-Italic",
    color: "#8B8691",
  },
  blockquote: {
    backgroundColor: "rgba(255,242,248,0.9)",
    borderLeftWidth: 4,
    borderLeftColor: "#FF5C8D",
    paddingLeft: 16,
    paddingVertical: 12,
    marginVertical: 12,
    borderRadius: 8,
  },
  code_inline: {
    backgroundColor: "rgba(183,108,253,0.08)",
    fontFamily: "monospace",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    color: "#B76CFD",
  },
};
