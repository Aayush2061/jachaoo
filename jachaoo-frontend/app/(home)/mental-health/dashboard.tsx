import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function MentalHealthDashboard() {
  const { user } = useUser();
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const primaryScale = useRef(new Animated.Value(1)).current;
  const [loading, setLoading] = useState(true);

  /* Fade-in animation on mount */
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();

    setTimeout(() => setLoading(false), 500);
  }, []);

  /* Primary CTA scale handlers */
  const primaryPressIn = () => {
    Animated.spring(primaryScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const primaryPressOut = () => {
    Animated.spring(primaryScale, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B3C73" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.background}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Greeting */}
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>
              Good day, {user?.firstName || "User"} 🌱
            </Text>
            <Text style={styles.subtitle}>
              How are you feeling today?
            </Text>
          </View>

          {/* PRIMARY ACTION */}
          <Animated.View
            style={{ transform: [{ scale: primaryScale }] }}
          >
            <Pressable
              onPressIn={primaryPressIn}
              onPressOut={primaryPressOut}
              onPress={() => {
                Haptics.impactAsync(
                  Haptics.ImpactFeedbackStyle.Light
                );
                router.push("/(home)/mental-health/check");
              }}
              style={styles.primaryPressable}
            >
              <LinearGradient
                colors={["#4A90E2", "#6BC4A1"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryCard}
              >
                <Text style={styles.primaryTitle}>
                  Mental Health Check
                </Text>
                <Text style={styles.primaryMeta}>
                  2–3 minutes • Private
                </Text>

                <View style={styles.primaryCTA}>
                  <Text style={styles.primaryCTAText}>
                    Start Check
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color="#FFFFFF"
                  />
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* SUPPORT */}
          <Section title="Support">
            <SupportItem
              icon="chatbubble-ellipses"
              title="Talk to Someone"
              subtitle="Connect with support or AI listener"
              onPress={() =>
                router.push("/(home)/mental-health/chat")
              }
            />
          </Section>

          {/* QUICK RELIEF */}
          <Section title="Quick Relief">
            <FeatureCard
              icon="leaf"
              title="Breathe & Calm"
              subtitle="Guided breathing exercises"
              onPress={() =>
                router.push("/(home)/mental-health/breathe")
              }
            />
            <FeatureCard
              icon="headset"
              title="Listen & Heal"
              subtitle="Relaxing audio sessions"
              onPress={() =>
                router.push("/(home)/mental-health/listen")
              }
            />
          </Section>

          {/* DAILY CARE */}
          <Section title="Daily Care">
            <FeatureCard
              icon="moon"
              title="Sleep Well"
              subtitle="Improve sleep quality"
              onPress={() =>
                router.push("/(home)/mental-health/sleepwell")
              }
            />
            <FeatureCard
              icon="checkmark-circle"
              title="Daily Goals"
              subtitle="Small goals for balance"
              onPress={() =>
                router.push("/(home)/mental-health/daily-goal")
              }
            />
          </Section>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

/* ---------------- REUSABLE COMPONENTS ---------------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

function FeatureCard({
  icon,
  title,
  subtitle,
  onPress,
}: any) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={onPress}
        style={styles.featureCard}
      >
        <Ionicons name={icon} size={26} color="#4A90E2" />
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureSubtitle}>{subtitle}</Text>
      </Pressable>
    </Animated.View>
  );
}

function SupportItem({
  icon,
  title,
  subtitle,
  onPress,
}: any) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPressIn={() =>
          Animated.spring(scale, {
            toValue: 0.97,
            useNativeDriver: true,
          }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
          }).start()
        }
        onPress={onPress}
        style={styles.supportItem}
      >
        <Ionicons name={icon} size={22} color="#4A90E2" />
        <View>
          <Text style={styles.supportTitle}>{title}</Text>
          <Text style={styles.supportSubtitle}>{subtitle}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#FAFAF7",
  },
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAF7",
  },

  greetingContainer: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    color: "#1B3C73",
    fontFamily: "Poppins-SemiBold",
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
    fontFamily: "Poppins-Regular",
  },

  primaryPressable: {
    marginBottom: 28,
  },
  primaryCard: {
    borderRadius: 24,
    padding: 22,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryTitle: {
    fontSize: 18,
    color: "#FFFFFF",
    fontFamily: "Poppins-SemiBold",
  },
  primaryMeta: {
    fontSize: 13,
    color: "#FFFFFF",
    opacity: 0.9,
    marginTop: 6,
    fontFamily: "Poppins-Regular",
  },
  primaryCTA: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  primaryCTAText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontFamily: "Poppins-SemiBold",
  },

  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    color: "#1B3C73",
    marginBottom: 14,
    fontFamily: "Poppins-SemiBold",
  },
  sectionContent: {
    gap: 12,
  },

  featureCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  featureTitle: {
    fontSize: 14,
    color: "#1B3C73",
    marginTop: 8,
    fontFamily: "Poppins-SemiBold",
  },
  featureSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
    fontFamily: "Poppins-Regular",
  },

  supportItem: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  supportTitle: {
    fontSize: 14,
    color: "#1B3C73",
    fontFamily: "Poppins-SemiBold",
  },
  supportSubtitle: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Poppins-Regular",
  },
});
