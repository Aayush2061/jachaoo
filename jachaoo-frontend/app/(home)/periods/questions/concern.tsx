import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const concerns = [
  "Irregular periods",
  "Painful periods",
  "Heavy flow",
  "Trying to conceive",
  "Missed period",
  "Just tracking",
  "Others",
];

export default function ConcernQuestion({
  data,
  updateData,
}: {
  data: any;
  updateData: (value: string) => void;
}) {
  const [selectedConcern, setSelectedConcern] = useState<string | null>(
    data.mainConcern || null
  );

  return (
    <View>
      <Text style={styles.title}>What is your current main concern?</Text>

      <View style={styles.concernsContainer}>
        {concerns.map((concern) => (
          <Pressable
            key={concern}
            style={[
              styles.concernButton,
              selectedConcern === concern && styles.selectedConcern,
            ]}
            onPress={() => {
              setSelectedConcern(concern);
              updateData(concern);
            }}
          >
            <Text
              style={[
                styles.concernText,
                selectedConcern === concern && styles.selectedConcernText,
              ]}
            >
              {concern}
            </Text>
          </Pressable>
        ))}
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
  concernsContainer: {
    gap: 10,
  },
  concernButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#eee",
  },
  selectedConcern: {
    backgroundColor: "#9b59b6",
    borderColor: "#9b59b6",
  },
  concernText: {
    fontSize: 16,
    color: "#2c3e50",
  },
  selectedConcernText: {
    color: "white",
  },
});
