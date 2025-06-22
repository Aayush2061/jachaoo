import { useClerk, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfilePage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        if (!user?.id) return;

        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/health/${user.id}`
        );
        const data = await response.json();
        setHealthData(data);
      } catch (error) {
        console.error("Error fetching health data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
  }, [user?.id]);

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            router.replace("/(auth)");
          } catch (err) {
            console.error("Sign out error:", JSON.stringify(err, null, 2));
            Alert.alert("Error", "Failed to sign out");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          {user?.imageUrl && (
            <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
          )}
          <Text style={styles.name}>
            {user?.fullName || `${user?.firstName} ${user?.lastName}` || "User"}
          </Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Account Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>
              {user?.primaryEmailAddress?.emailAddress || "Not available"}
            </Text>
          </View>
        </View>

        {healthData && (
          <View style={styles.infoContainer}>
            <Text style={styles.sectionTitle}>Health Information</Text>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{healthData.name}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Age:</Text>
              <Text style={styles.value}>{healthData.age}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Sex:</Text>
              <Text style={styles.value}>{healthData.sex}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>High Blood Pressure:</Text>
              <Text style={styles.value}>{healthData.bloodPressure}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Diabetes:</Text>
              <Text style={styles.value}>{healthData.diabetes}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Smoker:</Text>
              <Text style={styles.value}>{healthData.smoker}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ... keep your existing styles

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 20,
  },
  header: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  infoContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: "#666",
    flex: 2,
    textAlign: "right",
  },
  signOutButton: {
    backgroundColor: "#FF3B30",
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 40,
  },
  signOutButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});
