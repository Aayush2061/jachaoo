import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { addDays, format, isToday } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  getCyclePhaseInfo,
  isPeriodIrregular,
} from "../../../utils/cycleUtils";
import SymptomsSection from "./components/SymptomsSection";

export default function PeriodDashboard() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [periodData, setPeriodData] = useState<any>(null);
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const baseDate = new Date(); // today

  const getCalendarStripDates = () => {
    // Show [yesterday, today, tomorrow, +2 more]
    return [-1, 0, 1, 2, 3].map((offset) => addDays(baseDate, offset));
  };

  const getPhaseColor = (phase?: string) => {
    switch (phase) {
      case "Menstrual Phase":
        return "#FF6B6B";
      case "Follicular Phase":
        return "#51CF66";
      case "Ovulation Phase":
        return "#3498DB";
      case "Luteal Phase":
        return "#FCC419";
      default:
        return "#ffffff"; // fallback
    }
  };
  useFocusEffect(
    useCallback(() => {
      const fetchPeriodData = async () => {
        try {
          setLoading(true);
          if (!user?.id) return;

          const token = await getToken();
          const periodsDataResponse = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/periods/${user.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const periodData = await periodsDataResponse.json();
          setPeriodData(periodData);

          const healthDataResponse = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/health/${user.id}`
          );
          const healthData = await healthDataResponse.json();
          setHealthData(healthData);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchPeriodData();
    }, [user?.id])
  );

  const getCurrentPhaseInfo = () => {
    if (
      !periodData ||
      !periodData.lastPeriodDate ||
      !periodData.cycleLength ||
      !periodData.duration
    ) {
      return null;
    }

    try {
      return getCyclePhaseInfo({
        lastPeriodDate: periodData.lastPeriodDate,
        cycleLength: periodData.cycleLength,
        duration: periodData.duration,
        today: new Date(),
      });
    } catch (error) {
      console.error("Error calculating cycle phase:", error);
      return null;
    }
  };

  const phaseInfo = getCurrentPhaseInfo();
  const currentSymptoms = periodData?.symptoms || [];

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#9b59b6" />
      </View>
    );
  }

  const buttons = [
    {
      label: "Log your symptoms to track your cycle health",
      icon: "plus-circle-outline",
      route: "/(home)/periods/daily-symptoms",
      colors: ["#fbc2eb", "#a6c1ee"],
    },
    {
      label: "Get your daily test result",
      icon: "clipboard-text-outline",
      route: "/(home)/periods/daily-result",
      colors: ["#fad0c4", "#ffd1ff"],
    },
    {
      label: "Track your cycle on calendar",
      icon: "calendar-month-outline",
      route: "/(home)/periods/calendar",
      colors: ["#c2e9fb", "#a1c4fd"],
    },
    {
      label: "Start Chat",
      icon: "chat-processing-outline",
      route: "/(home)/periods/chat",
      colors: ["#fddb92", "#d1fdff"],
    },
    {
      label: "Cycle Guide",
      icon: "flower-outline",
      route: "/(home)/periods/cycle-guide",
      colors: ["#fbc2eb", "#fceabb"],
    },
  ];

  return (
    <LinearGradient colors={["#b3e5fc", "#ffe0b2"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.monthText}>
              {new Date().toLocaleString("default", { month: "long" })}
            </Text>
            <Text
              style={[
                styles.phaseText,
                {
                  color: getPhaseColor(phaseInfo?.phase), // dynamic color
                },
              ]}
            >
              {phaseInfo
                ? isPeriodIrregular(periodData)
                  ? `Irregular cycle`
                  : `${phaseInfo.phase} - Day ${phaseInfo.currentDay}`
                : "Cycle data not available"}
            </Text>
          </View>
          {/* <Pressable
            style={styles.editButton}
            onPress={() => router.push("/(home)/periods/edit")}
          >
            <Ionicons name="pencil" size={18} color="#9b59b6" />
            <Text style={styles.editText}>Edit details</Text>
          </Pressable> */}
        </View>

        {/* Calendar Strip */}
        <View style={styles.calendarStrip}>
          {getCalendarStripDates().map((date, index) => {
            const isCurrent = isToday(date);
            return (
              <View
                key={index}
                style={[
                  styles.calendarDay,
                  isCurrent && styles.currentDayCircle,
                ]}
              >
                <Text
                  style={[
                    styles.calendarDayText,
                    isCurrent && styles.currentDayText,
                  ]}
                >
                  {format(date, "dd")}
                </Text>
                <Text style={styles.calendarDayLabel}>
                  {format(date, "EEE")}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Profile Card */}
        <View style={styles.userCard}>
          {/* User Info Section */}
          <View style={styles.userInfoContainer}>
            <LinearGradient
              colors={["#9b59b6", "#8e44ad"]}
              style={styles.avatarContainer}
            >
              <MaterialCommunityIcons
                name="face-woman"
                size={24}
                color="#fff"
              />
            </LinearGradient>
            <View style={styles.userTextContainer}>
              <Text style={styles.userName}>{healthData?.name}</Text>
              <Text style={styles.userAge}>{healthData?.age} years</Text>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.editButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
              onPress={() => router.push("/(home)/periods/edit")}
            >
              <Ionicons name="pencil" size={18} color="#9b59b6" />
              <Text style={styles.editText}>Edit details</Text>
            </Pressable>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Symptoms Section */}
          <SymptomsSection
            initialSymptoms={currentSymptoms}
            userId={user?.id}
            onSymptomsUpdate={(updatedSymptoms) => {
              setPeriodData({ ...periodData, symptoms: updatedSymptoms });
            }}
            customStyles={{
              symptomsContainer: styles.symptomsContainerCustom,
              symptomPill: styles.symptomPillCustom,
              symptomText: styles.symptomTextCustom,
              sectionTitle: styles.symptomsTitleCustom,
              addButton: styles.addButtonCustom,
              removeButton: styles.removeButtonCustom,
            }}
          />
        </View>

        {/* Feature Buttons */}
        <View style={styles.grid}>
          {buttons.map((btn, idx) => (
            <Pressable
              key={idx}
              onPress={() => router.push(btn.route)}
              style={styles.pressable}
            >
              <LinearGradient
                colors={btn.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                <MaterialCommunityIcons
                  name={btn.icon}
                  size={28}
                  color="#333"
                  style={{ marginBottom: 8 }}
                />
                <Text style={styles.cardText}>{btn.label}</Text>
              </LinearGradient>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // Layout Styles
  container: {
    padding: 20,
    paddingBottom: 60,
    marginTop: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 14,
    marginTop: 20,
  },

  // Text Styles
  monthText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#2c3e50",
  },
  phaseText: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: 4,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  cardText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },

  // Calendar Styles
  calendarStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 16,
  },
  calendarDay: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  calendarDayText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#444",
  },
  calendarDayLabel: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 2,
  },
  currentDayCircle: {
    backgroundColor: "rgba(255, 105, 180, 0.15)",
    borderRadius: 12,
  },
  currentDayText: {
    color: "#e91e63",
    fontWeight: "bold",
  },

  // Profile Card Styles
  userCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 24,
    padding: 20,
    marginBottom: 25,
    shadowColor: "#8e44ad",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#8e44ad",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  userTextContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2c3e50",
    letterSpacing: 0.2,
  },
  userAge: {
    fontSize: 15,
    color: "#7f8c8d",
    marginTop: 4,
    fontWeight: "500",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(155, 89, 182, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(155, 89, 182, 0.2)",
  },
  editText: {
    color: "#9b59b6",
    marginLeft: 6,
    fontWeight: "600",
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(155, 89, 182, 0.1)",
    marginBottom: 16,
    marginHorizontal: -8,
  },

  // Feature Button Styles
  pressable: {
    width: "48%",
  },
  card: {
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    minHeight: 130,
  },

  // Symptoms Section Styles
  symptomsContainerCustom: {
    marginTop: 0,
  },
  symptomsTitleCustom: {
    fontSize: 17,
    fontWeight: "600",
    color: "#8e44ad",
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  symptomPillCustom: {
    backgroundColor: "rgba(155, 89, 182, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(155, 89, 182, 0.15)",
    shadowColor: "#8e44ad",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  symptomTextCustom: {
    color: "#8e44ad",
    fontWeight: "500",
    fontSize: 14,
  },
  addButtonCustom: {
    backgroundColor: "rgba(155, 89, 182, 0.1)",
    padding: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(155, 89, 182, 0.2)",
  },
  removeButtonCustom: {
    marginLeft: 6,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 10,
    padding: 2,
  },
});
