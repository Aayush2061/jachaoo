import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator
        size="large"
        color="#007AFF" // Matching your button color
      />
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5", // Matching your background
    padding: 20,
  },
  text: {
    marginTop: 15,
    fontSize: 16,
    color: "#666", // Matching your subtitle color
  },
});
