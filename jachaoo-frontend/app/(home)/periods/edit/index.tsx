import { useAuth, useUser } from "@clerk/clerk-expo";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
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
  "Hot Flashes",
  "Night Sweats",
  "Low Libido",
  "Vaginal Dryness",
  "Fatigue",
  "Mood Swings",
  "Cramps",
  "Hair Issues",
  "Acne",
  "Cravings",
  "Weight Gain",
  "Headaches",
  "Tender Breasts",
  "Bloating",
  "No Symptoms",
];

const appearanceColors: Record<string, string> = {
  "Bright Red": "#FF5C8D", // theme primary color
  "Deep Red": "#D81B60", // deeper pink
  "Light Red": "#FF8FB0", // lighter pink
  "Pale Brown": "#A1887F", // brown
  // "Missing or irregular": "#8B8691", // theme secondary color
};

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

  return (
    <LinearGradient
      colors={["#FFF2F8", "#F2F0FF"]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.username}>{user?.firstName || "User"}</Text>
          <Text style={styles.headerSubtitle}>Edit Period Details</Text>
        </View>

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
              <View style={styles.optionContent}>
                {/* Only show color dot if not "Missing or irregular" */}
                {item !== "Missing or irregular" && (
                  <View
                    style={[
                      styles.colorDot,
                      { backgroundColor: appearanceColors[item] || "#B76CFD" },
                    ]}
                  />
                )}
                <Text
                  style={[
                    styles.optionText,
                    formData.appearance === item && styles.selectedOptionText,
                  ]}
                >
                  {item}
                </Text>
              </View>
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
                  formData.conditions.includes(item) &&
                    styles.selectedOptionText,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Symptoms */}
        <Text style={styles.sectionTitle}>
          Symptoms (Select all that apply)
        </Text>
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
                  formData.tryingToConceive === item &&
                    styles.selectedToggleText,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Save Button */}
        <Pressable
          disabled={saving}
          onPress={handleSave}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
    paddingTop: 40,
  },
  header: {
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    alignItems: "center",
    shadowColor: "#B76CFD",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(183,108,253,0.04)",
  },
  username: {
    fontSize: 24,
    fontFamily: "Poppins-SemiBold",
    color: "#2D2D2D",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#8B8691",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Poppins-SemiBold",
    color: "#2D2D2D",
    marginTop: 20,
    marginBottom: 12,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#F0E8FF",
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#FFF",
  },
  dateText: {
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: "#2D2D2D",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 20,
  },
  inputContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#8B8691",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#F0E8FF",
    borderRadius: 16,
    padding: 14,
    backgroundColor: "#FFF",
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: "#2D2D2D",
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 15,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255,242,248,0.9)",
    borderWidth: 1,
    borderColor: "rgba(255,92,141,0.1)",
  },
  selectedOption: {
    backgroundColor: "#FF5C8D",
    borderColor: "#FF5C8D",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  optionText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#FF5C8D",
  },
  selectedOptionText: {
    color: "#FFFFFF",
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  gridOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(183,108,253,0.08)",
    minWidth: "30%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(183,108,253,0.1)",
  },
  selectedGridOption: {
    backgroundColor: "#B76CFD",
    borderColor: "#B76CFD",
  },
  gridOptionText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#B76CFD",
    textAlign: "center",
  },
  selectedGridOptionText: {
    color: "#FFFFFF",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 25,
  },
  toggleOption: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#FFF",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0E8FF",
  },
  selectedToggle: {
    backgroundColor: "#B76CFD",
    borderColor: "#B76CFD",
  },
  toggleText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#2D2D2D",
  },
  selectedToggleText: {
    color: "#FFFFFF",
  },
  saveButton: {
    marginTop: 30,
    marginBottom: 40,
    backgroundColor: "#B76CFD",
    borderRadius: 28,
    padding: 18,
    alignItems: "center",
    shadowColor: "#B76CFD",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  saveButtonDisabled: {
    backgroundColor: "#E0D7FF",
    shadowOpacity: 0.1,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "Poppins-SemiBold",
  },
});
