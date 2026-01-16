// app/(home)/mental-health/breathe/index.tsx
import { useRouter } from "expo-router";
import { 
  StyleSheet, 
  Text, 
  View, 
  Pressable, 
  ScrollView, 
  SafeAreaView,
  Animated
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";

export default function BreatheAndCalm() {
  const router = useRouter();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, []);

  const breathingExercises = [
    {
      id: "four-seven-eight",
      title: "4-7-8 Breathing",
      subtitle: "Calm anxiety, improve sleep",
      icon: "moon",
    },
    {
      id: "box-breathing",
      title: "Box Breathing",
      subtitle: "Increase focus, reduce stress",
      icon: "square",
    },
    {
      id: "coherent-breathing",
      title: "Coherent Breathing",
      subtitle: "Balance emotions, steady mind",
      icon: "heart",
    },
  ];

  return (
    <SafeAreaView style={styles.background}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#1B3C73" />
            </Pressable>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Breathe & Calm</Text>
              <Text style={styles.subtitle}>
                Guided breathing exercises
              </Text>
            </View>
          </View>

          {/* Exercises List */}
          <View style={styles.exercisesContainer}>
            {breathingExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(`/(home)/mental-health/breathe/${exercise.id}`);
                }}
              />
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

function ExerciseCard({ exercise, onPress }: any) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={onPress}
        style={styles.exerciseCard}
      >
        <Ionicons name={exercise.icon} size={28} color="#4A90E2" />
        <View style={styles.exerciseText}>
          <Text style={styles.exerciseTitle}>{exercise.title}</Text>
          <Text style={styles.exerciseSubtitle}>{exercise.subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#FAFAF7",
  },
  container: {
    padding: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    color: "#1B3C73",
    fontFamily: "Poppins-SemiBold",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins-Regular",
    marginTop: 2,
  },
  exercisesContainer: {
    gap: 12,
  },
  exerciseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  exerciseText: {
    flex: 1,
    marginLeft: 16,
  },
  exerciseTitle: {
    fontSize: 16,
    color: "#1B3C73",
    fontFamily: "Poppins-SemiBold",
    marginBottom: 2,
  },
  exerciseSubtitle: {
    fontSize: 13,
    color: "#666",
    fontFamily: "Poppins-Regular",
  },
});