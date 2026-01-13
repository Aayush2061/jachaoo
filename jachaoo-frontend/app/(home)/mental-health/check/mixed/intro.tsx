import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MentalHealthBackground from "../../MentalHealthBackground";

export default function MixedIntro() {
  const router = useRouter();

  return (
    <MentalHealthBackground>
      <View style={styles.container}>
        {/* Header */}
        <Text style={styles.title}>Mental Health Check</Text>
        <Text style={styles.subtitle}>
          Based on DASS-21 (Stress, Anxiety & Depression)
        </Text>

        {/* Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>What this check is about</Text>

          <Text style={styles.cardText}>
            This check is for times when your feelings feel mixed or hard to
            explain.
          </Text>

          <Text style={styles.cardText}>
            It looks at three areas together:
          </Text>

          <Text style={styles.cardText}>
            • Stress (feeling tense, overwhelmed, irritated){"\n"}
            • Anxiety (worry, fear, nervous energy){"\n"}
            • Low mood (sadness, lack of interest or motivation)
          </Text>
        </View>

        {/* Timeframe */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Important</Text>
          <Text style={styles.infoText}>
            Please answer based on how you felt during the{" "}
            <Text style={styles.bold}>past 7 days</Text>.
          </Text>
        </View>

        {/* Reassurance */}
        <Text style={styles.reassurance}>
          There are no right or wrong answers. Just choose what feels most true
          for you.
        </Text>

        {/* Start Button */}
        <Pressable
          style={styles.primaryButton}
          onPress={() =>
            router.push("/(home)/mental-health/check/mixed/questions")
          }
        >
          <Text style={styles.primaryButtonText}>
            Start Mental Health Check
          </Text>
        </Pressable>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          This check is not a medical diagnosis. It is meant to help you better
          understand how you’ve been feeling.
        </Text>

        {/* Back */}
        <Pressable
          style={styles.backButton}
          onPress={() =>
            router.push("/(home)/mental-health/check")
          }
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
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2c3e50",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#7f8c8d",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#2c3e50",
  },
  cardText: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
    marginBottom: 8,
  },
  infoBox: {
    backgroundColor: "rgba(142, 68, 173, 0.1)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8e44ad",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: "#2c3e50",
    lineHeight: 20,
  },
  bold: {
    fontWeight: "bold",
  },
  reassurance: {
    fontSize: 14,
    textAlign: "center",
    color: "#555",
    marginBottom: 24,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: "#8e44ad",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  disclaimer: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 18,
  },
  backButton: {
    alignItems: "center",
    padding: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: "#555",
    textDecorationLine: "underline",
  },
});
