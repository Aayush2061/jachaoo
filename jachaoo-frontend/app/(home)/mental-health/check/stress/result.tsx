import { useLocalSearchParams, useRouter } from "expo-router";
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
import Animated, { FadeInDown } from "react-native-reanimated";

function getResultData(score: number) {
  if (score <= 14) {
    return {
      title: "Your stress level looks normal",
      description: "Your answers suggest that stress is not heavily affecting you right now.",
      advice: "Keep maintaining healthy routines like rest, movement, and taking breaks when needed.",
      color: "#27ae60",
      level: "Normal stress",
      scoreRange: "Score: 0-14",
      icon: "checkmark-circle",
    };
  }

  if (score <= 18) {
    return {
      title: "Mild stress noticed",
      description: "You may be experiencing some stress, which is common in daily life.",
      advice: "Short breaks, breathing exercises, and talking to someone you trust can help.",
      color: "#f1c40f",
      level: "Mild stress",
      scoreRange: "Score: 15-18",
      icon: "sunny",
    };
  }

  if (score <= 25) {
    return {
      title: "Moderate stress detected",
      description: "Your stress level may be affecting your mood, focus, or daily activities.",
      advice: "Consider stress-management practices like relaxation exercises, routines, or professional support.",
      color: "#e67e22",
      level: "Moderate stress",
      scoreRange: "Score: 19-25",
      icon: "partly-sunny",
    };
  }

  if (score <= 33) {
    return {
      title: "High stress level",
      description: "Your answers suggest high stress that may be difficult to manage alone.",
      advice: "Talking to a mental health professional or counselor is strongly recommended.",
      color: "#e74c3c",
      level: "Severe stress",
      scoreRange: "Score: 26-33",
      icon: "rainy",
    };
  }

  return {
    title: "Very high stress level",
    description: "Your stress level is extremely high and may be overwhelming.",
    advice: "Please seek professional help as soon as possible. Support can make a big difference.",
    color: "#c0392b",
    level: "Extremely severe stress",
    scoreRange: "Score: 34+",
    icon: "warning",
  };
}

