// app/(home)/periods/phase-detail.tsx
import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { phaseData } from "../../utils/phaseData";

export default function PhaseDetail() {
  const params = useLocalSearchParams();
  const phase = JSON.parse(params.phase as string);
  const action = params.action as string;

  // Get the content for this phase and action
  const content = phaseData[phase.name][action];

  // Function to render content with proper formatting
  const renderContent = () => {
    return content.map((item, index) => {
      // Check if the item is a heading (no bullet point)
      if (item.match(/^[A-Z][a-zA-Z ]+$/) && !item.match(/[0-9]\./)) {
        return (
          <Text key={index} style={styles.sectionHeader}>
            {item}
          </Text>
        );
      }
      // Check if the item is a tip or note
      if (item.startsWith("Tip") || item.startsWith("Note")) {
        return (
          <View key={index} style={styles.tipContainer}>
            <Text style={styles.tipText}>{item}</Text>
          </View>
        );
      }
      // Regular list item
      return (
        <Text key={index} style={styles.contentText}>
          {item}
        </Text>
      );
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.header, { backgroundColor: `${phase.color}20` }]}>
        <Text style={styles.phaseName}>{phase.name}</Text>
        <Text style={styles.actionName}>{action}</Text>
      </View>

      <View style={styles.contentContainer}>{renderContent()}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    paddingBottom: 40,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  phaseName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  actionName: {
    fontSize: 18,
    color: "#7f8c8d",
    marginTop: 4,
  },
  contentContainer: {
    padding: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 20,
    marginBottom: 10,
  },
  contentText: {
    fontSize: 16,
    color: "#2c3e50",
    marginBottom: 8,
    lineHeight: 24,
  },
  tipContainer: {
    backgroundColor: "#f0e6ff",
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
  },
  tipText: {
    fontSize: 15,
    color: "#9b59b6",
    fontStyle: "italic",
  },
});
