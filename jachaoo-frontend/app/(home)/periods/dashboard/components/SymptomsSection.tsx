import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type SymptomsSectionProps = {
  initialSymptoms?: string[];
  userId?: string;
  onSymptomsUpdate?: (symptoms: string[]) => void;
};

const MAX_SYMPTOMS = 15;
const MIN_SYMPTOM_LENGTH = 3;
const MAX_SYMPTOM_LENGTH = 50;

export default function SymptomsSection({
  initialSymptoms = [],
  userId,
  onSymptomsUpdate,
}: SymptomsSectionProps) {
  const { getToken } = useAuth();
  const [symptoms, setSymptoms] = useState<string[]>(initialSymptoms);
  const [modalVisible, setModalVisible] = useState(false);
  const [newSymptom, setNewSymptom] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateSymptomsInAPI = async (updatedSymptoms: string[]) => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/periods/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ symptoms: updatedSymptoms }),
        }
      );

      // First get the response as text
      const responseText = await response.text();

      // Then try to parse it
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        // If parsing fails, throw with the raw text
        throw new Error(responseText || "Invalid server response");
      }

      if (!response.ok) {
        throw new Error(
          responseData.message ||
            responseData.error ||
            `Request failed with status ${response.status}`
        );
      }

      return responseData;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  };

  const addSymptom = async () => {
    const trimmedSymptom = newSymptom.trim();

    // Client-side validation
    if (!trimmedSymptom) {
      Alert.alert("Invalid Input", "Please enter a symptom");
      return;
    }

    // if (trimmedSymptom.length < MIN_SYMPTOM_LENGTH) {
    //   Alert.alert(
    //     "Too Short",
    //     `Symptom must be at least ${MIN_SYMPTOM_LENGTH} characters`
    //   );
    //   return;
    // }

    if (trimmedSymptom.length > MAX_SYMPTOM_LENGTH) {
      Alert.alert(
        "Too Long",
        `Symptom cannot exceed ${MAX_SYMPTOM_LENGTH} characters`
      );
      return;
    }

    if (symptoms.length >= MAX_SYMPTOMS) {
      Alert.alert("Limit Reached", `Maximum ${MAX_SYMPTOMS} symptoms allowed`);
      return;
    }

    if (symptoms.includes(trimmedSymptom)) {
      Alert.alert("Duplicate Symptom", "This symptom is already being tracked");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await updateSymptomsInAPI([...symptoms, trimmedSymptom]);

      setSymptoms(response.symptoms);
      onSymptomsUpdate?.(response.symptoms);
      setNewSymptom("");
      setModalVisible(false);

      // Show success feedback
      const addedSymptoms = response.changes?.added || [trimmedSymptom];
      if (addedSymptoms.length > 0) {
        Alert.alert("Success", `Added: ${addedSymptoms.join(", ")}`, [
          { text: "OK" },
        ]);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeSymptom = async (index: number) => {
    const symptomToRemove = symptoms[index];
    const updatedSymptoms = symptoms.filter((_, i) => i !== index);

    setIsSubmitting(true);
    try {
      const response = await updateSymptomsInAPI(updatedSymptoms);

      setSymptoms(response.symptoms);
      onSymptomsUpdate?.(response.symptoms);

      // Show undo option
      Alert.alert("Symptom Removed", `Removed: ${symptomToRemove}`, [
        { text: "OK" },
        {
          text: "Undo",
          onPress: () => {
            // Re-add the symptom
            setSymptoms([...response.symptoms, symptomToRemove]);
            updateSymptomsInAPI([...response.symptoms, symptomToRemove]);
          },
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.symptomsContainer}>
      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#9b59b6" />
        </View>
      )}

      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Symptoms</Text>
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            {
              opacity: pressed
                ? 0.6
                : symptoms.length >= MAX_SYMPTOMS
                ? 0.5
                : 1,
            },
          ]}
          onPress={() => setModalVisible(true)}
          disabled={symptoms.length >= MAX_SYMPTOMS}
        >
          <Ionicons
            name="add"
            size={20}
            color={symptoms.length >= MAX_SYMPTOMS ? "#ccc" : "#9b59b6"}
          />
        </Pressable>
      </View>

      {symptoms.length >= MAX_SYMPTOMS * 0.8 && (
        <Text style={styles.limitWarning}>
          {symptoms.length >= MAX_SYMPTOMS
            ? "Maximum symptoms reached"
            : `Approaching limit (${symptoms.length}/${MAX_SYMPTOMS})`}
        </Text>
      )}

      <View style={styles.symptomsList}>
        {symptoms.map((symptom, index) => (
          <View key={`${symptom}-${index}`} style={styles.symptomPill}>
            <Text style={styles.symptomText}>{symptom}</Text>
            <Pressable
              style={({ pressed }) => [
                styles.removeButton,
                { opacity: pressed ? 0.5 : 1 },
              ]}
              onPress={() => removeSymptom(index)}
              disabled={isSubmitting}
            >
              <Ionicons name="close" size={16} color="#9b59b6" />
            </Pressable>
          </View>
        ))}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => !isSubmitting && setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Symptom</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter symptom"
              placeholderTextColor="#999"
              value={newSymptom}
              onChangeText={setNewSymptom}
              autoFocus={true}
              maxLength={MAX_SYMPTOM_LENGTH}
              editable={!isSubmitting}
            />

            <Text style={styles.charCount}>
              {newSymptom.length}/{MAX_SYMPTOM_LENGTH}
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.addButtonModal,
                  (isSubmitting || !newSymptom.trim()) && { opacity: 0.5 },
                ]}
                onPress={addSymptom}
                disabled={isSubmitting || !newSymptom.trim()}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Add</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  symptomsContainer: {
    marginBottom: 30,
    position: "relative",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  addButton: {
    padding: 5,
  },
  symptomsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  symptomPill: {
    backgroundColor: "#f0e6ff",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  symptomText: {
    color: "#9b59b6",
    fontWeight: "500",
    marginRight: 5,
  },
  removeButton: {
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#2c3e50",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 5,
    color: "#2c3e50",
  },
  charCount: {
    alignSelf: "flex-end",
    color: "#7f8c8d",
    fontSize: 12,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  addButtonModal: {
    backgroundColor: "#9b59b6",
  },
  buttonText: {
    fontWeight: "500",
    color: "white",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  limitWarning: {
    color: "#e74c3c",
    fontSize: 12,
    marginBottom: 10,
    fontStyle: "italic",
  },
});
