// app/(home)/periods/calendar/index.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";

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

  const handleDayPress = (day: { dateString: string }) => {
    setPeriodDays((prev) =>
      prev.includes(day.dateString)
        ? prev.filter((d) => d !== day.dateString)
        : [...prev, day.dateString]
    );
  };

  const getMarkedDates = () => {
    const markedDates: any = {};

    periodDays.forEach((date) => {
      markedDates[date] = {
        customStyles: {
          container: {
            backgroundColor: "#FFEEEE",
            borderRadius: 16,
          },
          text: {
            color: "#D0021B",
            fontWeight: "bold",
          },
        },
      };
    });

    return markedDates;
  };

  return (
    <View style={styles.container}>
      {/* Phase Display - Updated with 2x2 Grid */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerCycleDay}>Cycle Day - 0</Text>
        <Text style={styles.headerPhaseText}>Follicle Phase - Day 4 of 15</Text>

        <View style={styles.legendRow}>
          {Object.entries(PHASE_COLORS).map(([phase, color]) => (
            <View style={styles.legendItem} key={phase}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={styles.legendLabel}>{phase}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Calendar */}
      <Calendar
        current={selectedDate.toISOString().split("T")[0]}
        onDayPress={handleDayPress}
        onMonthChange={(date) => setSelectedDate(new Date(date.dateString))}
        markedDates={getMarkedDates()}
        markingType="custom"
        hideExtraDays={false}
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
});
