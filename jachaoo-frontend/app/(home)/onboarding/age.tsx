import { useRouter } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import NextButton from "../../components/NextButton";
import OnboardingLayout from "../../components/OnboardingLayout";
import { onboardingData } from "./onboarding-data";

export default function AgeScreen() {
  const router = useRouter();
  const [age, setAge] = useState("");

  const incrementAge = () => {
    const currentAge = parseInt(age) || 0;
    if (currentAge < 150) {
      setAge((currentAge + 1).toString());
    }
  };

  const decrementAge = () => {
    const currentAge = parseInt(age) || 0;
    if (currentAge > 1) {
      setAge((currentAge - 1).toString());
    }
  };

  const handleNext = () => {
    // Save the data before navigating
    onboardingData.age = age;
    console.log("Saved age:", onboardingData); // Optional: for debugging
    router.push("/(home)/onboarding/sex");
  };

  return (
    <OnboardingLayout currentStep={3} totalSteps={9}>
      <View style={styles.content}>
        <Text style={styles.title}>How old are you?</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={(text) => {
              const numeric = text.replace(/[^0-9]/g, "");
              if (
                numeric === "" ||
                (parseInt(numeric) >= 1 && parseInt(numeric) <= 150)
              ) {
                setAge(numeric);
              }
            }}
            placeholder="Enter age"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            autoFocus
          />
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={decrementAge}
            >
              <Text style={styles.stepperText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={incrementAge}
            >
              <Text style={styles.stepperText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <NextButton
        onPress={handleNext}
        disabled={!age.trim() || parseInt(age) < 1 || parseInt(age) > 150}
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
  buttonsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  stepperButton: {
    width: 44,
    height: 44,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  stepperText: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#0F3A5D",
  },
});
