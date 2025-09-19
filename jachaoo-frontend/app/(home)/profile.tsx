import { useClerk, useUser } from "@clerk/clerk-expo";
import { MaterialIcons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfilePage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    sex: "Male",
    bloodPressure: "No",
    diabetes: "No",
    smoker: "No",
  });

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        if (!user?.id) return;

        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/health/${user.id}`
        );
        const data = await response.json();
        setHealthData(data);
        if (data) {
          setFormData({
            name: data.name || "",
            age: data.age?.toString() || "",
            sex: data.sex || "Male",
            bloodPressure: data.bloodPressure || "No",
            diabetes: data.diabetes || "No",
            smoker: data.smoker || "No",
          });
        }
      } catch (error) {
        console.error("Error fetching health data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
  }, [user?.id]);

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            router.replace("/(auth)");
          } catch (err) {
            console.error("Sign out error:", JSON.stringify(err, null, 2));
            Alert.alert("Error", "Failed to sign out");
          }
        },
      },
    ]);
  };

  const handleUpdateHealthData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/health`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user?.id,
            name: formData.name,
            age: parseInt(formData.age),
            sex: formData.sex,
            bloodPressure: formData.bloodPressure,
            diabetes: formData.diabetes,
            smoker: formData.smoker,
          }),
        }
      );

      const data = await response.json();
      setHealthData(data);
      setEditModalVisible(false);
    } catch (error) {
      console.error("Error updating health data:", error);
      Alert.alert("Error", "Failed to update health information");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialIcons name="person" size={50} color="#4A90E2" />
              </View>
            )}
          </View>
          <Text style={styles.name}>
            {user?.fullName || `${user?.firstName} ${user?.lastName}` || "User"}
          </Text>
          <Text style={styles.email}>
            {user?.primaryEmailAddress?.emailAddress || "Not available"}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Information</Text>

          <View style={styles.infoItem}>
            <MaterialIcons name="email" size={20} color="#4A90E2" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>
                {user?.primaryEmailAddress?.emailAddress || "Not available"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.cardTitle}>Health Information</Text>
            <TouchableOpacity
              onPress={() => setEditModalVisible(true)}
              style={styles.editButton}
            >
              <MaterialIcons name="edit" size={20} color="#4A90E2" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {healthData ? (
            <>
              <View style={styles.infoItem}>
                <MaterialIcons name="person" size={20} color="#4A90E2" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Name</Text>
                  <Text style={styles.infoValue}>{healthData.name}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <MaterialIcons name="cake" size={20} color="#4A90E2" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Age</Text>
                  <Text style={styles.infoValue}>{healthData.age}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <MaterialIcons name="wc" size={20} color="#4A90E2" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Sex</Text>
                  <Text style={styles.infoValue}>{healthData.sex}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <MaterialIcons name="favorite" size={20} color="#4A90E2" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Blood Pressure</Text>
                  <Text style={styles.infoValue}>
                    {healthData.bloodPressure}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <MaterialIcons name="healing" size={20} color="#4A90E2" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Diabetes</Text>
                  <Text style={styles.infoValue}>{healthData.diabetes}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <MaterialIcons name="smoking-rooms" size={20} color="#4A90E2" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Smoker</Text>
                  <Text style={styles.infoValue}>{healthData.smoker}</Text>
                </View>
              </View>
            </>
          ) : (
            <Text style={styles.noDataText}>No health data available</Text>
          )}
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>

        <Link href="/(home)/delete-account" asChild>
          <TouchableOpacity style={styles.deleteAccountButton}>
            <Text style={styles.deleteAccountButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </Link>

        {/* Edit Health Data Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={editModalVisible}
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Update Health Information</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, name: text })
                  }
                  placeholder="Enter your full name"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Age</Text>
                <TextInput
                  style={styles.input}
                  value={formData.age}
                  onChangeText={(text) =>
                    setFormData({ ...formData, age: text })
                  }
                  placeholder="Enter your age"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Sex</Text>
                <View style={styles.radioGroup}>
                  {["Male", "Female", "Other"].map((option) => (
                    <Pressable
                      key={option}
                      style={styles.radioOption}
                      onPress={() => setFormData({ ...formData, sex: option })}
                    >
                      <View style={styles.radioCircle}>
                        {formData.sex === option && (
                          <View style={styles.radioInnerCircle} />
                        )}
                      </View>
                      <Text style={styles.radioLabel}>{option}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {["bloodPressure", "diabetes", "smoker"].map((field) => (
                <View key={field} style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    {field
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                  </Text>
                  <View style={styles.radioGroup}>
                    {["Yes", "No", "Don't know"].map((option) => (
                      <Pressable
                        key={option}
                        style={styles.radioOption}
                        onPress={() =>
                          setFormData({ ...formData, [field]: option })
                        }
                      >
                        <View style={styles.radioCircle}>
                          {formData[field] === option && (
                            <View style={styles.radioInnerCircle} />
                          )}
                        </View>
                        <Text style={styles.radioLabel}>{option}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ))}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleUpdateHealthData}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFF",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F8FAFF",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    padding: 30,
    marginBottom: 10,
  },
  avatarContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E8F0FE",
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 22,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "#7F8C8D",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ECF0F1",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C3E50",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButtonText: {
    color: "#4A90E2",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 5,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  infoTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#7F8C8D",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2C3E50",
  },
  noDataText: {
    textAlign: "center",
    color: "#7F8C8D",
    marginVertical: 20,
  },
  signOutButton: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#E74C3C",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  signOutButtonText: {
    color: "#E74C3C",
    fontSize: 16,
    fontWeight: "600",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: "#7F8C8D",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ECF0F1",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#F8FAFF",
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
  },
  radioInnerCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4A90E2",
  },
  radioLabel: {
    fontSize: 16,
    color: "#2C3E50",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#ECF0F1",
  },
  saveButton: {
    backgroundColor: "#4A90E2",
  },
  cancelButtonText: {
    color: "#2C3E50",
    fontWeight: "600",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "600",
  },
  deleteAccountButton: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#E74C3C",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  deleteAccountButtonText: {
    color: "#E74C3C",
    fontSize: 16,
    fontWeight: "600",
  },
});
