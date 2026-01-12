import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MentalHealthBackground from "../../MentalHealthBackground";

export default function LowMoodIntro() {
  const router = useRouter();

  const handleStart = () => {
    router.push("/(home)/mental-health/check/depression/questions");
  };

  return (
    <MentalHealthBackground>
      <View style={styles.container}>
        {/* Title */}
        <Text style={styles.title}>Low Mood & Low Energy Check</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Based on the PHQ-9 Mood Questionnaire
        </Text>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.text}>
            This short check helps understand how low mood or low energy may be
            affecting you.
          </Text>

          <Text style={styles.text}>
            You will be asked{" "}
            <Text style={styles.bold}>9 simple questions</Text> about how you’ve
            been feeling over the{" "}
            <Text style={styles.bold}>last 2 weeks</Text>.
          </Text>

          <Text style={styles.text}>
            There are no right or wrong answers. Just choose what feels closest
            to your experience.
          </Text>
        </View>

        {/* Start Button */}
        <Pressable style={styles.button} onPress={handleStart}>
          <Text style={styles.buttonText}>Start Mood Check</Text>
        </Pressable>

        {/* Footer Note */}
        <Text style={styles.footer}>
          This is not a medical diagnosis. It is only meant to help you understand
          how you’ve been feeling.
        </Text>
      </View>
    </MentalHealthBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2c3e50",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 14,
    color: "#555",
    marginTop: 6,
    marginBottom: 24,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 18,
    padding: 20,
    elevation: 3,
  },
  text: {
    fontSize: 15,
    color: "#333",
    marginBottom: 12,
    lineHeight: 22,
  },
  bold: {
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#8e44ad", // slightly different tone from anxiety
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "#777",
    marginTop: 20,
  },
});
