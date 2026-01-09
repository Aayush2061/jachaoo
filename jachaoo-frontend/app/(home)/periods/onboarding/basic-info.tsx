import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import NextButton from "../../../components/NextButton";
import PeriodOnboardingLayout from "./components/PeriodOnboardingLayout";
import { periodData } from "./period-data";

export default function BasicInfoScreen() {
  const router = useRouter();
  const [date, setDate] = useState<Date>(
    periodData.lastPeriodDate || new Date()
  );
  const [duration, setDuration] = useState<string>(
    periodData.duration?.toString() || ""
  );
  const [cycleLength, setCycleLength] = useState<string>(
    periodData.cycleLength?.toString() || ""
  );
  const [showPicker, setShowPicker] = useState(false);

  const handleNext = () => {
    periodData.lastPeriodDate = date;
    periodData.duration = duration ? parseInt(duration, 10) : null;
    periodData.cycleLength = cycleLength ? parseInt(cycleLength, 10) : null;
    router.push("/(home)/periods/onboarding/symptoms");
  };

  const isFormValid = () => {
    return (
      date &&
      duration &&
      cycleLength &&
      parseInt(duration) > 0 &&
      parseInt(cycleLength) > 0
    );
  };

  return (
    <PeriodOnboardingLayout currentStep={2} totalSteps={8}>
      <View style={styles.content}>
        <Text style={styles.title}>Basic Information</Text>
        <Text style={styles.subtitle}>
          Let's start with the basics of your cycle
        </Text>

        {/* Last Period Date */}
        <View style={styles.section}>
          <Text style={styles.label}>First day of last period</Text>
          <Pressable
            style={styles.dateButton}
            onPress={() => setShowPicker(true)}
          >
            <Text style={styles.dateText}>
              {date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </Pressable>
        </View>

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) {
                setDate(selectedDate);
              }
            }}
            maximumDate={new Date()}
          />
        )}

        {/* Duration */}
        <View style={styles.section}>
          <Text style={styles.label}>Period duration (days)</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="e.g., 5"
              value={duration}
              onChangeText={setDuration}
              placeholderTextColor="#9CA3AF"
            />
            <Text style={styles.unit}>days</Text>
          </View>
        </View>

        {/* Cycle Length */}
        <View style={styles.section}>
          <Text style={styles.label}>Typical cycle length (days)</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="e.g., 28"
              value={cycleLength}
              onChangeText={setCycleLength}
              placeholderTextColor="#9CA3AF"
            />
            <Text style={styles.unit}>days</Text>
          </View>
        </View>
      </View>

      <NextButton onPress={handleNext} disabled={!isFormValid()} />
    </PeriodOnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 20,
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
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#1F2937",
    marginBottom: 8,
  },
  dateButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
  },
  dateText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#1F2937",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#1F2937",
  },
  unit: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#6B7280",
    marginLeft: 8,
  },
});
