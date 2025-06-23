import { useAuth, useUser } from "@clerk/clerk-expo";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const appearances = [
  "Bright Red",
  "Deep Red",
  "Pale Brown",
  "Light Red",
  "Missing or irregular",
];

const concerns = [
  "Irregular periods",
  "Painful periods",
  "Heavy flow",
  "Trying to conceive",
  "Missed period",
  "Just tracking",
  "Others",
];

const conditions = [
  "Fibroids",
  "Endometriosis",
  "PCOS",
  "Ovarian Cysts",
  "Infertility",
  "Perimenopause",
  "None of above",
];

const symptoms = [
  "Insomnia",
  "Hot flashes",
  "Headaches",
  "Bloating",
  "Cramps",
  "Fatigue",
  "Mood swings",
  "Breast tenderness",
];

const contraceptiveOptions = ["Yes", "No", "Never"];
const conceiveOptions = ["Yes", "No", "Open but not trying"];

export default function EditPeriodDetails() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState({
    lastPeriodDate: new Date(),
    duration: "",
    cycleLength: "",
    appearance: "",
    mainConcern: "",
    conditions: [] as string[],
    symptoms: [] as string[],
    contraceptive: "",
    tryingToConceive: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user?.id) return;
        const token = await getToken();

        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/periods/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        if (data) {
          setFormData({
            lastPeriodDate: data.lastPeriodDate
              ? new Date(data.lastPeriodDate)
              : new Date(),
            duration: data.duration?.toString() || "",
            cycleLength: data.cycleLength?.toString() || "",
            appearance: data.appearance || "",
            mainConcern: data.mainConcern || "",
            conditions: data.conditions || [],
            symptoms: data.symptoms || [],
            contraceptive: data.contraceptive || "",
            tryingToConceive: data.tryingToConceive || "",
          });
        }
      } catch (error) {
        console.error("Error fetching period data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || formData.lastPeriodDate;
    setShowDatePicker(false);
    setFormData({ ...formData, lastPeriodDate: currentDate });
  };

  const toggleSelection = (field: string, value: string, isArray = false) => {
    if (isArray) {
      const currentValues = formData[
        field as keyof typeof formData
      ] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      // Special handling for "None of above"
      if (field === "conditions" && value === "None of above") {
        setFormData({ ...formData, conditions: ["None of above"] });
      } else if (field === "conditions") {
        setFormData({
          ...formData,
          conditions: newValues.filter((v) => v !== "None of above"),
        });
      } else {
        setFormData({ ...formData, [field]: newValues });
      }
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/periods`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: user?.id,
            lastPeriodDate: formData.lastPeriodDate,
            duration: parseInt(formData.duration) || 0,
            cycleLength: parseInt(formData.cycleLength) || 0,
            appearance: formData.appearance,
            mainConcern: formData.mainConcern,
            conditions: formData.conditions,
            symptoms: formData.symptoms,
            contraceptive: formData.contraceptive,
            tryingToConceive: formData.tryingToConceive,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update");
      Alert.alert("Success", "Your period details have been updated");
      router.back();
    } catch (error) {
      console.error("Error saving:", error);
      Alert.alert("Error", "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9b59b6" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.username}>{user?.firstName || "User"}</Text>

      {/* Last Period Date */}
      <Text style={styles.sectionTitle}>Last Period Date</Text>
      <Pressable
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateText}>
          {formData.lastPeriodDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </Pressable>
      {showDatePicker && (
        <DateTimePicker
          value={formData.lastPeriodDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* Duration and Cycle Length */}
      <View style={styles.row}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Duration (days)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={formData.duration}
            onChangeText={(text) =>
              setFormData({ ...formData, duration: text })
            }
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Cycle Length (days)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={formData.cycleLength}
            onChangeText={(text) =>
              setFormData({ ...formData, cycleLength: text })
            }
          />
        </View>
      </View>

      {/* Appearance */}
      <Text style={styles.sectionTitle}>Period Appearance</Text>
      <View style={styles.optionsContainer}>
        {appearances.map((item) => (
          <Pressable
            key={item}
            style={[
              styles.optionButton,
              formData.appearance === item && styles.selectedOption,
            ]}
            onPress={() => toggleSelection("appearance", item)}
          >
            <Text
              style={[
                styles.optionText,
                formData.appearance === item && styles.selectedOptionText,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Main Concern */}
      <Text style={styles.sectionTitle}>Main Concern</Text>
      <View style={styles.optionsContainer}>
        {concerns.map((item) => (
          <Pressable
            key={item}
            style={[
              styles.optionButton,
              formData.mainConcern === item && styles.selectedOption,
            ]}
            onPress={() => toggleSelection("mainConcern", item)}
          >
            <Text
              style={[
                styles.optionText,
                formData.mainConcern === item && styles.selectedOptionText,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Conditions */}
      <Text style={styles.sectionTitle}>
        Conditions (Select all that apply)
      </Text>
      <View style={styles.optionsContainer}>
        {conditions.map((item) => (
          <Pressable
            key={item}
            style={[
              styles.optionButton,
              formData.conditions.includes(item) && styles.selectedOption,
            ]}
            onPress={() => toggleSelection("conditions", item, true)}
          >
            <Text
              style={[
                styles.optionText,
                formData.conditions.includes(item) && styles.selectedOptionText,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Symptoms */}
      <Text style={styles.sectionTitle}>Symptoms (Select all that apply)</Text>
      <View style={styles.optionsGrid}>
        {symptoms.map((item) => (
          <Pressable
            key={item}
            style={[
              styles.gridOption,
              formData.symptoms.includes(item) && styles.selectedGridOption,
            ]}
            onPress={() => toggleSelection("symptoms", item, true)}
          >
            <Text
              style={[
                styles.gridOptionText,
                formData.symptoms.includes(item) &&
                  styles.selectedGridOptionText,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Contraceptive */}
      <Text style={styles.sectionTitle}>Hormonal Contraceptive</Text>
      <View style={styles.toggleContainer}>
        {contraceptiveOptions.map((item) => (
          <Pressable
            key={item}
            style={[
              styles.toggleOption,
              formData.contraceptive === item && styles.selectedToggle,
            ]}
            onPress={() => toggleSelection("contraceptive", item)}
          >
            <Text
              style={[
                styles.toggleText,
                formData.contraceptive === item && styles.selectedToggleText,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Trying to Conceive */}
      <Text style={styles.sectionTitle}>Trying to Conceive</Text>
      <View style={styles.toggleContainer}>
        {conceiveOptions.map((item) => (
          <Pressable
            key={item}
            style={[
              styles.toggleOption,
              formData.tryingToConceive === item && styles.selectedToggle,
            ]}
            onPress={() => toggleSelection("tryingToConceive", item)}
          >
            <Text
              style={[
                styles.toggleText,
                formData.tryingToConceive === item && styles.selectedToggleText,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Save Button */}
      <Pressable
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? "Saving..." : "Save Changes"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2c3e50",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginTop: 20,
    marginBottom: 10,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  dateText: {
    fontSize: 16,
    color: "#2c3e50",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
    marginBottom: 15,
  },
  inputContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 15,
  },
  optionButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  selectedOption: {
    backgroundColor: "#9b59b6",
  },
  optionText: {
    fontSize: 14,
    color: "#2c3e50",
  },
  selectedOptionText: {
    color: "white",
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 15,
  },
  gridOption: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    minWidth: "30%",
    alignItems: "center",
  },
  selectedGridOption: {
    backgroundColor: "#9b59b6",
  },
  gridOptionText: {
    fontSize: 14,
    color: "#2c3e50",
    textAlign: "center",
  },
  selectedGridOptionText: {
    color: "white",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 20,
  },
  toggleOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  selectedToggle: {
    backgroundColor: "#9b59b6",
  },
  toggleText: {
    fontSize: 14,
    color: "#2c3e50",
  },
  selectedToggleText: {
    color: "white",
  },
  saveButton: {
    backgroundColor: "#9b59b6",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
  },
  saveButtonDisabled: {
    backgroundColor: "#bdc3c7",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
