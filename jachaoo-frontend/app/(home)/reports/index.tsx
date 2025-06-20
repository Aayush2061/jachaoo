import ReportCard from "@/app/components/ReportCard";
import { useAuth } from "@clerk/clerk-expo";
import { MaterialIcons } from "@expo/vector-icons";
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
        <MaterialIcons name="add" size={24} color="white" />
        <Text style={styles.uploadButtonText}>New Report</Text>
      </Link>

      {reports.length > 0 ? (
        <FlatList
          data={reports}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <ReportCard report={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="folder" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No reports yet</Text>
          <Text style={styles.emptySubtext}>
            Upload your first medical report to get started
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  uploadButton: {
    backgroundColor: "#2980b9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  uploadButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
});
