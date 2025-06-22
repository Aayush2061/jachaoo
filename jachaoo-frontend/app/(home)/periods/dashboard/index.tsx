import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import SymptomsSection from "./components/SymptomsSection";
export default function PeriodDashboard() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [periodData, setPeriodData] = useState<any>(null);

  const router = useRouter();
  const userSymptoms = ["Night Sweats", "Insomnia"];
  const userName = "Aayush Bhandari";
  const userAge = "21 years";

  useEffect(() => {
    const fetchPeriodData = async () => {
      try {
        if (!user?.id) return;

        const token = await getToken(); // 🔐 Get token here

        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/periods/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // ✅ Include token
            },
          }
        );

        const data = await response.json();
        setPeriodData(data);
      } catch (error) {
        console.error("Error fetching period data:", error);
      }
    };

    fetchPeriodData();
  }, [user?.id]);
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <Text style={styles.monthText}>June</Text>
          <Text style={styles.phaseText}>Follicle Phase - Day 2 of 15</Text>
        </View>

        <Pressable style={styles.editButton}>
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
      <View style={styles.profileSection}>
        <Text style={styles.userName}>Aayush Bhandari</Text>
        <Text style={styles.userAge}>21 years</Text>
      </View>

      {/* Symptoms Section */}
      <SymptomsSection initialSymptoms={userSymptoms} />

      {/* Features Section */}
      <View style={styles.featuresContainer}>
        <Text style={styles.sectionTitle}>Track Your Cycle</Text>

        <View style={styles.featureRow}>
          <Pressable style={styles.featureCard}>
            <MaterialCommunityIcons
              name="clipboard-pulse"
              size={28}
              color="#9b59b6"
            />
            <Text style={styles.featureText}>
              Log your symptoms to track your cycle health
            </Text>
          </Pressable>

          <Pressable style={styles.featureCard}>
            <MaterialCommunityIcons
              name="chart-line"
              size={28}
              color="#9b59b6"
            />
            <Text style={styles.featureText}>Get your daily test result</Text>
          </Pressable>
        </View>

        <View style={styles.featureRow}>
          <Pressable style={styles.featureCard}>
            <MaterialCommunityIcons name="calendar" size={28} color="#9b59b6" />
            <Text style={styles.featureText}>Track your cycle on calendar</Text>
          </Pressable>

          <Pressable style={styles.featureCard}>
            <Ionicons name="chatbubbles" size={28} color="#9b59b6" />
            <Text style={styles.featureText}>Start Chat</Text>
          </Pressable>
        </View>
      </View>

      {/* Cycle Guide Section */}
      <View style={styles.guideContainer}>
        <Text style={styles.sectionTitle}>Cycle Guide</Text>
        <Pressable style={styles.guideCard}>
          <Text style={styles.guideTitle}>How to control excessive flow?</Text>
          <Ionicons name="chevron-forward" size={20} color="#9b59b6" />
        </Pressable>
        <Pressable style={styles.guideCard}>
          <Text style={styles.guideTitle}>Tips to control the cramps.</Text>
          <Ionicons name="chevron-forward" size={20} color="#9b59b6" />
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
    marginBottom: 30,
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
});
