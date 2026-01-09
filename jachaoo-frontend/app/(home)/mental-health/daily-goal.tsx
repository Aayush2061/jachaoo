import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

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
        // Fallback to first task
        setTask(dailyTasks[0]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchDailyGoal();
    }
  }, [user?.id]);

  const handleMarkAsDone = async () => {
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

      Alert.alert("✅ Great job!", "You completed your daily mental task.");
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to mark task as complete. Please try again."
      );
      console.error(error);
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={["#f2d3e2", "#d9e4f5"]}
        style={[styles.container, { justifyContent: "center" }]}
      >
        <Text>Loading your daily goal...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#f2d3e2", "#d9e4f5"]} style={styles.container}>
      {/* Close Button */}
      <Pressable style={styles.closeButton} onPress={() => router.back()}>
        <Ionicons name="close" size={28} color="#ff4d4d" />
      </Pressable>

      <Text style={styles.greeting}>Hey, {user?.firstName}</Text>
      <Text style={styles.streak}>
        🔥 Streak: {streak} day{streak !== 1 ? "s" : ""}
      </Text>
      <Text style={styles.quote}>"Small step for mental wellbeing"</Text>

      {/* Task Box */}
      <View style={styles.taskBox}>
        <Text style={styles.taskHeader}>✨ TODAY'S CHALLENGE</Text>
        <Text style={styles.taskText}>{task.task}</Text>
        <Text style={styles.whyHeader}>💡 WHY THIS MATTERS</Text>
        <Text style={styles.whyText}>{task.why}</Text>
      </View>

      {/* Mark as done */}
      <Pressable
        style={[styles.markButton, isCompletedToday && styles.disabledButton]}
        onPress={handleMarkAsDone}
        disabled={isCompletedToday}
      >
        <Ionicons
          name="checkmark-done-circle"
          size={32}
          color={isCompletedToday ? "#2ecc71" : "#fff"}
        />
        <Text style={styles.buttonText}>
          {isCompletedToday ? "Completed today" : "Mark as done"}
        </Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    left: 20,
  },
  greeting: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
  },
  streak: {
    fontSize: 18,
    marginTop: 10,
    color: "#ff6600",
  },
  quote: {
    marginVertical: 20,
    fontSize: 14,
    color: "#333",
    fontStyle: "italic",
    textAlign: "center",
  },
  // taskBox: {
  //   backgroundColor: "#fff",
  //   borderRadius: 20,
  //   padding: 20,
  //   width: "100%",
  //   marginVertical: 20,
  //   shadowColor: "#000",
  //   shadowOffset: { width: 0, height: 4 },
  //   shadowOpacity: 0.2,
  //   shadowRadius: 6,
  //   elevation: 4,
  // },
  taskText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  whyText: {
    fontSize: 15,
    color: "#333",
  },
  markButton: {
    backgroundColor: "#27ae60",
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  disabledButton: {
    backgroundColor: "#95a5a6",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  taskBox: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    height: "40%",
    marginVertical: 15,
    // Shadow for Android
    elevation: 5,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderLeftWidth: 5, // Red accent line
    borderLeftColor: "#FF6B6B",
  },
  taskHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6B6B", // Red-pink
    marginBottom: 8,
    marginTop: 10,
  },
  taskText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  whyHeader: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#7F5DF0", // Purple
    marginBottom: 8,
    marginTop: 40,
  },
  whyText: {
    fontSize: 15,
    color: "green",
    fontStyle: "italic",
  },
});
