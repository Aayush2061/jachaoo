import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function DateAndDurationQuestion({
  data,
  updateData,
}: {
  data: any;
  updateData: (field: string, value: Date | number) => void;
}) {
  const [date, setDate] = useState<Date>(data.lastPeriodDate || new Date());
  const [duration, setDuration] = useState<string>(
    data.duration?.toString() || ""
  );
  const [cycleLength, setCycleLength] = useState<string>(
    data.cycleLength?.toString() || ""
  );
  const [showPicker, setShowPicker] = useState(false);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowPicker(false);
    setDate(currentDate);
    updateData("lastPeriodDate", currentDate);
  };

  const handleDurationChange = (text: string) => {
    setDuration(text);
    if (text) {
      updateData("duration", parseInt(text, 10));
    }
  };

  const handleCycleLengthChange = (text: string) => {
    setCycleLength(text);
    if (text) {
      updateData("cycleLength", parseInt(text, 10));
    }
  };

  return (
    <View>
      <Text style={styles.title}>Let's Start Tracking</Text>

      {/* Last Period Date Section */}
      <Text style={styles.sectionTitle}>
        What was the first day of your last period?
      </Text>
      <Pressable style={styles.dateButton} onPress={() => setShowPicker(true)}>
        <Text style={styles.dateText}>
          {date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
        <Text style={styles.dateLabel}>Last period date</Text>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChangeDate}
          maximumDate={new Date()}
        />
      )}

      {/* Duration Section */}
      <Text style={styles.sectionTitle}>
        What was the approximate duration of period?
      </Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="e.g. 5"
          value={duration}
          onChangeText={handleDurationChange}
        />
        <Text style={styles.unit}>days</Text>
      </View>

      {/* Cycle Length Section */}
      <Text style={styles.sectionTitle}>How long is your cycle typically?</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="e.g. 28"
          value={cycleLength}
          onChangeText={handleCycleLengthChange}
        />
        <Text style={styles.unit}>days</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#2c3e50",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 10,
    marginTop: 20,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 20,
    marginBottom: 10,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
  },
  dateLabel: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  unit: {
    color: "#7f8c8d",
    fontSize: 16,
    marginLeft: 10,
  },
});
