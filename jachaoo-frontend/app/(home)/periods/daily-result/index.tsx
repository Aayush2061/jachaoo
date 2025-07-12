import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";

export default function DailyResult() {
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

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#7e5bef" />
        <Text style={{ marginTop: 10 }}>Loading analysis...</Text>
      </View>
    );
  }

  if (!analysis) {
    return (
      <View style={styles.container}>
        <Text>No analysis data available</Text>
      </View>
    );
  }

  if (analysis.error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{analysis.error}</Text>
      </View>
    );
  }
  // console.log(analysis);
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Your Daily Cycle Analysis</Text>
      <Text style={styles.date}>{analysis.date || analysis.storedDate}</Text>

      <View style={styles.resultContainer}>
        <Markdown style={markdownStyles}>
          {formatAnalysisText(analysis.result)}
        </Markdown>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#7e5bef",
    marginBottom: 6,
  },
  date: {
    fontSize: 16,
    color: "#888",
    marginBottom: 20,
  },
  resultContainer: {
    backgroundColor: "#f8f4ff",
    borderRadius: 12,
    padding: 18,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});

const markdownStyles = {
  body: {
    fontSize: 16,
    color: "#2d2d2d",
    lineHeight: 26,
  },
  heading1: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4a148c",
    marginBottom: 10,
  },
  heading2: {
    fontSize: 18,
    fontWeight: "600",
    color: "#5e35b1",
    marginTop: 10,
  },
  strong: {
    fontWeight: "bold",
    color: "#000",
  },
  bullet_list: {
    paddingLeft: 18,
    marginBottom: 10,
  },
  list_item: {
    marginBottom: 5,
  },
  paragraph: {
    marginBottom: 10,
  },
};
