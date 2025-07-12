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
  questionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2c3e50",
  },
  questionContainer: {
    marginBottom: 25,
  },
  question: {
    fontSize: 16,
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
    borderRadius: 10,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#eee",
  },
  selectedOption: {
    backgroundColor: "#9b59b6",
    borderColor: "#9b59b6",
  },
  optionText: {
    fontSize: 16,
    color: "#2c3e50",
  },
  selectedOptionText: {
    color: "white",
  },
});
