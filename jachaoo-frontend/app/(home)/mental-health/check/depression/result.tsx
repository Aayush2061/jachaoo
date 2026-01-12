import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MentalHealthBackground from "../../MentalHealthBackground";

/* -------------------- RESULT LOGIC -------------------- */

function getResultData(score: number) {
  if (score <= 4) {
    return {
      title: "You seem to be doing okay 🌱",
      description:
        "Your answers show very few signs of low mood or depression right now.",
      advice:
        "Keep taking care of yourself. Regular sleep, movement, and staying connected with people helps a lot.",
      color: "#27ae60",
      level: "Minimal depression",
      scoreRange: "Score: 0–4",
    };
  }

  if (score <= 9) {
    return {
      title: "Some low mood signs noticed 🌤️",
      description:
        "Your answers suggest mild low mood or loss of energy. This is common and often improves with small changes.",
      advice:
        "Try gentle routines, short walks, sunlight, and talking to someone you trust.",
      color: "#f1c40f",
      level: "Mild depression",
      scoreRange: "Score: 5–9",
    };
  }

  if (score <= 14) {
    return {
      title: "Noticeable low mood 🌥️",
      description:
        "Your answers suggest moderate depression that may be affecting daily life.",
      advice:
        "You may benefit from talking to a mental health professional or counselor.",
      color: "#e67e22",
      level: "Moderate depression",
      scoreRange: "Score: 10–14",
    };
  }

  if (score <= 19) {
    return {
      title: "Strong signs of depression 🌧️",
      description:
        "Your answers suggest significant low mood and low energy that may be hard to manage alone.",
      advice:
        "Professional support is strongly recommended. Help can really make a difference.",
      color: "#e74c3c",
      level: "Moderately severe depression",
      scoreRange: "Score: 15–19",
    };
  }

  return {
    title: "Very strong signs of depression 🚨",
    description:
      "Your answers suggest severe depression. You deserve care and support.",
    advice:
      "Please consider reaching out to a mental health professional as soon as possible.",
    color: "#c0392b",
    level: "Severe depression",
    scoreRange: "Score: 20–27",
  };
}

/* -------------------- COMPONENT -------------------- */

export default function DepressionResult() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    score?: string;
    q9?: string;
  }>();

  const numericScore = params.score ? parseInt(params.score, 10) : 0;
  const q9Score = params.q9 ? parseInt(params.q9, 10) : 0;

  const result = getResultData(numericScore);
  const showSafetyNote = q9Score > 0;

  return (
    <MentalHealthBackground>
      <View style={styles.container}>
        {/* Score Circle */}
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

        {/* SAFETY NOTE (Q9) */}
        {showSafetyNote && (
          <View style={styles.safetyBox}>
            <Text style={styles.safetyTitle}>Important 💛</Text>
            <Text style={styles.safetyText}>
              You mentioned thoughts about harming yourself or feeling better
              off dead. You are not alone, and help is available.
            </Text>
            <Text style={styles.safetyText}>
              Please consider talking to a trusted person or a mental health
              professional as soon as possible.
            </Text>
          </View>
        )}

        {/* Actions */}
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push("/(home)/mental-health/chat")}
        >
          <Text style={styles.primaryButtonText}>Talk to someone</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.push("/(home)/mental-health/breathe")}
        >
          <Text style={styles.secondaryButtonText}>
            Try a calming exercise
          </Text>
        </Pressable>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          This check is not a medical diagnosis. It helps you understand how
          you’ve been feeling.
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
    width: 120,
    height: 120,
    borderRadius: 60,
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
  },
  scoreLevel: {
    fontSize: 12,
    fontWeight: "600",
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
    marginBottom: 16,
  },
  adviceTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },
  adviceText: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
  },
  safetyBox: {
    backgroundColor: "#FFF3F3",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e74c3c",
  },
  safetyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#c0392b",
    marginBottom: 6,
  },
  safetyText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginBottom: 4,
  },
  primaryButton: {
    backgroundColor: "#2980b9",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#fff",
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
  disclaimer: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 14,
    color: "#555",
    textDecorationLine: "underline",
  },
});
