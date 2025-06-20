import { Link } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function ReportCard({ report }) {
  return (
    <Link href={`/(home)/reports/${report._id}`} asChild>
      <Pressable style={styles.card}>
        <View style={styles.textContainer}>
          <Text style={styles.reportName} numberOfLines={1}>
            {report.reportName}
          </Text>
          <View style={styles.labContainer}>
            {/* <MaterialIcons name="location-on" size={16} color="#666" /> */}
            <Text style={styles.labName} numberOfLines={1}>
              {report.labName}
            </Text>
          </View>
          <Text style={styles.date}>
            {new Date(report.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </Text>
        </View>
        <Image
          source={{ uri: report.url }}
          style={styles.image}
          resizeMode="cover"
        />
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginRight: 150,
  },
  textContainer: {
    padding: 16,
    paddingBottom: 12,
  },
  reportName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  labContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  labName: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  date: {
    fontSize: 12,
    color: "#999",
  },
  image: {
    width: "100%",
    height: 180,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
});
