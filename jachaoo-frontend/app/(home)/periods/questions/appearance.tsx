import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const appearances = [
  {
    title: "Bright Red",
    description: "Bright red, like cherry",
  },
  {
    title: "Deep Red",
    description: "Very dark, almost purple. Sometimes clots",
  },
  {
    title: "Pale Brown",
    description: "Spotting first or last few days",
  },
  {
    title: "Light Red",
    description: "Almost pink, barely a bleed",
  },
  {
    title: "Missing or irregular",
    description: "Varying colors and lengths",
  },
];

export default function AppearanceQuestion({
  data,
  updateData,
}: {
  data: any;
  updateData: (value: string) => void;
}) {
  const [selectedAppearance, setSelectedAppearance] = useState<string | null>(
    data.appearance || null
  );

  return (
    <View>
      <Text style={styles.title}>
        What does your period look like when it shows up?
      </Text>
      <Text style={styles.subtitle}>Select one that most fits your cycle</Text>

      <View style={styles.appearancesContainer}>
        {appearances.map((appearance) => (
          <Pressable
            key={appearance.title}
            style={[
              styles.appearanceButton,
              selectedAppearance === appearance.title &&
                styles.selectedAppearance,
            ]}
            onPress={() => {
              setSelectedAppearance(appearance.title);
              updateData(appearance.title);
            }}
          >
            <Text
              style={[
                styles.appearanceTitle,
                selectedAppearance === appearance.title && styles.selectedText,
              ]}
            >
              {appearance.title}
            </Text>
            <Text
              style={[
                styles.appearanceDescription,
                selectedAppearance === appearance.title && styles.selectedText,
              ]}
            >
              {appearance.description}
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
  appearancesContainer: {
    gap: 12,
  },
  appearanceButton: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "white",
  },
  selectedAppearance: {
    backgroundColor: "#9b59b6",
    borderColor: "#9b59b6",
  },
  appearanceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 5,
  },
  appearanceDescription: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  selectedText: {
    color: "white",
  },
});
