import { useRouter } from "expo-router";
import { 
  StyleSheet, 
  Text, 
  View, 
  Pressable, 
  SafeAreaView,
  Animated,
  ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";

export default function SleepwellScreen() {
  const router = useRouter();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, []);

  const features = [
    {
      title: "Audio Section",
      route: "/(home)/mental-health/sleepwell/audio",
      icon: "musical-notes",
    },
    {
      title: "Herbal Remedies",
      route: "/(home)/mental-health/sleepwell/herbal",
      icon: "leaf",
    },
    {
      title: "Home Rituals",
      route: "/(home)/mental-health/sleepwell/rituals",
      icon: "cafe",
    },
    {
      title: "Sleep Checklist",
      route: "/(home)/mental-health/sleepwell/checklist",
      icon: "checkmark-circle",
    },
  ];

  return (
    <SafeAreaView style={styles.background}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#1B3C73" />
            </Pressable>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Sleep Well</Text>
              <Text style={styles.subtitle}>
                Tools for better sleep and relaxation
              </Text>
            </View>
          </View>

          {/* Features - Single Column */}
          <View style={styles.featuresColumn}>
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                feature={feature}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(feature.route);
                }}
              />
            ))}
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>
              Explore different approaches to improve your sleep quality and create a relaxing bedtime routine.
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

function FeatureCard({ feature, onPress }: any) {
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
        <View style={styles.featureContent}>
          <View style={styles.featureLeft}>
            <View style={styles.featureIconContainer}>
              <Ionicons name={feature.icon} size={28} color="#4A90E2" />
            </View>
            <Text style={styles.featureTitle}>{feature.title}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#FAFAF7",
  },
  container: {
    padding: 24,
    marginTop:10
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    color: "#1B3C73",
    fontFamily: "Poppins-SemiBold",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins-Regular",
    marginTop: 2,
  },
  featuresColumn: {
    marginBottom: 32,
  },
  featureCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 18,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 16,
    width: "100%", // Full width, centered by parent
  },
  featureContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  featureLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F0F7FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureTitle: {
    fontSize: 16,
    color: "#1B3C73",
    fontFamily: "Poppins-SemiBold",
    flex: 1,
  },
  descriptionContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  descriptionText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    lineHeight: 22,
  },
});