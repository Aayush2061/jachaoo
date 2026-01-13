import { useRouter } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import MentalHealthBackground from "../../MentalHealthBackground";

/**
 * DASS-21 MIXED QUESTIONS
 * Each question belongs to: stress | anxiety | depression
 * Scoring: 0–3
 */

const QUESTIONS = [
  // STRESS (7)
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

  // ANXIETY (7)
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

  // DEPRESSION (7)
  {
    id: 15,
    type: "depression",
    text: "I couldn’t feel happy or enjoy things.",
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
    text: "I couldn’t feel interested or excited about anything.",
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

const OPTIONS = [
  { label: "Did not happen at all", value: 0 },
  { label: "Happened sometimes", value: 1 },
  { label: "Happened often", value: 2 },
  { label: "Happened almost every day", value: 3 },
];

export default function MixedQuestions() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});

  const currentQuestion = QUESTIONS[currentIndex];

  const handleSelect = (value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const calculateScores = () => {
    let stress = 0;
    let anxiety = 0;
    let depression = 0;

    QUESTIONS.forEach((q) => {
      const score = answers[q.id] ?? 0;
      if (q.type === "stress") stress += score;
      if (q.type === "anxiety") anxiety += score;
      if (q.type === "depression") depression += score;
    });

    // DASS-21 rule: multiply by 2
    return {
      stress: stress * 2,
      anxiety: anxiety * 2,
      depression: depression * 2,
    };
  };

  // questions.tsx - Update handleNext function
const handleNext = () => {
  if (currentIndex < QUESTIONS.length - 1) {
    setCurrentIndex(currentIndex + 1);
  } else {
    const scores = calculateScores();
    router.push({
      pathname: "/(home)/mental-health/check/mixed/result",
      params: {
        stressScore: scores.stress.toString(),
        anxietyScore: scores.anxiety.toString(),
        depressionScore: scores.depression.toString(),
        // Also pass the raw scores if needed
        stressRaw: (scores.stress / 2).toString(),
        anxietyRaw: (scores.anxiety / 2).toString(),
        depressionRaw: (scores.depression / 2).toString(),
      },
    });
  }
};

  const scoresDebug = calculateScores();

  return (
    <MentalHealthBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.progress}>
          Question {currentIndex + 1} of {QUESTIONS.length}
        </Text>

        <View style={styles.card}>
          <Text style={styles.question}>{currentQuestion.text}</Text>
          <Text style={styles.example}>{currentQuestion.example}</Text>
        </View>

        {OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            style={[
              styles.option,
              answers[currentQuestion.id] === opt.value &&
                styles.optionSelected,
            ]}
            onPress={() => handleSelect(opt.value)}
          >
            <Text style={styles.optionText}>{opt.label}</Text>
          </Pressable>
        ))}

        <Pressable
          style={[
            styles.nextButton,
            answers[currentQuestion.id] === undefined &&
              styles.nextButtonDisabled,
          ]}
          disabled={answers[currentQuestion.id] === undefined}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentIndex === QUESTIONS.length - 1
              ? "See Results"
              : "Next"}
          </Text>
        </Pressable>

        {/* DEBUG SCORES (REMOVE IN PRODUCTION) */}
        <View style={styles.debugBox}>
          <Text style={styles.debugText}>
            Stress: {scoresDebug.stress} | Anxiety: {scoresDebug.anxiety} |
            Depression: {scoresDebug.depression}
          </Text>
        </View>
      </ScrollView>
    </MentalHealthBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 40,
  },
  progress: {
    textAlign: "center",
    color: "#666",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  question: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  example: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  option: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  optionSelected: {
    borderColor: "#2980b9",
    backgroundColor: "rgba(41,128,185,0.1)",
  },
  optionText: {
    fontSize: 15,
    color: "#2c3e50",
  },
  nextButton: {
    backgroundColor: "#2980b9",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 20,
  },
  nextButtonDisabled: {
    backgroundColor: "#aaa",
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  debugBox: {
    marginTop: 20,
    alignItems: "center",
  },
  debugText: {
    fontSize: 12,
    color: "#888",
  },
});
