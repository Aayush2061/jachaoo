import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

// Add this interface at the top of your file
interface MentalHealthData {
  diagnosed: string;
  support?: string;
  frequency: string;
  goals: string[];
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function MentalHealthDashboard() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<MentalHealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = await getToken();
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/mental-health/${user?.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching mental health data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2980b9" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mental Health Dashboard</Text>
      {data && (
        <View style={styles.dataContainer}>
          <Text>Diagnosed: {data.diagnosed}</Text>
          {data.support && <Text>Current Support: {data.support}</Text>}
          <Text>Frequency of thoughts: {data.frequency}</Text>
          <Text>Goals: {data.goals.join(", ")}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2980b9",
  },
  dataContainer: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 8,
  },
});
