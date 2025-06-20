// app/(home)/reports/[id].tsx
import { useAuth } from "@clerk/clerk-expo";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function ReportDetail() {
  const { id } = useLocalSearchParams();
  const { getToken } = useAuth();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: report.url }} style={styles.image} />

      <View style={styles.analysisContainer}>
        <Text style={styles.analysisTitle}>Analysis Results</Text>
        <Text style={styles.analysisText}>
          {report.analysis || "No analysis available"}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  image: { width: "100%", height: 300, borderRadius: 8 },
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
});
