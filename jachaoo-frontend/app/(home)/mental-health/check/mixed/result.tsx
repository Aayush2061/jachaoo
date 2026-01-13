import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import MentalHealthBackground from "../../MentalHealthBackground";

export default function MixedResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();


  // Get scores directly from params (already calculated)
  const stressScore = params.stressScore ? parseInt(params.stressScore as string, 10) : 0;
  const anxietyScore = params.anxietyScore ? parseInt(params.anxietyScore as string, 10) : 0;
  const depressionScore = params.depressionScore ? parseInt(params.depressionScore as string, 10) : 0;

  // -------------------------------
  // Severity classification
  // -------------------------------
  const getSeverity = (type: string, score: number) => {
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
  };

  // -------------------------------
  // Supportive explanations
  // -------------------------------
  const getExplanation = (label: string, severity: string) => {
    if (severity === "Normal") {
      return `Your ${label.toLowerCase()} level is within the normal range. This suggests you are coping reasonably well right now.`;
    }

    if (severity === "Mild") {
      return `You are showing mild signs of ${label.toLowerCase()}. This can happen during stressful periods and usually improves with rest and self-care.`;
    }

    if (severity === "Moderate") {
      return `Your responses suggest moderate ${label.toLowerCase()}. You may benefit from talking to someone you trust or using stress-management techniques.`;
    }

    return `Your score suggests high ${label.toLowerCase()} symptoms. It may be helpful to seek professional support if these feelings continue.`;
  };

  // -------------------------------
  // UI
  // -------------------------------
  return (
    <MentalHealthBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Your Wellbeing Summary</Text>

        <Text style={styles.subtitle}>
          This is a self-check based on the DASS-21 questionnaire.
          It is not a medical diagnosis.
        </Text>

        {/* Stress */}
        <ResultCard
          title="Stress"
          score={stressScore}
          severity={getSeverity("stress", stressScore)}
          description={getExplanation("Stress", getSeverity("stress", stressScore))}
          color="#2980b9"
        />

        {/* Anxiety */}
        <ResultCard
          title="Anxiety"
          score={anxietyScore}
          severity={getSeverity("anxiety", anxietyScore)}
          description={getExplanation("Anxiety", getSeverity("anxiety", anxietyScore))}
          color="#e67e22"
        />

        {/* Depression */}
        <ResultCard
          title="Depression"
          score={depressionScore}
          severity={getSeverity("depression", depressionScore)}
          description={getExplanation("Depression", getSeverity("depression", depressionScore))}
          color="#8e44ad"
        />

        {/* Footer guidance */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>What you can do next</Text>
          <Text style={styles.footerText}>
            • Take a few deep breaths to calm your nervous system{"\n"}
            • Talk to someone you trust about how you're feeling{"\n"}
            • Try a mindfulness or relaxation exercise{"\n"}
            • Consider speaking with a mental health professional
          </Text>
        </View>

        <Pressable 
          style={styles.primaryButton} 
          onPress={() => router.push("/(home)/mental-health/breathe")}
        >
          <Text style={styles.primaryButtonText}>Try a Breathing Exercise</Text>
        </Pressable>

        <Pressable 
          style={styles.secondaryButton} 
          onPress={() => router.push("/(home)/mental-health/chat")}
        >
          <Text style={styles.secondaryButtonText}>Talk to Someone</Text>
        </Pressable>

        <Pressable 
          style={styles.backButton} 
          onPress={() => router.push("/(home)/mental-health/check")}
        >
          <Text style={styles.backButtonText}>Back to Mental Health Checks</Text>
        </Pressable>

        <Text style={styles.disclaimer}>
          This check is not a medical diagnosis. If you're concerned about your mental health, please seek professional support.
        </Text>
      </ScrollView>
    </MentalHealthBackground>
  );
}

// -------------------------------
// Result Card Component
// -------------------------------
function ResultCard({
  title,
  score,
  severity,
  description,
  color,
}: {
  title: string;
  score: number;
  severity: string;
  description: string;
  color: string;
}) {
  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color }]}>{title}</Text>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </View>
      <Text style={styles.severity}>{severity}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

// -------------------------------
// Styles
// -------------------------------
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2c3e50",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  scoreBadge: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  scoreText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  severity: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  footer: {
    backgroundColor: "rgba(52, 152, 219, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2980b9",
    marginBottom: 8,
  },
  footerText: {
    fontSize: 14,
    color: "#2c3e50",
    lineHeight: 22,
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
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: "#2980b9",
    fontSize: 15,
    fontWeight: "600",
  },
  backButton: {
    padding: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 14,
    color: "#555",
    textDecorationLine: "underline",
  },
  disclaimer: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
    lineHeight: 18,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
});