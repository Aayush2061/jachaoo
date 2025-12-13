import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import NextButton from "../../../components/NextButton";
import PeriodOnboardingLayout from "./components/PeriodOnboardingLayout";
import { periodData } from "./period-data";

const SYMPTOM_OPTIONS = [
  "Cramps",
  "Headaches",
  "Fatigue",
  "Mood Swings",
  "Bloating",
  "Tender Breasts",
  "Acne",
  "Food Cravings",
  "Back Pain",
  "Insomnia",
  "Hot Flashes",
  "Night Sweats",
  "Low Libido",
  "Vaginal Dryness",
  "Hair Issues",
  "Weight Gain",
  "None of the above",
];

export default function SymptomsScreen() {
  const router = useRouter();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(
    periodData.symptoms || []
  );

  const handleNext = () => {
    periodData.symptoms = selectedSymptoms;
    router.push("/(home)/periods/onboarding/appearance");
  };

  const toggleSymptom = (symptom: string) => {
    if (symptom === "None of the above") {
      setSelectedSymptoms(["None of the above"]);
    } else {
      const newSymptoms = selectedSymptoms.includes(symptom)
        ? selectedSymptoms.filter(
            (s) => s !== symptom && s !== "None of the above"
          )
        : [
            ...selectedSymptoms.filter((s) => s !== "None of the above"),
            symptom,
          ];
      setSelectedSymptoms(newSymptoms);
    }
  };

  return (
    <PeriodOnboardingLayout currentStep={3} totalSteps={8}>
      <View style={styles.content}>
        <Text style={styles.title}>Common Symptoms</Text>
        <Text style={styles.subtitle}>
          Select all that you regularly experience
        </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
        >
          <View style={styles.chipsContainer}>
            {SYMPTOM_OPTIONS.map((symptom) => (
              <TouchableOpacity
                key={symptom}
                style={[
                  styles.chip,
                  selectedSymptoms.includes(symptom) && styles.chipSelected,
                ]}
                onPress={() => toggleSymptom(symptom)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedSymptoms.includes(symptom) &&
                      styles.chipTextSelected,
                  ]}
                >
                  {symptom}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <NextButton
        onPress={handleNext}
        disabled={selectedSymptoms.length === 0}
      />
    </PeriodOnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: "#8E24AA",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
    marginBottom: 24,
  },
  scrollView: {
    flex: 1,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipSelected: {
    backgroundColor: "#8E24AA",
    borderColor: "#8E24AA",
  },
  chipText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#6B7280",
  },
  chipTextSelected: {
    color: "#FFFFFF",
  },
});
