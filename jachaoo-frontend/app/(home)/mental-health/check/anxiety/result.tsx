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
      description: "Your answers show very low signs of anxiety right now.",
      advice: "Keep taking care of yourself. Small daily habits like good sleep, movement, and breaks really matter.",
      color: "#6BC4A1",
      level: "Minimal anxiety",
      scoreRange: "Score: 0-4",
      icon: "checkmark-circle",
    };
  }

  if (score <= 9) {
    return {
      title: "Some anxiety signs noticed",
      description: "Your answers suggest mild anxiety. This is very common and manageable.",
      advice: "Breathing exercises, journaling, and talking to someone you trust can really help.",
      color: "#4A90E2",
      level: "Mild anxiety",
      scoreRange: "Score: 5-9",
      icon: "sunny",
    };
  }

  if (score <= 14) {
    return {
      title: "Noticeable anxiety signs",
      description: "Your answers suggest moderate anxiety that may be affecting your daily life.",
      advice: "You may benefit from guided relaxation, regular routines, or speaking with a mental health professional.",
      color: "#FFA726",
      level: "Moderate anxiety",
      scoreRange: "Score: 10-14",
      icon: "partly-sunny",
    };
  }

  return {
    title: "Strong anxiety signs",
    description: "Your answers suggest higher levels of anxiety that may be difficult to handle alone.",
    advice: "Talking to a mental health professional is strongly recommended. You deserve support.",
    color: "#FF6B6B",
    level: "Severe anxiety",
    scoreRange: "Score: 15-21",
    icon: "rainy",
  };
}

export default function AnxietyResult() {
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
            <Text style={styles.title}>Anxiety Check Results</Text>
            <Text style={styles.subtitle}>Based on GAD-7 assessment</Text>
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
                <Text style={styles.scoreTotal}>/21</Text>
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
              <Ionicons name="bulb-outline" size={24} color="#4A90E2" />
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
                  colors={["#4A90E2", "#6BC4A1"]}
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
                <Ionicons name="chatbubble-ellipses-outline" size={20} color="#4A90E2" />
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
                color="#4A90E2"
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
    borderColor: "#4A90E2",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: "#4A90E2",
    fontFamily: "Poppins-SemiBold",
  },
  tertiaryButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  tertiaryButtonText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins-Regular",
  },
  disclaimer: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    lineHeight: 18,
    opacity: 0.7,
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
  color: "#4A90E2",
  fontFamily: "Poppins-Medium",
},

});