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

export default function ContraceptiveScreen() {
  const router = useRouter();
  const [contraceptive, setContraceptive] = useState<string | null>(
    periodData.contraceptive || null
  );
  const [tryingToConceive, setTryingToConceive] = useState<string | null>(
    periodData.tryingToConceive || null
  );

  const handleNext = () => {
    periodData.contraceptive = contraceptive;
    periodData.tryingToConceive = tryingToConceive;
    router.push("/(home)/periods/onboarding/concern");
  };

  const isFormValid = () => contraceptive && tryingToConceive;

  return (
    <PeriodOnboardingLayout currentStep={6} totalSteps={8}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Reproductive Health</Text>

          {/* Contraceptive Question */}
          <View style={styles.section}>
            <Text style={styles.question}>
              Are you on hormonal contraceptive?
            </Text>
            <Text style={styles.subtext}>Pill, IUD, ring, etc.</Text>
            <View style={styles.optionsContainer}>
              {["Yes", "No", "Never"].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.option,
                    contraceptive === option && styles.optionSelected,
                  ]}
                  onPress={() => setContraceptive(option)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      contraceptive === option && styles.optionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Trying to Conceive Question */}
          <View style={styles.section}>
            <Text style={styles.question}>Are you trying to conceive?</Text>
            <View style={styles.optionsContainer}>
              {["Yes", "No", "Open but not trying"].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.option,
                    tryingToConceive === option && styles.optionSelected,
                  ]}
                  onPress={() => setTryingToConceive(option)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      tryingToConceive === option && styles.optionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <NextButton onPress={handleNext} disabled={!isFormValid()} />
      </View>
    </PeriodOnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20, // Extra padding at bottom
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: "#8E24AA",
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  question: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtext: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  optionSelected: {
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
