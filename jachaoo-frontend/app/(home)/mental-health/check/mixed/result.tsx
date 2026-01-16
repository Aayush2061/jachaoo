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

function getSeverity(type: string, score: number) {
  if (type === "stress") {
    if (score <= 14) return "Normal";
    if (score <= 18) return "Mild";
    if (score <= 25) return "Moderate";
    if (score <= 33) return "Severe";
    return "Extremely Severe";
  }

  if (type === "anxiety") {
    if (score <= 7) return "Normal";
    if (score <= 9) return "Mild";
    if (score <= 14) return "Moderate";
    if (score <= 19) return "Severe";
    return "Extremely Severe";
  }

  if (type === "depression") {
    if (score <= 9) return "Normal";
    if (score <= 13) return "Mild";
    if (score <= 20) return "Moderate";
    if (score <= 27) return "Severe";
    return "Extremely Severe";
  }

  return "Unknown";
}

function getExplanation(label: string, severity: string) {
  if (severity === "Normal") {
    return `Your ${label.toLowerCase()} level is within the normal range. This suggests you are coping reasonably well right now.`;
  }

  if (severity === "Mild") {
    return `You are showing mild signs of ${label.toLowerCase()}. This can happen during stressful periods and usually improves with rest and self-care.`;
  }

  if (severity === "Moderate") {
    return `Your responses suggest moderate ${label.toLowerCase()}. You may benefit from talking to someone you trust or using stress-management techniques.`;
  }

  if (severity === "Severe") {
    return `Your score suggests high ${label.toLowerCase()} symptoms. It may be helpful to seek professional support if these feelings continue.`;
  }

  return `Your score suggests very high ${label.toLowerCase()} symptoms. Professional support is strongly recommended.`;
}

export default function MixedResult() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scaleAnim1 = useRef(new RNAnimated.Value(1)).current;
  const scaleAnim2 = useRef(new RNAnimated.Value(1)).current;
  const scaleAnim3 = useRef(new RNAnimated.Value(1)).current;

  const stressScore = params.stressScore ? parseInt(params.stressScore as string, 10) : 0;
  const anxietyScore = params.anxietyScore ? parseInt(params.anxietyScore as string, 10) : 0;
  const depressionScore = params.depressionScore ? parseInt(params.depressionScore as string, 10) : 0;

  const stressSeverity = getSeverity("stress", stressScore);
  const anxietySeverity = getSeverity("anxiety", anxietyScore);
  const depressionSeverity = getSeverity("depression", depressionScore);

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

  const ResultCard = ({ 
    title, 
    score, 
    severity, 
    description, 
    color 
  }: { 
    title: string; 
    score: number; 
    severity: string; 
    description: string; 
    color: string; 
  }) => (
    <Animated.View 
      entering={FadeInDown.delay(100)}
      style={[styles.resultCard, { borderLeftColor: color }]}
    >
      <View style={styles.resultHeader}>
        <View style={styles.resultTitleContainer}>
          <View style={[styles.resultDot, { backgroundColor: color }]} />
          <Text style={[styles.resultTitle, { color }]}>{title}</Text>
        </View>
        <View style={[styles.scoreBadge, { backgroundColor: `${color}15` }]}>
          <Text style={[styles.scoreValue, { color }]}>{score}</Text>
          <Text style={styles.scoreMax}>/42</Text>
        </View>
      </View>
      
      <View style={styles.severityContainer}>
        <Text style={[styles.severityText, { color }]}>{severity}</Text>
      </View>
      
      <Text style={styles.resultDescription}>{description}</Text>
    </Animated.View>
  );

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
            <Text style={styles.title}>Your Wellbeing Summary</Text>
            <Text style={styles.subtitle}>
              Based on DASS-21 assessment
            </Text>
          </View>

          {/* Stress Result */}
          <ResultCard 
            title="Stress" 
            score={stressScore} 
            severity={stressSeverity}
            description={getExplanation("Stress", stressSeverity)}
            color="#2980B9"
          />

          {/* Anxiety Result */}
          <ResultCard 
            title="Anxiety" 
            score={anxietyScore} 
            severity={anxietySeverity}
            description={getExplanation("Anxiety", anxietySeverity)}
            color="#E67E22"
          />

          {/* Depression Result */}
          <ResultCard 
            title="Depression" 
            score={depressionScore} 
            severity={depressionSeverity}
            description={getExplanation("Depression", depressionSeverity)}
            color="#8E44AD"
          />

          {/* Advice Card */}
          <Animated.View 
            entering={FadeInDown.delay(400)}
            style={styles.adviceCard}
          >
            <View style={styles.adviceHeader}>
              <Ionicons name="bulb-outline" size={24} color="#2980B9" />
              <Text style={styles.adviceTitle}>What you can do next</Text>
            </View>
            <Text style={styles.adviceText}>
              • Take a few deep breaths to calm your nervous system{"\n"}
              • Talk to someone you trust about how you're feeling{"\n"}
              • Try a mindfulness or relaxation exercise{"\n"}
              • Consider speaking with a mental health professional
            </Text>
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
                  colors={["#8E44AD", "#2980B9"]}
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
                <Ionicons name="chatbubble-ellipses-outline" size={20} color="#2980B9" />
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
                <Ionicons name="arrow-back" size={18} color="#2980B9" />
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
  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  resultTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  resultDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  resultTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    flex: 1,
  },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  scoreValue: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
  },
  scoreMax: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Poppins-Regular",
    marginLeft: 2,
  },
  severityContainer: {
    marginBottom: 12,
  },
  severityText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
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
    borderColor: "#2980B9",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: "#2980B9",
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
    color: "#2980B9",
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