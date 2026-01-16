import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from "react-native";

export const dailyTasks = [
  {
    task: "Talk for 10 minutes with parents or someone you love.",
    why: "Talking with loved ones builds emotional connection and reduces stress hormones like cortisol.",
  },
  {
    task: "Spend 20 minutes talking with a good friend.",
    why: "Meaningful conversations improve mood and reduce feelings of loneliness.",
  },
  {
    task: "Write 3 things you are thankful for today.",
    why: "Practicing gratitude enhances overall happiness and rewires your brain for positivity.",
  },
  {
    task: "Do 10 minutes of deep breathing or meditation.",
    why: "Calms your nervous system, lowers anxiety, and improves emotional regulation.",
  },
  {
    task: "Stretch or do light yoga for 15 minutes.",
    why: "Increases body awareness and releases muscle tension which improves mental clarity.",
  },
  {
    task: "Listen to 2 favorite songs and notice how you feel.",
    why: "Music stimulates dopamine release and helps process emotions.",
  },
  {
    task: "Go for a 10-minute walk outside and look around.",
    why: "Exposure to nature lowers cortisol levels and improves mood and focus.",
  },
  {
    task: "Write 5 positive things about yourself.",
    why: "Boosts self-esteem and reduces negative self-talk patterns.",
  },
  {
    task: "Read something inspiring for 10-15 minutes.",
    why: "Uplifting content helps shift your mindset and cultivates hope.",
  },
  {
    task: "Take 5 minutes to imagine your best future self.",
    why: "Future visualization increases motivation and long-term goal commitment.",
  },
  {
    task: "Have at least 1 hour with no screens or social media.",
    why: "Reduces information overload and improves mental presence and attention span.",
  },
  {
    task: "Draw anything you like most.",
    why: "Creative expression allows emotional release and reduces anxiety.",
  },
  {
    task: "Have tea or coffee quietly without phone or TV.",
    why: "Mindful sipping encourages relaxation and increases present-moment awareness.",
  },
  {
    task: "Watch a short funny video for 10 minutes.",
    why: "Laughter reduces stress and increases serotonin production.",
  },
  {
    task: "Write down your biggest worry and 1 small solution.",
    why: "Externalizing worry and identifying action steps reduces overwhelm.",
  },
  {
    task: "Spend 10 minutes visualizing success.",
    why: "Mental rehearsal strengthens confidence and improves goal outcomes.",
  },
  {
    task: "Look at old happy photos for 10 minutes.",
    why: "Triggers positive memories and enhances your sense of well-being.",
  },
  {
    task: "Write freely about your thoughts for 10 minutes.",
    why: "Journaling helps organize thoughts and reduce emotional clutter.",
  },
  {
    task: "Stand in sunlight for 5 minutes.",
    why: "Boosts vitamin D, regulates mood, and resets circadian rhythms.",
  },
  {
    task: "Have a cold water bath for 10 minutes.",
    why: "Cold exposure increases alertness and reduces stress by activating endorphins.",
  },
  {
    task: "Write where you wish to be in five years for 10 minutes.",
    why: "Goal setting gives direction and fosters long-term motivation.",
  },
];

