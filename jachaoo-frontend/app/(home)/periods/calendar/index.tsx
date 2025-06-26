// app/(home)/periods/calendar/index.tsx
import { useAuth, useUser } from "@clerk/clerk-expo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { CyclePhaseInfo, getCyclePhaseInfo } from "../../../utils/cycleUtils";
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
  const [currentPhase, setCurrentPhase] = useState("Follicular");
  const [periodData, setPeriodData] = useState<PeriodData | null>(null);
  const [phaseInfo, setPhaseInfo] = useState<CyclePhaseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const { getToken } = useAuth();
  useEffect(() => {
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
        // console.log(periodData);
        setPeriodData(periodData);
      } catch (error) {
        console.error("Error fetching data:", error);
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

    const getPhaseDayCount = () => {
      if (!phaseInfo || !periodData) return { current: 0, total: 0 };

      const currentPhase = phaseInfo.phase.split(" ")[0]; // "Menstrual", "Follicular", etc.

      // Get total days for the current phase
      const phaseDays =
        {
          Menstrual: periodData.duration,
          Follicular: phaseInfo.phases.Follicular.length,
          Ovulatory: phaseInfo.phases.Ovulatory.length,
          Luteal: phaseInfo.phases.Luteal.length,
        }[currentPhase] || 0;

      // Calculate current day within phase
      const currentDayInPhase =
        phaseInfo.currentDay -
        (currentPhase === "Follicular"
          ? periodData.duration
          : currentPhase === "Ovulatory"
          ? periodData.duration + phaseInfo.phases.Follicular.length
          : currentPhase === "Luteal"
          ? periodData.duration +
            phaseInfo.phases.Follicular.length +
            phaseInfo.phases.Ovulatory.length
          : 0);

      return {
        current: currentDayInPhase,
        total: phaseDays,
      };
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

    // Mark fertile window (override with border or dot)
    fertileWindow
      .filter((date) => new Date(date).getMonth() === selectedDate.getMonth())
      .forEach((date) => {
        markedDates[date] = {
          ...(markedDates[date] || {}),
          customStyles: {
            ...(markedDates[date]?.customStyles || {}),
            container: {
              ...(markedDates[date]?.customStyles?.container || {}),
              borderWidth: 2,
              borderColor: "#8e44ad",
              borderStyle: "dotted",
            },
            text: {
              ...(markedDates[date]?.customStyles?.text || {}),
              fontWeight: "bold",
            },
          },
        };
      });

    // Mark today's date
    // const todayString = new Date().toISOString().split("T")[0];

    const todayString = new Date().toISOString().split("T")[0];

    markedDates[todayString] = {
      ...(markedDates[todayString] || {}),
      customStyles: {
        ...(markedDates[todayString]?.customStyles || {}),
        text: {
          ...(markedDates[todayString]?.customStyles?.text || {}),
          color: "#000000", // white text for better visibility
          fontWeight: "bold",
        },
      },
    };

    return markedDates;
  };

  const formatPhaseName = (phase: string | undefined) => {
    if (!phase) return "Cycle data not available";
    return phase.replace(" Phase", "");
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerCycleDay}>
          {loading
            ? "Loading..."
            : `Cycle Day - ${phaseInfo?.currentDay || "N/A"}`}
        </Text>
        <Text style={styles.headerPhaseText}>
          {loading
            ? "Loading cycle data..."
            : phaseInfo
            ? `${formatPhaseName(phaseInfo.phase)} Phase `
            : "Cycle data not available"}
        </Text>

        <View style={styles.legendRow}>
          {Object.entries(PHASE_COLORS).map(([phase, color]) => (
            <View style={styles.legendItem} key={phase}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={styles.legendLabel}>{phase}</Text>
            </View>
          ))}

          <View style={styles.legendItem}>
            <View style={styles.fertileCircle}></View>
            <Text style={styles.legendLabel}>Fertile Days</Text>
          </View>
        </View>
      </View>

      {/* Calendar */}
      <Calendar
        current={selectedDate.toISOString().split("T")[0]}
        onDayPress={handleDayPress}
        onMonthChange={(date) => setSelectedDate(new Date(date.dateString))}
        markedDates={getMarkedDates()}
        markingType="custom"
        hideExtraDays={true}
        disableMonthChange={false}
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
          "stylesheet.calendar.header": {
            header: {
              flexDirection: "row",
              justifyContent: "space-between",
              paddingBottom: 10,
              paddingHorizontal: 0,
              marginBottom: 0,
              alignItems: "center",
            },
          },
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
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
});
