import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MentalHealthBackground from "../MentalHealthBackground";

const checklistItems = [
  {
    id: 1,
    title: "Fix your bedtime",
    description:
      "Go to bed and wake up at the same time every day, even on weekends.",
    emoji: "😊",
  },
  {
    id: 2,
    title: "Limit screen time before bed",
    description:
      "Turn off phones, TVs, and laptops at least 1 hour before sleeping.",
    emoji: "📱",
  },
  {
    id: 3,
    title: "Dim the lights",
    description:
      "Use soft, warm lighting in the evening to help your brain wind down.",
    emoji: "💡",
  },
  {
    id: 4,
    title: "Keep your room cool and dark",
    description:
      "Ideal temperature is around 18–22°C; use blackout curtains if needed.",
    emoji: "👍",
  },
  {
    id: 5,
    title: "Avoid heavy meals late at night",
    description:
      "Finish dinner at least 2 hours before sleeping; avoid spicy or oily food.",
    emoji: "🍽️",
  },
  {
    id: 6,
    title: "Don't drink caffeine in the evening",
    description: "No coffee, energy drinks, or strong tea after 4 PM.",
    emoji: "☕",
  },
  {
    id: 7,
    title: "Do light stretches or breathing",
    description:
      "Just 5–10 minutes of calm breathing or simple stretches can relax your body.",
    emoji: "🧘",
  },
  {
    id: 8,
    title: "Use your bed only for sleep",
    description: "Avoid watching TV or scrolling in bed.",
    emoji: "🛏️",
  },
  {
    id: 9,
    title: "Keep noise low",
    description:
      "Use earplugs, white noise, or a fan to block disturbing sounds.",
    emoji: "🔇",
  },
  {
    id: 10,
    title: "Clear your mind",
    description:
      "Think of one peaceful thought, or 3 good things from the day.",
    emoji: "🧠",
  },
];

export default function ChecklistScreen() {
  const router = useRouter();

  return (
    <MentalHealthBackground>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#3b82f6" />
          </Pressable>
          <Text style={styles.header}>Sleep Checklist</Text>
        </View>

        <Text style={styles.subheader}>10 habits for better sleep</Text>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {checklistItems.map((item) => (
            <View key={item.id} style={styles.checklistItem}>
              <View style={styles.emojiContainer}>
                <Text style={styles.emoji}>{item.emoji}</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.checklistTitle}>{item.title}</Text>
                <Text style={styles.checklistDescription}>
                  {item.description}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </MentalHealthBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  backButton: {
    marginRight: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
    fontFamily: "Inter_600SemiBold",
  },
  subheader: {
    fontSize: 16,
    marginBottom: 24,
    color: "#64748b",
    fontFamily: "Inter_400Regular",
  },
  scrollContainer: {
    flex: 1,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  emojiContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  emoji: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  checklistTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
    fontFamily: "Inter_600SemiBold",
  },
  checklistDescription: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
    fontFamily: "Inter_400Regular",
  },
});
