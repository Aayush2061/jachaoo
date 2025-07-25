import { useAuth, useUser } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
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

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const steps = [
    <DateAndDurationQuestion data={formData} updateData={updateFormData} />,
    <SymptomsQuestion
      data={formData}
      updateData={(v) => updateFormData("symptoms", v)}
    />,
    <AppearanceQuestion
      data={formData}
      updateData={(v) => updateFormData("appearance", v)}
    />,
    <ConditionsQuestion
      data={formData}
      updateData={(v) => updateFormData("conditions", v)}
    />,
    <ContraceptiveQuestion data={formData} updateData={updateFormData} />,
    <ConcernQuestion
      data={formData}
      updateData={(v) => updateFormData("mainConcern", v)}
    />,
  ];

  const isStepValid = () => {
    switch (step) {
      case 0:
        return (
          formData.lastPeriodDate && formData.duration && formData.cycleLength
        );
      case 1:
        return formData.symptoms.length > 0;
      case 2:
        return !!formData.appearance;
      case 3:
        return formData.conditions.length > 0;
      case 4:
        return formData.contraceptive && formData.tryingToConceive;
      case 5:
        return !!formData.mainConcern;
      default:
        return false;
    }
  };

  const submitData = async () => {
    const token = await getToken();
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/periods`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: user?.id, ...formData }),
        }
      );
      if (!response.ok) throw new Error("Failed to save period data");
      router.replace("/(home)/periods/dashboard");
    } catch (error) {
      console.error("Error saving period data:", error);
      Alert.alert("Error", "Failed to save period tracking data");
    }
  };

  return (
    <LinearGradient colors={["#b3e5fc", "#ffe0b2"]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
              <Text style={styles.stepText}>Step {step + 1} of 6</Text>
              {steps[step]}
            </ScrollView>

            <View style={styles.buttonContainer}>
              {step > 0 && (
                <Pressable
                  style={styles.backButton}
                  onPress={() => setStep(step - 1)}
                >
                  <Text style={styles.backButtonText}>Back</Text>
                </Pressable>
              )}

              <Pressable
                style={[
                  styles.nextButton,
                  !isStepValid() && styles.disabledButton,
                ]}
                onPress={() =>
                  step === steps.length - 1 ? submitData() : setStep(step + 1)
                }
                disabled={!isStepValid()}
              >
                <Text style={styles.nextButtonText}>
                  {step === steps.length - 1 ? "Finish" : "Continue"}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
    justifyContent: "space-between",
  },
  scroll: {
    paddingVertical: 20,
  },
  stepText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#6a1b9a",
    // backgroundColor: "rgba(255,255,255,0.4)",
    textAlign: "center",
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    // paddingTop: 10,
    // backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 16,
    padding: 10,
  },
  backButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 24,
    borderColor: "#6a1b9a",
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  backButtonText: {
    color: "#6a1b9a",
    fontSize: 16,
    fontWeight: "600",
  },
  nextButton: {
    flex: 1,
    backgroundColor: "#6a1b9a",
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#b29ac1",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
