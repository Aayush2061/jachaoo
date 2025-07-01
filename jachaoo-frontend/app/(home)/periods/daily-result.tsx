import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function DailyResult() {
  const params = useLocalSearchParams();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        // First check if we have new data from navigation params
        if (params.analysis) {
          const newAnalysis = JSON.parse(params.analysis as string);
          // Store the new analysis with current date
          await storeAnalysis(newAnalysis);
          setAnalysis(newAnalysis);
          return;
        }

        // If no new data, try to load from storage
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
        storedDate: new Date().toISOString().split("T")[0], // Store today's date
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

      // Only return if the data is from today
      if (parsedData.storedDate === today) {
        return parsedData;
      }
      return null;
    } catch (error) {
      console.error("Error retrieving analysis:", error);
      return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Your Daily Cycle Analysis</Text>
      <Text style={styles.date}>{analysis.date || analysis.storedDate}</Text>
      <View style={styles.resultContainer}>
        <Text style={styles.resultText}>{analysis.result}</Text>
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
  },
  date: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 20,
  },
  resultContainer: {
    backgroundColor: "#f9f5ff",
    borderRadius: 10,
    padding: 15,
  },
  resultText: {
    fontSize: 16,
    color: "#2c3e50",
    lineHeight: 24,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});
