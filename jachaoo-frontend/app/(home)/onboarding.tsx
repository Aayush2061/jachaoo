import { useUser } from "@clerk/clerk-expo";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Define the illness options based on your image
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

export default function OnboardingScreen() {
  const { user } = useUser();
  const router = useRouter();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [sex, setSex] = useState("Male");
  const [bloodPressure, setBloodPressure] = useState("Don't know");
  const [diabetes, setDiabetes] = useState("Don't know");
  const [smoker, setSmoker] = useState("Don't know");
  const [hasIllness, setHasIllness] = useState("No"); // New state
  const [selectedIllnesses, setSelectedIllnesses] = useState<string[]>([]); // New state
  const [otherIllness, setOtherIllness] = useState(""); // New state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    name: false,
    age: false,
    weight: false,
    otherIllness: false,
  });

  const handleIllnessToggle = (illness: string) => {
    setSelectedIllnesses((prev) => {
      if (prev.includes(illness)) {
        return prev.filter((item) => item !== illness);
      } else {
        return [...prev, illness];
      }
    });
  };

  const handleSubmit = async () => {
    const ageNumber = parseInt(age);
    const weightNumber = parseFloat(weight);

    const newErrors = {
      name: !name.trim(),
      age: !age.trim() || isNaN(ageNumber) || ageNumber < 1 || ageNumber > 150,
      weight:
        !weight.trim() ||
        isNaN(weightNumber) ||
        weightNumber < 1 ||
        weightNumber > 500,
      otherIllness:
        hasIllness === "Yes" &&
        selectedIllnesses.includes("Others") &&
        !otherIllness.trim(),
    };

    setErrors(newErrors);

    if (
      newErrors.name ||
      newErrors.age ||
      newErrors.weight ||
      newErrors.otherIllness
    ) {
      let errorMessage = "Please enter valid:";
      if (newErrors.name) errorMessage += "\n• Name";
      if (newErrors.age) errorMessage += "\n• Age (1-150)";
      if (newErrors.weight) errorMessage += "\n• Weight (1-500 kg)";
      if (newErrors.otherIllness) errorMessage += "\n• Other illness details";

      Alert.alert("Invalid Input", errorMessage);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/health`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?.id,
            name,
            age: ageNumber,
            sex,
            weight: weightNumber,
            bloodPressure,
            diabetes,
            smoker,
            hasIllness,
            illnesses: selectedIllnesses,
            otherIllness: selectedIllnesses.includes("Others")
              ? otherIllness
              : "",
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to save health data");
      router.replace("/(home)");
    } catch (error) {
      console.error("Error saving health data:", error);
      Alert.alert("Error", "Failed to save health information");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LinearGradient colors={["#F8FAFF", "#ECF2FF"]} style={styles.gradient}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Welcome to Jachao</Text>
          <Text style={styles.subtitle}>Let's get to know you better</Text>

          {/* Existing form fields (name, age, weight, sex, etc.) */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={name}
              onChangeText={(text) => {
                setName(text);
                setErrors((prev) => ({ ...prev, name: false }));
              }}
              placeholder="Enter your full name"
              placeholderTextColor="#aaa"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Age *</Text>
            <TextInput
              style={[styles.input, errors.age && styles.inputError]}
              value={age}
              onChangeText={(text) => {
                const numeric = text.replace(/[^0-9]/g, "");
                setAge(numeric);
                setErrors((prev) => ({ ...prev, age: false }));
              }}
              placeholder="Enter your age"
              keyboardType="numeric"
              placeholderTextColor="#aaa"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Weight (kg) *</Text>
            <TextInput
              style={[styles.input, errors.weight && styles.inputError]}
              value={weight}
              onChangeText={(text) => {
                const numeric = text.replace(/[^0-9.]/g, "");
                const parts = numeric.split(".");
                const formatted =
                  parts.length > 2
                    ? parts[0] + "." + parts.slice(1).join("")
                    : numeric;
                setWeight(formatted);
                setErrors((prev) => ({ ...prev, weight: false }));
              }}
              placeholder="Enter your weight in kg"
              keyboardType="numeric"
              placeholderTextColor="#aaa"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Sex *</Text>
            <View style={styles.pickerWrapper}>
              <Picker selectedValue={sex} onValueChange={setSex}>
                <Picker.Item label="Male" value="Male" />
                <Picker.Item label="Female" value="Female" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
            </View>
          </View>

          {/* New Illness Section */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Do you have any type of illness? *</Text>
            <View style={styles.pickerWrapper}>
              <Picker selectedValue={hasIllness} onValueChange={setHasIllness}>
                <Picker.Item label="No" value="No" />
                <Picker.Item label="Yes" value="Yes" />
              </Picker>
            </View>
          </View>

          {hasIllness === "Yes" && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Select your illnesses:</Text>
              <View style={styles.illnessContainer}>
                {ILLNESS_OPTIONS.map((illness) => (
                  <TouchableOpacity
                    key={illness}
                    style={styles.illnessOption}
                    onPress={() => handleIllnessToggle(illness)}
                  >
                    <View style={styles.checkboxContainer}>
                      <View
                        style={[
                          styles.checkbox,
                          selectedIllnesses.includes(illness) &&
                            styles.checkboxSelected,
                        ]}
                      >
                        {selectedIllnesses.includes(illness) && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </View>
                    </View>
                    <Text style={styles.illnessText}>{illness}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Other Illness Input */}
              {selectedIllnesses.includes("Others") && (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Please specify other illness *
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      errors.otherIllness && styles.inputError,
                    ]}
                    value={otherIllness}
                    onChangeText={(text) => {
                      setOtherIllness(text);
                      setErrors((prev) => ({ ...prev, otherIllness: false }));
                    }}
                    placeholder="Enter the illness name"
                    placeholderTextColor="#aaa"
                  />
                </View>
              )}
            </View>
          )}

          {/* Existing health questions (blood pressure, diabetes, smoker) */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Have you been diagnosed with high blood pressure?
            </Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={bloodPressure}
                onValueChange={setBloodPressure}
              >
                <Picker.Item label="Yes" value="Yes" />
                <Picker.Item label="No" value="No" />
                <Picker.Item label="Don't know" value="Don't know" />
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Do you have diabetes?</Text>
            <View style={styles.pickerWrapper}>
              <Picker selectedValue={diabetes} onValueChange={setDiabetes}>
                <Picker.Item label="Yes" value="Yes" />
                <Picker.Item label="No" value="No" />
                <Picker.Item label="Don't know" value="Don't know" />
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Are you a smoker?</Text>
            <View style={styles.pickerWrapper}>
              <Picker selectedValue={smoker} onValueChange={setSmoker}>
                <Picker.Item label="Yes" value="Yes" />
                <Picker.Item label="No" value="No" />
                <Picker.Item label="Don't know" value="Don't know" />
              </Picker>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? "Saving..." : "Save & Continue"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// Add new styles for the illness section
const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    padding: 24,
    paddingBottom: 60,
    marginTop: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1A237E",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 28,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#0F172A",
    backgroundColor: "white",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    backgroundColor: "white",
  },
  // New styles for illness section
  illnessContainer: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    backgroundColor: "white",
    padding: 12,
  },
  illnessOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  checkmark: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  illnessText: {
    fontSize: 16,
    color: "#0F172A",
  },
  submitButton: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
