import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MentalHealthBackground from "./MentalHealthBackground";

const { width } = Dimensions.get("window");

interface MentalHealthData {
  diagnosed: string;
  support?: string;
  frequency: string;
  goals: string[];
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2980b9" />
      </View>
    );
  }

  return (
    <MentalHealthBackground>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Greeting Section */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>Hi, {user?.firstName}</Text>
        </View>

        {/* Main Feature Buttons - 2 columns */}
        <View style={styles.featuresContainer}>
          {/* Row 1 */}
          <View style={styles.featureRow}>
            <Pressable
              style={styles.featureButton}
              onPress={() => router.push("/(home)/mental-health/track")}
            >
              <ImageBackground
                source={require("@/assets/images/mental-health-icons/track-bg.jpg")}
                style={styles.featureBackground}
                imageStyle={styles.featureBackgroundImage}
              >
                <Text style={styles.featureButtonText}>Track my mood</Text>
              </ImageBackground>
            </Pressable>

            <Pressable
              style={styles.featureButton}
              onPress={() => router.push("/(home)/mental-health/breathe")}
            >
              <ImageBackground
                source={require("@/assets/images/mental-health-icons/breathe-bg.jpg")}
                style={styles.featureBackground}
                imageStyle={styles.featureBackgroundImage}
              >
                <Text style={styles.featureButtonText}>Breathe & Calm</Text>
              </ImageBackground>
            </Pressable>
          </View>

          {/* Row 2 */}
          <View style={styles.featureRow}>
            <Pressable
              style={styles.featureButton}
              onPress={() => router.push("/(home)/mental-health/listen")}
            >
              <ImageBackground
                source={require("@/assets/images/mental-health-icons/listen-bg.jpg")}
                style={styles.featureBackground}
                imageStyle={styles.featureBackgroundImage}
              >
                <Text style={styles.featureButtonText}>Listen & Heal</Text>
              </ImageBackground>
            </Pressable>

            <Pressable
              style={styles.featureButton}
              onPress={() => router.push("/(home)/mental-health/sleepwell")}
            >
              <ImageBackground
                source={require("@/assets/images/mental-health-icons/sleepwell-bg.jpg")}
                style={styles.featureBackground}
                imageStyle={styles.featureBackgroundImage}
              >
                <Text style={styles.featureButtonText}>Sleepwell</Text>
              </ImageBackground>
            </Pressable>
          </View>

          {/* Row 3 */}
          <View style={styles.featureRow}>
            <Pressable
              style={styles.featureButton}
              onPress={() => router.push("/(home)/mental-health/chat")}
            >
              <ImageBackground
                source={require("../../../assets/images/mental-health-icons/talk.jpg")}
                style={styles.featureBackground}
                imageStyle={styles.featureBackgroundImage}
              >
                <Text style={styles.featureButtonText}>Talk to someone</Text>
              </ImageBackground>
            </Pressable>

            <Pressable
              style={styles.featureButton}
              onPress={() => router.push("/(home)/mental-health/daily-goal")}
            >
              <ImageBackground
                source={require("@/assets/images/mental-health-icons/daily-goal-bg.jpg")}
                style={styles.featureBackground}
                imageStyle={styles.featureBackgroundImage}
              >
                <Text style={styles.featureButtonText}>Daily Goals</Text>
              </ImageBackground>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </MentalHealthBackground>
  );
}

const styles = StyleSheet.create({
  // backgroundImage: {
  //   flex: 1,
  //   width: "100%",
  //   height: "100%",
  // },
  // overlay: {
  //   flex: 1,
  //   backgroundColor: "rgba(255, 255, 255, 0.1)",
  // },
  transparentOverlay: {
    backgroundColor: "rgba(255, 255, 255, 0.1)", // Your desired opacity
  },
  container: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 40,
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  greetingContainer: {
    marginBottom: 24,
    marginTop: 16,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2980b9",
    textAlign: "center",
  },
  featuresContainer: {
    gap: 25,
  },
  featureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 16,
  },
  featureButton: {
    width: "48%", // Slightly less than half to account for gap
    aspectRatio: 1, // Square buttons
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  featureBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    resizeMode: "contain",
  },
  featureBackgroundImage: {
    borderRadius: 16,
  },
  featureButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
    textAlign: "center",
    padding: 8,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 8,
    overflow: "hidden",
  },
});
