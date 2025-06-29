import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function DailyResult() {
  const params = useLocalSearchParams();
  // Parse the analysis data directly from params without useEffect
  const analysis = params.analysis ? JSON.parse(params.analysis as string) : {};

  if (analysis.error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{analysis.error}</Text>
      </View>
    );
  }

  if (!analysis.result) {
    return (
      <View style={styles.container}>
        <Text>No analysis data available</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Your Daily Cycle Analysis</Text>
      <Text style={styles.date}>{analysis.date}</Text>
      <View style={styles.resultContainer}>
        <Text style={styles.resultText}>{analysis.result}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
  },
  date: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 20,
  },
  resultContainer: {
    backgroundColor: "#f9f5ff",
    borderRadius: 10,
    padding: 15,
  },
  resultText: {
    fontSize: 16,
    color: "#2c3e50",
    lineHeight: 24,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});
