import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const contraceptiveOptions = ["Yes", "NO", "Never"];
const conceiveOptions = ["Yes", "NO", "Open but not trying"];

export default function ContraceptiveQuestion({
  data,
  updateData,
}: {
  data: any;
  updateData: (field: string, value: string) => void;
}) {
  const [contraceptive, setContraceptive] = useState<string | null>(
    data.contraceptive || null
  );
  const [tryingToConceive, setTryingToConceive] = useState<string | null>(
    data.tryingToConceive || null
  );

  return (
    <View>
      <Text style={styles.title}>Reproductive Health</Text>

      <View style={styles.questionContainer}>
        <Text style={styles.question}>Are you on hormonal contraceptive?</Text>
        <Text style={styles.subtext}>Ex: Pill, Hormonal IUD, ring</Text>

        <View style={styles.optionsContainer}>
          {contraceptiveOptions.map((option) => (
            <Pressable
              key={option}
              style={[
                styles.optionButton,
                contraceptive === option && styles.selectedOption,
              ]}
              onPress={() => {
                setContraceptive(option);
                updateData("contraceptive", option);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  contraceptive === option && styles.selectedOptionText,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.question}>Are you trying to conceive?</Text>

        <View style={styles.optionsContainer}>
          {conceiveOptions.map((option) => (
            <Pressable
              key={option}
              style={[
                styles.optionButton,
                tryingToConceive === option && styles.selectedOption,
              ]}
              onPress={() => {
                setTryingToConceive(option);
                updateData("tryingToConceive", option);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  tryingToConceive === option && styles.selectedOptionText,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#2c3e50",
  },
  questionContainer: {
    marginBottom: 30,
  },
  question: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
    color: "#2c3e50",
  },
  subtext: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 15,
  },
  optionsContainer: {
    gap: 10,
  },
  optionButton: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  selectedOption: {
    backgroundColor: "#9b59b6",
  },
  optionText: {
    fontSize: 16,
    color: "#2c3e50",
  },
  selectedOptionText: {
    color: "white",
  },
});
