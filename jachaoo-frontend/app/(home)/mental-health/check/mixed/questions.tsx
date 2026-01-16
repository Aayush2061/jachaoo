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
const QUESTIONS = [
  {
    id: 1,
    type: "stress",
    text: "I found it hard to calm myself or relax.",
    example: "Even when sitting quietly, my mind or body felt tense.",
  },
  {
    id: 2,
    type: "stress",
    text: "I reacted too strongly to small problems.",
    example: "Small issues made me very angry or upset.",
  },
  {
    id: 3,
    type: "stress",
    text: "I felt full of nervous energy.",
    example: "Feeling restless or unable to sit calmly.",
  },
  {
    id: 4,
    type: "stress",
    text: "I felt easily irritated or annoyed.",
    example: "Getting angry quickly with people around me.",
  },
  {
    id: 5,
    type: "stress",
    text: "I found it hard to relax even when I had time.",
    example: "Body felt tight even while resting.",
  },
  {
    id: 6,
    type: "stress",
    text: "Delays or interruptions bothered me a lot.",
    example: "Getting upset when someone disturbed your work.",
  },
  {
    id: 7,
    type: "stress",
    text: "I felt very sensitive or touchy.",
    example: "Feeling hurt or upset very easily.",
  },
  {
    id: 8,
    type: "anxiety",
    text: "My mouth felt dry without any clear reason.",
    example: "Dry mouth even when not thirsty or sick.",
  },
  {
    id: 9,
    type: "anxiety",
    text: "I had trouble breathing suddenly.",
    example: "Shortness of breath without physical work.",
  },
  {
    id: 10,
    type: "anxiety",
    text: "I felt shaky or trembling.",
    example: "Hands or body shaking due to nervousness.",
  },
  {
    id: 11,
    type: "anxiety",
    text: "I worried I might panic or embarrass myself.",
    example: "Fear of losing control in public.",
  },
  {
    id: 12,
    type: "anxiety",
    text: "I felt very close to panic.",
    example: "Feeling something bad might happen suddenly.",
  },
  {
    id: 13,
    type: "anxiety",
    text: "I felt scared without any clear reason.",
    example: "Feeling fear even when nothing was wrong.",
  },
  {
    id: 14,
    type: "anxiety",
    text: "My heart was beating very fast.",
    example: "Heart racing while resting.",
  },
  {
    id: 15,
    type: "depression",
    text: "I couldn't feel happy or enjoy things.",
    example: "Things you liked no longer felt enjoyable.",
  },
  {
    id: 16,
    type: "depression",
    text: "I found it hard to start doing things.",
    example: "No motivation to work or study.",
  },
  {
    id: 17,
    type: "depression",
    text: "I felt I had nothing to look forward to.",
    example: "Feeling hopeless about the future.",
  },
  {
    id: 18,
    type: "depression",
    text: "I felt sad, low, or empty.",
    example: "Feeling down most of the day.",
  },
  {
    id: 19,
    type: "depression",
    text: "I couldn't feel interested or excited about anything.",
    example: "No excitement even for good news.",
  },
  {
    id: 20,
    type: "depression",
    text: "I felt I was not worth much as a person.",
    example: "Feeling useless or like a burden.",
  },
  {
    id: 21,
    type: "depression",
    text: "Life felt meaningless.",
    example: "Feeling life has no purpose.",
  },
];

const ANSWER_OPTIONS = [
  { label: "Did not happen at all", value: 0 },
  { label: "Happened sometimes", value: 1 },
  { label: "Happened often", value: 2 },
  { label: "Happened almost every day", value: 3 },
];

