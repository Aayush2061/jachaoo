import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import NextButton from "../../components/NextButton";
import OnboardingLayout from "../../components/OnboardingLayout";
import { onboardingData } from "./onboarding-data";

export default function WeightScreen() {
  const router = useRouter();
  const [weight, setWeight] = useState("");

  const handleNext = () => {
    onboardingData.weight = weight;
    router.push("/(home)/onboarding/blood-pressure");
  };

  return (
    <OnboardingLayout currentStep={5} totalSteps={9}>
      <View style={styles.content}>
        <Text style={styles.title}>What's your weight?</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={(text) => {
              const numeric = text.replace(/[^0-9.]/g, "");
              const parts = numeric.split(".");
              const formatted =
                parts.length > 2
                  ? parts[0] + "." + parts.slice(1).join("")
                  : numeric;
              if (
                formatted === "" ||
                (parseFloat(formatted) >= 1 && parseFloat(formatted) <= 500)
              ) {
                setWeight(formatted);
              }
            }}
            placeholder="Enter weight"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            autoFocus
          />
          <Text style={styles.suffix}>kg</Text>
        </View>
      </View>

      <NextButton
        onPress={handleNext}
        disabled={
          !weight.trim() || parseFloat(weight) < 1 || parseFloat(weight) > 500
        }
      />
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  input: {
    flex: 1,
    height: 52,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#1F2937",
  },
  suffix: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#6B7280",
    width: 40,
  },
});
