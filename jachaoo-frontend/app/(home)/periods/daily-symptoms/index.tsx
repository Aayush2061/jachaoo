import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { getCyclePhaseInfo } from "../../../utils/cycleUtils";

export default function SymptomTracker() {
  const { user } = useUser();
  const router = useRouter();
  const { getToken } = useAuth();

  // State for symptoms
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [bodyTemp, setBodyTemp] = useState<string>("");
  const [hadSex, setHadSex] = useState<boolean | null>(null);
  const [caffeineEmptyStomach, setCaffeineEmptyStomach] = useState<
    boolean | null
  >(null);
  const [qualitySleep, setQualitySleep] = useState<boolean | null>(null);
  const [toiletHabit, setToiletHabit] = useState<boolean | null>(null);
  const [flow, setFlow] = useState<string>("");
  const [moods, setMoods] = useState<string[]>([]);
  const [dailyNotes, setDailyNotes] = useState<string>("");
  const [periodData, setPeriodData] = useState<any>(null);
  const [cyclePhaseInfo, setCyclePhaseInfo] = useState<any>(null);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempUnit, setTempUnit] = useState<"C" | "F">("C");
  const DAILY_NOTES_MAX_LENGTH = 500;
  const TEMP_MAX_LENGTH = 10;

  useEffect(() => {
    const fetchPeriodData = async () => {
      try {
        setIsFetchingData(true);
        if (!user?.id) return;

        const token = await getToken();
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/periods/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setPeriodData(data);

        // Calculate cycle phase information
        if (data && data.lastPeriodDate && data.cycleLength && data.duration) {
          try {
            const phaseInfo = getCyclePhaseInfo({
              lastPeriodDate: data.lastPeriodDate,
              cycleLength: data.cycleLength,
              duration: data.duration,
              today: new Date(),
            });
            setCyclePhaseInfo(phaseInfo);
          } catch (error) {
            console.error("Error calculating cycle phase:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching period data:", error);
      } finally {
        setIsFetchingData(false);
      }
    };

    fetchPeriodData();
  }, [user?.id]);

  const symptomsList = [
    "Insomnia",
    "Hot Flashes",
    "Night Sweats",
    "Low Libido",
    "Vaginal Dryness",
    "Fatigue",
    "Mood Swings",
    "Cramps",
    "Hair Issues",
    "Acne",
    "Cravings",
    "Weight Gain",
    "Headaches",
    "Tender Breasts",
    "Bloating",
    "No Symptoms",
  ];

  const flowOptions = ["Spotting", "Light", "Medium", "Heavy", "Super"];

  const moodOptions = [
    "Anxious",
    "Bored",
    "Depressed",
    "Emotional",
    "Happy",
    "Focused",
    "Irritated",
    "Energetic",
    "Nervous",
    "Tired",
    "Sad",
    "Restless",
  ];

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const toggleMood = (mood: string) => {
    if (moods.includes(mood)) {
      setMoods(moods.filter((m) => m !== mood));
    } else {
      setMoods([...moods, mood]);
    }
  };

  const handleSubmit = async () => {
    if (!periodData) {
      setError("Please wait while we load your period data");
      return;
    }

    // Add input length validation
    if (dailyNotes.length > DAILY_NOTES_MAX_LENGTH) {
      setError(
        `Daily notes cannot exceed ${DAILY_NOTES_MAX_LENGTH} characters`
      );
      return;
    }

    // Convert to float
    const temp = parseFloat(bodyTemp);

    // Range validation
    if (tempUnit === "C") {
      if (temp < 20 || temp > 50) {
        setError("Temperature must be between 20°C and 50°C.");
        return;
      }
    } else {
      if (temp < 68 || temp > 122) {
        setError("Temperature must be between 68°F and 122°F.");
        return;
      }
    }

    if (bodyTemp.length > TEMP_MAX_LENGTH) {
      setError(`Temperature cannot exceed ${TEMP_MAX_LENGTH} characters`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const today = new Date().toISOString().split("T")[0];

      const requestData = {
        permanent_data: {
          cycleLength: periodData.cycleLength,
          duration: periodData.duration,
          lastPeriodDate: periodData.lastPeriodDate.split("T")[0],
          conditions: periodData.conditions,
          contraceptive: periodData.contraceptive,
          tryingToConceive: periodData.tryingToConceive,
          mainConcern: periodData.mainConcern,
          appearance: periodData.appearance,
          currentCyclePhase: cyclePhaseInfo?.phase || "Unknown",
        },
        daily_data: {
          bodyTemp: {
            value: bodyTemp,
            unit: tempUnit,
          },
          hadSex,
          symptoms: selectedSymptoms,
          caffeineEmptyStomach,
          qualitySleep,
          toiletHabit,
          flow,
          moods,
          dailyNote: dailyNotes,
          date: today,
        },
      };

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/daily-analysis`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestData),
        }
      );

      if (response.status === 429) {
        const { error } = await response.json();
        alert(
          `You've used your ${error.limit} daily analyses. Try again tomorrow.`
        );
        return;
      }

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const result = await response.json();

      router.push({
        pathname: "/(home)/periods/daily-result",
        params: {
          analysis: JSON.stringify({
            ...result,
            date: today,
          }),
        },
      });
    } catch (err) {
      console.error("Error during analysis:", err);
      setError("Failed to generate analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isFetchingData) {
    return (
      <LinearGradient
        colors={["#FFF2F8", "#F2F0FF"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color="#B76CFD" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#FFF2F8", "#F2F0FF"]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#B76CFD" />
          </Pressable>
          <Text style={styles.title}>Track Your Symptoms</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          {/* Symptoms Section */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              What symptoms are you experiencing today?
            </Text>
            <View style={styles.symptomsGrid}>
              {symptomsList.map((symptom) => (
                <TouchableOpacity
                  key={symptom}
                  style={[
                    styles.symptomButton,
                    selectedSymptoms.includes(symptom) &&
                      styles.selectedSymptom,
                  ]}
                  onPress={() => toggleSymptom(symptom)}
                >
                  <Text
                    style={[
                      styles.symptomText,
                      selectedSymptoms.includes(symptom) &&
                        styles.selectedSymptomText,
                    ]}
                  >
                    {symptom}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Health Metrics Section */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Health Metrics</Text>

            {/* Body Temperature */}
            <View style={styles.temperatureContainer}>
              {/* Unit Picker */}
              <View style={styles.tempPickerContainer}>
                <Picker
                  selectedValue={tempUnit}
                  style={styles.picker}
                  onValueChange={(value) => setTempUnit(value)}
                >
                  <Picker.Item label="°C" value="C" />
                  <Picker.Item label="°F" value="F" />
                </Picker>
              </View>

              {/* Temperature Input */}
              <TextInput
                style={styles.tempInput}
                placeholder={tempUnit === "C" ? "37.0" : "98.6"}
                placeholderTextColor="#B0A9B9"
                keyboardType="decimal-pad"
                value={bodyTemp}
                onChangeText={(text) => setBodyTemp(text)}
              />
            </View>

            {/* Sexual Health */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Did you have sex today?</Text>
              <View style={styles.optionRow}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    hadSex === true && styles.selectedOption,
                  ]}
                  onPress={() => setHadSex(true)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      hadSex === true && styles.selectedOptionText,
                    ]}
                  >
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    hadSex === false && styles.selectedOption,
                  ]}
                  onPress={() => setHadSex(false)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      hadSex === false && styles.selectedOptionText,
                    ]}
                  >
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Lifestyle Factors Section */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Lifestyle Factors</Text>

            {/* Caffeine */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Caffeine on empty stomach?</Text>
              <View style={styles.optionRow}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    caffeineEmptyStomach === true && styles.selectedOption,
                  ]}
                  onPress={() => setCaffeineEmptyStomach(true)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      caffeineEmptyStomach === true &&
                        styles.selectedOptionText,
                    ]}
                  >
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    caffeineEmptyStomach === false && styles.selectedOption,
                  ]}
                  onPress={() => setCaffeineEmptyStomach(false)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      caffeineEmptyStomach === false &&
                        styles.selectedOptionText,
                    ]}
                  >
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Sleep */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Quality sleep (6-9 hours)?</Text>
              <View style={styles.optionRow}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    qualitySleep === true && styles.selectedOption,
                  ]}
                  onPress={() => setQualitySleep(true)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      qualitySleep === true && styles.selectedOptionText,
                    ]}
                  >
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    qualitySleep === false && styles.selectedOption,
                  ]}
                  onPress={() => setQualitySleep(false)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      qualitySleep === false && styles.selectedOptionText,
                    ]}
                  >
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Toilet Habit */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Normal toilet habits?</Text>
              <View style={styles.optionRow}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    toiletHabit === true && styles.selectedOption,
                  ]}
                  onPress={() => setToiletHabit(true)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      toiletHabit === true && styles.selectedOptionText,
                    ]}
                  >
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    toiletHabit === false && styles.selectedOption,
                  ]}
                  onPress={() => setToiletHabit(false)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      toiletHabit === false && styles.selectedOptionText,
                    ]}
                  >
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Flow Section */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Menstrual Flow</Text>
            <Text style={styles.inputLabel}>
              How heavy was your flow today?
            </Text>
            <View style={styles.flowOptions}>
              {flowOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.flowButton,
                    flow === option && styles.selectedFlow,
                  ]}
                  onPress={() => {
                    // Toggle functionality: if same option is clicked, clear it
                    if (flow === option) {
                      setFlow(""); // Clear the selection
                    } else {
                      setFlow(option); // Set new selection
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.flowText,
                      flow === option && styles.selectedFlowText,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Moods Section */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Mood Today</Text>
            <Text style={styles.inputLabel}>Select your current moods:</Text>
            <View style={styles.moodsGrid}>
              {moodOptions.map((mood) => (
                <TouchableOpacity
                  key={mood}
                  style={[
                    styles.moodButton,
                    moods.includes(mood) && styles.selectedMood,
                  ]}
                  onPress={() => toggleMood(mood)}
                >
                  <Text
                    style={[
                      styles.moodText,
                      moods.includes(mood) && styles.selectedMoodText,
                    ]}
                  >
                    {mood}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Daily Notes */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Daily Notes</Text>
            <View style={styles.notesContainer}>
              <TextInput
                style={styles.notesInput}
                placeholder="Record any additional notes about your day..."
                placeholderTextColor="#B0A9B9"
                multiline
                numberOfLines={4}
                value={dailyNotes}
                onChangeText={setDailyNotes}
                maxLength={DAILY_NOTES_MAX_LENGTH}
              />
              <Text style={styles.charCounter}>
                {dailyNotes.length}/{DAILY_NOTES_MAX_LENGTH}
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (loading || isFetchingData) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading || isFetchingData}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitText}>Get Daily Analysis</Text>
            )}
          </TouchableOpacity>

          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 40,
    paddingTop: 20,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(183,108,253,0.08)",
  },
  title: {
    fontSize: 22,
    fontFamily: "Poppins-SemiBold",
    color: "#2D2D2D",
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#B76CFD",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(183,108,253,0.04)",
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Poppins-SemiBold",
    color: "#2D2D2D",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: "#2D2D2D",
    marginBottom: 12,
  },
  temperatureContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  tempPickerContainer: {
    width: 90,
    borderWidth: 1,
    borderColor: "#F0E8FF",
    borderRadius: 14,
    backgroundColor: "#FFF",
    overflow: "hidden",
  },
  picker: {
    width: "100%",
    height: 60,
    fontFamily: "Poppins-Regular",
    color: "#2D2D2D",
  },
  tempInput: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderColor: "#F0E8FF",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontFamily: "Poppins-Regular",
    fontSize: 15,
    color: "#2D2D2D",
    backgroundColor: "#FFF",
  },
  symptomsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  symptomButton: {
    backgroundColor: "rgba(255,242,248,0.9)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,92,141,0.1)",
  },
  selectedSymptom: {
    backgroundColor: "#FF5C8D",
    borderColor: "#FF5C8D",
  },
  symptomText: {
    color: "#FF5C8D",
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  selectedSymptomText: {
    color: "#FFFFFF",
  },
  optionRow: {
    flexDirection: "row",
    gap: 12,
  },
  optionButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#F0E8FF",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  selectedOption: {
    backgroundColor: "#B76CFD",
    borderColor: "#B76CFD",
  },
  optionText: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: "#2D2D2D",
  },
  selectedOptionText: {
    color: "#FFFFFF",
  },
  flowOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  flowButton: {
    backgroundColor: "rgba(183,108,253,0.08)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(183,108,253,0.1)",
  },
  selectedFlow: {
    backgroundColor: "#B76CFD",
    borderColor: "#B76CFD",
  },
  flowText: {
    color: "#B76CFD",
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  selectedFlowText: {
    color: "#FFFFFF",
  },
  moodsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  moodButton: {
    backgroundColor: "rgba(255,242,248,0.9)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,92,141,0.1)",
  },
  selectedMood: {
    backgroundColor: "#FF5C8D",
    borderColor: "#FF5C8D",
  },
  moodText: {
    color: "#FF5C8D",
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  selectedMoodText: {
    color: "#FFFFFF",
  },
  notesContainer: {
    borderWidth: 1,
    borderColor: "#F0E8FF",
    borderRadius: 14,
    padding: 16,
    backgroundColor: "#FFF",
    minHeight: 120,
  },
  notesInput: {
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: "#2D2D2D",
    textAlignVertical: "top",
    minHeight: 100,
  },
  charCounter: {
    alignSelf: "flex-end",
    color: "#8B8691",
    fontSize: 12,
    marginTop: 8,
    fontFamily: "Poppins-Regular",
  },
  submitButton: {
    backgroundColor: "#B76CFD",
    borderRadius: 28,
    padding: 18,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 30,
    shadowColor: "#B76CFD",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: "#E0D7FF",
    shadowOpacity: 0.1,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "Poppins-SemiBold",
  },
  errorText: {
    color: "#FF5C8D",
    textAlign: "center",
    marginTop: 16,
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
});
