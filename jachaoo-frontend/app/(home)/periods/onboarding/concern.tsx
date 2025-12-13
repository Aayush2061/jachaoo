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

const CONCERN_OPTIONS = [
  "Irregular periods",
  "Painful periods",
  "Heavy flow",
  "Trying to conceive",
  "Missed period",
  "Cycle tracking",
  "General health",
  "Other concerns",
];

export default function ConcernScreen() {
  const router = useRouter();
  const [selectedConcern, setSelectedConcern] = useState<string | null>(
    periodData.mainConcern || null
  );

  const handleNext = () => {
    periodData.mainConcern = selectedConcern;
    router.push("/(home)/periods/onboarding/summary");
  };

  return (
    <PeriodOnboardingLayout currentStep={7} totalSteps={8}>
      <View style={styles.content}>
        <Text style={styles.title}>Your Main Concern</Text>
        <Text style={styles.subtitle}>
          What brings you to track your period?
        </Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.optionsContainer}>
            {CONCERN_OPTIONS.map((concern) => (
              <TouchableOpacity
                key={concern}
                style={[
                  styles.optionCard,
                  selectedConcern === concern && styles.optionCardSelected,
                ]}
                onPress={() => setSelectedConcern(concern)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedConcern === concern && styles.optionTextSelected,
                  ]}
                >
                  {concern}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <NextButton onPress={handleNext} disabled={!selectedConcern} />
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
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  optionCardSelected: {
    backgroundColor: "#F3E5F5",
    borderColor: "#8E24AA",
  },
  optionText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#1F2937",
    textAlign: "center",
  },
  optionTextSelected: {
    color: "#8E24AA",
    fontFamily: "Poppins-SemiBold",
  },
});
