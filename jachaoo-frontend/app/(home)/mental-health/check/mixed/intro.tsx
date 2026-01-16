import { useRouter } from "expo-router";
import { useRef } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Animated as RNAnimated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

export default function MixedIntro() {
  const router = useRouter();
  const scaleAnim = useRef(new RNAnimated.Value(1)).current;

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    RNAnimated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start(() => {
      RNAnimated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }).start(() => {
        router.push("/(home)/mental-health/check/mixed/questions");
      });
    });
  };

  const handlePressIn = () => {
    RNAnimated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    RNAnimated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const features = [
    {
      icon: "layers-outline",
      text: "Stress, Anxiety & Depression",
      color: "#8E44AD",
    },
    {
      icon: "time-outline",
      text: "21 questions total",
      color: "#8E44AD",
    },
    {
      icon: "calendar-outline",
      text: "Based on last 7 days",
      color: "#8E44AD",
    },
    {
      icon: "shield-checkmark-outline",
      text: "Private & confidential",
      color: "#2980B9",
    },
  ];

  return (
    <SafeAreaView style={styles.background}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Header with Gradient Icon */}
          <Animated.View 
            entering={FadeInDown.delay(100)}
            style={styles.header}
          >
            <LinearGradient
              colors={["#8E44AD", "#2980B9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerIcon}
            >
              <Ionicons name="heart" size={32} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.title}>Mental Health Check</Text>
            <Text style={styles.subtitle}>
              Based on DASS-21 (Stress, Anxiety & Depression)
            </Text>
          </Animated.View>

          {/* Info Card */}
          <Animated.View 
            entering={FadeInDown.delay(200)}
            style={styles.infoCard}
          >
            <Text style={styles.infoTitle}>
              What this check is about
            </Text>
            <Text style={styles.infoDescription}>
              This check helps understand how stress, anxiety, and low mood may be affecting you. Your honest responses help provide meaningful insights.
            </Text>
            
            {/* Features Grid */}
            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <Animated.View
                  key={index}
                  entering={FadeInUp.delay(300 + index * 100)}
                  style={styles.featureItem}
                >
                  <View style={[styles.featureIcon, { backgroundColor: `${feature.color}15` }]}>
                    <Ionicons name={feature.icon} size={20} color={feature.color} />
                  </View>
                  <Text style={styles.featureText}>{feature.text}</Text>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* How It Works */}
          <Animated.View 
            entering={FadeInDown.delay(400)}
            style={styles.stepsCard}
          >
            <Text style={styles.stepsTitle}>How it works</Text>
            <View style={styles.stepsContainer}>
              {[
                "Read each question carefully",
                "Select how often you've felt that way in the last 7 days",
                "Answer all 21 questions honestly",
                "Get personalized insights on stress, anxiety & depression"
              ].map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Time Estimate */}
          <Animated.View 
            entering={FadeInDown.delay(500)}
            style={styles.timeCard}
          >
            <Ionicons name="time-outline" size={24} color="#8E44AD" />
            <View style={styles.timeContent}>
              <Text style={styles.timeTitle}>Quick & Private</Text>
              <Text style={styles.timeDescription}>
                Takes about 5–7 minutes. Your answers are completely private.
              </Text>
            </View>
          </Animated.View>

          {/* CTA Button */}
          <Animated.View 
            entering={FadeInUp.delay(600)}
            style={styles.buttonContainer}
          >
            <RNAnimated.View style={{ transform: [{ scale: scaleAnim }], width: "100%" }}>
              <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={handleStart}
              >
                <LinearGradient
                  colors={["#8E44AD", "#2980B9"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>Start Mental Health Check</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </LinearGradient>
              </Pressable>
            </RNAnimated.View>
          </Animated.View>

          {/* Footer */}
          <Animated.View 
            entering={FadeInDown.delay(700)}
            style={styles.footer}
          >
            <Text style={styles.footerText}>
              This tool is for self-understanding only and not a substitute for professional medical advice.
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#FAFAF7",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: {
    fontSize: 28,
    color: "#1B3C73",
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    color: "#1B3C73",
    fontFamily: "Poppins-SemiBold",
    marginBottom: 12,
    lineHeight: 24,
  },
  infoDescription: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins-Regular",
    lineHeight: 22,
    marginBottom: 24,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
    marginBottom: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  featureText: {
    fontSize: 12,
    color: "#1B3C73",
    fontFamily: "Poppins-Regular",
    flex: 1,
    lineHeight: 16,
  },
  stepsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  stepsTitle: {
    fontSize: 18,
    color: "#1B3C73",
    fontFamily: "Poppins-SemiBold",
    marginBottom: 20,
  },
  stepsContainer: {
    gap: 16,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#8E44AD",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontFamily: "Poppins-SemiBold",
  },
  stepText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins-Regular",
    lineHeight: 22,
    flex: 1,
    paddingTop: 4,
  },
  timeCard: {
    backgroundColor: "#F8FBFF",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: "#E8F4F8",
  },
  timeContent: {
    flex: 1,
  },
  timeTitle: {
    fontSize: 16,
    color: "#1B3C73",
    fontFamily: "Poppins-SemiBold",
    marginBottom: 4,
  },
  timeDescription: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins-Regular",
    lineHeight: 20,
  },
  buttonContainer: {
    width: "100%",
    marginBottom: 32,
  },
  button: {
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  buttonText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontFamily: "Poppins-SemiBold",
  },
  footer: {
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  footerText: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    lineHeight: 18,
    opacity: 0.7,
  },
});