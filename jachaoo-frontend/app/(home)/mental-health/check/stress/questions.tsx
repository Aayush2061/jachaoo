import { useRouter } from "expo-router";
import { useState, useRef } from "react";
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

/* -------------------- DATA -------------------- */
const STRESS_QUESTIONS = [
  {
    id: 1,
    text: "I found it hard to relax or calm down",
    example: "Even when sitting or resting, my mind or body felt tense",
  },
  {
    id: 2,
    text: "Small things made me very upset",
    example: "Minor problems felt big and annoying",
  },
  {
    id: 3,
    text: "I felt restless or full of nervous energy",
    example: "Feeling uneasy, shaky, or unable to sit calmly",
  },
  {
    id: 4,
    text: "I felt easily irritated or angry",
    example: "Getting annoyed quickly with people or situations",
  },
  {
    id: 5,
    text: "I found it hard to fully relax",
    example: "Body felt tight even when nothing serious was happening",
  },
  {
    id: 6,
    text: "Delays or interruptions bothered me a lot",
    example: "Getting angry when plans didn't go smoothly",
  },
  {
    id: 7,
    text: "I felt very sensitive or touchy",
    example: "Feeling hurt or upset easily",
  },
];

const ANSWER_OPTIONS = [
  { label: "Did not happen at all", value: 0 },
  { label: "Happened a little", value: 1 },
  { label: "Happened a lot", value: 2 },
  { label: "Happened almost every day", value: 3 },
];

