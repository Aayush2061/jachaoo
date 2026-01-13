import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MentalHealthBackground from "../../MentalHealthBackground";

/* -------------------- DASS-21 STRESS QUESTIONS -------------------- */

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
    example: "Getting angry when plans didn’t go smoothly",
  },
  {
    id: 7,
    text: "I felt very sensitive or touchy",
    example: "Feeling hurt or upset easily",
  },
];


/* -------------------- ANSWER OPTIONS -------------------- */

const ANSWER_OPTIONS = [
  { label: "Did not happen at all", value: 0 },
  { label: "Happened a little", value: 1 },
  { label: "Happened a lot", value: 2 },
  { label: "Happened almost every day", value: 3 },
];


/* -------------------- COMPONENT -------------------- */

export default function StressQuestions() {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(STRESS_QUESTIONS.length).fill(null)
  );

  const currentQuestion = STRESS_QUESTIONS[currentIndex];

  const rawScore = answers.reduce((sum, val) => sum + (val ?? 0), 0);
  const finalScore = rawScore * 2;

  const isAnswered = answers[currentIndex] !== null;
  const allAnswered = answers.every(a => a !== null);

  const handleSelect = (value: number) => {
    const updated = [...answers];
    updated[currentIndex] = value;
    setAnswers(updated);

    if (currentIndex < STRESS_QUESTIONS.length - 1) {
      setTimeout(() => setCurrentIndex(i => i + 1), 250);
    }
  };

  const handleFinish = () => {
    if (!allAnswered) return;

    router.push({
      pathname: "/(home)/mental-health/check/stress/result",
      params: {
        score: finalScore, // Change from rawScore to finalScore
      },
    });
  };

  return (
    <MentalHealthBackground>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>
            Question {currentIndex + 1} of {STRESS_QUESTIONS.length}
          </Text>
          <Text style={styles.subHeader}>
            Think about how you felt in the past 7 days
          </Text>
        </View>

        {/* Progress */}
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentIndex + 1) / STRESS_QUESTIONS.length) * 100}%` },
            ]}
          />
        </View>

        {/* Question Card */}
        <View style={styles.card}>
          <Text style={styles.question}>{currentQuestion.text}</Text>
          <Text style={styles.example}>{currentQuestion.example}</Text>
        </View>

        {/* Answers */}
        <View style={styles.options}>
          {ANSWER_OPTIONS.map(option => (
            <Pressable
              key={option.value}
              style={[
                styles.option,
                answers[currentIndex] === option.value && styles.optionSelected,
              ]}
              onPress={() => handleSelect(option.value)}
            >
              <View style={styles.radio}>
                {answers[currentIndex] === option.value && (
                  <View style={styles.radioDot} />
                )}
              </View>
              <Text
                style={[
                  styles.optionText,
                  answers[currentIndex] === option.value &&
                    styles.optionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Navigation */}
        <View style={styles.navigation}>
          {currentIndex > 0 && (
            <Pressable
              style={styles.backButton}
              onPress={() => setCurrentIndex(i => i - 1)}
            >
              <Text style={styles.backText}>Previous</Text>
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
              <Text style={styles.finishText}>See Results</Text>
            </Pressable>
          ) : (
            <Pressable
              style={[
                styles.nextButton,
                !isAnswered && styles.disabledButton,
              ]}
              disabled={!isAnswered}
              onPress={() => setCurrentIndex(i => i + 1)}
            >
              <Text style={styles.nextText}>Next</Text>
            </Pressable>
          )}
        </View>

        {/* DEBUG (REMOVE IN PROD) */}
        <View style={styles.debugBox}>
          <Text style={styles.debugText}>
            Raw Score: {rawScore} / 21
          </Text>
          <Text style={styles.debugSubText}>
            Final Stress Score: {finalScore}
          </Text>
        </View>
      </View>
    </MentalHealthBackground>
  );
}

/* -------------------- STYLES -------------------- */

const PRIMARY = "#2980b9";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 18,
  },
  headerText: {
    fontSize: 15,
    fontWeight: "600",
    color: PRIMARY,
  },
  subHeader: {
    fontSize: 13,
    color: "#777",
    marginTop: 6,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E6ECF2",
    borderRadius: 2,
    marginBottom: 28,
  },
  progressFill: {
    height: "100%",
    backgroundColor: PRIMARY,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 22,
    marginBottom: 28,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  question: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
    lineHeight: 26,
  },
  example: {
    fontSize: 14,
    color: "#777",
    marginTop: 10,
  },
  options: {
    marginBottom: 30,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 14,
    backgroundColor: "#F7F9FC",
    marginBottom: 12,
  },
  optionSelected: {
    backgroundColor: "#EAF2FF",
    borderWidth: 1,
    borderColor: PRIMARY,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PRIMARY,
  },
  optionText: {
    fontSize: 15,
    color: "#333",
  },
  optionTextSelected: {
    fontWeight: "600",
    color: PRIMARY,
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#ECEFF4",
    borderRadius: 12,
  },
  backText: {
    color: "#555",
    fontWeight: "600",
  },
  nextButton: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    backgroundColor: PRIMARY,
    borderRadius: 12,
  },
  nextText: {
    color: "#FFF",
    fontWeight: "600",
  },
  finishButton: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    backgroundColor: "#27ae60",
    borderRadius: 12,
  },
  finishText: {
    color: "#FFF",
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
  },
  debugBox: {
    marginTop: 20,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#FFF3CD",
    alignItems: "center",
  },
  debugText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#856404",
  },
  debugSubText: {
    fontSize: 12,
    color: "#856404",
    marginTop: 4,
  },
});
