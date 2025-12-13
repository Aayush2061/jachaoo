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

const CONDITIONS_OPTIONS = [
  "Fibroids",
  "Endometriosis",
  "PCOS",
  "Ovarian Cysts",
  "Infertility",
  "Perimenopause",
  "None of the above",
];

export default function ConditionsScreen() {
  const router = useRouter();
  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    periodData.conditions || []
  );

  const handleNext = () => {
    periodData.conditions = selectedConditions;
    router.push("/(home)/periods/onboarding/contraceptive");
  };

  const toggleCondition = (condition: string) => {
    if (condition === "None of the above") {
      setSelectedConditions(["None of the above"]);
    } else {
      const newConditions = selectedConditions.includes(condition)
        ? selectedConditions.filter(
            (c) => c !== condition && c !== "None of the above"
          )
        : [
            ...selectedConditions.filter((c) => c !== "None of the above"),
            condition,
          ];
      setSelectedConditions(newConditions);
    }
  };

  return (
    <PeriodOnboardingLayout currentStep={5} totalSteps={8}>
      <View style={styles.content}>
        <Text style={styles.title}>Health Conditions</Text>
        <Text style={styles.subtitle}>
          Have you been diagnosed with any of these?
        </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
        >
          <View style={styles.optionsContainer}>
            {CONDITIONS_OPTIONS.map((condition) => (
              <TouchableOpacity
                key={condition}
                style={[
                  styles.optionCard,
                  selectedConditions.includes(condition) &&
                    styles.optionCardSelected,
                ]}
                onPress={() => toggleCondition(condition)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedConditions.includes(condition) &&
                      styles.optionTextSelected,
                  ]}
                >
                  {condition}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <NextButton
        onPress={handleNext}
        disabled={selectedConditions.length === 0}
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
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
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
