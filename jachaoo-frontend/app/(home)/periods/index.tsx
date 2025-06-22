import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function PeriodTrackerGetStarted() {
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkPeriodData = async () => {
      try {
        if (!user?.id) return;
        setIsChecking(true); //this is added to add loading page at the time when checks at database whether user has filled the onboarding page or not
        const token = await getToken();
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/periods/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // const text = await response.text();
        // console.log("Raw response:", text);
        const data = await response.json();

        if (data.exists !== false) {
          router.replace("/(home)/periods/dashboard");
        }
      } catch (error) {
        console.error("Error checking period data:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkPeriodData();
  }, [user?.id]);

  if (isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9b59b6" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("@/assets/images/period-tracker.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Balance & Care</Text>
          <Text style={styles.subtitle}>
            Track your menstrual cycle, symptoms, and patterns to better
            understand your body
          </Text>
          <Pressable
            style={styles.button}
            onPress={() => router.push("/(home)/periods/onboarding")}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.5)", // Semi-transparent white overlay
    // justifyContent: "center",
  },
  contentContainer: {
    alignItems: "center",
    padding: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 36, // Slightly larger for better visibility
    fontWeight: "bold",
    color: "#9b59b6",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    color: "#555",
    // marginTop: 200,
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 24, // Better readability
  },
  button: {
    backgroundColor: "#9b59b6",
    marginTop: 500,
    padding: 18, // Slightly larger padding
    borderRadius: 10,
    width: "80%", // Not full width for better aesthetics
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
