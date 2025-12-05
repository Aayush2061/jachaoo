import { useAuth, useUser } from "@clerk/clerk-expo";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 70) / 2;

export default function HomePage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasHealthData, setHasHealthData] = useState(false);
  const [healthData, setHealthData] = useState<any>(null);
  const [dailyTip, setDailyTip] = useState<{
    tip: string;
    description: string;
  } | null>(null);
  const [lastTipDate, setLastTipDate] = useState<string>("");

  // Heartbeat animation
  const heartbeat = new Animated.Value(1);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartbeat, {
          toValue: 1.2,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(heartbeat, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Function to fetch daily tip
  const fetchDailyTip = async () => {
    try {
      const today = new Date().toDateString();

      if (lastTipDate !== today) {
        const token = await getToken();
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/health-tips/random`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setDailyTip(data);
        setLastTipDate(today);

        await AsyncStorage.setItem("lastTipDate", today);
        await AsyncStorage.setItem("dailyTip", JSON.stringify(data));
      }
    } catch (error) {
      console.error("Error fetching daily tip:", error);

      const cachedTip = await AsyncStorage.getItem("dailyTip");
      const cachedDate = await AsyncStorage.getItem("lastTipDate");

      if (cachedTip && cachedDate) {
        setDailyTip(JSON.parse(cachedTip));
        setLastTipDate(cachedDate);
      } else {
        setDailyTip({
          tip: "Drink at least 8 glasses of water daily",
          description:
            "Helps maintain fluid balance, supports digestion, and keeps skin healthy.",
        });
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      const loadCachedTip = async () => {
        const today = new Date().toDateString();
        const cachedDate = await AsyncStorage.getItem("lastTipDate");

        if (cachedDate === today) {
          const cachedTip = await AsyncStorage.getItem("dailyTip");
          if (cachedTip) {
            setDailyTip(JSON.parse(cachedTip));
            setLastTipDate(cachedDate);
          }
        } else {
          fetchDailyTip();
        }
      };

      loadCachedTip();
    }, [])
  );

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
          router.replace("/(home)/onboarding/welcome");
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
      title: "Symptom Diagnosis",
      subtitle: "AI-powered symptom analysis",
      icon: "stethoscope",
      stripeColor: "#2FB7F0",
      bgColor: "#E8F6FD",
      iconLib: FontAwesome5,
      route: "/(home)/symptoms",
    },
    {
      id: 2,
      title: "Lab Report",
      subtitle: "Scan & understand reports",
      icon: "file-medical-alt",
      stripeColor: "#1B3C73",
      bgColor: "#E8EDF5",
      iconLib: FontAwesome5,
      route: "/(home)/reports",
    },
    {
      id: 3,
      title: "First Aid",
      subtitle: "Emergency care guide",
      icon: "first-aid",
      stripeColor: "#FF6B6B",
      bgColor: "#FFE8E8",
      iconLib: FontAwesome5,
      route: "/firstaid",
    },
    {
      id: 4,
      title: "Period Tracker",
      subtitle: "Track your cycle",
      icon: "heartbeat",
      stripeColor: "#E84C88",
      bgColor: "#FFEAF1",
      iconLib: FontAwesome5,
      route: "/(home)/periods",
    },
    {
      id: 5,
      title: "Mental Health",
      subtitle: "Emotional wellness support",
      icon: "brain",
      stripeColor: "#7F5AF0",
      bgColor: "#F3EDFF",
      iconLib: FontAwesome5,
      route: "/(home)/mental-health",
    },
  ];

  const scaleValues = features.map(() => new Animated.Value(1));

  const handlePressIn = (index: number) => {
    Animated.spring(scaleValues[index], {
      toValue: 0.96,
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
        <ActivityIndicator size="large" color="#1B3C73" />
        <Text style={styles.loadingText}>Loading your health data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Premium Header Section */}
          <View style={styles.header}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>
                Hello, {healthData?.name || "User"} 👋
              </Text>
              <Text style={styles.subtitle}>Stay healthy today!</Text>
            </View>
            <View style={styles.headerRight}>
              <Animated.View
                style={[
                  styles.heartbeatIcon,
                  { transform: [{ scale: heartbeat }] },
                ]}
              ></Animated.View>
              <Link href="/(home)/profile" asChild>
                <Pressable style={styles.profilePicContainer}>
                  {user?.imageUrl ? (
                    <Image
                      source={{ uri: user.imageUrl }}
                      style={styles.profilePic}
                    />
                  ) : (
                    <View style={styles.profilePicPlaceholder}>
                      <Ionicons name="person" size={20} color="#1B3C73" />
                    </View>
                  )}
                </Pressable>
              </Link>
            </View>
          </View>

          {/* Main Features Grid */}
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <Animated.View
                key={feature.id}
                style={[
                  styles.featureCardWrapper,
                  {
                    transform: [{ scale: scaleValues[index] }],
                  },
                ]}
              >
                <Pressable
                  onPress={() => router.push(feature.route)}
                  onPressIn={() => handlePressIn(index)}
                  onPressOut={() => handlePressOut(index)}
                  style={styles.featureCardPressable}
                >
                  <View
                    style={[
                      styles.featureCard,
                      { backgroundColor: feature.bgColor },
                    ]}
                  >
                    {/* Colored stripe accent */}
                    <View
                      style={[
                        styles.stripeAccent,
                        { backgroundColor: feature.stripeColor },
                      ]}
                    />

                    <View style={styles.cardContent}>
                      <View
                        style={[
                          styles.iconCircle,
                          { backgroundColor: feature.stripeColor },
                        ]}
                      >
                        <feature.iconLib
                          name={feature.icon}
                          size={24}
                          color="white"
                        />
                      </View>
                      <View style={styles.textContainer}>
                        <Text style={styles.featureTitle}>{feature.title}</Text>
                        <Text style={styles.featureSubtitle}>
                          {feature.subtitle}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            ))}
          </View>

          {/* Premium Daily Tip Card */}
          {dailyTip && (
            <Pressable style={styles.tipCardPressable}>
              <LinearGradient
                colors={["#2FB7F0", "#1B3C73"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tipCard}
              >
                <View style={styles.tipHeader}>
                  <Ionicons name="bulb" size={24} color="#FFFFFF" />
                  <Text style={styles.tipTitle}>Today's Health Tip</Text>
                </View>
                <Text style={styles.tipContent}>{dailyTip.tip}</Text>
                <Text style={styles.tipDescription}>
                  {dailyTip.description}
                </Text>
              </LinearGradient>
            </Pressable>
          )}
          <Text style={styles.disclaimer}>
            Disclaimer: Jachao provides general health information and
            AI-generated insights. It does not offer medical advice, diagnosis,
            or treatment. Always consult a qualified healthcare professional for
            medical concerns.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    flex: 1,
    paddingBottom: 60,
  },
  background: {
    flex: 1,
    backgroundColor: "#FAFAF7",
  },
  scrollContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#FAFAF7",
  },
  loadingText: {
    fontSize: 16,
    color: "#1B3C73",
    marginTop: 16,
    fontFamily: "Poppins-Regular",
  },

  // Header Styles
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    // fontWeight: "600",
    color: "#1B3C73",
    fontFamily: "Poppins-SemiBold",
  },
  subtitle: {
    fontSize: 14,
    color: "#555555",
    marginTop: 2,
    fontFamily: "Poppins-Regular",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  heartbeatIcon: {
    // Animation container
  },
  profilePicContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#E8F0FE",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  profilePic: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
  },
  profilePicPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
    backgroundColor: "#E8F0FE",
    justifyContent: "center",
    alignItems: "center",
  },

  // Features Grid
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 26,
    rowGap: 16,
    columnGap: 12,
  },
  featureCardWrapper: {
    width: CARD_WIDTH,
  },
  featureCardPressable: {
    width: "100%",
  },
  featureCard: {
    width: "100%",
    height: 160,
    borderRadius: 24,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
    overflow: "hidden",
  },
  stripeAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingLeft: 22,
    justifyContent: "space-between",
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  textContainer: {
    gap: 4,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B3C73",
    letterSpacing: 0.2,
    fontFamily: "Poppins-Bold",
  },
  featureSubtitle: {
    fontSize: 12,
    color: "#666666",
    lineHeight: 16,
    fontFamily: "Poppins-Regular",
  },

  // Daily Tip Card
  tipCardPressable: {
    marginTop: 4,
  },
  tipCard: {
    borderRadius: 20,
    padding: 20,
    minHeight: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
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
    color: "#FFFFFF",
    fontFamily: "Poppins-SemiBold",
  },
  tipContent: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    lineHeight: 22,
    marginBottom: 6,
    fontFamily: "Poppins-SemiBold",
  },
  tipDescription: {
    fontSize: 13,
    color: "#FFFFFF",
    lineHeight: 20,
    opacity: 0.95,
    fontFamily: "Poppins-Regular",
  },
  disclaimer: {
    fontSize: 11,
    color: "#9CA3AF", // subtle grey
    textAlign: "center",
    marginTop: 30,
    paddingHorizontal: 20,
    lineHeight: 15,
    marginBottom: 20,
    fontFamily: "Poppins-Regular",
  },
});