/* -------------------- COMPONENT -------------------- */
export default function StressQuestions() {
  const router = useRouter();
  const scaleAnims = useRef(
    ANSWER_OPTIONS.reduce((acc, option) => {
      acc[option.value] = new RNAnimated.Value(1);
      return acc;
    }, {} as Record<number, RNAnimated.Value>)
  ).current;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(STRESS_QUESTIONS.length).fill(null)
  );

  const currentQuestion = STRESS_QUESTIONS[currentIndex];
  const answeredCount = answers.filter(a => a !== null).length;
  const rawScore = answers.reduce((sum, val) => sum + (val ?? 0), 0);
  const finalScore = rawScore * 2;
  const isAnswered = answers[currentIndex] !== null;
  const allAnswered = answers.every(a => a !== null);

  const handleSelect = (value: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const updated = [...answers];
    updated[currentIndex] = value;
    setAnswers(updated);
  };

  const handleFinish = () => {
    if (!allAnswered) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    router.push({
      pathname: "/(home)/mental-health/check/stress/result",
      params: { score: finalScore.toString() },
    });
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentIndex(i => i + 1);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentIndex(i => i - 1);
  };

  const handlePressIn = (value: number) => {
    RNAnimated.spring(scaleAnims[value], {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (value: number) => {
    RNAnimated.spring(scaleAnims[value], {
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
          {/* Simplified Header - Score only */}
          <View style={styles.header}>
            <View style={styles.scoreContainer}>
              <LinearGradient
                colors={["#2980b9", "#27ae60"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.scoreGradient}
              >
                <Text style={styles.scoreText}>Raw Score: {rawScore}/21</Text>
              </LinearGradient>
            </View>
            <Text style={styles.instructionText}>
              Answer based on how often you've felt this way in the last 7 days
            </Text>
          </View>

          {/* Progress Bar with integrated label */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                Question {currentIndex + 1} of {STRESS_QUESTIONS.length}
              </Text>
              <Text style={styles.progressPercent}>
                {Math.round((answeredCount / STRESS_QUESTIONS.length) * 100)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={["#2980b9", "#27ae60"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.progressFill,
                  { width: `${(answeredCount / STRESS_QUESTIONS.length) * 100}%` }
                ]}
              />
            </View>
          </View>

          {/* Question Card - Clean and focused */}
          <Animated.View 
            entering={FadeInDown.delay(100)}
            style={styles.questionCard}
          >
            <Text style={styles.questionText}>{currentQuestion.text}</Text>
            <Text style={styles.questionExample}>{currentQuestion.example}</Text>
          </Animated.View>

          {/* Answer Options */}
          <View style={styles.optionsContainer}>
            {ANSWER_OPTIONS.map((option, index) => (
              <Animated.View
                key={option.value}
                entering={FadeInDown.delay(200 + index * 50)}
                style={styles.optionWrapper}
              >
                <RNAnimated.View style={{ transform: [{ scale: scaleAnims[option.value] }] }}>
                  <Pressable
                    onPressIn={() => handlePressIn(option.value)}
                    onPressOut={() => handlePressOut(option.value)}
                    onPress={() => handleSelect(option.value)}
                    style={({ pressed }) => [
                      styles.optionButton,
                      pressed && styles.optionButtonPressed,
                      answers[currentIndex] === option.value && styles.optionButtonSelected,
                    ]}
                  >
                    <View style={styles.optionLeft}>
                      <View style={[
                        styles.radioOuter,
                        answers[currentIndex] === option.value && styles.radioOuterSelected
                      ]}>
                        {answers[currentIndex] === option.value && (
                          <View style={styles.radioInner} />
                        )}
                      </View>
                      <Text style={[
                        styles.optionLabel,
                        answers[currentIndex] === option.value && styles.optionLabelSelected
                      ]}>
                        {option.label}
                      </Text>
                    </View>
                    
                    {answers[currentIndex] === option.value && (
                      <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
                    )}
                  </Pressable>
                </RNAnimated.View>
              </Animated.View>
            ))}
          </View>

          {/* Navigation */}
          <View style={styles.navigationContainer}>
            {currentIndex > 0 && (
              <Pressable
                style={styles.backButton}
                onPress={handleBack}
              >
                <Ionicons name="arrow-back" size={18} color="#2c3e50" />
                <Text style={styles.backButtonText}>Previous</Text>
              </Pressable>
            )}

            {currentIndex === STRESS_QUESTIONS.length - 1 ? (
              <Pressable
                style={[
                  styles.finishButton,
                  !allAnswered && styles.disabledButton,
                ]}
                disabled={!allAnswered}
                onPress={handleFinish}
              >
                <LinearGradient
                  colors={["#2980b9", "#27ae60"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.finishButtonGradient}
                >
                  <Text style={styles.finishButtonText}>See Results</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                </LinearGradient>
              </Pressable>
            ) : (
              <Pressable
                style={[
                  styles.nextButton,
                  !isAnswered && styles.disabledButton,
                ]}
                disabled={!isAnswered}
                onPress={handleNext}
              >
                <LinearGradient
                  colors={["#2980b9", "#27ae60"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.nextButtonGradient}
                >
                  <Text style={styles.nextButtonText}>Continue</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </LinearGradient>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* -------------------- STYLES -------------------- */
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
    marginBottom: 24,
  },
  scoreContainer: {
    marginBottom: 12,
  },
  scoreGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: "Poppins-SemiBold",
  },
  instructionText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: "#2c3e50",
    fontFamily: "Poppins-SemiBold",
  },
  progressPercent: {
    fontSize: 14,
    color: "#2980b9",
    fontFamily: "Poppins-SemiBold",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E8F4F8",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  questionCard: {
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
  questionText: {
    fontSize: 20,
    color: "#2c3e50",
    fontFamily: "Poppins-SemiBold",
    lineHeight: 28,
    marginBottom: 12,
  },
  questionExample: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins-Regular",
    lineHeight: 20,
    fontStyle: "italic",
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  optionWrapper: {
    width: "100%",
  },
  optionButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionButtonPressed: {
    opacity: 0.9,
  },
  optionButtonSelected: {
    backgroundColor: "#F8FBFF",
    borderColor: "#2980b9",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#2980b9",
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterSelected: {
    backgroundColor: "#2980b9",
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  optionLabel: {
    fontSize: 16,
    color: "#2c3e50",
    fontFamily: "Poppins-Regular",
    flex: 1,
  },
  optionLabelSelected: {
    color: "#2c3e50",
    fontFamily: "Poppins-SemiBold",
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: "#2c3e50",
    fontFamily: "Poppins-SemiBold",
  },
  nextButton: {
    flex: 1,
    marginLeft: 20,
    borderRadius: 20,
    overflow: "hidden",
  },
  nextButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: "Poppins-SemiBold",
  },
  finishButton: {
    flex: 1,
    marginLeft: 20,
    borderRadius: 20,
    overflow: "hidden",
  },
  finishButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  finishButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: "Poppins-SemiBold",
  },
  disabledButton: {
    opacity: 0.5,
  },
});