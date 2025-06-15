import { View, Text } from "react-native";
import { Link } from "expo-router";

export default function ReportsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Report Analysis</Text>
      <Link href="/report-upload" asChild>
        <Text style={{ color: "blue", marginTop: 20 }}>Upload Report</Text>
      </Link>
    </View>
  );
}