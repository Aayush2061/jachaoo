import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MentalHealthBackground from "../MentalHealthBackground";
const rituals = [
  {
    name: "Oil Massage on Feet",
    benefits: "Relaxes your body and soothes your nerves.",
    time: "30 minutes before bed",
    method:
      "Warm sesame or mustard oil and gently massage the soles of your feet for 5–7 minutes.",
    precaution: "Don't walk immediately after",
  },
  {
    name: "Ghee in Nose",
    benefits: "Cools and calms your mind, helps with easier breathing.",
    time: "Just before sleep",
    method:
      "Lie on your back and gently put 1 drop of pure cow ghee in each nostril.",
    precaution:
      "Use only pure ghee. Avoid if you have a cold or sinus problem.",
  },
  {
    name: "Warm Foot Soak",
    benefits: "Reduces tiredness and calms your body.",
    time: "1 hour before bed",
    method:
      "Soak your feet in warm water mixed with a little salt for 10 minutes.",
    precaution: "Water should be warm, not hot",
  },
  {
    name: "Lighting Lamp or Incense",
    benefits: "Creates a peaceful and relaxing sleep environment.",
    time: "Evening time, around 8–9 PM",
    method:
      "Light a small oil lamp or natural incense stick to make the space calming.",
    precaution: "Place safely",
  },
  {
    name: "Warm Milk with Nutmeg",
    benefits: "Promotes natural sleep and soothes your mind.",
    time: "20–30 minutes before bed",
    method:
      "Add a small pinch of nutmeg to warm milk, stir well, and drink slowly.",
    precaution: "Don't use too much nutmeg",
  },
  {
    name: "Mantra or Prayer",
    benefits: "Clears your mind, reduces stress, and brings inner peace.",
    time: "Right before going to sleep",
    method: "Sit or lie down and softly chant or say a quiet prayer.",
    precaution:
      "Keep it soft and peaceful — avoid loud or energizing chants at night.",
  },
  {
    name: "Quiet Reading",
    benefits: "Helps your mind shift away from screens and daily stress.",
    time: "Last 15 minutes before bed",
    method:
      "Read a calming book, story, or scripture under a soft yellow lamp.",
    precaution: "Avoid phone or tablet screens",
  },
];

export default function RitualsScreen() {
  const router = useRouter();

  return (
    <MentalHealthBackground>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#3b82f6" />
          </Pressable>
          <Text style={styles.header}>Home Rituals</Text>
        </View>

        <Text style={styles.subheader}>
          Traditional practices for better sleep
        </Text>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {rituals.map((ritual, index) => (
            <View key={index} style={styles.ritualCard}>
              <Text style={styles.ritualName}>{ritual.name}</Text>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Benefits</Text>
                <Text style={styles.sectionContentBenifits}>
                  {ritual.benefits}
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Best Time</Text>
                <Text style={styles.sectionContent}>{ritual.time}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Method</Text>
                <Text style={styles.sectionContent}>{ritual.method}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Precautions</Text>
                <Text style={[styles.sectionContent, styles.precautionText]}>
                  {ritual.precaution}
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
    // backgroundColor: "#f8fafc",
    marginTop: 20,
    paddingBottom: 30,
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
  ritualCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  ritualName: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    color: "#1e293b",
    fontFamily: "Inter_600SemiBold",
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    color: "#334155",
    fontFamily: "Inter_500Medium",
  },
  sectionContent: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
  },
  precautionText: {
    color: "#dc2626",
  },
  sectionContentBenifits: {
    fontSize: 15,
    color: "green",
    lineHeight: 22,
    fontFamily: "Inter_400Italic", // Changed to italic variant
    fontStyle: "italic", // Explicitly set to italic (optional if fontFamily includes italic)
  },
});