export default function StressResult() {
  const router = useRouter();
  const params = useLocalSearchParams<{ score: string }>();
  const scaleAnim1 = useRef(new RNAnimated.Value(1)).current;
  const scaleAnim2 = useRef(new RNAnimated.Value(1)).current;
  const scaleAnim3 = useRef(new RNAnimated.Value(1)).current;

  const numericScore = params.score ? parseInt(params.score, 10) : 0;
  const result = getResultData(numericScore);

  const handleButtonPress = (scaleAnim: RNAnimated.Value, route: string) => {
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
        router.push(route);
      });
    });
  };

  const handlePressIn = (scaleAnim: RNAnimated.Value) => {
    RNAnimated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (scaleAnim: RNAnimated.Value) => {
    RNAnimated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={styles.background}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Stress Check Results</Text>
            <Text style={styles.subtitle}>Based on DASS-21 Stress assessment</Text>
          </View>

          {/* Score Card */}
          <Animated.View 
            entering={FadeInDown.delay(100)}
            style={styles.scoreCard}
          >
            {/* Score Display */}
            <View style={styles.scoreHeader}>
              <View style={[styles.scoreCircle, { backgroundColor: result.color }]}>
                <Text style={styles.scoreNumber}>{numericScore}</Text>
                <Text style={styles.scoreTotal}>/42</Text>
              </View>
              
              <View style={styles.scoreInfo}>
                <Text style={[styles.scoreLevel, { color: result.color }]}>
                  {result.level}
                </Text>
                <Text style={styles.scoreRange}>{result.scoreRange}</Text>
              </View>
            </View>

            {/* Result Content */}
            <View style={styles.resultContent}>
              <Text style={styles.resultTitle}>{result.title}</Text>
              <Text style={styles.resultDescription}>{result.description}</Text>
            </View>
          </Animated.View>

          {/* Advice Card */}
          <Animated.View 
            entering={FadeInDown.delay(200)}
            style={styles.adviceCard}
          >
            <View style={styles.adviceHeader}>
              <Ionicons name="bulb-outline" size={24} color="#2980b9" />
              <Text style={styles.adviceTitle}>What you can do next</Text>
            </View>
            <Text style={styles.adviceText}>{result.advice}</Text>
          </Animated.View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <RNAnimated.View style={{ transform: [{ scale: scaleAnim1 }] }}>
              <Pressable
                onPressIn={() => handlePressIn(scaleAnim1)}
                onPressOut={() => handlePressOut(scaleAnim1)}
                onPress={() => handleButtonPress(scaleAnim1, "/(home)/mental-health/breathe")}
              >
                <LinearGradient
                  colors={["#2980b9", "#27ae60"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButton}
                >
                  <Ionicons name="leaf-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Try a calming exercise</Text>
                </LinearGradient>
              </Pressable>
            </RNAnimated.View>

            <RNAnimated.View style={{ transform: [{ scale: scaleAnim2 }] }}>
              <Pressable
                onPressIn={() => handlePressIn(scaleAnim2)}
                onPressOut={() => handlePressOut(scaleAnim2)}
                onPress={() => handleButtonPress(scaleAnim2, "/(home)/mental-health/chat")}
                style={styles.secondaryButton}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={20} color="#2980b9" />
                <Text style={styles.secondaryButtonText}>Talk to someone</Text>
              </Pressable>
            </RNAnimated.View>

            <RNAnimated.View style={{ transform: [{ scale: scaleAnim3 }] }}>
              <Pressable
                onPressIn={() => handlePressIn(scaleAnim3)}
                onPressOut={() => handlePressOut(scaleAnim3)}
                onPress={() => {
                  Haptics.selectionAsync();
                  router.replace("/(home)/mental-health/check");
                }}
                style={styles.backButton}
              >
                <Ionicons
                  name="arrow-back"
                  size={18}
                  color="#2980b9"
                />
                <Text style={styles.backButtonText}>
                  Back to mental health checks
                </Text>
              </Pressable>
            </RNAnimated.View>
          </View>

          {/* Disclaimer */}
          <Text style={styles.disclaimer}>
            This check is not a medical diagnosis. It is meant to help you understand how you've been feeling.
          </Text>
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
  title: {
    fontSize: 24,
    color: "#2c3e50",
    fontFamily: "Poppins-SemiBold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins-Regular",
  },
  scoreCard: {
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
  scoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E8F4F8",
  },
  scoreCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreNumber: {
    fontSize: 28,
    color: "#FFFFFF",
    fontFamily: "Poppins-Bold",
    lineHeight: 32,
  },
  scoreTotal: {
    fontSize: 12,
    color: "#FFFFFF",
    fontFamily: "Poppins-Regular",
    opacity: 0.9,
  },
  scoreInfo: {
    flex: 1,
  },
  scoreLevel: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 4,
  },
  scoreRange: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins-Regular",
  },
  resultContent: {
    gap: 8,
  },
  resultTitle: {
    fontSize: 18,
    color: "#2c3e50",
    fontFamily: "Poppins-SemiBold",
    lineHeight: 24,
  },
  resultDescription: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins-Regular",
    lineHeight: 20,
  },
  adviceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  adviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  adviceTitle: {
    fontSize: 18,
    color: "#2c3e50",
    fontFamily: "Poppins-SemiBold",
  },
  adviceText: {
    fontSize: 15,
    color: "#666",
    fontFamily: "Poppins-Regular",
    lineHeight: 22,
  },
  actionsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  primaryButton: {
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: "Poppins-SemiBold",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderWidth: 2,
    borderColor: "#2980b9",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: "#2980b9",
    fontFamily: "Poppins-SemiBold",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: "#EEF6FB",
    borderWidth: 1,
    borderColor: "#D6EAF8",
  },
  backButtonText: {
    fontSize: 14,
    color: "#2980b9",
    fontFamily: "Poppins-Medium",
  },
  disclaimer: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    lineHeight: 18,
    opacity: 0.7,
  },
});