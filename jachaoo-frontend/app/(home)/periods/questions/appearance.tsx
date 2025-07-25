import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const appearances = [
  {
    title: "Bright Red",
    description: "Bright red, like cherry",
    color: "#ff2d55", // Cherry Red
  },
  {
    title: "Deep Red",
    description: "Very dark, almost purple. Sometimes clots",
    color: "#8B0000", // Dark red
  },
  {
    title: "Pale Brown",
    description: "Spotting first or last few days",
    color: "#A0522D", // Pale brown
  },
  {
    title: "Light Red",
    description: "Almost pink, barely a bleed",
    color: "#FFC0CB", // Light pink
  },
  {
    title: "Missing or irregular",
    description: "Varying colors and lengths",
    // color: "#7f8c8d", // Neutral gray
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
        {appearances.map((appearance) => {
          const selected = selectedAppearance === appearance.title;
          return (
            <Pressable
              key={appearance.title}
              style={[
                styles.appearanceButton,
                selected && styles.selectedAppearance,
              ]}
              onPress={() => {
                setSelectedAppearance(appearance.title);
                updateData(appearance.title);
              }}
            >
              <View style={styles.row}>
                <Text
                  style={[
                    styles.appearanceTitle,
                    selected && styles.selectedText,
                  ]}
                >
                  {appearance.title}
                </Text>
                <View
                  style={[
                    styles.colorDot,
                    { backgroundColor: appearance.color },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.appearanceDescription,
                  selected && styles.selectedText,
                ]}
              >
                {appearance.description}
              </Text>
            </Pressable>
          );
        })}
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
});
