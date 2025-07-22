import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
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
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      } catch (error) {
        console.error("Error fetching period data:", error);
      } finally {
        setIsFetchingData(false);
      }
    };

    fetchPeriodData();
  }, [user?.id]);

  const symptomsList = [
    "Backache",
    "Cramps",
    "Headache",
    "Bloating",
    "Constipation",
    "Diarrhea",
    "Sleep Issues",
    "Nausea",
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
        },
        daily_data: {
          bodyTemp,
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
        `${process.env.EXPO_PUBLIC_FLASK_API_URL}/daily-analysis`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestData),
        }
      );

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

  return (
    <LinearGradient colors={["#b3e5fc", "#ffe0b2"]} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#6E56CF" />
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
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Body temperature (°C)</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 37.0"
                  keyboardType="decimal-pad"
                  value={bodyTemp}
                  onChangeText={setBodyTemp}
                />
              </View>
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
                  onPress={() => setFlow(option)}
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
                placeholderTextColor="#888"
                multiline
                numberOfLines={4}
                value={dailyNotes}
                onChangeText={setDailyNotes}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading || isFetchingData}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
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
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#2D3748",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4A5568",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    color: "#4A5568",
    marginBottom: 8,
    fontWeight: "500",
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 14,
    backgroundColor: "#F8FAFC",
  },
  input: {
    fontSize: 16,
    color: "#2D3748",
  },
  symptomsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  symptomButton: {
    backgroundColor: "#EDF2F7",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  selectedSymptom: {
    backgroundColor: "#6E56CF",
  },
  symptomText: {
    color: "#4A5568",
    fontWeight: "500",
    fontSize: 14,
  },
  selectedSymptomText: {
    color: "#FFF",
  },
  optionRow: {
    flexDirection: "row",
    gap: 12,
  },
  optionButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  selectedOption: {
    backgroundColor: "#6E56CF",
    borderColor: "#6E56CF",
  },
  optionText: {
    fontSize: 16,
    color: "#4A5568",
    fontWeight: "500",
  },
  selectedOptionText: {
    color: "#FFF",
  },
  flowOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  flowButton: {
    backgroundColor: "#EDF2F7",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  selectedFlow: {
    backgroundColor: "#6E56CF",
  },
  flowText: {
    color: "#4A5568",
    fontWeight: "500",
    fontSize: 14,
  },
  selectedFlowText: {
    color: "#FFF",
  },
  moodsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  moodButton: {
    backgroundColor: "#EDF2F7",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  selectedMood: {
    backgroundColor: "#6E56CF",
  },
  moodText: {
    color: "#4A5568",
    fontWeight: "500",
    fontSize: 14,
  },
  selectedMoodText: {
    color: "#FFF",
  },
  notesContainer: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 14,
    backgroundColor: "#F8FAFC",
    minHeight: 120,
  },
  notesInput: {
    fontSize: 16,
    color: "#2D3748",
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#6E56CF",
    borderRadius: 10,
    padding: 18,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#6E56CF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  submitText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
  errorText: {
    color: "#E53E3E",
    textAlign: "center",
    marginTop: 16,
    fontWeight: "500",
  },
});
