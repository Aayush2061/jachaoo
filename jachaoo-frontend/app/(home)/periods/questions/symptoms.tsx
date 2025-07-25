import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const allSymptoms = [
  "Insomnia",
  "Hot Flashes",
  "Night Sweats",
  "Low Libido",
  "Vaginal Dryness",
  "Fatigue",
  "Mood Swings",
  "Cramps",
  "Hair Issues",
  "Acne",
  "Cravings",
  "Weight Gain",
  "Headaches",
  "Tender Breasts",
  "Bloating",
  "No Symptoms",
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
    const updated = selectedSymptoms.includes(symptom)
      ? selectedSymptoms.filter((s) => s !== symptom)
      : [...selectedSymptoms, symptom];
    setSelectedSymptoms(updated);
    updateData(updated);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Do you experience any of the following symptoms regularly?
      </Text>
      <Text style={styles.subtitle}>Select all that apply:</Text>

      <View style={styles.gridContainer}>
        {allSymptoms.map((symptom) => {
          const selected = selectedSymptoms.includes(symptom);
          return (
            <Pressable
              key={symptom}
              style={[styles.symptomButton, selected && styles.selectedSymptom]}
              onPress={() => toggleSymptom(symptom)}
            >
              <Text
                style={[
                  styles.symptomText,
                  selected && styles.selectedSymptomText,
                ]}
              >
                {symptom}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // paddingHorizontal: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1c1c1e",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#8e8e93",
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  symptomButton: {
    width: "48%",
    paddingVertical: 12,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  selectedSymptom: {
    backgroundColor: "#9b59b6",
    borderColor: "#9b59b6",
  },
  symptomText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  selectedSymptomText: {
    color: "#fff",
  },
});
