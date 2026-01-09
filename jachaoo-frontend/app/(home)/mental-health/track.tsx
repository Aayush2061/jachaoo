import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Animated,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
type MoodLevel = "Very Low" | "Low" | "Neutral" | "Good" | "Very Good";
type MoodFactor =
  | "Work or Studies"
  | "Relationships"
  | "Physical Health"
  | "Mental State"
  | "Surroundings"
  | "Selfcare"
  | "I'm not sure";
type SleepQuality = "Poor" | "Okay" | "Good";
type EnergyLevel = "Low" | "Normal" | "High";
type SelfcareActivity =
  | "Moved my body"
  | "Ate well"
  | "Took a break"
  | "Did something I enjoy"
  | "Nothing yet";

export default function TrackMoodScreen() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);
  const [selectedFactors, setSelectedFactors] = useState<MoodFactor[]>([]);
  const [sleepQuality, setSleepQuality] = useState<SleepQuality | null>(null);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | null>(null);
  const [selfcareActivities, setSelfcareActivities] = useState<
    SelfcareActivity[]
  >([]);
  // Add these states
  const [showToast, setShowToast] = useState(false);
  const toastOpacity = useState(new Animated.Value(0))[0];

  const toggleFactor = (factor: MoodFactor) => {
    setSelectedFactors((prev) =>
      prev.includes(factor)
        ? prev.filter((f) => f !== factor)
        : [...prev, factor]
    );
  };

  const toggleSelfcare = (activity: SelfcareActivity) => {
    setSelfcareActivities((prev) =>
      prev.includes(activity)
        ? prev.filter((a) => a !== activity)
        : [...prev, activity]
    );
  };

  const handleSubmit = () => {
    // console.log({
    //   mood: selectedMood,
    //   factors: selectedFactors,
    //   sleepQuality,
    //   energyLevel,
    //   selfcareActivities,
    //   timestamp: new Date().toISOString(),
    // });
    // Add this alert
    // Show toast
    setShowToast(true);
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Hide toast after 2 seconds and navigate
    setTimeout(() => {
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowToast(false);
        router.push("/(home)/mental-health/dashboard");
      });
    }, 2000);
  };
  const isFormValid =
    selectedMood &&
    sleepQuality &&
    energyLevel &&
    selfcareActivities.length > 0;

  return (
    <ImageBackground
      source={require("@/assets/images/mental-health-background.jpg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      {showToast && (
        <Animated.View
          style={[styles.toastContainer, { opacity: toastOpacity }]}
        >
          <LinearGradient
            colors={["#4CAF50", "#2E7D32"]}
            style={styles.toastGradient}
          >
            <MaterialIcons name="check-circle" size={24} color="white" />
            <Text style={styles.toastText}>Mood saved successfully!</Text>
          </LinearGradient>
        </Animated.View>
      )}

      <View style={styles.overlay}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>Track Your Mood</Text>

          {/* Mood Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How's your mood today?</Text>
            <View style={styles.moodOptions}>
              {(
                [
                  "Very Low",
                  "Low",
                  "Neutral",
                  "Good",
                  "Very Good",
                ] as MoodLevel[]
              ).map((mood) => (
                <Pressable
                  key={mood}
                  style={[
                    styles.moodButton,
                    selectedMood === mood && styles.selectedMood,
                  ]}
                  onPress={() => setSelectedMood(mood)}
                >
                  <Text style={styles.moodText}>{mood}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Mood Factors */}
          {selectedMood && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                What's influencing your mood?
              </Text>
              <View style={styles.factorsGrid}>
                {(
                  [
                    "Work or Studies",
                    "Relationships",
                    "Physical Health",
                    "Mental State",
                    "Surroundings",
                    "Selfcare",
                    "I'm not sure",
                  ] as MoodFactor[]
                ).map((factor) => (
                  <Pressable
                    key={factor}
                    style={[
                      styles.factorButton,
                      selectedFactors.includes(factor) && styles.selectedFactor,
                    ]}
                    onPress={() => toggleFactor(factor)}
                  >
                    <Text style={styles.factorText}>{factor}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Wellness Questions */}
          <View style={styles.section}>
            <View style={styles.questionGroup}>
              <Text style={styles.questionText}>
                How did you sleep last night?
              </Text>
              <View style={styles.optionsRow}>
                {(["Poor", "Okay", "Good"] as SleepQuality[]).map((quality) => (
                  <Pressable
                    key={quality}
                    style={[
                      styles.optionButton,
                      sleepQuality === quality && styles.selectedOption,
                    ]}
                    onPress={() => setSleepQuality(quality)}
                  >
                    <Text style={styles.optionText}>{quality}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.questionGroup}>
              <Text style={styles.questionText}>How's your energy today?</Text>
              <View style={styles.optionsRow}>
                {(["Low", "Normal", "High"] as EnergyLevel[]).map((energy) => (
                  <Pressable
                    key={energy}
                    style={[
                      styles.optionButton,
                      energyLevel === energy && styles.selectedOption,
                    ]}
                    onPress={() => setEnergyLevel(energy)}
                  >
                    <Text style={styles.optionText}>{energy}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.questionGroup}>
              <Text style={styles.questionText}>
                Did you do anything for yourself today?
              </Text>
              <View style={styles.factorsGrid}>
                {(
                  [
                    "Moved my body",
                    "Ate well",
                    "Took a break",
                    "Did something I enjoy",
                    "Nothing yet",
                  ] as SelfcareActivity[]
                ).map((activity) => (
                  <Pressable
                    key={activity}
                    style={[
                      styles.factorButton,
                      selfcareActivities.includes(activity) &&
                        styles.selectedFactor,
                    ]}
                    onPress={() => toggleSelfcare(activity)}
                  >
                    <Text style={styles.factorText}>{activity}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <Pressable
            style={[styles.submitButton, !isFormValid && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={!isFormValid}
          >
            <Text style={styles.submitText}>Save & Continue</Text>
          </Pressable>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  container: {
    flexGrow: 1,
    paddingBottom: 60,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 32,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 14,
  },
  moodOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  moodButton: {
    width: "30%",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#f1f3f5",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  selectedMood: {
    backgroundColor: "#d0ebff",
    borderColor: "#228be6",
  },
  moodText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  factorsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  factorButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  selectedFactor: {
    backgroundColor: "#d0ebff",
    borderColor: "#228be6",
  },
  factorText: {
    fontSize: 14,
    color: "#333",
  },
  questionGroup: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#444",
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#f1f3f5",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  selectedOption: {
    backgroundColor: "#d0ebff",
    borderColor: "#228be6",
  },
  optionText: {
    fontSize: 15,
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#339af0",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  submitDisabled: {
    backgroundColor: "#adb5bd",
  },
  submitText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  // Add toast styles
  toastContainer: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  toastGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  toastText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
});
