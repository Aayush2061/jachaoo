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

const APPEARANCE_OPTIONS = [
  {
    title: "Bright Red",
    description: "Bright red, like cherry",
    color: "#FF2D55",
  },
  {
    title: "Deep Red",
    description: "Very dark, almost purple",
    color: "#8B0000",
  },
  {
    title: "Pale Brown",
    description: "Spotting first or last few days",
    color: "#A0522D",
  },
  {
    title: "Light Pink",
    description: "Almost pink, barely a bleed",
    color: "#FFC0CB",
  },
  {
    title: "Varies",
    description: "Different colors throughout",
    color: "#7F8C8D",
  },
];

export default function AppearanceScreen() {
  const router = useRouter();
  const [selectedAppearance, setSelectedAppearance] = useState<string | null>(
    periodData.appearance || null
  );

  const handleNext = () => {
    periodData.appearance = selectedAppearance;
    router.push("/(home)/periods/onboarding/conditions");
  };

  return (
    <PeriodOnboardingLayout currentStep={4} totalSteps={8}>
      <View style={styles.content}>
        <Text style={styles.title}>Flow Appearance</Text>
        <Text style={styles.subtitle}>
          What does your period typically look like?
        </Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {APPEARANCE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.title}
              style={[
                styles.optionCard,
                selectedAppearance === option.title &&
                  styles.optionCardSelected,
              ]}
              onPress={() => setSelectedAppearance(option.title)}
            >
              <View style={styles.optionHeader}>
                <View style={styles.colorInfo}>
                  <View
                    style={[styles.colorDot, { backgroundColor: option.color }]}
                  />
                  <Text
                    style={[
                      styles.optionTitle,
                      selectedAppearance === option.title &&
                        styles.optionTitleSelected,
                    ]}
                  >
                    {option.title}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.optionDescription,
                  selectedAppearance === option.title &&
                    styles.optionDescriptionSelected,
                ]}
              >
                {option.description}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <NextButton onPress={handleNext} disabled={!selectedAppearance} />
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
  optionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  optionCardSelected: {
    backgroundColor: "#F3E5F5",
    borderColor: "#8E24AA",
  },
  optionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  colorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#1F2937",
  },
  optionTitleSelected: {
    color: "#8E24AA",
  },
  optionDescription: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
  },
  optionDescriptionSelected: {
    color: "#8E24AA",
  },
});