export default function DailyGoalScreen() {
  const { user } = useUser();
  const [task, setTask] = useState({ task: "", why: "" });
  const [streak, setStreak] = useState(0);
  const [isCompletedToday, setIsCompletedToday] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchDailyGoal = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];

        // Check local storage first
        const localData = await AsyncStorage.getItem(`dailyGoal-${user?.id}`);
        if (localData) {
          const parsed = JSON.parse(localData);
          if (parsed.lastShownDate === today) {
            setTask(dailyTasks[parsed.currentIndex]);
            setStreak(parsed.streak);
            setIsCompletedToday(parsed.lastCompletedDate === today);
            setLoading(false);
            return;
          }
        }

        // Fetch from server
        const token = await getToken();
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/daily-goals/${user?.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await response.json();

        // Update state
        setTask(dailyTasks[data.currentTaskIndex]);
        setStreak(data.streak);
        setIsCompletedToday(data.isCompletedToday);

        // Save to local storage
        await AsyncStorage.setItem(
          `dailyGoal-${user?.id}`,
          JSON.stringify({
            currentIndex: data.currentTaskIndex,
            streak: data.streak,
            lastCompletedDate: data.lastCompletedDate,
            lastShownDate: today,
          })
        );
      } catch (error) {
        console.error("Error fetching daily goal:", error);
        // Fallback to random task
        const randomIndex = Math.floor(Math.random() * dailyTasks.length);
        setTask(dailyTasks[randomIndex]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchDailyGoal();
    }
  }, [user?.id]);

  const handleMarkAsDone = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (isCompletedToday) return;
    
    try {
      const token = await getToken();
      const today = new Date().toISOString().split("T")[0];

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/daily-goals/${user?.id}/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to complete task");

      const result = await response.json();

      // Update state
      setStreak(result.streak);
      setIsCompletedToday(true);

      // Update local storage
      await AsyncStorage.mergeItem(
        `dailyGoal-${user?.id}`,
        JSON.stringify({
          streak: result.streak,
          lastCompletedDate: today,
        })
      );

      Alert.alert("🎉 Great job!", "You completed your daily mental wellness task.");
    } catch (error) {
      Alert.alert(
        "Oops!",
        "We couldn't mark your task as complete. Please try again."
      );
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading your daily goal...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1B3C73" />
          </Pressable>
          <Text style={styles.title}>Daily Goals</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Greeting */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>Hello, {user?.firstName} 🌱</Text>
          <Text style={styles.subtitle}>Small steps for mental wellbeing</Text>
        </View>

        {/* Streak Card */}
        <View style={styles.streakCard}>
          <View style={styles.streakContent}>
            <View style={styles.streakIcon}>
              <Ionicons name="flame" size={28} color="#FF9500" />
            </View>
            <View>
              <Text style={styles.streakNumber}>{streak}</Text>
              <Text style={styles.streakLabel}>Day Streak</Text>
            </View>
          </View>
          <Text style={styles.streakMotivation}>
            {streak === 0 
              ? "Start your journey today!" 
              : streak < 3 
                ? "You're building momentum!" 
                : streak < 7 
                  ? "Amazing consistency!" 
                  : "You're unstoppable! 🔥"}
          </Text>
        </View>

        {/* Today's Challenge Card */}
        <View style={styles.taskCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Today's Challenge</Text>
            <View style={styles.timeBadge}>
              <Ionicons name="time-outline" size={14} color="#4A90E2" />
              <Text style={styles.timeText}>10-20 min</Text>
            </View>
          </View>
          
          <Text style={styles.taskText}>{task.task}</Text>
          
          <View style={styles.divider} />
          
          <View style={styles.whySection}>
            <View style={styles.whyHeader}>
              <Ionicons name="bulb-outline" size={20} color="#6BC4A1" />
              <Text style={styles.whyTitle}>Why This Matters</Text>
            </View>
            <Text style={styles.whyText}>{task.why}</Text>
          </View>
        </View>

        {/* Action Button */}
        <Pressable
          style={[
            styles.actionButton,
            isCompletedToday && styles.completedButton,
          ]}
          onPress={handleMarkAsDone}
          disabled={isCompletedToday}
        >
          <Ionicons
            name={isCompletedToday ? "checkmark-circle" : "checkmark-circle-outline"}
            size={24}
            color="#FFFFFF"
          />
          <Text style={styles.actionButtonText}>
            {isCompletedToday ? "Completed Today" : "Mark as Done"}
          </Text>
        </Pressable>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${isCompletedToday ? 100 : 0}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {isCompletedToday ? "Daily goal achieved! 🎯" : "Ready to begin"}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF7",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAF7",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1B3C73",
  },
  greetingContainer: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1B3C73",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  streakCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  streakContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
  },
  streakIcon: {
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    padding: 12,
    borderRadius: 12,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1B3C73",
  },
  streakLabel: {
    fontSize: 14,
    color: "#666",
  },
  streakMotivation: {
    fontSize: 14,
    color: "#4A90E2",
    fontStyle: "italic",
  },
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1B3C73",
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 12,
    color: "#4A90E2",
    fontWeight: "500",
  },
  taskText: {
    fontSize: 17,
    fontWeight: "500",
    color: "#333",
    lineHeight: 24,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 16,
  },
  whySection: {
    backgroundColor: "rgba(107, 196, 161, 0.05)",
    borderRadius: 12,
    padding: 16,
  },
  whyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  whyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6BC4A1",
  },
  whyText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 20,
  },
  completedButton: {
    backgroundColor: "#95A5A6",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  progressContainer: {
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    borderRadius: 3,
    marginBottom: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4A90E2",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
});