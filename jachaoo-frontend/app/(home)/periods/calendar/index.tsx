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

const PHASE_COLORS = {
  Menstrual: "#FF6B6B", // Red
  Follicular: "#51CF66", // Green
  Ovulatory: "#3498DB", // Blue
  Luteal: "#FCC419", // Yellow
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
      const phaseColors = {
        Menstrual: "#FF6B6B",
        Follicular: "#51CF66",
        Ovulatory: "#3498DB",
        Luteal: "#FCC419",
      };

      Object.entries(phases).forEach(([phase, dates]) => {
        dates.forEach((date) => {
          markedDates[date] = {
            customStyles: {
              container: {
                backgroundColor: phaseColors[phase as keyof typeof phaseColors],
                borderRadius: 16,
              },
              text: {
                color: "#fff",
                fontWeight: "bold",
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
              borderColor: "#8e44ad",
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
            color: "#000000",
            fontWeight: "bold",
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

  // const isPeriodIrregular = (data: PeriodData | null) => {
  //   if (!data) return false;
  //   const NORMAL_RANGE = { min: 25, max: 35 };
  //   return (
  //     data.cycleLength < NORMAL_RANGE.min || data.cycleLength > NORMAL_RANGE.max
  //   );
  // };

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#9B59B6" />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error Loading Data</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
      </View>
    );
  }

  // No data state
  if (!periodData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No Period Data Available</Text>
        <Text style={styles.errorSubtext}>
          Please set up your period information first
        </Text>
      </View>
    );
  }

  // Irregular period state
  if (isPeriodIrregular(periodData)) {
    return (
      <View style={styles.warningOuterContainer}>
        <View style={styles.warningContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={24}
            style={styles.warningIcon}
          />

          <View style={styles.warningTextContainer}>
            <Text style={styles.warningTitle}>Irregular Cycle Detected</Text>
            <Text style={styles.warningText}>
              Calendar predictions work best for regular cycles between 25-35
              days. Consider tracking symptoms manually for more accurate
              insights.
            </Text>

            {/* <TouchableOpacity 
            onPress={() => navigation.navigate('TrackingTips')}
          >
            <Text style={styles.warningActionText}>
              Learn about tracking irregular cycles →
            </Text>
          </TouchableOpacity> */}
          </View>
        </View>
      </View>
    );
  }

  // Main calendar view
  return (
    <LinearGradient colors={["#b3e5fc", "#ffe0b2"]} style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerCycleDay}>
            {`Cycle Day - ${phaseInfo?.currentDay || "N/A"}`}
          </Text>
          <Text style={styles.headerPhaseText}>
            {phaseInfo
              ? `${formatPhaseName(phaseInfo.phase)}`
              : "Loading cycle data..."}
          </Text>

          <View style={styles.legendRow}>
            {Object.entries(PHASE_COLORS).map(([phase, color]) => (
              <View style={styles.legendItem} key={phase}>
                <View style={[styles.legendDot, { backgroundColor: color }]} />
                <Text style={styles.legendLabel}>{phase}</Text>
              </View>
            ))}
            <View style={styles.legendItem}>
              <View style={styles.fertileCircle} />
              <Text style={styles.legendLabel}>Fertile Days</Text>
            </View>
          </View>
        </View>

        <Calendar
          current={selectedDate.toISOString().split("T")[0]}
          onDayPress={handleDayPress}
          markedDates={getMarkedDates()}
          markingType="custom"
          hideExtraDays={true}
          theme={{
            backgroundColor: "#FFFFFF",
            calendarBackground: "#FFFFFF",
            textSectionTitleColor: "#7F8C8D",
            dayTextColor: "#2C3E50",
            todayTextColor: "#9B59B6",
            selectedDayTextColor: "#FFFFFF",
            selectedDayBackgroundColor: "#9B59B6",
            arrowColor: "#9B59B6",
            monthTextColor: "#2C3E50",
            textDayFontWeight: "500",
            textMonthFontWeight: "bold",
            textDayHeaderFontWeight: "500",
          }}
          renderHeader={(date) => (
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarMonthText}>
                {date.toString("MMMM")}
              </Text>
              <Text style={styles.calendarYearText}>{date.getFullYear()}</Text>
            </View>
          )}
          renderArrow={(direction) => (
            <MaterialCommunityIcons
              name={direction === "left" ? "chevron-left" : "chevron-right"}
              size={24}
              color="#9B59B6"
            />
          )}
          style={styles.calendar}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#FFFFFF",
    padding: 20,
    marginTop: 60,
  },
  // Phase Display Styles
  phaseContainer: {
    marginBottom: 25,
  },
  cycleDayText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  phaseText: {
    fontSize: 16,
    color: "#7F8C8D",
    marginBottom: 16,
  },
  phaseGrid: {
    gap: 8,
  },
  phaseRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  phasePill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  phasePillText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  // Calendar Styles
  calendarHeader: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  calendarMonthText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  calendarYearText: {
    fontSize: 16,
    color: "#7F8C8D",
  },
  calendar: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },

  headerCycleDay: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 6,
  },

  headerPhaseText: {
    fontSize: 16,
    color: "#7F8C8D",
    marginBottom: 14,
  },

  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 16,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 6,
    marginVertical: 4,
  },

  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },

  legendLabel: {
    fontSize: 14,
    color: "#2C3E50",
  },
  fertileCircle: {
    width: 16,
    height: 16,
    borderRadius: 8, // Makes it circular
    borderWidth: 2,
    borderColor: "#8e44ad",
    borderStyle: "dotted",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  warningOuterContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  warningContainer: {
    backgroundColor: "#FFF4F4",
    borderRadius: 12, // More rounded corners
    padding: 20,
    width: "90%",
    maxWidth: 350,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFD6D6", // Lighter border
  },
  warningIcon: {
    color: "#FF6B6B",
    marginBottom: 12,
  },
  warningTextContainer: {
    alignItems: "center",
  },
  warningTitle: {
    fontSize: 18, // Slightly larger
    fontWeight: "600",
    color: "#D32F2F",
    marginBottom: 8,
    textAlign: "center",
  },
  warningText: {
    fontSize: 14,
    color: "#5D5D5D", // Dark gray for body
    lineHeight: 20,
  },
  warningActionText: {
    color: "#9B59B6", // Your app's purple
    fontWeight: "500",
    marginTop: 8,
  },

  // Error container (add this if you want a dedicated container)
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  // Error text styles
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#D32F2F", // Dark red for emphasis
    marginBottom: 8,
    textAlign: "center",
  },

  errorSubtext: {
    fontSize: 14,
    color: "#5D5D5D", // Dark gray for secondary text
    textAlign: "center",
    lineHeight: 20,
    maxWidth: "80%",
  },
});
