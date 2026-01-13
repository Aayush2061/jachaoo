import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MentalHealthBackground from "../../MentalHealthBackground";

/* -------------------- RESULT LOGIC -------------------- */

function getStressResult(finalScore: number) {
  if (finalScore <= 14) {
    return {
      title: "Your stress level looks normal 🌿",
      description:
        "Your answers suggest that stress is not heavily affecting you right now.",
      advice:
        "Keep maintaining healthy routines like rest, movement, and taking breaks when needed.",
      level: "Normal stress",
      range: "Score: 0–14",
      color: "#27ae60",
    };
  }

  if (finalScore <= 18) {
    return {
      title: "Mild stress noticed 🌤️",
      description:
        "You may be experiencing some stress, which is common in daily life.",
      advice:
        "Short breaks, breathing exercises, and talking to someone you trust can help.",
      level: "Mild stress",
      range: "Score: 15–18",
      color: "#f1c40f",
    };
  }

  if (finalScore <= 25) {
    return {
      title: "Moderate stress detected 🌥️",
      description:
        "Your stress level may be affecting your mood, focus, or daily activities.",
      advice:
        "Consider stress-management practices like relaxation exercises, routines, or professional support.",
      level: "Moderate stress",
      range: "Score: 19–25",
      color: "#e67e22",
    };
  }

  if (finalScore <= 33) {
    return {
      title: "High stress level 🌧️",
      description:
        "Your answers suggest high stress that may be difficult to manage alone.",
      advice:
        "Talking to a mental health professional or counselor is strongly recommended.",
      level: "Severe stress",
      range: "Score: 26–33",
      color: "#e74c3c",
    };
  }

  return {
    title: "Very high stress level 🚨",
    description:
      "Your stress level is extremely high and may be overwhelming.",
    advice:
      "Please seek professional help as soon as possible. Support can make a big difference.",
    level: "Extremely severe stress",
    range: "Score: 34+",
    color: "#c0392b",
  };
}

/* -------------------- COMPONENT -------------------- */

export default function StressResult() {
  const router = useRouter();
  const { score } = useLocalSearchParams<{ score?: string }>();

  // The score passed from questions.tsx is already the final score (rawScore * 2)
  const finalScore = score ? parseInt(score, 10) : 0;
  // console.log("finalScore" + finalScore);
  const result = getStressResult(finalScore);

  return (
    <MentalHealthBackground>
      <View style={styles.container}>
        {/* Score Circle */}
        <View style={[styles.scoreCircle, { borderColor: result.color }]}>
          <Text style={[styles.scoreNumber, { color: result.color }]}>
            {finalScore}
          </Text>
          <Text style={styles.scoreLabel}>Stress Score</Text>
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
        <Text style={styles.scoreRange}>{result.range}</Text>

        {/* Advice */}
        <View style={styles.adviceBox}>
          <Text style={styles.adviceTitle}>What you can do next</Text>
          <Text style={styles.adviceText}>{result.advice}</Text>
        </View>

        {/* Actions */}
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push("/(home)/mental-health/breathe")}
        >
          <Text style={styles.primaryButtonText}>
            Try a calming exercise
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.push("/(home)/mental-health/chat")}
        >
          <Text style={styles.secondaryButtonText}>
            Talk to someone
          </Text>
        </Pressable>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          This check is not a medical diagnosis. It is meant to help you
          understand your stress level.
        </Text>

        {/* Back */}
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

/* -------------------- STYLES -------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
  },
  scoreCircle: {
    alignSelf: "center",
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "rgba(255,255,255,0.95)",
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
    backgroundColor: "rgba(255,255,255,0.95)",
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