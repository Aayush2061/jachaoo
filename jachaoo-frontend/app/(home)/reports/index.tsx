import ReportCard from "@/app/components/ReportCard";
import { useAuth } from "@clerk/clerk-expo";
import { MaterialIcons } from "@expo/vector-icons";
import { Link, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function ReportsGallery() {
  const { getToken } = useAuth();
  const params = useLocalSearchParams();
  const [reports, setReports] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/reports`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setReports(data);
      setFiltered(data);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [params.shouldRefresh]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReports().then(() => setRefreshing(false));
  }, []);

  const handleSearch = (text: string) => {
    setSearch(text);
    const filteredData = reports.filter((r) =>
      r.reportName.toLowerCase().includes(text.toLowerCase())
    );
    setFiltered(filteredData);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🩺 My Medical Reports</Text>

      <Link href="/(home)/reports/analyze" asChild>
        <Pressable style={styles.analyzeTopButton}>
          <MaterialIcons name="add-circle-outline" size={22} color="white" />
          <Text style={styles.analyzeTopButtonText}>Analyze New Report</Text>
        </Pressable>
      </Link>

      <TextInput
        style={styles.searchBar}
        placeholder="Search reports..."
        value={search}
        onChangeText={handleSearch}
        placeholderTextColor="#999"
      />

      {filtered.length > 0 ? (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <ReportCard report={item} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialIcons name="folder-open" size={64} color="#aaa" />
          <Text style={styles.emptyText}>No reports found</Text>
          <Text style={styles.emptySubtext}>
            Try uploading your first report or adjust your search.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
    marginBottom: 12,
  },
  analyzeTopButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  analyzeTopButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  searchBar: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    color: "#333",
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#555",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginTop: 8,
    maxWidth: 250,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
