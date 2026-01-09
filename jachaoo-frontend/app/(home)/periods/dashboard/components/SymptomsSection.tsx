// periods/dashboard/components/SymptomsSection.tsx
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
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
  customStyles?: {
    symptomsContainer?: any;
    symptomPill?: any;
    symptomText?: any;
    sectionTitle?: any;
    addButton?: any;
    removeButton?: any;
  };
};

const MAX_SYMPTOMS = 15;
const MAX_SYMPTOM_LENGTH = 50;

export default function SymptomsSection({
  initialSymptoms = [],
  userId,
  onSymptomsUpdate,
  customStyles = {},
}: SymptomsSectionProps) {
  const { getToken } = useAuth();
  const [symptoms, setSymptoms] = useState<string[]>(initialSymptoms);
  const [modalVisible, setModalVisible] = useState(false);
  const [newSymptom, setNewSymptom] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSymptoms(initialSymptoms || []);
  }, [initialSymptoms.join("|")]);

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

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text || "Invalid server response");
      }

      if (!response.ok) {
        throw new Error(data.message || `Request failed ${response.status}`);
      }
      return data;
    } catch (err) {
      console.error("API Error:", err);
      throw err;
    }
  };

  const addSymptom = async () => {
    const trimmed = newSymptom.trim();
    if (!trimmed) {
      Alert.alert("Please enter a symptom");
      return;
    }
    if (trimmed.length > MAX_SYMPTOM_LENGTH) {
      Alert.alert("Too long", `Max ${MAX_SYMPTOM_LENGTH} characters`);
      return;
    }
    if (symptoms.includes(trimmed)) {
      Alert.alert("Already added");
      return;
    }
    if (symptoms.length >= MAX_SYMPTOMS) {
      Alert.alert("Limit reached", `Maximum ${MAX_SYMPTOMS} symptoms`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateSymptomsInAPI([...symptoms, trimmed]);
      setSymptoms(res.symptoms || [...symptoms, trimmed]);
      onSymptomsUpdate?.(res.symptoms || [...symptoms, trimmed]);
      setNewSymptom("");
      setModalVisible(false);
      Alert.alert("Added", trimmed);
    } catch (err) {
      Alert.alert("Failed to add", (err as any).message || "Try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeSymptom = async (index: number) => {
    const toRemove = symptoms[index];
    const updated = symptoms.filter((_, i) => i !== index);
    setIsSubmitting(true);
    try {
      const res = await updateSymptomsInAPI(updated);
      setSymptoms(res.symptoms || updated);
      onSymptomsUpdate?.(res.symptoms || updated);

      Alert.alert("Removed", toRemove, [
        { text: "OK" },
        {
          text: "Undo",
          onPress: () => {
            const restore = [...(res.symptoms || updated), toRemove];
            setSymptoms(restore);
            updateSymptomsInAPI(restore);
            onSymptomsUpdate?.(restore);
          },
        },
      ]);
    } catch (err) {
      Alert.alert("Failed to remove", (err as any).message || "Try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  // friendly emoji mapping for a nicer pill
  const emojiFor = (s: string) => {
    const lower = s.toLowerCase();
    if (lower.includes("cramp")) return "🔴";
    if (lower.includes("head")) return "🤕";
    if (lower.includes("tired") || lower.includes("fatigue")) return "😴";
    if (lower.includes("bloat")) return "🌕";
    if (lower.includes("mood") || lower.includes("irrit")) return "😬";
    return "✨";
  };

  return (
    <View style={[styles.container, customStyles?.symptomsContainer]}>
      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#B76CFD" />
        </View>
      )}

      <View style={styles.headerRow}>
        <Text style={[styles.title, customStyles?.sectionTitle || {}]}>
          How are you feeling?
        </Text>

        <Pressable
          style={[styles.addBtn, customStyles?.addButton || {}]}
          onPress={() => setModalVisible(true)}
          disabled={symptoms.length >= MAX_SYMPTOMS || isSubmitting}
        >
          <Ionicons name="add" size={20} color="#FF5C8D" />
        </Pressable>
      </View>

      {symptoms.length >= MAX_SYMPTOMS * 0.8 && (
        <Text style={styles.warningText}>
          {symptoms.length >= MAX_SYMPTOMS
            ? "Max symptoms added"
            : `Approaching limit (${symptoms.length}/${MAX_SYMPTOMS})`}
        </Text>
      )}

      <View style={styles.listWrap}>
        {symptoms.map((s, i) => (
          <View
            key={`${s}-${i}`}
            style={[styles.pill, customStyles?.symptomPill || {}]}
          >
            <Text style={[styles.pillText, customStyles?.symptomText || {}]}>
              <Text style={{ marginRight: 6 }}>{emojiFor(s)}</Text>
              {s}
            </Text>
            <Pressable
              onPress={() => removeSymptom(i)}
              style={[styles.removeBtn, customStyles?.removeButton || {}]}
            >
              <Ionicons name="close" size={14} color="#B76CFD" />
            </Pressable>
          </View>
        ))}
      </View>

      {/* Bottom-style modal for adding symptom */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => !isSubmitting && setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Add symptom</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., cramps, headache, tired"
              placeholderTextColor="#B0A9B9"
              value={newSymptom}
              onChangeText={setNewSymptom}
              editable={!isSubmitting}
              maxLength={MAX_SYMPTOM_LENGTH}
            />
            <Text style={styles.charCount}>
              {newSymptom.length}/{MAX_SYMPTOM_LENGTH}
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setModalVisible(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  styles.addConfirmBtn,
                  (!newSymptom.trim() || isSubmitting) && { opacity: 0.6 },
                ]}
                onPress={addSymptom}
                disabled={!newSymptom.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.addConfirmText}>Add</Text>
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
  container: {
    position: "relative",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#2D2D2D",
  },
  addBtn: {
    padding: 6,
    borderRadius: 10,
  },

  // pills
  listWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
  pill: {
    backgroundColor: "rgba(255,242,248,0.9)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  pillText: {
    fontFamily: "Poppins-Medium",
    color: "#FF5C8D",
    fontSize: 13,
  },
  removeBtn: {
    marginLeft: 8,
  },

  // modal bottom sheet
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(10,10,10,0.35)",
  },
  modalSheet: {
    backgroundColor: "white",
    padding: 18,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(183,108,253,0.04)",
  },
  modalTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    marginBottom: 10,
    color: "#2D2D2D",
  },
  input: {
    borderWidth: 1,
    borderColor: "#F0E8FF",
    borderRadius: 12,
    padding: 12,
    fontFamily: "Poppins-Regular",
    color: "#2D2D2D",
    backgroundColor: "#FFF",
  },
  charCount: {
    textAlign: "right",
    color: "#9B98A4",
    fontSize: 12,
    marginTop: 8,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    gap: 8,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  cancelBtn: {
    backgroundColor: "#F5F5F7",
  },
  addConfirmBtn: {
    backgroundColor: "#B76CFD",
  },
  cancelText: {
    color: "#6B6573",
    fontFamily: "Poppins-Medium",
  },
  addConfirmText: {
    color: "white",
    fontFamily: "Poppins-SemiBold",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    borderRadius: 12,
  },
  warningText: {
    color: "#E85E6C",
    fontSize: 12,
    marginTop: 8,
  },
});
