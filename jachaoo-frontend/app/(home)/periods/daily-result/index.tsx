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
      <LinearGradient colors={["#b3e5fc", "#ffe0b2"]} style={{ flex: 1 }}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6E56CF" />
          <Text style={styles.loadingText}>Loading your analysis...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!analysis) {
    return (
      <LinearGradient colors={["#b3e5fc", "#ffe0b2"]} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.emptyContainer}>
          <View style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={48} color="#6E56CF" />
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
      <LinearGradient colors={["#b3e5fc", "#ffe0b2"]} style={{ flex: 1 }}>
        <View style={styles.errorContainer}>
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
    <LinearGradient colors={["#b3e5fc", "#ffe0b2"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#6E56CF" />
          </Pressable>
          <Text style={styles.title}>Your Daily Analysis</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.date}>
            {analysis.date || analysis.storedDate}
          </Text>

          <View style={styles.resultCard}>
            <Markdown style={markdownStyles}>
              {formatAnalysisText(analysis.result)}
            </Markdown>
          </View>
          <Text style={styles.disclaimer}>
            Results are not a substitute for professional medical advice,
            diagnosis, or treatment. Consult a healthcare provider for any
            health decisions.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 60,
    marginTop: 20,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#2D3748",
  },
  date: {
    fontSize: 16,
    color: "#4A5568",
    marginBottom: 20,
    textAlign: "center",
  },
  resultCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 20,
    // marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#4A5568",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 30,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#2D3748",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#4A5568",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: "#E53E3E",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  trackButton: {
    backgroundColor: "#6E56CF",
    borderRadius: 10,
    padding: 16,
    width: "100%",
    alignItems: "center",
    shadowColor: "#6E56CF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  trackButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  disclaimer: {
    fontSize: 12,
    color: "#777",
    marginTop: 16,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
});

const markdownStyles = {
  body: {
    fontSize: 16,
    color: "#2D3748",
    lineHeight: 26,
  },
  heading1: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4a148c",
    marginBottom: 10,
    marginTop: 10,
  },
  heading2: {
    fontSize: 18,
    fontWeight: "600",
    color: "#5e35b1",
    marginTop: 10,
    marginBottom: 8,
  },
  strong: {
    fontWeight: "bold",
    color: "#000",
  },
  bullet_list: {
    marginBottom: 10,
  },
  list_item: {
    marginBottom: 8,
    flexDirection: "row",
  },
  paragraph: {
    marginBottom: 12,
  },
  link: {
    color: "#6E56CF",
    textDecorationLine: "underline",
  },
};
