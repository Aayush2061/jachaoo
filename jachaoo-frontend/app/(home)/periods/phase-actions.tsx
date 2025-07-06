import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const router = useRouter();

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
  const params = useLocalSearchParams();
  const phase = JSON.parse(params.phase as string);

  return (
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
                pathname: "/(home)/periods/phase-detail",
                params: {
                  phase: JSON.stringify(phase),
                  action: action.name,
                },
              })
            }
          >
            <View style={styles.actionIconContainer}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
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
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 180,
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconContainer: {
    backgroundColor: "rgba(155, 89, 182, 0.1)",
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  actionDescription: {
    fontSize: 13,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 18,
  },
  chevron: {
    marginTop: 4,
  },
});
