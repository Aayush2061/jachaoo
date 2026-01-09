import { useClerk, useUser } from "@clerk/clerk-expo";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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

const { height: screenHeight } = Dimensions.get("window");

const ILLNESS_OPTIONS = [
  "Asthma",
  "Insulin",
  "High Blood Pressure",
  "Diabetes",
  "Heart Problem",
  "Kidney Problem",
  "Liver Problem",
  "Thyroid",
  "TB",
  "Mental Health",
  "Obesity",
  "Others",
];

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
    weight: "",
    sex: "Male",
    bloodPressure: "No",
    diabetes: "No",
    smoker: "No",
    hasIllness: "No",
    illnesses: [] as string[],
    otherIllness: "",
  });

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        if (!user?.id) return;

        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/health/${user.id}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Full health data:", data); // Debug log

        setHealthData(data);
        if (data) {
          setFormData({
            name: data.name || "",
            age: data.age?.toString() || "",
            weight: data.weight?.toString() || "",
            sex: data.sex || "Male",
            bloodPressure: data.bloodPressure || "No",
            diabetes: data.diabetes || "No",
            smoker: data.smoker || "No",
            hasIllness: data.hasIllness || "No",
            illnesses: data.illnesses || [],
            otherIllness: data.otherIllness || "",
          });
        }
      } catch (error) {
        console.error("Error fetching health data:", error);
        // Set default data for testing
        setHealthData({
          name: user?.fullName || "Test User",
          age: "25",
          weight: "70",
          sex: "Male",
          bloodPressure: "No",
          diabetes: "No",
          smoker: "No",
          hasIllness: "No",
          illnesses: [],
          otherIllness: "",
        });
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
            console.error("Sign out error:", err);
            Alert.alert("Error", "Failed to sign out");
          }
        },
      },
    ]);
  };

  const handleIllnessToggle = (illness: string) => {
    setFormData((prev) => {
      const currentIllnesses = [...prev.illnesses];
      if (currentIllnesses.includes(illness)) {
        return {
          ...prev,
          illnesses: currentIllnesses.filter((item) => item !== illness),
          otherIllness: illness === "Others" ? "" : prev.otherIllness,
        };
      } else {
        return {
          ...prev,
          illnesses: [...currentIllnesses, illness],
        };
      }
    });
  };

  const handleUpdateHealthData = async () => {
    try {
      const ageNumber = parseInt(formData.age);
      const weightNumber = parseFloat(formData.weight);

      if (
        !formData.name.trim() ||
        !formData.age.trim() ||
        !formData.weight.trim()
      ) {
        Alert.alert("Error", "Please fill in all required fields");
        return;
      }

      if (isNaN(ageNumber) || ageNumber < 1 || ageNumber > 150) {
        Alert.alert("Error", "Please enter a valid age (1-150)");
        return;
      }

      if (isNaN(weightNumber) || weightNumber < 1 || weightNumber > 500) {
        Alert.alert("Error", "Please enter a valid weight (1-500 kg)");
        return;
      }

      if (
        formData.hasIllness === "Yes" &&
        formData.illnesses.includes("Others") &&
        !formData.otherIllness.trim()
      ) {
        Alert.alert("Error", "Please specify your other illness");
        return;
      }

      setLoading(true);

      // Prepare the data for API call
      const updatedData = {
        userId: user?.id, // Make sure to include userId
        name: formData.name,
        age: ageNumber,
        weight: weightNumber,
        sex: formData.sex,
        bloodPressure: formData.bloodPressure,
        diabetes: formData.diabetes,
        smoker: formData.smoker,
        hasIllness: formData.hasIllness,
        illnesses: formData.illnesses,
        otherIllness: formData.illnesses.includes("Others")
          ? formData.otherIllness
          : "",
      };

      // Make API call to update database
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/health`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Update local state
      setHealthData(result);
      setEditModalVisible(false);
      Alert.alert("Success", "Health information updated successfully");
    } catch (error) {
      console.error("Error updating health data:", error);
      Alert.alert("Error", "Failed to update health information");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B3C73" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <LinearGradient
          colors={["#2FB7F0", "#1B3C73"]}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              {user?.imageUrl ? (
                <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color="#FFFFFF" />
                </View>
              )}
            </View>
            <Text style={styles.name}>
              {user?.fullName ||
                `${user?.firstName} ${user?.lastName}` ||
                "User"}
            </Text>
            <Text style={styles.email}>
              {user?.primaryEmailAddress?.emailAddress || "Not available"}
            </Text>
          </View>
        </LinearGradient>

        {/* Health Information Card - FIXED: Show all health data */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Ionicons name="fitness" size={24} color="#1B3C73" />
              <Text style={styles.cardTitle}>Health Information</Text>
            </View>
            <TouchableOpacity
              onPress={() => setEditModalVisible(true)}
              style={styles.editButton}
            >
              <Ionicons name="create-outline" size={20} color="#2FB7F0" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {healthData ? (
            <View style={styles.healthGrid}>
              {/* Basic Information */}
              <View style={styles.healthItem}>
                <View
                  style={[styles.healthIcon, { backgroundColor: "#E8F6FD" }]}
                >
                  <FontAwesome5 name="user" size={16} color="#2FB7F0" />
                </View>
                <View style={styles.healthInfo}>
                  <Text style={styles.healthLabel}>Name</Text>
                  <Text style={styles.healthValue}>{healthData.name}</Text>
                </View>
              </View>

              <View style={styles.healthItem}>
                <View
                  style={[styles.healthIcon, { backgroundColor: "#FFE8E8" }]}
                >
                  <FontAwesome5
                    name="birthday-cake"
                    size={16}
                    color="#FF6B6B"
                  />
                </View>
                <View style={styles.healthInfo}>
                  <Text style={styles.healthLabel}>Age</Text>
                  <Text style={styles.healthValue}>{healthData.age} years</Text>
                </View>
              </View>

              <View style={styles.healthItem}>
                <View
                  style={[styles.healthIcon, { backgroundColor: "#E8EDF5" }]}
                >
                  <FontAwesome5 name="weight" size={16} color="#1B3C73" />
                </View>
                <View style={styles.healthInfo}>
                  <Text style={styles.healthLabel}>Weight</Text>
                  <Text style={styles.healthValue}>{healthData.weight} kg</Text>
                </View>
              </View>

              <View style={styles.healthItem}>
                <View
                  style={[styles.healthIcon, { backgroundColor: "#FFEAF1" }]}
                >
                  <FontAwesome5 name="venus-mars" size={16} color="#E84C88" />
                </View>
                <View style={styles.healthInfo}>
                  <Text style={styles.healthLabel}>Sex</Text>
                  <Text style={styles.healthValue}>{healthData.sex}</Text>
                </View>
              </View>

              {/* Health Conditions */}
              <View style={styles.healthItem}>
                <View
                  style={[styles.healthIcon, { backgroundColor: "#F3EDFF" }]}
                >
                  <FontAwesome5 name="heartbeat" size={16} color="#7F5AF0" />
                </View>
                <View style={styles.healthInfo}>
                  <Text style={styles.healthLabel}>Blood Pressure</Text>
                  <Text style={styles.healthValue}>
                    {healthData.bloodPressure}
                  </Text>
                </View>
              </View>

              <View style={styles.healthItem}>
                <View
                  style={[styles.healthIcon, { backgroundColor: "#E8F6FD" }]}
                >
                  <FontAwesome5 name="syringe" size={16} color="#2FB7F0" />
                </View>
                <View style={styles.healthInfo}>
                  <Text style={styles.healthLabel}>Diabetes</Text>
                  <Text style={styles.healthValue}>{healthData.diabetes}</Text>
                </View>
              </View>

              <View style={styles.healthItem}>
                <View
                  style={[styles.healthIcon, { backgroundColor: "#FFE8E8" }]}
                >
                  <FontAwesome5 name="smoking" size={16} color="#FF6B6B" />
                </View>
                <View style={styles.healthInfo}>
                  <Text style={styles.healthLabel}>Smoker</Text>
                  <Text style={styles.healthValue}>{healthData.smoker}</Text>
                </View>
              </View>

              <View style={styles.healthItem}>
                <View
                  style={[styles.healthIcon, { backgroundColor: "#E8EDF5" }]}
                >
                  <FontAwesome5
                    name="notes-medical"
                    size={16}
                    color="#1B3C73"
                  />
                </View>
                <View style={styles.healthInfo}>
                  <Text style={styles.healthLabel}>Has Illness</Text>
                  <Text style={styles.healthValue}>
                    {healthData.hasIllness || "No"}
                  </Text>
                </View>
              </View>

              {/* Illnesses List - Full Width */}
              {healthData.hasIllness === "Yes" &&
                healthData.illnesses &&
                healthData.illnesses.length > 0 && (
                  <View style={styles.fullWidthItem}>
                    <View
                      style={[
                        styles.healthIcon,
                        { backgroundColor: "#FFEAF1" },
                      ]}
                    >
                      <FontAwesome5 name="list" size={16} color="#E84C88" />
                    </View>
                    <View style={styles.healthInfo}>
                      <Text style={styles.healthLabel}>Illnesses</Text>
                      <Text style={styles.healthValue}>
                        {healthData.illnesses.join(", ")}
                        {healthData.otherIllness &&
                          `, ${healthData.otherIllness}`}
                      </Text>
                    </View>
                  </View>
                )}
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Ionicons name="medical-outline" size={48} color="#CBD5E1" />
              <Text style={styles.noDataText}>No health data available</Text>
              <TouchableOpacity
                style={styles.addDataButton}
                onPress={() => setEditModalVisible(true)}
              >
                <Text style={styles.addDataButtonText}>
                  Add Health Information
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#E74C3C" />
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>

        <Link href="/(home)/delete-account" asChild>
          <TouchableOpacity style={styles.deleteAccountButton}>
            <Ionicons name="trash-outline" size={20} color="#E74C3C" />
            <Text style={styles.deleteAccountButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>

      {/* Edit Health Data Modal - FIXED: Full form with proper scrolling */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Health Information</Text>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={true}
            >
              {/* Basic Information */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Basic Information</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Full Name *</Text>
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
                  <Text style={styles.inputLabel}>Age *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.age}
                    onChangeText={(text) =>
                      setFormData({
                        ...formData,
                        age: text.replace(/[^0-9]/g, ""),
                      })
                    }
                    placeholder="Enter your age"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Weight (kg) *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.weight}
                    onChangeText={(text) => {
                      const numeric = text.replace(/[^0-9.]/g, "");
                      const parts = numeric.split(".");
                      const formatted =
                        parts.length > 2
                          ? parts[0] + "." + parts.slice(1).join("")
                          : numeric;
                      setFormData({ ...formData, weight: formatted });
                    }}
                    placeholder="Enter your weight in kg"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Sex *</Text>
                  <View style={styles.radioGroup}>
                    {["Male", "Female", "Other"].map((option) => (
                      <Pressable
                        key={option}
                        style={styles.radioOption}
                        onPress={() =>
                          setFormData({ ...formData, sex: option })
                        }
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
              </View>

              {/* Health Conditions */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Health Conditions</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>High Blood Pressure</Text>
                  <View style={styles.radioGroup}>
                    {["Yes", "No", "Don't know"].map((option) => (
                      <Pressable
                        key={option}
                        style={styles.radioOption}
                        onPress={() =>
                          setFormData({ ...formData, bloodPressure: option })
                        }
                      >
                        <View style={styles.radioCircle}>
                          {formData.bloodPressure === option && (
                            <View style={styles.radioInnerCircle} />
                          )}
                        </View>
                        <Text style={styles.radioLabel}>{option}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Diabetes</Text>
                  <View style={styles.radioGroup}>
                    {["Yes", "No", "Don't know"].map((option) => (
                      <Pressable
                        key={option}
                        style={styles.radioOption}
                        onPress={() =>
                          setFormData({ ...formData, diabetes: option })
                        }
                      >
                        <View style={styles.radioCircle}>
                          {formData.diabetes === option && (
                            <View style={styles.radioInnerCircle} />
                          )}
                        </View>
                        <Text style={styles.radioLabel}>{option}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Smoker</Text>
                  <View style={styles.radioGroup}>
                    {["Yes", "No", "Don't know"].map((option) => (
                      <Pressable
                        key={option}
                        style={styles.radioOption}
                        onPress={() =>
                          setFormData({ ...formData, smoker: option })
                        }
                      >
                        <View style={styles.radioCircle}>
                          {formData.smoker === option && (
                            <View style={styles.radioInnerCircle} />
                          )}
                        </View>
                        <Text style={styles.radioLabel}>{option}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Do you have any type of illness? *
                  </Text>
                  <View style={styles.radioGroup}>
                    {["No", "Yes"].map((option) => (
                      <Pressable
                        key={option}
                        style={styles.radioOption}
                        onPress={() =>
                          setFormData({ ...formData, hasIllness: option })
                        }
                      >
                        <View style={styles.radioCircle}>
                          {formData.hasIllness === option && (
                            <View style={styles.radioInnerCircle} />
                          )}
                        </View>
                        <Text style={styles.radioLabel}>{option}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {formData.hasIllness === "Yes" && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      Select your illnesses:
                    </Text>
                    <ScrollView style={styles.illnessContainer}>
                      {ILLNESS_OPTIONS.map((illness) => (
                        <TouchableOpacity
                          key={illness}
                          style={styles.illnessOption}
                          onPress={() => handleIllnessToggle(illness)}
                        >
                          <View style={styles.checkboxContainer}>
                            <View
                              style={[
                                styles.checkbox,
                                formData.illnesses.includes(illness) &&
                                  styles.checkboxSelected,
                              ]}
                            >
                              {formData.illnesses.includes(illness) && (
                                <Text style={styles.checkmark}>✓</Text>
                              )}
                            </View>
                          </View>
                          <Text style={styles.illnessText}>{illness}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    {formData.illnesses.includes("Others") && (
                      <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>
                          Please specify other illness *
                        </Text>
                        <TextInput
                          style={styles.input}
                          value={formData.otherIllness}
                          onChangeText={(text) =>
                            setFormData({ ...formData, otherIllness: text })
                          }
                          placeholder="Enter the illness name"
                        />
                      </View>
                    )}
                  </View>
                )}
              </View>

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
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF7",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAF7",
  },
  loadingText: {
    fontSize: 16,
    color: "#1B3C73",
    marginTop: 16,
  },
  // Header Styles
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.3)",
  },
  name: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
    textAlign: "center",
  },
  email: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  // Card Styles
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 20,
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1B3C73",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  editButtonText: {
    color: "#2FB7F0",
    fontSize: 14,
    fontWeight: "600",
  },
  // Health Grid
  healthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  healthItem: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFF",
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  fullWidthItem: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFF",
    padding: 16,
    borderRadius: 16,
    gap: 12,
    marginTop: 8,
  },
  healthIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  healthInfo: {
    flex: 1,
  },
  healthLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 2,
  },
  healthValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1B3C73",
  },
  // No Data State
  noDataContainer: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
  },
  addDataButton: {
    backgroundColor: "#2FB7F0",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  addDataButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  // Action Buttons
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 24,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  signOutButtonText: {
    color: "#E74C3C",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteAccountButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 24,
    borderWidth: 1,
    borderColor: "#FECACA",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  deleteAccountButtonText: {
    color: "#E74C3C",
    fontSize: 16,
    fontWeight: "600",
  },
  // Modal Styles - FIXED
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: screenHeight,
    width: "100%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    backgroundColor: "#FFFFFF",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1B3C73",
    flex: 1,
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
  },
  modalScrollView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  formSection: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B3C73",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#E0F2FE",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#1E293B",
    backgroundColor: "#F8FAFC",
  },
  radioGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 8,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#2FB7F0",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  radioInnerCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2FB7F0",
  },
  radioLabel: {
    fontSize: 15,
    color: "#334155",
    fontWeight: "500",
  },
  illnessContainer: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    padding: 12,
    maxHeight: "100%",
  },
  illnessOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxSelected: {
    backgroundColor: "#2FB7F0",
    borderColor: "#2FB7F0",
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  illnessText: {
    fontSize: 15,
    color: "#334155",
    fontWeight: "500",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 0,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  saveButton: {
    backgroundColor: "#2FB7F0",
    shadowColor: "#2FB7F0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cancelButtonText: {
    color: "#64748B",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
