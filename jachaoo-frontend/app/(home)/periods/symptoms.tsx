import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
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

  const symptomsList = [
    "Backache",
    "Cramps",
    "Headache or Migraine",
    "Bloating",
    "Constipation",
    "Diarrhea",
    "Sleep Disturbances",
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

  const handleSubmit = () => {
    // Here you would typically send the data to your backend
    console.log({
      userId: user?.id,
      symptoms: selectedSymptoms,
      bodyTemperature: bodyTemp,
      hadSex,
      caffeineEmptyStomach,
      qualitySleep,
      toiletHabit,
      flow,
      moods,
      dailyNotes,
    });

    // Navigate back or show success message
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#9b59b6" />
        </Pressable>
        <Text style={styles.title}>Track Your Symptoms</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Symptoms Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          What symptoms are you facing today?
        </Text>
        <View style={styles.symptomsGrid}>
          {symptomsList.map((symptom) => (
            <TouchableOpacity
              key={symptom}
              style={[
                styles.symptomButton,
                selectedSymptoms.includes(symptom) && styles.selectedSymptom,
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
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Metrics</Text>

        {/* Body Temperature */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>What is your body temperature?</Text>
          <View style={styles.textInput}>
            <TextInput
              style={styles.input}
              placeholder="e.g. 98.6°F"
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
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lifestyle Factors</Text>

        {/* Caffeine */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Did you have caffeine on an empty stomach?
          </Text>
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
                  caffeineEmptyStomach === true && styles.selectedOptionText,
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
                  caffeineEmptyStomach === false && styles.selectedOptionText,
                ]}
              >
                No
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sleep */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Did you get quality sleep of about 6-9 hours?
          </Text>
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
          <Text style={styles.inputLabel}>Is your toilet habit normal?</Text>
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
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Flow</Text>
        <Text style={styles.inputLabel}>How heavy was your period?</Text>
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
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Moods</Text>
        <Text style={styles.inputLabel}>What moods are you facing today?</Text>
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
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Notes</Text>
        <View style={styles.notesInput}>
          <TextInput
            style={styles.notesText}
            placeholder="What happened today?"
            multiline
            numberOfLines={4}
            value={dailyNotes}
            onChangeText={setDailyNotes}
          />
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Save Daily Data</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
  },
  symptomsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  symptomButton: {
    backgroundColor: "#f0e6ff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  selectedSymptom: {
    backgroundColor: "#9b59b6",
  },
  symptomText: {
    color: "#9b59b6",
    fontWeight: "500",
  },
  selectedSymptomText: {
    color: "#fff",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: "#2c3e50",
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
  },
  input: {
    fontSize: 16,
    color: "#2c3e50",
  },
  optionRow: {
    flexDirection: "row",
    gap: 10,
  },
  optionButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: "#9b59b6",
    borderColor: "#9b59b6",
  },
  optionText: {
    fontSize: 16,
    color: "#2c3e50",
    fontWeight: "500",
  },
  selectedOptionText: {
    color: "#fff",
  },
  flowOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  flowButton: {
    backgroundColor: "#f0e6ff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  selectedFlow: {
    backgroundColor: "#9b59b6",
  },
  flowText: {
    color: "#9b59b6",
    fontWeight: "500",
  },
  selectedFlowText: {
    color: "#fff",
  },
  moodsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  moodButton: {
    backgroundColor: "#f0e6ff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  selectedMood: {
    backgroundColor: "#9b59b6",
  },
  moodText: {
    color: "#9b59b6",
    fontWeight: "500",
  },
  selectedMoodText: {
    color: "#fff",
  },
  notesInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    minHeight: 100,
  },
  notesText: {
    fontSize: 16,
    color: "#2c3e50",
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#9b59b6",
    borderRadius: 10,
    padding: 18,
    alignItems: "center",
    marginTop: 20,
  },
  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
