// (home)/mental-health/listen.tsx
import { StyleSheet, Text, View } from "react-native";
import MentalHealthBackground from "./MentalHealthBackground";

export default function ListenComingSoon() {
  return (
    <MentalHealthBackground>
      <View style={styles.container}>
        <Text style={styles.text}>Listen & Heal - Coming Soon!</Text>
        <Text style={styles.subtext}>This feature is under development</Text>
      </View>
    </MentalHealthBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2980b9",
    marginBottom: 10,
    textAlign: "center",
  },
  subtext: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
});
