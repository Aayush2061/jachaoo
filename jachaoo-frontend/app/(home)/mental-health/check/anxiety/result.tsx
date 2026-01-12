import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MentalHealthBackground from "../../MentalHealthBackground";

function getResultData(score: number) {
  if (score <= 4) {
    return {
      title: "You seem to be doing okay 🌱",
      description:
        "Your answers show very low signs of anxiety right now.",
      advice:
        "Keep taking care of yourself. Small daily habits like good sleep, movement, and breaks really matter.",
      color: "#27ae60",
      level: "Minimal anxiety",
      scoreRange: "Score: 0-4",
    };
  }

  if (score <= 9) {
    return {
      title: "Some anxiety signs noticed 🌤️",
      description:
        "Your answers suggest mild anxiety. This is very common and manageable.",
      advice:
        "Breathing exercises, journaling, and talking to someone you trust can really help.",
      color: "#f1c40f",
      level: "Mild anxiety",
      scoreRange: "Score: 5-9",
    };
  }

  if (score <= 14) {
    return {
      title: "Noticeable anxiety signs 🌧️",
      description:
        "Your answers suggest moderate anxiety that may be affecting your daily life.",
      advice:
        "You may benefit from guided relaxation, regular routines, or speaking with a mental health professional.",
      color: "#e67e22",
      level: "Moderate anxiety",
      scoreRange: "Score: 10-14",
    };
  }

  return {
    title: "Strong anxiety signs 🌧️",
    description:
      "Your answers suggest higher levels of anxiety that may be difficult to handle alone.",
    advice:
      "Talking to a mental health professional is strongly recommended. You deserve support.",
    color: "#e74c3c",
    level: "Severe anxiety",
    scoreRange: "Score: 15-21",
  };
}

export default function AnxietyResult() {
  const router = useRouter();
  const params = useLocalSearchParams();

  console.log("Result params received:", params);
  console.log("Score param:", params.score);

  const { score } = useLocalSearchParams<{ score: string }>();
    const numericScore = score ? parseInt(score, 10) : 0;
  console.log("Parsed score:", numericScore);
  const result = getResultData(numericScore);

  return (
    <MentalHealthBackground>
      <View style={styles.container}>
        {/* Score Display */}
        <View style={[styles.scoreCircle, { borderColor: result.color }]}>
          <Text style={[styles.scoreNumber, { color: result.color }]}>
            {numericScore}
          </Text>
          <Text style={styles.scoreLabel}>Total Score</Text>
          <Text style={[styles.scoreLevel, { color: result.color }]}>
            {result.level}
          </Text>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: result.color }]}>
          {result.title}
        </Text>

        {/* Description */}
        <Text style={styles.description}>{result.description}</Text>

        {/* Score Range */}
        <Text style={styles.scoreRange}>{result.scoreRange}</Text>

        {/* Advice */}
        <View style={styles.adviceBox}>
          <Text style={styles.adviceTitle}>What you can do next</Text>
          <Text style={styles.adviceText}>{result.advice}</Text>
        </View>

        {/* Actions */}
        <Pressable
          style={styles.primaryButton}
          onPress={() =>
            router.push("/(home)/mental-health/breathe")
          }
        >
          <Text style={styles.primaryButtonText}>
            Try a calming exercise
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() =>
            router.push("/(home)/mental-health/chat")
          }
        >
          <Text style={styles.secondaryButtonText}>
            Talk to someone
          </Text>
        </Pressable>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          This check is not a medical diagnosis. It is meant to help you
          understand how you've been feeling.
        </Text>

        {/* Back Button */}
        <Pressable
          style={styles.backButton}
          onPress={() => router.push("/(home)/mental-health/check")}
        >
          <Text style={styles.backButtonText}>
            Back to Mental Health Checks
          </Text>
        </Pressable>
      </View>
    </MentalHealthBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
  },
  scoreCircle: {
    alignSelf: "center",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: "bold",
  },
  scoreLabel: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },
  scoreLevel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#2c3e50",
    marginBottom: 8,
    lineHeight: 22,
  },
  scoreRange: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
  adviceBox: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  adviceTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
    color: "#2c3e50",
  },
  adviceText: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
  },
  disclaimer: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 18,
  },
  primaryButton: {
    backgroundColor: "#2980b9",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#2980b9",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  secondaryButtonText: {
    color: "#2980b9",
    fontSize: 15,
    fontWeight: "600",
  },
  backButton: {
    marginTop: 10,
    padding: 12,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 14,
    color: "#555",
    textDecorationLine: "underline",
  },
});