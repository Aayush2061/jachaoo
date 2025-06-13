import { useUser } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";

export default function HomePage() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasHealthData, setHasHealthData] = useState(false);

  useEffect(() => {
    const checkHealthData = async () => {
      try {
        if (!user?.id) return;

        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/health/${user.id}`
        );
        const data = await response.json();

        if (data && data.userId) {
          setHasHealthData(true);
        } else {
          router.replace("/(home)/onboarding");
        }
      } catch (error) {
        console.error("Error checking health data:", error);
        Alert.alert("Error", "Failed to check health data status");
      } finally {
        setLoading(false);
      }
    };

    checkHealthData();
  }, [user?.id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {user?.imageUrl && (
        <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
      )}

      <Text style={styles.title}>Welcome!</Text>
      <Text style={styles.subtitle}>
        Hello, {user?.firstName || user?.fullName || "User"}
      </Text>

      <Link href="/(home)/profile" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>View Profile</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

// ... keep your existing styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    minWidth: 150,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});
