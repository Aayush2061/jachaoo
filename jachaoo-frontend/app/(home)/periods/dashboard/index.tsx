// periods/dashboard/index.tsx
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { addDays, format, isToday } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
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

/**
 * Theme tokens (Ultra Soft)
 * Primary: #FF5C8D (blossom)
 * Soft bg: #FFF2F8 / secondary pastel: #F0E8FF
 * Highlight: #B76CFD
 */

export default function PeriodDashboard() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [periodData, setPeriodData] = useState<any>(null);
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const baseDate = new Date(); // today

  const getCalendarStripDates = () => {
    return [-2, -1, 0, 1, 2].map((offset) => addDays(baseDate, offset));
  };

  const getPhaseColor = (phase?: string) => {
    switch (phase) {
      case "Menstrual Phase":
        return "#FF5C8D";
      case "Follicular Phase":
        return "#9AD1A1";
      case "Ovulation Phase":
        return "#7CB9E8";
      case "Luteal Phase":
        return "#F5C76B";
      default:
        return "#E0D7FF";
    }
  };

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      const fetchPeriodData = async () => {
        try {
          setLoading(true);
          if (!user?.id) return;
          const token = await getToken();

          const [periodsRes, healthRes] = await Promise.all([
            fetch(`${process.env.EXPO_PUBLIC_API_URL}/periods/${user.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${process.env.EXPO_PUBLIC_API_URL}/health/${user.id}`),
          ]);
          const periodData = await periodsRes.json();
          const healthData = await healthRes.json();
          if (!mounted) return;
          setPeriodData(periodData);
          setHealthData(healthData);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          if (mounted) setLoading(false);
        }
      };

      fetchPeriodData();
      return () => {
        mounted = false;
      };
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

  const quickActions = useMemo(
    () => [
      {
        label: "How are you feeling?",
        icon: "plus-circle-outline",
        route: "/(home)/periods/daily-symptoms",
      },
      {
        label: "Today’s summary",
        icon: "clipboard-text-outline",
        route: "/(home)/periods/daily-result",
      },
      {
        label: "Calendar",
        icon: "calendar-month-outline",
        route: "/(home)/periods/calendar",
      },
      {
        label: "Chat",
        icon: "chat-processing-outline",
        route: "/(home)/periods/chat",
      },
      {
        label: "Cycle guide",
        icon: "flower-outline",
        route: "/(home)/periods/cycle-guide",
      },
    ],
    []
  );

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#B76CFD" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#FFF2F8", "#F2F0FF"]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.monthText}>
              {new Date().toLocaleString("default", { month: "long" })}
            </Text>
            <Text
              style={[
                styles.phaseText,
                { color: getPhaseColor(phaseInfo?.phase) },
              ]}
            >
              {phaseInfo
                ? isPeriodIrregular(periodData)
                  ? "Irregular cycle"
                  : `${phaseInfo.phase} • Day ${phaseInfo.currentDay}`
                : "Cycle data not set"}
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.headerEditBtn,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => router.push("/(home)/periods/edit")}
          >
            <Ionicons name="pencil" size={16} color="#B76CFD" />
            <Text style={styles.headerEditText}>Edit</Text>
          </Pressable>
        </View>

        {/* Calendar strip */}
        <View style={styles.calendarStrip}>
          {getCalendarStripDates().map((date, i) => {
            const today = isToday(date);
            return (
              <View key={i} style={styles.calendarDayWrap}>
                <View
                  style={[
                    styles.calendarDayChip,
                    today && {
                      borderWidth: 2,
                      borderColor: "rgba(183,108,253,0.18)",
                      shadowColor: "#B76CFD",
                      shadowOpacity: 0.08,
                      shadowRadius: 8,
                      transform: [{ scale: 1.02 }],
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.calendarDayText,
                      today && { color: "#FF5C8D", fontWeight: "700" },
                    ]}
                  >
                    {format(date, "dd")}
                  </Text>
                </View>
                <Text style={styles.calendarLabel}>{format(date, "EEE")}</Text>
              </View>
            );
          })}
        </View>

        {/* Profile + Cycle ring card */}
        <View style={styles.profileCard}>
          <View style={styles.topRow}>
            <View style={styles.avatarRow}>
              <LinearGradient
                colors={["#FF8FB0", "#B76CFD"]}
                style={styles.avatar}
              >
                <MaterialCommunityIcons
                  name="face-woman"
                  size={22}
                  color="white"
                />
              </LinearGradient>
              <View style={styles.userText}>
                <Text style={styles.userName}>{healthData?.name || "-"}</Text>
                <Text style={styles.userMeta}>
                  {healthData?.age ? `${healthData.age} yrs` : ""}
                </Text>
              </View>
            </View>

            {/* Cycle ring (simple) */}
            <View
              style={[
                styles.cycleRingOuter,
                { borderColor: getPhaseColor(phaseInfo?.phase) },
              ]}
            >
              <View style={styles.cycleRingInner}>
                <Text style={styles.cycleDay}>
                  {phaseInfo ? `Day ${phaseInfo.currentDay}` : `—`}
                </Text>
                <Text style={styles.cyclePhaseShort}>
                  {phaseInfo ? phaseInfo.phase.split(" ")[0] : "No data"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Symptoms */}
          <SymptomsSection
            initialSymptoms={currentSymptoms}
            userId={user?.id}
            onSymptomsUpdate={(updatedSymptoms) =>
              setPeriodData({ ...periodData, symptoms: updatedSymptoms })
            }
            customStyles={{
              symptomsContainer: styles.symptomsContainer,
              symptomPill: styles.symptomPill,
              symptomText: styles.symptomText,
              sectionTitle: styles.symptomsTitle,
              addButton: styles.symptomAddBtn,
              removeButton: styles.symptomRemoveBtn,
            }}
          />
        </View>

        {/* Quick action tiles */}
        <View style={styles.actionsGrid}>
          {quickActions.map((b, idx) => (
            <Pressable
              key={idx}
              style={({ pressed }) => [
                styles.actionTile,
                pressed && { opacity: 0.8, transform: [{ scale: 0.995 }] },
              ]}
              onPress={() => router.push(b.route)}
            >
              <LinearGradient
                colors={["rgba(255,255,255,0.7)", "rgba(255,255,255,0.6)"]}
                style={styles.actionInner}
              >
                <View style={styles.actionIconWrap}>
                  <MaterialCommunityIcons
                    name={b.icon}
                    size={22}
                    color="#FF5C8D"
                  />
                </View>
                <Text style={styles.actionLabel}>{b.label}</Text>
              </LinearGradient>
            </Pressable>
          ))}
        </View>
        <View style={{ height: 60 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },

  // Loading
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF7FA",
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  monthText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 22,
    color: "#2D2D2D",
  },
  phaseText: {
    marginTop: 4,
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "#B76CFD",
  },
  headerEditBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(183,108,253,0.08)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  headerEditText: {
    marginLeft: 6,
    color: "#7F3BE7",
    fontFamily: "Poppins-Medium",
    fontSize: 13,
  },

  // Calendar strip
  calendarStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    paddingHorizontal: 6,
  },
  calendarDayWrap: {
    alignItems: "center",
    width: 48,
  },
  calendarDayChip: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#B76CFD",
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  calendarDayText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#4A4A4A",
  },
  calendarLabel: {
    marginTop: 6,
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: "#8B8691",
  },

  // Profile card
  profileCard: {
    marginBottom: 18,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#B76CFD",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 6,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userText: {
    flexDirection: "column",
  },
  userName: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
    color: "#2D2D2D",
  },
  userMeta: {
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    color: "#8B8691",
    marginTop: 4,
  },

  // Cycle ring
  cycleRingOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  cycleRingInner: {
    width: 74,
    height: 74,
    borderRadius: 38,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  cycleDay: {
    fontFamily: "Poppins-Bold",
    fontSize: 14,
    color: "#2D2D2D",
  },
  cyclePhaseShort: {
    fontFamily: "Poppins-Regular",
    fontSize: 11,
    color: "#8B8691",
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(183,108,253,0.06)",
    marginVertical: 14,
    marginHorizontal: -16,
  },

  // Symptoms (customizable)
  symptomsContainer: {
    marginBottom: 6,
  },
  symptomsTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#2D2D2D",
    marginBottom: 10,
  },

  // Actions grid
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 6,
  },
  actionTile: {
    width: "48%",
    marginBottom: 12,
  },
  actionInner: {
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 110,
    backgroundColor: "rgba(255,255,255,0.88)",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIconWrap: {
    backgroundColor: "rgba(255,92,141,0.08)",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  actionLabel: {
    fontFamily: "Poppins-Medium",
    fontSize: 13,
    color: "#333",
    textAlign: "center",
  },

  // symptom pill styles (defaults, can be overridden by props)
  symptomPill: {
    backgroundColor: "#FFF0F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  symptomText: {
    fontFamily: "Poppins-Medium",
    color: "#FF5C8D",
    fontSize: 13,
  },
  symptomAddBtn: {
    padding: 6,
  },
  symptomRemoveBtn: {
    marginLeft: 8,
  },
});
