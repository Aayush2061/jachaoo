import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import NextButton from "../../components/NextButton";
import OnboardingLayout from "../../components/OnboardingLayout";
import { onboardingData } from "./onboarding-data";

export default function SmokerScreen() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState("");

  const options = [
    { label: "Yes", value: "Yes" },
    { label: "No", value: "No" },
    { label: "Don't know", value: "Don't know" },
  ];

  const handleNext = () => {
    onboardingData.smoker = selectedOption;
    router.push("/(home)/onboarding/illness");
  };

  return (
    <OnboardingLayout currentStep={8} totalSteps={9}>
      <View style={styles.content}>
        <Text style={styles.title}>Are you a smoker?</Text>

        <View style={styles.segmentedContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.segmentedOption,
                selectedOption === option.value &&
                  styles.segmentedOptionSelected,
              ]}
              onPress={() => setSelectedOption(option.value)}
            >
              <Text
                style={[
                  styles.segmentedText,
                  selectedOption === option.value &&
                    styles.segmentedTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <NextButton onPress={handleNext} disabled={!selectedOption} />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins-SemiBold",
    color: "#0F3A5D",
    textAlign: "center",
    marginBottom: 40,
  },
  segmentedContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 4,
  },
  segmentedOption: {
    flex: 1,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  segmentedOptionSelected: {
    backgroundColor: "#0F3A5D",
  },
  segmentedText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#6B7280",
  },
  segmentedTextSelected: {
    color: "#FFFFFF",
    fontFamily: "Poppins-SemiBold",
  },
});
