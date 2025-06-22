import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SymptomsSection({
  initialSymptoms = [],
}: {
  initialSymptoms?: string[];
}) {
  const [symptoms, setSymptoms] = useState<string[]>(initialSymptoms);
  const [modalVisible, setModalVisible] = useState(false);
  const [newSymptom, setNewSymptom] = useState("");

  const addSymptom = () => {
    if (newSymptom.trim() !== "") {
      setSymptoms([...symptoms, newSymptom.trim()]);
      setNewSymptom("");
      setModalVisible(false);
    }
  };

  const removeSymptom = (index: number) => {
    const updatedSymptoms = [...symptoms];
    updatedSymptoms.splice(index, 1);
    setSymptoms(updatedSymptoms);
  };

  return (
    <View style={styles.symptomsContainer}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Current Symptoms</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={20} color="#9b59b6" />
        </Pressable>
      </View>

      <View style={styles.symptomsList}>
        {symptoms.map((symptom, index) => (
          <View key={index} style={styles.symptomPill}>
            <Text style={styles.symptomText}>{symptom}</Text>
            <Pressable
              style={styles.removeButton}
              onPress={() => removeSymptom(index)}
            >
              <Ionicons name="close" size={16} color="#9b59b6" />
            </Pressable>
          </View>
        ))}
      </View>

      {/* Add Symptom Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Symptom</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter symptom"
              value={newSymptom}
              onChangeText={setNewSymptom}
              autoFocus={true}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.addButtonModal]}
                onPress={addSymptom}
                disabled={!newSymptom.trim()}
              >
                <Text style={styles.buttonText}>Add</Text>
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
  },
});
