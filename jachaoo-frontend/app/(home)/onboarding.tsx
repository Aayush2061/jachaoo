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

export default function OnboardingScreen() {
  const { user } = useUser();
  const router = useRouter();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("Male");
  const [bloodPressure, setBloodPressure] = useState("Don't know");
  const [diabetes, setDiabetes] = useState("Don't know");
  const [smoker, setSmoker] = useState("Don't know");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ name: false, age: false });

  const handleSubmit = async () => {
    const ageNumber = parseInt(age);

    const newErrors = {
      name: !name.trim(),
      age: !age.trim() || isNaN(ageNumber) || ageNumber < 1 || ageNumber > 150,
    };

    setErrors(newErrors);

    if (newErrors.name || newErrors.age) {
      Alert.alert("Invalid Input", "Please enter a valid name and age (1-150)");
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
            bloodPressure,
            diabetes,
            smoker,
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
                // Allow only numbers
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
            <Text style={styles.label}>Sex *</Text>
            <View style={styles.pickerWrapper}>
              <Picker selectedValue={sex} onValueChange={setSex}>
                <Picker.Item label="Male" value="Male" />
                <Picker.Item label="Female" value="Female" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
            </View>
          </View>

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
