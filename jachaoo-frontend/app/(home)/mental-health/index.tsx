import { useAuth, useUser } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function MentalHealthIndex() {
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();

  const [isChecking, setIsChecking] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  /* Fade-in like dashboard */
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, []);

  /* Check onboarding status */
  useEffect(() => {
    const checkMentalHealthData = async () => {
      try {
        if (!user?.id) return;

        setIsChecking(true);
        const token = await getToken();

        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/mental-health/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        if (data.exists !== false) {
          router.replace("/(home)/mental-health/dashboard");
        }
      } catch (error) {
        console.error("Mental health check error:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkMentalHealthData();
  }, [user?.id]);

  if (isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B3C73" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.background}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* Header Content - Positioned higher */}
        <View style={styles.headerContent}>
          <Text style={styles.title}>Your Mental Well-Being</Text>
          <Text style={styles.subtitle}>
            A calm, private space to understand and care for your mind.
          </Text>
        </View>

        {/* Illustration */}
        <Image
          source={require("@/assets/images/butterfly1.png")}
          style={styles.image}
          resizeMode="contain"
        />

        {/* Spacer to push button down */}
        <View style={styles.spacer} />

        {/* CTA - Positioned at bottom */}
        <View style={styles.buttonContainer}>
          <Animated.View
            style={{ transform: [{ scale: scaleAnim }], width: "100%" }}
          >
            <Pressable
              onPressIn={() =>
                Animated.spring(scaleAnim, {
                  toValue: 0.96,
                  useNativeDriver: true,
                }).start()
              }
              onPressOut={() =>
                Animated.spring(scaleAnim, {
                  toValue: 1,
                  friction: 4,
                  tension: 40,
                  useNativeDriver: true,
                }).start()
              }
              onPress={() => {
                Haptics.impactAsync(
                  Haptics.ImpactFeedbackStyle.Light
                );
                router.push("/(home)/mental-health/onboarding");
              }}
            >
              <LinearGradient
                colors={["#4A90E2", "#6BC4A1"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cta}
              >
                <Text style={styles.ctaText}>Get Started</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#FAFAF7",
  },
  container: {
    flex: 1,
    padding: 25,
    paddingTop: 80, // Reduced top padding to move content higher
  },

  headerContent: {
    alignItems: "center",
    marginTop: 30, // Reduced margin to move title higher
  },

  title: {
    fontSize: 28, // Slightly larger for emphasis
    color: "#1B3C73",
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16, // Slightly larger
    color: "#666",
    marginTop: 12,
    textAlign: "center",
    fontFamily: "Poppins-Regular",
    maxWidth: 300,
    lineHeight: 22,
  },

  image: {
    width: 220, // Slightly larger
    height: 220,
    alignSelf: "center",
    marginTop: 80, // Reduced margin to move image higher
    opacity: 0.9,
  },

  spacer: {
    flex: 1, // This will push everything below it to the bottom
  },

  buttonContainer: {
    width: "100%",
    marginBottom: 100, // Ensures button has space from bottom
  },

  cta: {
    borderRadius: 24,
    paddingVertical: 18, // Slightly taller
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 18, // Slightly larger
    fontFamily: "Poppins-SemiBold",
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#FAFAF7",
    justifyContent: "center",
    alignItems: "center",
  },
});