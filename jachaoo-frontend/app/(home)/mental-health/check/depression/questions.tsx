import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MentalHealthBackground from "../../MentalHealthBackground";

/* -------------------- DATA -------------------- */

const PHQ9_QUESTIONS = [
  {
    id: 1,
    text: "Little interest or enjoyment in doing things?",
    example: "Not feeling like doing work, studies, or things you usually enjoy",
  },
  {
    id: 2,
    text: "Feeling sad, low, or hopeless?",
    example: "Feeling down, empty, or like nothing will get better",
  },
  {
    id: 3,
    text: "Problems with sleep?",
    example: "Trouble sleeping, waking up often, or sleeping too much",
  },
  {
    id: 4,
    text: "Feeling tired or having very low energy?",
    example: "Feeling exhausted even after rest or small tasks",
  },
  {
    id: 5,
    text: "Changes in appetite?",
    example: "Eating much less or much more than usual",
  },
  {
    id: 6,
    text: "Feeling bad about yourself?",
    example: "Feeling like a failure or that you disappointed yourself or family",
  },
  {
    id: 7,
    text: "Difficulty concentrating?",
    example: "Hard to focus on reading, watching videos, studying, or work",
  },
  {
    id: 8,
    text: "Moving or speaking very slow, or feeling very restless?",
    example: "Others notice you are unusually slow or unable to sit still",
  },
  {
    id: 9,
    text: "Thoughts of hurting yourself or feeling better off not alive?",
    example: "Wishing you wouldn’t wake up or thinking about self-harm",
  },
];

const ANSWER_OPTIONS = [
  { label: "Not at all", value: 0 },
  { label: "Several days", value: 1 },
  { label: "More than half the days", value: 2 },
  { label: "Nearly every day", value: 3 },
];

/* -------------------- COMPONENT -------------------- */

export default function DepressionQuestions() {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(PHQ9_QUESTIONS.length).fill(null)
  );

  const currentQuestion = PHQ9_QUESTIONS[currentIndex];

  const answeredCount = answers.filter(a => a !== null).length;
  const currentScore = answers.reduce((sum, val) => sum + (val ?? 0), 0);

  const isAnswered = answers[currentIndex] !== null;
  const allAnswered = answers.every(a => a !== null);

  const handleSelect = (value: number) => {
    const updated = [...answers];
    updated[currentIndex] = value;
    setAnswers(updated);

    if (currentIndex < PHQ9_QUESTIONS.length - 1) {
      setTimeout(() => setCurrentIndex(i => i + 1), 250);
    }
  };

  const handleFinish = () => {
    if (!allAnswered) return;

    router.push({
      pathname: "/(home)/mental-health/check/depression/result",
      params: {
        score: currentScore.toString(),
        q9: (answers[8] ?? 0).toString(), // IMPORTANT for safety handling
      },
    });
  };

  return (
    <MentalHealthBackground>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>
            Question {currentIndex + 1} of {PHQ9_QUESTIONS.length}
          </Text>
          <Text style={styles.subHeader}>
            Think about how you felt in the last 2 weeks
          </Text>
        </View>

        {/* Progress */}
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentIndex + 1) / PHQ9_QUESTIONS.length) * 100}%` },
            ]}
          />
        </View>

        {/* Question */}
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
                  answers[currentIndex] === option.value && styles.optionTextSelected,
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

          {currentIndex === PHQ9_QUESTIONS.length - 1 ? (
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
            Debug Score: {currentScore} / 27
          </Text>
          <Text style={styles.debugSubText}>
            Answered: {answeredCount} / {PHQ9_QUESTIONS.length}
          </Text>
        </View>
      </View>
    </MentalHealthBackground>
  );
}

/* -------------------- STYLES -------------------- */

const PRIMARY = "#6C5CE7"; // slightly different from anxiety

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },

  header: { alignItems: "center", marginBottom: 18 },

  headerText: { fontSize: 15, fontWeight: "600", color: PRIMARY },

  subHeader: { fontSize: 13, color: "#777", marginTop: 6 },

  progressBar: {
    height: 4,
    backgroundColor: "#E6ECF2",
    borderRadius: 2,
    marginBottom: 28,
  },

  progressFill: { height: "100%", backgroundColor: PRIMARY },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 22,
    marginBottom: 28,
  },

  question: { fontSize: 18, fontWeight: "600", color: "#222" },

  example: { fontSize: 14, color: "#777", marginTop: 10 },

  options: { marginBottom: 30 },

  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 14,
    backgroundColor: "#F7F9FC",
    marginBottom: 12,
  },

  optionSelected: {
    backgroundColor: "#EFEAFF",
    borderWidth: 1,
    borderColor: PRIMARY,
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: PRIMARY,
    marginRight: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PRIMARY,
  },

  optionText: { fontSize: 15, color: "#333" },

  optionTextSelected: { fontWeight: "600", color: PRIMARY },

  navigation: { flexDirection: "row", justifyContent: "space-between" },

  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#ECEFF4",
    borderRadius: 12,
  },

  backText: { color: "#555", fontWeight: "600" },

  nextButton: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    backgroundColor: PRIMARY,
    borderRadius: 12,
  },

  nextText: { color: "#FFF", fontWeight: "600" },

  finishButton: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    backgroundColor: "#2ECC71",
    borderRadius: 12,
  },

  finishText: { color: "#FFF", fontWeight: "600" },

  disabledButton: { opacity: 0.5 },

  debugBox: {
    marginTop: 20,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#FFF3CD",
    alignItems: "center",
  },

  debugText: { fontSize: 14, fontWeight: "700", color: "#856404" },

  debugSubText: { fontSize: 12, color: "#856404", marginTop: 4 },
});
