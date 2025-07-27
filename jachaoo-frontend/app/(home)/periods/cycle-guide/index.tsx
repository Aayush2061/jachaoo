import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
const phaseData = [
  {
    name: "Menstrual Phase",
    color: "#FF6B6B",
    icon: "water",
    description:
      "The menstrual phase is when you have your period. This phase typically lasts 3-7 days as your body sheds the uterine lining.",
    keyPoints: [
      "Estrogen and progesterone levels are low",
      "Uterine lining is shed",
      "Typical duration: 3-7 days",
      "Common symptoms: cramps, fatigue",
    ],
  },
  {
    name: "Follicular Phase",
    color: "#51CF66",
    icon: "flower",
    description:
      "This phase begins after menstruation and lasts until ovulation. Your body prepares eggs for release and the uterine lining thickens.",
    keyPoints: [
      "Estrogen levels rise",
      "Follicles mature in ovaries",
      "Uterine lining thickens",
      "Typical duration: 7-10 days",
    ],
  },
  {
    name: "Ovulatory Phase",
    color: "#3498DB",
    icon: "egg",
    description:
      "Ovulation occurs when an egg is released from the ovary. This is your most fertile period, typically around day 14 of a 28-day cycle.",
    keyPoints: [
      "LH surge triggers ovulation",
      "Egg is released from follicle",
      "Most fertile window",
      "Lasts 12-24 hours",
    ],
  },
  {
    name: "Luteal Phase",
    color: "#FCC419",
    icon: "leaf",
    description:
      "After ovulation, the luteal phase begins. If pregnancy doesn't occur, hormone levels drop, leading to menstruation and the start of a new cycle.",
    keyPoints: [
      "Progesterone dominates",
      "Uterine lining prepares for implantation",
      "Typical duration: 10-14 days",
      "PMS symptoms may occur",
    ],
  },
];

export default function CycleGuide() {
  const router = useRouter();

  const navigateToPhaseDetail = (phase: (typeof phaseData)[0]) => {
    router.push({
      pathname: "/(home)/periods/cycle-guide/phase-actions",
      params: {
        phase: JSON.stringify(phase),
      },
    });
  };

  return (
    <LinearGradient colors={["#b3e5fc", "#ffe0b2"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Menstrual Cycle Phases</Text>
        <Text style={styles.subtitle}>Tap on a phase to learn more</Text>

        {phaseData.map((phase, index) => (
          <Pressable
            key={index}
            style={[styles.phaseCard, { backgroundColor: phase.color + "20" }]} // Add opacity to color
            onPress={() => navigateToPhaseDetail(phase)}
          >
            <View style={styles.phaseHeader}>
              <MaterialCommunityIcons
                name={phase.icon}
                size={24}
                color={phase.color}
              />
              <Text style={[styles.phaseTitle, { color: phase.color }]}>
                {phase.name}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={phase.color}
                style={styles.chevron}
              />
            </View>
            <Text style={styles.phaseDescription}>{phase.description}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "rgba(255,255,255,0.4)",
    padding: 20,
    paddingBottom: 60,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 20,
  },
  phaseCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  phaseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 12,
    flex: 1,
  },
  phaseDescription: {
    fontSize: 15,
    color: "#2c3e50",
    lineHeight: 22,
  },
  chevron: {
    marginLeft: 8,
  },
});
