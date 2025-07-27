import { useUser } from "@clerk/clerk-expo";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

export default function HomePage() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasHealthData, setHasHealthData] = useState(false);
  const [healthData, setHealthData] = useState<any>(null);
  const [dailyTip, setDailyTip] = useState<{
    tip: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    const fetchDailyTip = async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/health-tips/random`
        );
        const data = await response.json();
        setDailyTip(data);
      } catch (error) {
        console.error("Error fetching daily tip:", error);
        // Fallback to a default tip if API fails
        setDailyTip({
          tip: "Drink at least 8 glasses of water daily",
          description:
            "Helps maintain fluid balance, supports digestion, and keeps skin healthy.",
        });
      }
    };

    fetchDailyTip();
  }, []);

  useEffect(() => {
    const checkHealthData = async () => {
      try {
        if (!user?.id) return;
        setLoading(true);
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/health/${user.id}`
        );
        const data = await response.json();

        if (data && data.userId) {
          setHasHealthData(true);
          setHealthData(data);
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

  const features = [
    {
      id: 1,
      title: "Symptom Checker",
      icon: "stethoscope",
      color: "#5E8BFF90", // Added alpha channel for transparency
      iconLib: FontAwesome5,
      route: "/(home)/symptoms",
      image: require("../../assets/images/home-page-icons/symptoms.jpg"),
    },
    {
      id: 2,
      title: "First Aid",
      icon: "first-aid",
      color: "#FF6B6B90",
      iconLib: FontAwesome5,
      route: "/firstaid",
      image: require("../../assets/images/home-page-icons/firstaid.jpg"),
    },
    {
      id: 3,
      title: "Lab Report Analysis",
      icon: "file-alt",
      color: "#6BD0FF90",
      iconLib: FontAwesome5,
      route: "/(home)/reports",
      image: require("../../assets/images/home-page-icons/reportanalysis.jpg"),
    },
    {
      id: 4,
      title: "Period Tracker",
      icon: "heart",
      color: "#FF8E9E90",
      iconLib: FontAwesome5,
      route: "/(home)/periods",
      image: require("../../assets/images/home-page-icons/periods.jpg"),
    },
    {
      id: 5,
      title: "Mental Health",
      icon: "brain",
      color: "#A78BFA90",
      iconLib: FontAwesome5,
      route: "/(home)/mental-health",
      image: require("../../assets/images/home-page-icons/mental-health.jpg"),
    },
  ];

  const scaleValues = features.map(() => new Animated.Value(1));

  const handlePressIn = (index: number) => {
    Animated.spring(scaleValues[index], {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (index: number) => {
    Animated.spring(scaleValues[index], {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#5E8BFF" />
        <Text style={styles.loadingText}>Loading your health data...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#F8FAFF", "#ECF2FF"]}
      style={styles.background}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.greeting}>
                Hello, {healthData?.name || "User"}
              </Text>
              <Text style={styles.subtitle}>
                Your personal health companion
              </Text>
            </View>
            <Link href="/(home)/profile" asChild>
              <Pressable
                style={styles.profileButton}
                android_ripple={{ color: "#E6F0FF", borderless: true }}
              >
                <Ionicons name="person-circle" size={44} color="#5E8BFF" />
              </Pressable>
            </Link>
          </View>

          {/* Features Grid */}
          <Text style={styles.sectionTitle}>Health Services</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <Animated.View
                key={feature.id}
                style={{
                  transform: [{ scale: scaleValues[index] }],
                }}
              >
                <Pressable
                  onPress={() => router.push(feature.route)}
                  onPressIn={() => handlePressIn(index)}
                  onPressOut={() => handlePressOut(index)}
                >
                  <ImageBackground
                    source={feature.image}
                    style={[
                      styles.featureCard,
                      { backgroundColor: feature.color },
                    ]}
                    imageStyle={styles.featureImage}
                  >
                    <View style={styles.featureContent}>
                      <View style={styles.featureIconContainer}>
                        <feature.iconLib
                          name={feature.icon}
                          size={28}
                          color="white"
                        />
                      </View>
                      <Text style={styles.featureText}>{feature.title}</Text>
                    </View>
                  </ImageBackground>
                </Pressable>
              </Animated.View>
            ))}
          </View>

          {/* Health Tip */}
          {dailyTip && (
            <View style={styles.tipCard}>
              <View style={styles.tipHeader}>
                <Ionicons name="sparkles" size={20} color="#FFC107" />
                <Text style={styles.tipTitle}>Daily Health Tip</Text>
              </View>
              <Text style={styles.tipContent}>
                <Text style={{ fontWeight: "bold" }}>{dailyTip.tip}</Text>:{" "}
                {dailyTip.description}
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    flex: 1,
    // backgroundColor: "#F8FAFF",
    paddingBottom: 60,
  },
  background: {
    flex: 1,
    width: "100%",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#5E8BFF",
    marginTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1A237E",
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    fontSize: 15,
    color: "#64748B",
    marginTop: 6,
    fontFamily: "Inter_400Regular",
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A237E",
    marginBottom: 18,
    fontFamily: "Inter_600SemiBold",
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  tipCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 8,
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A237E",
    fontFamily: "Inter_600SemiBold",
  },
  tipContent: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
  },
  featureCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 0.9,
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  featureImage: {
    opacity: 0.8,
    resizeMode: "cover",
  },
  featureContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  featureText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginTop: 8,
    textAlign: "center",
  },
});
