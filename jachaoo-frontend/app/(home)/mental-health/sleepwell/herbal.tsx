import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MentalHealthBackground from "../MentalHealthBackground";
const remedies = [
  {
    name: "Jatamansi",
    preparation:
      "Boil 1 teaspoon of dried root in a cup of water and drink warm.",
    time: "1 hour before bed",
    benefits: "Makes your mind calm and helps you fall asleep.",
    precautions: "Use only a small amount",
  },
  {
    name: "Ashwagandha",
    preparation: "Mix 1 teaspoon of powder in warm milk or water and drink",
    time: "After dinner",
    benefits: "Reduces stress and relaxes your body for better sleep.",
    precautions: "Avoid during pregnancy or thyroid issues — consult a doctor.",
  },
  {
    name: "Nutmeg",
    preparation: "Add a small pinch of nutmeg to a cup of warm milk.",
    time: "20–30 minutes before sleep",
    benefits: "Helps your brain feel naturally healthy.",
    precautions: "Don't use too much. It may cause nausea.",
  },
  {
    name: "Tulsi",
    preparation: "Boil fresh or dried leaves in water to make tea.",
    time: "In the evening",
    benefits: "Helps you feel peaceful and reduces anxiety.",
    precautions: "Don't mix with caffeine like tea or coffee.",
  },
  {
    name: "Chamomile",
    preparation: "Make tea using dried chamomile flowers.",
    time: "Before bed",
    benefits:
      "Acts as a light relaxant — helps your body and mind wind down naturally.",
    precautions:
      "May cause drowsiness — avoid if you need to stay alert or drive afterward.",
  },
  {
    name: "Sarpagandha",
    preparation:
      "Take in powder form with water or as Ayurvedic tablets — only as prescribed.",
    time: "Only under expert guidance",
    benefits: "Helps with insomnia and high blood pressure (BP).",
    precautions:
      "Must be taken under doctor or Ayurvedic expert advice — can have strong effects on BP and nervous system.",
  },
  {
    name: "Tagar",
    preparation:
      "Use in capsule or tea form (consult Ayurvedic practitioner for correct dosage).",
    time: "30 minutes before bedtime",
    benefits: "Helps with stress and promotes deep sleep.",
    precautions:
      "Can cause very deep sleep — avoid during the daytime or when alertness is needed.",
  },
];

export default function HerbalRemediesScreen() {
  const router = useRouter();

  return (
    <MentalHealthBackground>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#3b82f6" />
          </Pressable>
          <Text style={styles.header}>Herbal Remedies</Text>
        </View>

        <Text style={styles.subheader}>Natural solutions for better sleep</Text>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {remedies.map((remedy, index) => (
            <View key={index} style={styles.remedyCard}>
              <Text style={styles.remedyName}>{remedy.name}</Text>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Preparation</Text>
                <Text style={styles.sectionContent}>{remedy.preparation}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Best Time</Text>
                <Text style={styles.sectionContent}>{remedy.time}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Benefits</Text>
                <Text style={styles.sectionContent}>{remedy.benefits}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Precautions</Text>
                <Text style={[styles.sectionContent, styles.precautionText]}>
                  {remedy.precautions}
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
  remedyCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  remedyName: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1e293b",
    fontFamily: "Inter_600SemiBold",
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
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
});
