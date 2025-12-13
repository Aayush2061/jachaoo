// app/(home)/periods/calendar/index.tsx
import { useAuth, useUser } from "@clerk/clerk-expo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import {
  CyclePhaseInfo,
  getCyclePhaseInfo,
  isPeriodIrregular,
} from "../../../utils/cycleUtils";

type PeriodData = {
  lastPeriodDate: string;
  cycleLength: number;
  duration: number;
  symptoms?: string[];
};

// Configure calendar locale
LocaleConfig.locales["en"] = {
  monthNames: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  monthNamesShort: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  dayNames: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
  dayNamesShort: ["S", "M", "T", "W", "T", "F", "S"],
};
LocaleConfig.defaultLocale = "en";

// Theme colors matching home page
const PHASE_COLORS = {
  Menstrual: "#FF5C8D", // Blossom pink (Primary)
  Follicular: "#9AD1A1", // Soft green (from home page)
  Ovulatory: "#7CB9E8", // Soft blue (from home page)
  Luteal: "#F5C76B", // Soft yellow (from home page)
};

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [periodDays, setPeriodDays] = useState<string[]>([]);
  const [periodData, setPeriodData] = useState<PeriodData | null>(null);
  const [phaseInfo, setPhaseInfo] = useState<CyclePhaseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchPeriodData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user?.id) {
          throw new Error("User not authenticated");
        }

        const token = await getToken();
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/periods/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const data = await response.json();

        if (
          !data ||
          !data.lastPeriodDate ||
          !data.cycleLength ||
          !data.duration
        ) {
          throw new Error("Invalid data format received");
        }

        setPeriodData(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message || "Failed to load period data");
        setPeriodData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPeriodData();
  }, [user?.id]);

  useEffect(() => {
    if (periodData) {
      try {
        const info = getCyclePhaseInfo({
          lastPeriodDate: periodData.lastPeriodDate,
          cycleLength: periodData.cycleLength,
          duration: periodData.duration,
          today: new Date(),
        });
        setPhaseInfo(info);
      } catch (error) {
        console.error("Error calculating cycle phase:", error);
        setPhaseInfo(null);
      }
    }
  }, [periodData]);

  const handleDayPress = (day: { dateString: string }) => {
    setPeriodDays((prev) =>
      prev.includes(day.dateString)
        ? prev.filter((d) => d !== day.dateString)
        : [...prev, day.dateString]
    );
  };

  const getMarkedDates = () => {
    if (!periodData) return {};

    try {
      const { phases, fertileWindow } = getCyclePhaseInfo({
        lastPeriodDate: periodData.lastPeriodDate,
        cycleLength: periodData.cycleLength,
        duration: periodData.duration,
        today: new Date(),
      });

      const markedDates: any = {};

      Object.entries(phases).forEach(([phase, dates]) => {
        dates.forEach((date) => {
          markedDates[date] = {
            customStyles: {
              container: {
                backgroundColor:
                  PHASE_COLORS[phase as keyof typeof PHASE_COLORS],
                borderRadius: 16,
              },
              text: {
                color: "#FFFFFF",
                fontFamily: "Poppins-Medium",
              },
            },
          };
        });
      });

      fertileWindow.forEach((date) => {
        markedDates[date] = {
          ...markedDates[date],
          customStyles: {
            ...markedDates[date]?.customStyles,
            container: {
              ...markedDates[date]?.customStyles?.container,
              borderWidth: 2,
              borderColor: "#B76CFD", // Highlight color from home page
              borderStyle: "dotted",
            },
          },
        };
      });

      const todayString = new Date().toISOString().split("T")[0];
      markedDates[todayString] = {
        ...markedDates[todayString],
        customStyles: {
          ...markedDates[todayString]?.customStyles,
          text: {
            color: "#2D2D2D",
            fontFamily: "Poppins-SemiBold",
          },
        },
      };

      return markedDates;
    } catch (error) {
      console.error("Error marking dates:", error);
      return {};
    }
  };

  const formatPhaseName = (phase: string | undefined) => {
    return phase?.replace(" Phase", "") || "Cycle data not available";
  };

  // Loading state
  if (loading) {
    return (
      <LinearGradient
        colors={["#FFF2F8", "#F2F0FF"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color="#B76CFD" />
      </LinearGradient>
    );
  }

  // Error state
  if (error) {
    return (
      <LinearGradient
        colors={["#FFF2F8", "#F2F0FF"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.errorOuterContainer}
      >
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={32}
            color="#FF5C8D"
            style={styles.errorIcon}
          />
          <Text style={styles.errorText}>Error Loading Data</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
        </View>
      </LinearGradient>
    );
  }

  // No data state
  if (!periodData) {
    return (
      <LinearGradient
        colors={["#FFF2F8", "#F2F0FF"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.errorOuterContainer}
      >
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="calendar-blank-outline"
            size={32}
            color="#B76CFD"
            style={styles.errorIcon}
          />
          <Text style={styles.errorText}>No Period Data Available</Text>
          <Text style={styles.errorSubtext}>
            Please set up your period information first
          </Text>
        </View>
      </LinearGradient>
    );
  }

  // Irregular period state
  if (isPeriodIrregular(periodData)) {
    return (
      <LinearGradient
        colors={["#FFF2F8", "#F2F0FF"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.warningOuterContainer}
      >
        <View style={styles.warningContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={32}
            color="#FF5C8D"
            style={styles.warningIcon}
          />
          <View style={styles.warningTextContainer}>
            <Text style={styles.warningTitle}>Irregular Cycle Detected</Text>
            <Text style={styles.warningText}>
              Calendar predictions work best for regular cycles between 25-35
              days. Consider tracking symptoms manually for more accurate
              insights.
            </Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

  // Main calendar view
  return (
    <LinearGradient
      colors={["#FFF2F8", "#F2F0FF"]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.cycleInfoCard}>
            <Text style={styles.headerCycleDay}>
              {`Cycle Day ${phaseInfo?.currentDay || "N/A"}`}
            </Text>
            <Text style={styles.headerPhaseText}>
              {phaseInfo
                ? `${formatPhaseName(phaseInfo.phase)}`
                : "Loading cycle data..."}
            </Text>
          </View>

          <View style={styles.legendRow}>
            {Object.entries(PHASE_COLORS).map(([phase, color]) => (
              <View style={styles.legendItem} key={phase}>
                <View style={[styles.legendDot, { backgroundColor: color }]} />
                <Text style={styles.legendLabel}>{phase}</Text>
              </View>
            ))}
            <View style={styles.legendItem}>
              <View style={styles.fertileCircle} />
              <Text style={styles.legendLabel}>Fertile</Text>
            </View>
          </View>
        </View>

        <View style={styles.calendarCard}>
          <Calendar
            current={selectedDate.toISOString().split("T")[0]}
            onDayPress={handleDayPress}
            markedDates={getMarkedDates()}
            markingType="custom"
            hideExtraDays={true}
            theme={{
              backgroundColor: "#FFFFFF",
              calendarBackground: "#FFFFFF",
              textSectionTitleColor: "#8B8691",
              dayTextColor: "#2D2D2D",
              todayTextColor: "#FF5C8D",
              selectedDayTextColor: "#FFFFFF",
              selectedDayBackgroundColor: "#B76CFD",
              arrowColor: "#B76CFD",
              monthTextColor: "#2D2D2D",
              textDayFontFamily: "Poppins-Medium",
              textMonthFontFamily: "Poppins-SemiBold",
              textDayHeaderFontFamily: "Poppins-Medium",
              textDayFontSize: 14,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 13,
            }}
            renderHeader={(date) => (
              <View style={styles.calendarHeader}>
                <Text style={styles.calendarMonthText}>
                  {date.toString("MMMM")}
                </Text>
                <Text style={styles.calendarYearText}>
                  {date.getFullYear()}
                </Text>
              </View>
            )}
            renderArrow={(direction) => (
              <MaterialCommunityIcons
                name={direction === "left" ? "chevron-left" : "chevron-right"}
                size={24}
                color="#B76CFD"
              />
            )}
            style={styles.calendar}
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },

  // Header Styles
  headerContainer: {
    alignItems: "center",
    marginBottom: 24,
  },

  cycleInfoCard: {
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    width: "100%",
    alignItems: "center",
    shadowColor: "#B76CFD",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 6,
  },

  headerCycleDay: {
    fontSize: 22,
    fontFamily: "Poppins-SemiBold",
    color: "#2D2D2D",
    marginBottom: 4,
  },

  headerPhaseText: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: "#8B8691",
  },

  // Legend Styles
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 16,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#B76CFD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 6,
    marginVertical: 2,
  },

  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },

  legendLabel: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: "#2D2D2D",
  },

  fertileCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#B76CFD",
    borderStyle: "dotted",
    marginRight: 8,
  },

  // Calendar Card
  calendarCard: {
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#B76CFD",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 8,
  },

  calendarHeader: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingHorizontal: 4,
  },

  calendarMonthText: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: "#2D2D2D",
    marginBottom: 2,
  },

  calendarYearText: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: "#8B8691",
  },

  calendar: {
    borderRadius: 12,
    overflow: "hidden",
  },

  // Warning/Irregular Cycle Styles
  warningOuterContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  warningContainer: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    padding: 24,
    width: "90%",
    maxWidth: 350,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 92, 141, 0.15)",
    shadowColor: "#FF5C8D",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },

  warningIcon: {
    marginBottom: 16,
  },

  warningTextContainer: {
    alignItems: "center",
  },

  warningTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#FF5C8D",
    marginBottom: 12,
    textAlign: "center",
  },

  warningText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
    lineHeight: 20,
    textAlign: "center",
  },

  // Error States
  errorOuterContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  errorContainer: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    padding: 28,
    width: "90%",
    maxWidth: 350,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(183, 108, 253, 0.15)",
    shadowColor: "#B76CFD",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },

  errorIcon: {
    marginBottom: 16,
  },

  errorText: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#2D2D2D",
    marginBottom: 8,
    textAlign: "center",
  },

  errorSubtext: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#8B8691",
    textAlign: "center",
    lineHeight: 20,
  },
});
