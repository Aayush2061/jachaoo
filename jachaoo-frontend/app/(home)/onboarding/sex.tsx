import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import NextButton from "../../components/NextButton";
import OnboardingLayout from "../../components/OnboardingLayout";
import { onboardingData } from "./onboarding-data";

export default function SexScreen() {
  const router = useRouter();
  const [selectedSex, setSelectedSex] = useState("");

  const options = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Other", value: "Other" },
  ];

  const handleNext = () => {
    // Save the data before navigating
    onboardingData.sex = selectedSex;
    // console.log("Saved age:", onboardingData); // Optional: for debugging
    router.push("/(home)/onboarding/weight");
  };

  return (
    <OnboardingLayout currentStep={4} totalSteps={9}>
      <View style={styles.content}>
        <Text style={styles.title}>What is your sex?</Text>

        <View style={styles.optionsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionCard,
                selectedSex === option.value && styles.optionCardSelected,
              ]}
              onPress={() => setSelectedSex(option.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedSex === option.value && styles.optionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <NextButton onPress={handleNext} disabled={!selectedSex} />
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
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    height: 64,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  optionCardSelected: {
    borderColor: "#0F3A5D",
    backgroundColor: "#EAF3FA",
  },
  optionText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#1F2937",
  },
  optionTextSelected: {
    color: "#0F3A5D",
    fontFamily: "Poppins-SemiBold",
  },
});
