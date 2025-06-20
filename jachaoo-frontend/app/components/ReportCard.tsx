import { Link } from "expo-router";
import { Image, Pressable, StyleSheet, Text } from "react-native";

export default function ReportCard({ report }) {
  return (
    <Link href={`/(home)/reports/${report._id}`} asChild>
      <Pressable style={styles.card}>
        <Image source={{ uri: report.url }} style={styles.image} />
        <Text style={styles.date}>
          {new Date(report.createdAt).toLocaleDateString()}
        </Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 4,
    marginBottom: 8,
  },
  date: { color: "#666" },
});
