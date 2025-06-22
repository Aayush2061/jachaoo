import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AppearanceQuestion from "./questions/appearance";
import ConcernQuestion from "./questions/concern";
import ConditionsQuestion from "./questions/conditions";
import ContraceptiveQuestion from "./questions/contraceptive";
import DateAndDurationQuestion from "./questions/date-and-duration";
import SymptomsQuestion from "./questions/symptoms";

type FormData = {
  lastPeriodDate: Date | null;
  duration: number | null;
  cycleLength: number | null;
  symptoms: string[];
  appearance: string | null;
  conditions: string[];
  contraceptive: string | null;
  tryingToConceive: string | null;
  mainConcern: string | null;
};

export default function PeriodOnboarding() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    lastPeriodDate: null,
    duration: null,
    cycleLength: null,
    symptoms: [],
    appearance: null,
    conditions: [],
    contraceptive: null,
    tryingToConceive: null,
    mainConcern: null,
  });

  const submitData = async () => {
    const token = await getToken(); // 🔐 Get auth token
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/periods`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: user?.id,
            lastPeriodDate: formData.lastPeriodDate,
            duration: formData.duration,
            cycleLength: formData.cycleLength,
            symptoms: formData.symptoms,
            appearance: formData.appearance,
            conditions: formData.conditions,
            contraceptive: formData.contraceptive,
            tryingToConceive: formData.tryingToConceive,
            mainConcern: formData.mainConcern,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save period data");
      }

      router.replace("/(home)/periods/dashboard");
    } catch (error) {
      console.error("Error saving period data:", error);
      Alert.alert("Error", "Failed to save period tracking data");
    }
  };

  const nextStep = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      // Submit data and navigate to main period tracker
      console.log("Form data:", formData);
      submitData();
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const steps = [
    <DateAndDurationQuestion
      data={formData}
      updateData={(field, value) => updateFormData(field, value)}
    />,
    <SymptomsQuestion
      data={formData}
      updateData={(value) => updateFormData("symptoms", value)}
    />,
    <AppearanceQuestion
      data={formData}
      updateData={(value) => updateFormData("appearance", value)}
    />,
    <ConditionsQuestion
      data={formData}
      updateData={(value) => updateFormData("conditions", value)}
    />,
    <ContraceptiveQuestion
      data={formData}
      updateData={(field, value) => updateFormData(field, value)}
    />,
    <ConcernQuestion
      data={formData}
      updateData={(value) => updateFormData("mainConcern", value)}
    />,
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.progressText}>Step {step + 1} of 6</Text>
        {steps[step]}
      </ScrollView>

      <View style={styles.buttonContainer}>
        {step > 0 && (
          <Pressable style={styles.backButton} onPress={prevStep}>
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
        )}

        <Pressable
          style={styles.nextButton}
          onPress={nextStep}
          disabled={
            (step === 0 && !formData.lastPeriodDate) ||
            !formData.duration ||
            !formData.cycleLength ||
            (step === 2 && !formData.appearance) ||
            (step === 4 &&
              (!formData.contraceptive || !formData.tryingToConceive)) ||
            (step === 5 && !formData.mainConcern)
          }
        >
          <Text style={styles.nextButtonText}>
            {step === 5 ? "Finish" : "Continue"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  progressText: {
    fontSize: 16,
    color: "#9b59b6",
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  backButton: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#9b59b6",
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  backButtonText: {
    color: "#9b59b6",
    fontSize: 16,
    fontWeight: "600",
  },
  nextButton: {
    backgroundColor: "#9b59b6",
    padding: 15,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
