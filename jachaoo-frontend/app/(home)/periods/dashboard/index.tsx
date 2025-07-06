import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const periodData = await periodsDataResponse.json();
          console.log(periodData);
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

  // Add this function to calculate phase info
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
  // Get the phase info
  const phaseInfo = getCurrentPhaseInfo();
  // console.log(phaseInfo);
  const currentSymptoms = periodData?.symptoms || [];
  // 👇 Show loading indicator while data is being fetched
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#9b59b6" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <Text style={styles.monthText}>
            {new Date().toLocaleString("default", { month: "long" })}
          </Text>
          <Text style={styles.phaseText}>
            {phaseInfo
              ? isPeriodIrregular(periodData)
                ? `Irregular cycle`
                : `${phaseInfo.phase} - Day ${phaseInfo.currentDay}`
              : "Cycle data not available"}
          </Text>
        </View>

        <Pressable
          style={styles.editButton}
          onPress={() => router.push("/(home)/periods/edit")}
        >
          <Ionicons name="pencil" size={18} color="#9b59b6" />
          <Text style={styles.editText}>Edit details</Text>
        </Pressable>
      </View>

      {/* Calendar Strip */}
      {/* <View style={styles.calendarStrip}>
        {["31", "01", "02", "03", "04"].map((day, index) => (
          <View key={index} style={styles.calendarDay}>
            <Text style={styles.calendarDayText}>{day}</Text>
            {index === 1 && <View style={styles.currentDayIndicator} />}
          </View>
        ))}
      </View> */}

      {/* User Profile Section */}
      {healthData && (
        <View style={styles.profileSection}>
          <Text style={styles.userName}>{healthData.name}</Text>
          <Text style={styles.userAge}>{healthData.age} years</Text>
        </View>
      )}

      {/* Symptoms Section */}
      <SymptomsSection
        initialSymptoms={currentSymptoms}
        userId={user?.id}
        onSymptomsUpdate={(updatedSymptoms) => {
          // Optional: Update local state if needed
          setPeriodData({ ...periodData, symptoms: updatedSymptoms });
        }}
      />

      {/* Features Section */}
      <View style={styles.featuresContainer}>
        <Text style={styles.sectionTitle}>Track Your Cycle</Text>

        <View style={styles.featureRow}>
          <Pressable
            style={styles.featureCard}
            onPress={() => router.push("/(home)/periods/daily-symptoms")}
          >
            <MaterialCommunityIcons
              name="clipboard-pulse"
              size={28}
              color="#9b59b6"
            />
            <Text style={styles.featureText}>
              Log your symptoms to track your cycle health
            </Text>
          </Pressable>

          <Pressable
            style={styles.featureCard}
            onPress={() => router.push("/(home)/periods/daily-result")}
          >
            <MaterialCommunityIcons
              name="chart-line"
              size={28}
              color="#9b59b6"
            />
            <Text style={styles.featureText}>Get your daily test result</Text>
          </Pressable>
        </View>

        <View style={styles.featureRow}>
          <Pressable
            style={styles.featureCard}
            onPress={() => router.push("/(home)/periods/calendar")}
          >
            <MaterialCommunityIcons name="calendar" size={28} color="#9b59b6" />
            <Text style={styles.featureText}>Track your cycle on calendar</Text>
          </Pressable>

          <Pressable
            style={styles.featureCard}
            onPress={() => router.push("/(home)/periods/chat")}
          >
            <Ionicons name="chatbubbles" size={28} color="#9b59b6" />
            <Text style={styles.featureText}>Start Chat</Text>
          </Pressable>
        </View>
      </View>

      {/* Cycle Guide Section - Standalone with better styling */}
      <View style={styles.guideSection}>
        <Text style={styles.sectionTitle}>Learn About Your Cycle</Text>
        <Pressable
          style={styles.guideFeatureCard}
          onPress={() => router.push("/(home)/periods/cycle-guide")}
        >
          <View style={styles.guideContent}>
            <MaterialCommunityIcons
              name="book-open-variant"
              size={32}
              color="#9b59b6"
            />
            <View style={styles.guideTextContainer}>
              <Text style={styles.guideFeatureTitle}>Cycle Guide</Text>
              <Text style={styles.guideFeatureSubtitle}>
                Understand your menstrual cycle phases
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#9b59b6"
              style={styles.chevron}
            />
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  dateContainer: {
    flex: 1,
  },
  monthText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  phaseText: {
    fontSize: 16,
    color: "#7f8c8d",
    marginTop: 5,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  editText: {
    color: "#9b59b6",
    marginLeft: 5,
    fontWeight: "500",
  },
  calendarStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  calendarDay: {
    alignItems: "center",
    width: 40,
  },
  calendarDayText: {
    fontSize: 16,
    color: "#2c3e50",
    fontWeight: "500",
  },
  currentDayIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#9b59b6",
    marginTop: 5,
  },
  profileSection: {
    marginBottom: 25,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  userAge: {
    fontSize: 16,
    color: "#7f8c8d",
    marginTop: 5,
  },
  symptomsContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
  },
  symptomsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  symptomPill: {
    backgroundColor: "#f0e6ff",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  symptomText: {
    color: "#9b59b6",
    fontWeight: "500",
  },
  symptomsPrompt: {
    color: "#7f8c8d",
    fontStyle: "italic",
  },
  featuresContainer: {
    marginBottom: 15,
  },
  featureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  featureCard: {
    width: "48%",
    backgroundColor: "#f9f5ff",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
  },
  featureText: {
    color: "#2c3e50",
    textAlign: "center",
    marginTop: 10,
    fontWeight: "500",
  },
  guideContainer: {
    marginBottom: 20,
  },
  guideCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9f5ff",
    borderRadius: 12,
    padding: 15,
  },
  guideTitle: {
    color: "#2c3e50",
    fontWeight: "500",
    fontSize: 16,
  },
  emptyCard: {
    width: "48%",
    backgroundColor: "transparent",
  },
  guideSection: {
    marginBottom: 25,
  },
  guideFeatureCard: {
    backgroundColor: "#f9f5ff",
    borderRadius: 12,
    padding: 16,
  },
  guideContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  guideTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  guideFeatureTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 4,
  },
  guideFeatureSubtitle: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  chevron: {
    marginLeft: 10,
  },
});
