import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const conditions = [
  "Fibroids",
  "Endometriosis",
  "PCOS",
  "Ovarian Cysts",
  "Infertility",
  "Perimenopause",
  "None of above",
];

export default function ConditionsQuestion({
  data,
  updateData,
}: {
  data: any;
  updateData: (value: string[]) => void;
}) {
  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    data.conditions || []
  );

  const toggleCondition = (condition: string) => {
    let newConditions;

    if (condition === "None of above") {
      newConditions = ["None of above"];
    } else {
      newConditions = selectedConditions.includes(condition)
        ? selectedConditions.filter(
            (c) => c !== condition && c !== "None of above"
          )
        : [
            ...selectedConditions.filter((c) => c !== "None of above"),
            condition,
          ];
    }

    setSelectedConditions(newConditions);
    updateData(newConditions);
  };

  return (
    <View>
      <Text style={styles.title}>
        Have you been diagnosed with any of these conditions?
      </Text>
      <Text style={styles.subtitle}>Select all that apply.</Text>

      <View style={styles.conditionsContainer}>
        {conditions.map((condition) => (
          <Pressable
            key={condition}
            style={[
              styles.conditionButton,
              selectedConditions.includes(condition) &&
                styles.selectedCondition,
            ]}
            onPress={() => toggleCondition(condition)}
          >
            <Text
              style={[
                styles.conditionText,
                selectedConditions.includes(condition) &&
                  styles.selectedConditionText,
              ]}
            >
              {condition}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2c3e50",
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 30,
  },
  conditionsContainer: {
    gap: 10,
  },
  conditionButton: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  selectedCondition: {
    backgroundColor: "#9b59b6",
  },
  conditionText: {
    fontSize: 16,
    color: "#2c3e50",
  },
  selectedConditionText: {
    color: "white",
  },
});
