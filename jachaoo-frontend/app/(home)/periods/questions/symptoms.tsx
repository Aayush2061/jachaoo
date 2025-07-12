import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const symptoms = [
  "Insomnia (start)",
  "Hot flashes (atat stcst)",
  "Headaches",
  "Bloating",
  "Cramps",
  "Fatigue",
  "Mood swings",
  "Breast tenderness",
];

export default function SymptomsQuestion({
  data,
  updateData,
}: {
  data: any;
  updateData: (value: string[]) => void;
}) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(
    data.symptoms || []
  );

  const toggleSymptom = (symptom: string) => {
    const newSymptoms = selectedSymptoms.includes(symptom)
      ? selectedSymptoms.filter((s) => s !== symptom)
      : [...selectedSymptoms, symptom];

    setSelectedSymptoms(newSymptoms);
    updateData(newSymptoms);
  };

  return (
    <View>
      <Text style={styles.title}>
        Do you experience any of the following symptoms regularly?
      </Text>
      <Text style={styles.subtitle}>Select features that apply.</Text>

      <View style={styles.symptomsContainer}>
        {symptoms.map((symptom) => (
          <Pressable
            key={symptom}
            style={[
              styles.symptomButton,
              selectedSymptoms.includes(symptom) && styles.selectedSymptom,
            ]}
            onPress={() => toggleSymptom(symptom)}
          >
            <Text
              style={[
                styles.symptomText,
                selectedSymptoms.includes(symptom) &&
                  styles.selectedSymptomText,
              ]}
            >
              {symptom}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2c3e50",
  },
  subtitle: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 20,
  },
  symptomsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  symptomButton: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#eee",
  },
  selectedSymptom: {
    backgroundColor: "#9b59b6",
    borderColor: "#9b59b6",
  },
  symptomText: {
    color: "#2c3e50",
    fontSize: 14,
  },
  selectedSymptomText: {
    color: "white",
  },
});
