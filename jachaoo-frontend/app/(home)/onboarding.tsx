import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useUser } from "@clerk/clerk-expo";

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

  const handleSubmit = async () => {
    if (!name.trim() || !age.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/health`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user?.id,
            name,
            age: parseInt(age),
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Health Information</Text>
      <Text style={styles.subtitle}>
        Please provide some basic health information
      </Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your full name"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Age *</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          placeholder="Enter your age"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Sex *</Text>
        <Picker
          selectedValue={sex}
          onValueChange={setSex}
          style={styles.picker}
        >
          <Picker.Item label="Male" value="Male" />
          <Picker.Item label="Female" value="Female" />
          <Picker.Item label="Other" value="Other" />
        </Picker>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Have you ever been diagnosed with high blood pressure?
        </Text>
        <Picker
          selectedValue={bloodPressure}
          onValueChange={setBloodPressure}
          style={styles.picker}
        >
          <Picker.Item label="Yes" value="Yes" />
          <Picker.Item label="No" value="No" />
          <Picker.Item label="Don't know" value="Don't know" />
        </Picker>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Do you have diabetes?</Text>
        <Picker
          selectedValue={diabetes}
          onValueChange={setDiabetes}
          style={styles.picker}
        >
          <Picker.Item label="Yes" value="Yes" />
          <Picker.Item label="No" value="No" />
          <Picker.Item label="Don't know" value="Don't know" />
        </Picker>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Are you a smoker?</Text>
        <Picker
          selectedValue={smoker}
          onValueChange={setSmoker}
          style={styles.picker}
        >
          <Picker.Item label="Yes" value="Yes" />
          <Picker.Item label="No" value="No" />
          <Picker.Item label="Don't know" value="Don't know" />
        </Picker>
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
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    color: "#666",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
