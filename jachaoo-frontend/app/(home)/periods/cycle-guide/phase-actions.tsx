import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const actions = [
  {
    name: "Food",
    icon: "food-apple" as const,
    description: "Nutrition recommendations for this phase",
  },
  {
    name: "Exercise",
    icon: "yoga" as const,
    description: "Physical activities tailored to this phase",
  },
  {
    name: "Focus",
    icon: "brain" as const,
    description: "Mental and work strategies",
  },
  {
    name: "Love",
    icon: "heart" as const,
    description: "Relationship and intimacy guidance",
  },
];

export default function PhaseActions() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const phase = JSON.parse(params.phase as string);

  return (
    <LinearGradient
      colors={["#FFF2F8", "#F2F0FF"]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{phase.name} Guidance</Text>
        <Text style={styles.subtitle}>Select an area to explore</Text>

        <View style={styles.actionsContainer}>
          {actions.map((action, index) => (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.actionCard,
                {
                  borderColor: phase.color,
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
              onPress={() =>
                router.push({
                  pathname: "/(home)/periods/cycle-guide/phase-detail",
                  params: {
                    phase: JSON.stringify(phase),
                    action: action.name,
                  },
                })
              }
            >
              <View
                style={[
                  styles.actionIconContainer,
                  { backgroundColor: `${phase.color}15` },
                ]}
              >
                <MaterialCommunityIcons
                  name={action.icon}
                  size={32}
                  color={phase.color}
                />
              </View>
              <Text style={[styles.actionTitle, { color: phase.color }]}>
                {action.name}
              </Text>
              <Text style={styles.actionDescription}>{action.description}</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={phase.color}
                style={styles.chevron}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
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
    marginBottom: 30,
  },
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
  },
  actionCard: {
    width: "48%",
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 180,
    borderWidth: 1.5,
    shadowColor: "#B76CFD",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 8,
    textAlign: "center",
  },
  actionDescription: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 18,
  },
  chevron: {
    marginTop: 4,
  },
});
