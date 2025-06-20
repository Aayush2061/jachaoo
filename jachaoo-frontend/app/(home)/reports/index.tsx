import ReportCard from "@/app/components/ReportCard";
import { useAuth } from "@clerk/clerk-expo";
import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function ReportsGallery() {
  const { getToken } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  // Modify the useEffect to watch for refresh params
  const params = useLocalSearchParams();

  useEffect(() => {
    fetchReports();
  }, [params.shouldRefresh]); // Refetch when this changes

  const fetchReports = async () => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/reports`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReports(await response.json());
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Link href="/(home)/reports/analyze" style={styles.uploadButton}>
        <Text style={styles.uploadButtonText}>+ New Report</Text>
      </Link>

      <FlatList
        data={reports}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <ReportCard report={item} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No reports yet</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  uploadButton: {
    backgroundColor: "#2980b9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  uploadButtonText: { color: "white", fontWeight: "bold" },
  emptyText: { textAlign: "center", marginTop: 20 },
});
