// app/(home)/mental-health/breathe/index.tsx
import { useRouter } from "expo-router";
import { StyleSheet, Text, View, Pressable, ScrollView } from "react-native";
import MentalHealthBackground from "../MentalHealthBackground";
import { Ionicons } from "@expo/vector-icons";

export default function BreatheAndCalm() {
  const router = useRouter();

  const breathingExercises = [
    {
      id: "four-seven-eight",
      title: "4-7-8 Breathing",
      subtitle: "Calm anxiety, improve sleep",
      icon: "🌙",
    },
    {
      id: "box-breathing",
      title: "Box Breathing",
      subtitle: "Increase focus, reduce stress",
      icon: "🧊",
    },
    {
      id: "coherent-breathing",
      title: "Coherent Breathing",
      subtitle: "Balance emotions, steady mind",
      icon: "⚖️",
    },
  ];

  return (
    <MentalHealthBackground>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🧘‍♂️ Breathe & Calm</Text>
          <Text style={styles.subtitle}>Slow your breath. Calm your mind.</Text>
        </View>

        {/* Exercises List */}
        <View style={styles.exercisesContainer}>
          {breathingExercises.map((exercise) => (
            <Pressable
              key={exercise.id}
              style={styles.exerciseCard}
              onPress={() =>
                router.push(`/(home)/mental-health/breathe/${exercise.id}`)
              }
            >
              <View style={styles.exerciseContent}>
                <Text style={styles.exerciseIcon}>{exercise.icon}</Text>
                <View style={styles.exerciseTextContainer}>
                  <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                  <Text style={styles.exerciseSubtitle}>
                    {exercise.subtitle}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#95a5a6" />
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </MentalHealthBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#7f8c8d",
    textAlign: "center",
  },
  exercisesContainer: {
    gap: 16,
  },
  exerciseCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  exerciseContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  exerciseIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  exerciseTextContainer: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 4,
  },
  exerciseSubtitle: {
    fontSize: 14,
    color: "#7f8c8d",
  },
});
