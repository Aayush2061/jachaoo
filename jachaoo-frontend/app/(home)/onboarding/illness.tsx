import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import NextButton from "../../components/NextButton";
import OnboardingLayout from "../../components/OnboardingLayout";
import { onboardingData } from "./onboarding-data";

const ILLNESS_OPTIONS = [
  "Asthma",
  "Heart Problem",
  "Kidney Problem",
  "Liver Problem",
  "Thyroid",
  "Tuberculosis (TB)",
  "Mental Health Conditions",
  "Obesity",
  "Others",
];

export default function IllnessScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [hasIllness, setHasIllness] = useState("");
  const [selectedIllnesses, setSelectedIllnesses] = useState<string[]>([]);
  const [otherIllness, setOtherIllness] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleIllnessToggle = (illness: string) => {
    setSelectedIllnesses((prev) => {
      if (prev.includes(illness)) {
        return prev.filter((item) => item !== illness);
      } else {
        return [...prev, illness];
      }
    });
  };

  const handleComplete = async () => {
    if (!isFormValid()) return;

    setIsSubmitting(true);
    try {
      // Collect all data (you'll need to pass data between screens)
      const finalData = {
        userId: user?.id,
        name: onboardingData.name || "",
        age: parseInt(onboardingData.age) || 0,
        sex: onboardingData.sex || "",
        weight: parseFloat(onboardingData.weight) || 0,
        bloodPressure: onboardingData.bloodPressure || "",
        diabetes: onboardingData.diabetes || "",
        smoker: onboardingData.smoker || "",
        hasIllness,
        illnesses: selectedIllnesses,
        otherIllness: selectedIllnesses.includes("Others") ? otherIllness : "",
      };

      console.log("Final onboarding data:", finalData); // Optional: for debugging

      // Validate required fields
      if (
        !finalData.name ||
        !finalData.age ||
        !finalData.weight ||
        !finalData.sex
      ) {
        Alert.alert(
          "Missing Information",
          "Please complete all required fields"
        );
        return;
      }

      // Send data to your backend
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/health`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(finalData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save health data");
      }

      // Success - navigate to home
      Alert.alert("Success", "Your health profile has been saved!", [
        {
          text: "Continue",
          onPress: () => router.replace("/(home)"),
        },
      ]);
    } catch (error) {
      console.error("Error saving health data:", error);
      Alert.alert(
        "Error",
        "Failed to save your health information. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    if (hasIllness === "No") return true;
    if (hasIllness === "Yes") {
      if (selectedIllnesses.length === 0) return false;
      if (selectedIllnesses.includes("Others") && !otherIllness.trim())
        return false;
      return true;
    }
    return false;
  };

  if (isSubmitting) {
    return (
      <OnboardingLayout currentStep={9} totalSteps={9}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0F3A5D" />
          <Text style={styles.loadingText}>Saving your health profile...</Text>
        </View>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout currentStep={9} totalSteps={9}>
      <View style={styles.content}>
        <Text style={styles.title}>Do you have any chronic illnesses?</Text>

        {/* Yes/No question */}
        <View style={styles.segmentedContainer}>
          {["Yes", "No"].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.segmentedOption,
                hasIllness === option && styles.segmentedOptionSelected,
              ]}
              onPress={() => setHasIllness(option)}
            >
              <Text
                style={[
                  styles.segmentedText,
                  hasIllness === option && styles.segmentedTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Illness selection (only show if Yes) */}
        {hasIllness === "Yes" && (
          <View style={styles.illnessSection}>
            <Text style={styles.subtitle}>Select your illnesses:</Text>

            <View style={styles.chipsContainer}>
              {ILLNESS_OPTIONS.map((illness) => (
                <TouchableOpacity
                  key={illness}
                  style={[
                    styles.chip,
                    selectedIllnesses.includes(illness) && styles.chipSelected,
                  ]}
                  onPress={() => handleIllnessToggle(illness)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedIllnesses.includes(illness) &&
                        styles.chipTextSelected,
                    ]}
                  >
                    {illness}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Other illness input */}
            {selectedIllnesses.includes("Others") && (
              <View style={styles.otherInputContainer}>
                <TextInput
                  style={styles.otherInput}
                  value={otherIllness}
                  onChangeText={setOtherIllness}
                  placeholder="Please specify other illness"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            )}
          </View>
        )}
      </View>

      <NextButton
        onPress={handleComplete}
        title={isSubmitting ? "Saving..." : "Complete"}
        disabled={!isFormValid() || isSubmitting}
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
  segmentedContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 4,
    marginBottom: 30,
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
  illnessSection: {
    gap: 20,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#0F3A5D",
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    height: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  chipSelected: {
    backgroundColor: "#0F3A5D",
    borderColor: "#0F3A5D",
  },
  chipText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#6B7280",
  },
  chipTextSelected: {
    color: "#FFFFFF",
  },
  otherInputContainer: {
    marginTop: 16,
  },
  otherInput: {
    height: 48,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#1F2937",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#0F3A5D",
  },
});