/* -------------------- COMPONENT -------------------- */
export default function MixedQuestions() {
  const router = useRouter();
  const scaleAnims = useRef(
    ANSWER_OPTIONS.reduce((acc, option) => {
      acc[option.value] = new RNAnimated.Value(1);
      return acc;
    }, {} as Record<number, RNAnimated.Value>)
  ).current;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(QUESTIONS.length).fill(null)
  );

  const currentQuestion = QUESTIONS[currentIndex];
  const answeredCount = answers.filter(a => a !== null).length;
  
  // Calculate scores (same logic as before)
  const calculateScores = () => {
    let stress = 0;
    let anxiety = 0;
    let depression = 0;

    QUESTIONS.forEach((q, index) => {
      const score = answers[index] ?? 0;
      if (q.type === "stress") stress += score;
      if (q.type === "anxiety") anxiety += score;
      if (q.type === "depression") depression += score;
    });

    // DASS-21 rule: multiply by 2
    return {
      stress: stress * 2,
      anxiety: anxiety * 2,
      depression: depression * 2,
      stressRaw: stress,
      anxietyRaw: anxiety,
      depressionRaw: depression,
    };
  };

  const scores = calculateScores();
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
      pathname: "/(home)/mental-health/check/mixed/result",
      params: {
        stressScore: scores.stress.toString(),
        anxietyScore: scores.anxiety.toString(),
        depressionScore: scores.depression.toString(),
        stressRaw: scores.stressRaw.toString(),
        anxietyRaw: scores.anxietyRaw.toString(),
        depressionRaw: scores.depressionRaw.toString(),
      },
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

  const getTypeColor = (type: string) => {
    switch(type) {
      case "stress": return "#2980B9";
      case "anxiety": return "#E67E22";
      case "depression": return "#8E44AD";
      default: return "#666";
    }
  };

  return (
    <SafeAreaView style={styles.background}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Header with Progress */}
          <View style={styles.header}>
            <Text style={styles.title}>Mental Health Check</Text>
            <Text style={styles.instructionText}>
              Answer based on how often you've felt this way in the last 7 days
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                Question {currentIndex + 1} of {QUESTIONS.length}
              </Text>
              <Text style={styles.progressPercent}>
                {Math.round((answeredCount / QUESTIONS.length) * 100)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={["#8E44AD", "#2980B9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.progressFill,
                  { width: `${(answeredCount / QUESTIONS.length) * 100}%` }
                ]}
              />
            </View>
          </View>

          {/* Question Type Indicator */}
          <View style={[styles.typeIndicator, { backgroundColor: `${getTypeColor(currentQuestion.type)}15` }]}>
            <View style={[styles.typeDot, { backgroundColor: getTypeColor(currentQuestion.type) }]} />
            <Text style={[styles.typeText, { color: getTypeColor(currentQuestion.type) }]}>
              {currentQuestion.type.charAt(0).toUpperCase() + currentQuestion.type.slice(1)}
            </Text>
          </View>

          {/* Question Card */}
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
                      <Ionicons name="checkmark-circle" size={20} color="#2980B9" />
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
                <Ionicons name="arrow-back" size={18} color="#1B3C73" />
                <Text style={styles.backButtonText}>Previous</Text>
              </Pressable>
            )}

            {currentIndex === QUESTIONS.length - 1 ? (
              <Pressable
                style={[
                  styles.finishButton,
                  !allAnswered && styles.disabledButton,
                ]}
                disabled={!allAnswered}
                onPress={handleFinish}
              >
                <LinearGradient
                  colors={["#8E44AD", "#2980B9"]}
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
                  colors={["#8E44AD", "#2980B9"]}
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

          {/* Current Scores (for reference) */}
          <View style={styles.scoresContainer}>
            <View style={styles.scoreItem}>
              <View style={[styles.scoreDot, { backgroundColor: "#2980B9" }]} />
              <Text style={styles.scoreLabel}>Stress:</Text>
              <Text style={styles.scoreValue}>{scores.stressRaw * 2}</Text>
            </View>
            <View style={styles.scoreItem}>
              <View style={[styles.scoreDot, { backgroundColor: "#E67E22" }]} />
              <Text style={styles.scoreLabel}>Anxiety:</Text>
              <Text style={styles.scoreValue}>{scores.anxietyRaw * 2}</Text>
            </View>
            <View style={styles.scoreItem}>
              <View style={[styles.scoreDot, { backgroundColor: "#8E44AD" }]} />
              <Text style={styles.scoreLabel}>Depression:</Text>
              <Text style={styles.scoreValue}>{scores.depressionRaw * 2}</Text>
            </View>
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
  title: {
    fontSize: 24,
    color: "#1B3C73",
    fontFamily: "Poppins-SemiBold",
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: "#1B3C73",
    fontFamily: "Poppins-SemiBold",
  },
  progressPercent: {
    fontSize: 14,
    color: "#8E44AD",
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
  typeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
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
    color: "#1B3C73",
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
    borderColor: "#8E44AD",
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
    borderColor: "#8E44AD",
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterSelected: {
    backgroundColor: "#8E44AD",
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  optionLabel: {
    fontSize: 16,
    color: "#1B3C73",
    fontFamily: "Poppins-Regular",
    flex: 1,
  },
  optionLabelSelected: {
    color: "#1B3C73",
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
    color: "#1B3C73",
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
  scoresContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  scoreItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  scoreDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scoreLabel: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Poppins-Regular",
  },
  scoreValue: {
    fontSize: 14,
    color: "#1B3C73",
    fontFamily: "Poppins-SemiBold",
  },
});