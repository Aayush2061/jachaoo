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
  if (score <= 4) {
    return {
      title: "You seem to be doing okay",
      description: "Your answers show very low signs of depression right now.",
      advice: "Keep taking care of yourself. Small daily habits like good sleep, movement, and social connections really matter.",
      color: "#6BC4A1",
      level: "Minimal depression",
      scoreRange: "Score: 0-4",
      icon: "checkmark-circle",
    };
  }

  if (score <= 9) {
    return {
      title: "Some low mood signs noticed",
      description: "Your answers suggest mild depression. This is very common and manageable.",
      advice: "Gentle routines, short walks, sunlight, and talking to someone you trust can really help.",
      color: "#6C5CE7",
      level: "Mild depression",
      scoreRange: "Score: 5-9",
      icon: "sunny",
    };
  }

  if (score <= 14) {
    return {
      title: "Noticeable low mood signs",
      description: "Your answers suggest moderate depression that may be affecting your daily life.",
      advice: "You may benefit from guided activities, regular routines, or speaking with a mental health professional.",
      color: "#FFA726",
      level: "Moderate depression",
      scoreRange: "Score: 10-14",
      icon: "partly-sunny",
    };
  }

  if (score <= 19) {
    return {
      title: "Strong depression signs",
      description: "Your answers suggest moderately severe depression that may be difficult to handle alone.",
      advice: "Talking to a mental health professional is strongly recommended. Support can make a significant difference.",
      color: "#FF6B6B",
      level: "Moderately severe depression",
      scoreRange: "Score: 15-19",
      icon: "rainy",
    };
  }

  return {
    title: "Very strong depression signs",
    description: "Your answers suggest severe depression. You deserve care and support.",
    advice: "Please consider reaching out to a mental health professional as soon as possible. Help is available.",
    color: "#C0392B",
    level: "Severe depression",
    scoreRange: "Score: 20-27",
    icon: "warning",
  };
}

export default function DepressionResult() {
  const router = useRouter();
  const params = useLocalSearchParams<{ score: string; q9: string }>();
  const scaleAnim1 = useRef(new RNAnimated.Value(1)).current;
  const scaleAnim2 = useRef(new RNAnimated.Value(1)).current;
  const scaleAnim3 = useRef(new RNAnimated.Value(1)).current;

  const numericScore = params.score ? parseInt(params.score, 10) : 0;
  const q9Score = params.q9 ? parseInt(params.q9, 10) : 0;
  const result = getResultData(numericScore);
  const showSafetyNote = q9Score > 0;

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
            <Text style={styles.title}>Mood Check Results</Text>
            <Text style={styles.subtitle}>Based on PHQ-9 assessment</Text>
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
                <Text style={styles.scoreTotal}>/27</Text>
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

          {/* Safety Note for Q9 */}
          {showSafetyNote && (
            <Animated.View 
              entering={FadeInDown.delay(150)}
              style={styles.safetyCard}
            >
              <View style={styles.safetyHeader}>
                <Ionicons name="heart-circle" size={24} color="#C0392B" />
                <Text style={styles.safetyTitle}>Important Note</Text>
              </View>
              <Text style={styles.safetyText}>
                You mentioned thoughts about harming yourself or feeling better off not alive. 
                You are not alone, and help is available.
              </Text>
              <Text style={styles.safetyText}>
                Please consider talking to a trusted person or a mental health professional as soon as possible.
              </Text>
            </Animated.View>
          )}

          {/* Advice Card */}
          <Animated.View 
            entering={FadeInDown.delay(200)}
            style={styles.adviceCard}
          >
            <View style={styles.adviceHeader}>
              <Ionicons name="bulb-outline" size={24} color="#8E44AD" />
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
                onPress={() => handleButtonPress(scaleAnim1, "/(home)/mental-health/chat")}
              >
                <LinearGradient
                  colors={["#8E44AD", "#6C5CE7"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButton}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Talk to someone</Text>
                </LinearGradient>
              </Pressable>
            </RNAnimated.View>

            <RNAnimated.View style={{ transform: [{ scale: scaleAnim2 }] }}>
              <Pressable
                onPressIn={() => handlePressIn(scaleAnim2)}
                onPressOut={() => handlePressOut(scaleAnim2)}
                onPress={() => handleButtonPress(scaleAnim2, "/(home)/mental-health/breathe")}
                style={styles.secondaryButton}
              >
                <Ionicons name="leaf-outline" size={20} color="#8E44AD" />
                <Text style={styles.secondaryButtonText}>Try a calming exercise</Text>
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
                  color="#8E44AD"
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
    color: "#1B3C73",
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
    marginBottom: 20,
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
    color: "#1B3C73",
    fontFamily: "Poppins-SemiBold",
    lineHeight: 24,
  },
  resultDescription: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins-Regular",
    lineHeight: 20,
  },
  safetyCard: {
    backgroundColor: "#FFF5F5",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#FFE5E5",
  },
  safetyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  safetyTitle: {
    fontSize: 16,
    color: "#C0392B",
    fontFamily: "Poppins-SemiBold",
  },
  safetyText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins-Regular",
    lineHeight: 20,
    marginBottom: 8,
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
    color: "#1B3C73",
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
    borderColor: "#8E44AD",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: "#8E44AD",
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
    backgroundColor: "#F5EEFF",
    borderWidth: 1,
    borderColor: "#E5D9FF",
  },
  backButtonText: {
    fontSize: 14,
    color: "#8E44AD",
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