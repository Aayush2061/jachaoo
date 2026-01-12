import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MentalHealthBackground from "../MentalHealthBackground";

export default function MentalHealthCheckStart() {
  const router = useRouter();

 const handleSelect = (
  type: "anxiety" | "depression" | "stress" | "mixed"
) => {
  router.push(`/(home)/mental-health/check/${type}/intro`);
};

  return (
    <MentalHealthBackground>
      <View style={styles.container}>
        {/* Title */}
        <Text style={styles.title}>How have you been feeling lately?</Text>

        {/* Helper text */}
        <Text style={styles.helper}>
          Just pick the one that feels closest. You can’t choose the wrong one.
        </Text>

        {/* Options */}
        <Pressable
          style={styles.optionCard}
          onPress={() => handleSelect("anxiety")}
        >
          <Text style={styles.optionEmoji}>😰</Text>
          <Text style={styles.optionText}>I worry a lot and can’t relax</Text>
          <Text style={styles.optionSubText}>
            My mind keeps thinking too much
          </Text>
        </Pressable>

        <Pressable
          style={styles.optionCard}
          onPress={() => handleSelect("depression")}
        >
          <Text style={styles.optionEmoji}>😞</Text>
          <Text style={styles.optionText}>I feel sad or empty most days</Text>
          <Text style={styles.optionSubText}>Low mood, low energy</Text>
        </Pressable>

        <Pressable
          style={styles.optionCard}
          onPress={() => handleSelect("stress")}
        >
          <Text style={styles.optionEmoji}>😵</Text>
          <Text style={styles.optionText}>
            I feel very stressed or burned out
          </Text>
          <Text style={styles.optionSubText}>
            Too much pressure, always tired
          </Text>
        </Pressable>

        <Pressable
          style={styles.optionCard}
          onPress={() => handleSelect("mixed")}
        >
          <Text style={styles.optionEmoji}>😐</Text>
          <Text style={styles.optionText}>
            I’m not sure / everything feels mixed
          </Text>
          <Text style={styles.optionSubText}>Hard to explain</Text>
        </Pressable>

        {/* Footer */}
        <Text style={styles.footer}>
          This is not a medical diagnosis. It just helps us understand you
          better.
        </Text>
      </View>
    </MentalHealthBackground>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#2c3e50",
  },
  helper: {
    textAlign: "center",
    fontSize: 14,
    color: "#555",
    marginBottom: 24,
  },
  optionCard: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    alignItems: "center",
    elevation: 3,
  },
  optionEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  optionText: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    color: "#2c3e50",
  },
  optionSubText: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
  footer: {
    marginTop: 20,
    fontSize: 12,
    color: "#777",
    textAlign: "center",
  },
});
