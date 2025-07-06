import { useUser } from "@clerk/clerk-expo";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
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
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Jachaoo</Text>
          <Link href="/(home)/profile" asChild>
            <Pressable style={styles.profileButton}>
              <Ionicons name="person-circle" size={45} color="#2980b9" />
            </Pressable>
          </Link>
        </View>
        <Text style={styles.headerSubtitle}>Your Health Companion</Text>
      </View>

      {/* Main Image */}
      <Image
        source={{
          uri: "https://img.freepik.com/free-vector/medical-infographic-template-with-4-elements_23-2148101674.jpg",
        }}
        style={styles.mainImage}
        resizeMode="contain"
      />

      {/* Service Buttons */}
      <View style={styles.buttonContainer}>
        <Link href="/(home)/reports" asChild>
          <Pressable style={styles.serviceButton}>
            <MaterialIcons name="analytics" size={24} color="#2980b9" />
            <Text style={styles.buttonText}>Analyze My Report</Text>
          </Pressable>
        </Link>

        <Link href="/firstaid" asChild>
          <Pressable style={styles.serviceButton}>
            <Ionicons name="medkit" size={24} color="#e74c3c" />
            <Text style={styles.buttonText}>First Aid Services</Text>
          </Pressable>
        </Link>

        <Link href="/symptoms" asChild>
          <Pressable style={styles.serviceButton}>
            <Ionicons name="medical" size={24} color="#27ae60" />
            <Text style={styles.buttonText}>Symptom Checker</Text>
          </Pressable>
        </Link>

        <Link href="/(home)/periods" asChild>
          <Pressable style={styles.serviceButton}>
            <FontAwesome name="calendar" size={24} color="#9b59b6" />
            <Text style={styles.buttonText}>Period Tracker</Text>
          </Pressable>
        </Link>
        <Link href="/(home)/mental-health" asChild>
          <Pressable style={styles.serviceButton}>
            <FontAwesome6 name="brain" size={24} color="black" />
            <Text style={styles.buttonText}>Mental Health</Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2980b9",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 5,
  },
  welcomeText: {
    fontSize: 14,
    color: "#27ae60",
    fontStyle: "italic",
    marginTop: 5,
  },
  mainImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginVertical: 15,
  },
  buttonContainer: {
    gap: 15,
    marginTop: 20,
  },
  serviceButton: {
    backgroundColor: "#b6d6ff",
    borderRadius: 10,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
  },
  profileButton: {
    borderRadius: 25,
    padding: 8,
    marginTop: 10,
  },
});

// ... keep your existing styles
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//     backgroundColor: "#f5f5f5",
//   },
//   avatar: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     marginBottom: 20,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: 10,
//     color: "#333",
//   },
//   subtitle: {
//     fontSize: 18,
//     textAlign: "center",
//     marginBottom: 30,
//     color: "#666",
//   },
//   button: {
//     backgroundColor: "#007AFF",
//     padding: 15,
//     borderRadius: 10,
//     minWidth: 150,
//   },
//   buttonText: {
//     color: "#fff",
//     textAlign: "center",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
// });

// <View style={styles.container}>
//   {user?.imageUrl && (
//     <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
//   )}

//   <Text style={styles.title}>Welcome!</Text>
//   <Text style={styles.subtitle}>
//     Hello, {user?.firstName || user?.fullName || "User"}
//   </Text>

//   <Link href="/(home)/profile" asChild>
//     <TouchableOpacity style={styles.button}>
//       <Text style={styles.buttonText}>View Profile</Text>
//     </TouchableOpacity>
//   </Link>
// </View>
