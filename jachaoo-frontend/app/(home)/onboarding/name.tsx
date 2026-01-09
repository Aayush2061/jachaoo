import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import NextButton from "../../components/NextButton";
import OnboardingLayout from "../../components/OnboardingLayout";
import { onboardingData } from "./onboarding-data";

// Shared data storage - put this at the TOP of the file (outside component)

export default function NameScreen() {
  const router = useRouter();
  const [name, setName] = useState("");

  const handleNext = () => {
    // Save the data before navigating
    onboardingData.name = name;
    console.log("Saved name:", name); // Optional: for debugging
    router.push("/(home)/onboarding/age");
  };

  return (
    <OnboardingLayout currentStep={2} totalSteps={9}>
      <View style={styles.content}>
        <Text style={styles.emoji}>👋</Text>
        <Text style={styles.title}>What's your name?</Text>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your full name"
          placeholderTextColor="#9CA3AF"
          autoFocus
        />
      </View>

      <NextButton onPress={handleNext} disabled={!name.trim()} />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 40,
  },
  emoji: {
    fontSize: 32,
    textAlign: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins-SemiBold",
    color: "#0F3A5D",
    textAlign: "center",
    marginBottom: 40,
  },
  input: {
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
});
