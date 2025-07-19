import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function SymptomsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Symptoms Analysis</Text>
      <Link href="/symptom-input" asChild>
        <Text style={{ color: "blue", marginTop: 20 }}>Check Symptoms</Text>
      </Link>
    </View>
  );
}