import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MentalHealthBackground from "../../MentalHealthBackground";

/* -------------------- DATA -------------------- */

const GAD7_QUESTIONS = [
  { id: 1, text: "Feeling nervous, anxious, or on edge?", example: "Feeling tense or worried without a clear reason" },
  { id: 2, text: "Not being able to stop or control worrying?", example: "Your mind keeps racing even when you want to relax" },
  { id: 3, text: "Worrying too much about different things?", example: "Health, money, family, or future" },
  { id: 4, text: "Trouble relaxing?", example: "Feeling tense even during rest" },
  { id: 5, text: "Being so restless that it’s hard to sit still?", example: "Pacing or feeling uncomfortable staying still" },
  { id: 6, text: "Becoming easily annoyed or irritable?", example: "Small things making you upset quickly" },
  { id: 7, text: "Feeling afraid something awful might happen?", example: "A constant sense of fear without a clear reason" },
];

const ANSWER_OPTIONS = [
  { label: "Not at all", value: 0 },
  { label: "Several days", value: 1 },
  { label: "More than half the days", value: 2 },
  { label: "Nearly every day", value: 3 },
];

/* -------------------- COMPONENT -------------------- */

export default function AnxietyQuestions() {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(GAD7_QUESTIONS.length).fill(null)
  );

  const currentQuestion = GAD7_QUESTIONS[currentIndex];

  const answeredCount = answers.filter(a => a !== null).length;
  const currentScore = answers.reduce((sum, val) => sum + (val ?? 0), 0);

  const isAnswered = answers[currentIndex] !== null;
  const allAnswered = answers.every(a => a !== null);

  const handleSelect = (value: number) => {
    const updated = [...answers];
    updated[currentIndex] = value;
    setAnswers(updated);

    if (currentIndex < GAD7_QUESTIONS.length - 1) {
      setTimeout(() => setCurrentIndex(i => i + 1), 250);
    }
  };

  const handleFinish = () => {
    if (!allAnswered) return;

    router.push({
      pathname: "/(home)/mental-health/check/anxiety/result",
      params: { score: currentScore.toString() },
    });
  };

  return (
    <MentalHealthBackground>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>
            Question {currentIndex + 1} of {GAD7_QUESTIONS.length}
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
              { width: `${((currentIndex + 1) / GAD7_QUESTIONS.length) * 100}%` },
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

          {currentIndex === GAD7_QUESTIONS.length - 1 ? (
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

        {/* ---------------- DEBUG SCORE (REMOVE IN PROD) ---------------- */}
        <View style={styles.debugBox}>
          <Text style={styles.debugText}>
            Debug Score: {currentScore} / 21
          </Text>
          <Text style={styles.debugSubText}>
            Answered: {answeredCount} / {GAD7_QUESTIONS.length}
          </Text>
        </View>
        {/* -------------------------------------------------------------- */}
      </View>
    </MentalHealthBackground>
  );
}

/* -------------------- STYLES -------------------- */

const PRIMARY = "#4A90E2";

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
    backgroundColor: "#2ECC71",
    borderRadius: 12,
  },

  finishText: {
    color: "#FFF",
    fontWeight: "600",
  },

  disabledButton: {
    opacity: 0.5,
  },

  /* DEBUG */
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
