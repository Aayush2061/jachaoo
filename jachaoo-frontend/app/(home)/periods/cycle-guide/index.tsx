import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const phaseData = [
  {
    name: "Menstrual Phase",
    color: "#FF5C8D", // Blossom pink from home page
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
    color: "#9AD1A1", // Soft green from home page
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
    color: "#7CB9E8", // Soft blue from home page
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
    color: "#F5C76B", // Soft yellow from home page
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
    <LinearGradient
      colors={["#FFF2F8", "#F2F0FF"]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Menstrual Cycle Phases</Text>
        <Text style={styles.subtitle}>Tap on a phase to learn more</Text>

        {phaseData.map((phase, index) => (
          <Pressable
            key={index}
            style={[styles.phaseCard, { backgroundColor: `${phase.color}20` }]}
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
    padding: 20,
    paddingTop: 40,
    paddingBottom: 60,
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins-SemiBold",
    color: "#2D2D2D",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#8B8691",
    textAlign: "center",
    marginBottom: 20,
  },
  phaseCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(183,108,253,0.1)",
  },
  phaseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  phaseTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    marginLeft: 12,
    flex: 1,
  },
  phaseDescription: {
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: "#2D2D2D",
    lineHeight: 22,
  },
  chevron: {
    marginLeft: 8,
  },
});
