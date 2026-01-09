// app/symptom/diagnose.tsx
import { useAuth, useUser } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";

export default function Diagnose() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  // States (backend + UI)
  const [loading, setLoading] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [options, setOptions] = useState<string[]>([]);
  const [userInput, setUserInput] = useState<string>("");
  const [diagnosis, setDiagnosis] = useState<string>("");
  const [healthData, setHealthData] = useState<any>(null);
  const [stage, setStage] = useState<"start" | "question" | "diagnosis">(
    "question"
  );
  const MAX_INPUT_LENGTH = 300;

  // Fetch user health data and automatically start diagnosis
  useEffect(() => {
    let active = true;
    const fetchHealthDataAndStart = async () => {
      try {
        if (!user?.id) return;

        // Fetch health data
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/health/${user.id}`
        );
        const json = await res.json();
        if (!active) return;
        setHealthData(json);

        // Automatically start diagnosis after getting health data
        await startDiagnosis(json);
      } catch (err) {
        console.error("Error fetching health data:", err);
      }
    };

    fetchHealthDataAndStart();
    return () => {
      active = false;
    };
  }, [user?.id]);

  // Clear userInput on certain question prompts
  useEffect(() => {
    if (currentQuestion?.includes("Please describe your next symptom")) {
      setUserInput("");
    }
  }, [currentQuestion]);

  // Avatar selection logic - thinking avatar shows processing
  const avatarSource =
    stage === "diagnosis"
      ? require("../../../assets/avatars/idle.png")
      : loading
      ? require("../../../assets/avatars/thinking.png")
      : stage === "question"
      ? require("../../../assets/avatars/speaking.png")
      : require("../../../assets/avatars/idle.png");

  // Start diagnosis (POST /symptoms/start) - now takes healthData as parameter
  const startDiagnosis = async (healthData: any) => {
    try {
      setLoading(true);
      const token = await getToken();

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/v2/symptoms/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            sex: healthData?.sex || "",
            age: healthData?.age?.toString() || "",
            weight: healthData?.weight?.toString() || "",
            diabetes: healthData?.diabetes || "Don't know",
            blood_pressure: healthData?.bloodPressure || "Don't know",
            illnesses: healthData?.illnesses || [],
            other_illness: healthData?.otherIllness || "",
            smoker: healthData?.smoker || "Don't know",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          Alert.alert(
            "Analysis Limit Reached",
            errorData.error?.message ||
              "You've reached your daily symptom analysis limit"
          );
          return;
        }
        throw new Error(errorData.message || "Failed to start diagnosis");
      }

      const data = await response.json();
      if (data.session_id) {
        setSessionId(data.session_id);
        setCurrentQuestion(
          data.message || "Please describe your symptoms in detail"
        );
        setOptions(data.options || []);
        setStage("question");
        setUserInput("");
      } else {
        throw new Error("Invalid response from server.");
      }
    } catch (err: any) {
      if (!err?.message?.includes("daily limit")) {
        Alert.alert("Error", err?.message || "Failed to start diagnosis");
      }
      console.error("startDiagnosis error", err);
    } finally {
      setLoading(false);
    }
  };

  // Submit answer (POST /symptoms/answer)
  const submitAnswer = async (answer: string) => {
    // Validation
    if (answer.length > MAX_INPUT_LENGTH) {
      Alert.alert(
        "Input Too Long",
        `Keep your response under ${MAX_INPUT_LENGTH} characters.`
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_FLASK_API_URL}/v2/symptoms/answer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId, answer }),
        }
      );

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson?.message || "Failed to submit answer");
      }

      const data = await response.json();
      console.log(data);

      if (data.session_over) {
        setDiagnosis(data.diagnosis || "No diagnosis provided");
        setStage("diagnosis");
        setUserInput("");
        setOptions([]);
        setCurrentQuestion("");
      } else {
        const q = data.question || "";

        // Check if this is the red flag question (multiple select allowed)
        const isRedFlagQuestion =
          q.includes("additional warning signs") ||
          (data.options &&
            data.options.length > 2 &&
            data.options.includes("None of these"));

        setCurrentQuestion(q.includes("?") ? q : `${q}?`);
        setOptions(data.options || []);

        // Clear input unless it's the red flag question (user needs to see their selection)
        if (data.options && !isRedFlagQuestion) {
          setUserInput("");
        }

        // For red flag questions, show instructions for multiple selection
        if (isRedFlagQuestion) {
          setCurrentQuestion(`${q}\n\n(Select aLL that apply.)`);
        }
      }
    } catch (err) {
      console.error("submitAnswer error", err);
      Alert.alert("Error", "Failed to submit answer");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (option: string) => {
    // Check if we're in red flag mode (options include "None of these")
    const isRedFlagMode = options.includes("None of these");

    if (!isRedFlagMode) {
      // Normal single selection mode
      const optionIndex = options.indexOf(option) + 1;
      submitAnswer(String(optionIndex));
    } else {
      // Red flag mode - multiple selection with "None of these" logic
      const currentInput = userInput.trim();
      const selectedNumbers = currentInput
        .split(",")
        .map((num) => num.trim())
        .filter((num) => num !== "" && !isNaN(Number(num)))
        .map((num) => parseInt(num));

      if (option === "None of these") {
        // If "None of these" is selected, clear all other selections
        setUserInput(String(options.indexOf("None of these") + 1));
      } else {
        // Handle other options
        const optionIndex = options.indexOf(option) + 1;

        // Remove "None of these" if it was previously selected
        const noneIndex = options.indexOf("None of these") + 1;
        const filteredNumbers = selectedNumbers.filter(
          (num) => num !== noneIndex
        );

        // Toggle the selected option
        if (filteredNumbers.includes(optionIndex)) {
          // Remove if already selected
          const updatedNumbers = filteredNumbers.filter(
            (num) => num !== optionIndex
          );
          setUserInput(updatedNumbers.join(", "));
        } else {
          // Add new selection
          const updatedNumbers = [...filteredNumbers, optionIndex];
          updatedNumbers.sort((a, b) => a - b);
          setUserInput(updatedNumbers.join(", "));
        }
      }
    }
  };

  const handleSubmit = () => {
    if (userInput.trim() && !loading) {
      submitAnswer(userInput.trim());
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={["#F8FAFF", "#E3ECFF"]} style={styles.background}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Symptom Diagnosis</Text>
                <View style={{ width: 40 }} />
              </View>

              {/* Top card: avatar (left) + question (right) */}
              <Animated.View
                entering={FadeInUp.duration(450)}
                style={styles.topCard}
              >
                <View style={styles.avatarWrapper}>
                  <Image
                    source={avatarSource}
                    style={styles.avatar}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.questionWrapper}>
                  {loading && stage === "question" ? (
                    <Animated.Text
                      entering={FadeIn.duration(300)}
                      style={styles.loadingLabel}
                    >
                      Thinking...
                    </Animated.Text>
                  ) : stage === "question" ? (
                    <Animated.Text
                      entering={FadeInUp.duration(300)}
                      style={styles.questionText}
                    >
                      {currentQuestion ||
                        "Please describe your symptoms in detail"}
                    </Animated.Text>
                  ) : stage === "diagnosis" ? (
                    <Animated.Text
                      entering={FadeInUp.duration(300)}
                      style={styles.welcomeText}
                    >
                      Here is your diagnosis result below.
                    </Animated.Text>
                  ) : null}
                </View>
              </Animated.View>

              {/* Spacer */}
              <View style={{ height: 24 }} />

              {/* When question stage: show options or text input */}
              {stage === "question" && options && options.length > 0 ? (
                <View style={styles.optionsContainer}>
                  {options.map((opt, idx) => {
                    const isNoneOption = opt === "None of these";
                    const optionNumber = idx + 1;
                    const isSelected = userInput
                      .split(",")
                      .map((num) => num.trim())
                      .includes(String(optionNumber));

                    return (
                      <Animated.View
                        key={idx}
                        entering={FadeInUp.delay(idx * 80)}
                        style={styles.optionWrapper}
                      >
                        <TouchableOpacity
                          style={[
                            styles.optionCard,
                            options.includes("None of these") &&
                              styles.redFlagOptionCard,
                            isSelected && styles.optionCardSelected,
                            isNoneOption &&
                              isSelected &&
                              styles.noneOptionCardSelected,
                          ]}
                          onPress={() => handleOptionSelect(opt)}
                          activeOpacity={0.85}
                          disabled={loading}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              loading && { opacity: 0.6 },
                              options.includes("None of these") &&
                                styles.redFlagOptionText,
                              isSelected && styles.optionTextSelected,
                              isNoneOption && styles.noneOptionText,
                              isNoneOption &&
                                isSelected &&
                                styles.noneOptionTextSelected,
                            ]}
                          >
                            {opt}
                          </Text>
                        </TouchableOpacity>
                      </Animated.View>
                    );
                  })}

                  {/* Add submit button for red flag selections */}
                  {options.includes("None of these") && (
                    <Animated.View
                      entering={FadeInUp.delay(options.length * 80)}
                    >
                      <TouchableOpacity
                        style={[
                          styles.redFlagSubmitButton,
                          (!userInput.trim() || loading) &&
                            styles.redFlagSubmitButtonDisabled,
                        ]}
                        onPress={() => {
                          if (userInput.trim()) {
                            submitAnswer(userInput);
                          }
                        }}
                        disabled={!userInput.trim() || loading}
                      >
                        <Text style={styles.redFlagSubmitText}>
                          {loading ? "Processing..." : "Submit Selections"}
                        </Text>
                      </TouchableOpacity>
                    </Animated.View>
                  )}
                </View>
              ) : (
                stage === "question" && (
                  <View style={styles.inputSection}>
                    <TextInput
                      style={[styles.input, loading && { opacity: 0.6 }]}
                      placeholder={
                        options?.includes("None of these")
                          ? "Enter selection numbers separated by commas (e.g., 1,3,5)..."
                          : "Describe how you're feeling in detail..."
                      }
                      placeholderTextColor="#94A3B8"
                      value={userInput}
                      onChangeText={setUserInput}
                      multiline
                      maxLength={MAX_INPUT_LENGTH}
                      editable={!loading}
                      returnKeyType="send"
                      blurOnSubmit={false}
                      onSubmitEditing={handleSubmit}
                    />
                    <View style={styles.inputFooter}>
                      <Text style={styles.charCount}>
                        {userInput.length}/{MAX_INPUT_LENGTH}
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.submitButton,
                          (!userInput.trim() || loading) && { opacity: 0.6 },
                        ]}
                        onPress={handleSubmit}
                        disabled={!userInput.trim() || loading}
                      >
                        <Text style={styles.submitButtonText}>
                          {loading ? "Processing..." : "Submit"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )
              )}

              {/* Diagnosis result screen */}
              {stage === "diagnosis" && (
                <Animated.View
                  entering={FadeInUp.duration(400)}
                  style={styles.resultContainer}
                >
                  <Text style={styles.resultTitle}>📝 Diagnosis Result</Text>

                  <View style={styles.resultBox}>
                    {(() => {
                      const lines = diagnosis.split("\n");
                      const redFlagIndex = lines.findIndex((l) =>
                        l.includes("Red flags to watch for:")
                      );
                      const nextSectionAfterRedFlags = lines.findIndex(
                        (l, idx) =>
                          idx > redFlagIndex && l.match(/^\d+\.\s+[A-Z][^:]+:/)
                      );

                      return lines.map((line, i) => {
                        if (!line.trim()) return null;

                        // Check if we're in red flags section
                        const isInRedFlagSection =
                          redFlagIndex !== -1 &&
                          i > redFlagIndex &&
                          (nextSectionAfterRedFlags === -1 ||
                            i < nextSectionAfterRedFlags);

                        if (line === "MEDICAL ASSESSMENT REPORT") {
                          return (
                            <Text key={i} style={styles.mainHeader}>
                              {line}
                            </Text>
                          );
                        }

                        if (line.includes("Red flags to watch for:")) {
                          return (
                            <Text key={i} style={styles.redFlagSectionHeader}>
                              {line}
                            </Text>
                          );
                        }

                        if (line.match(/^\d+\.\s+[A-Z][^:]+:/)) {
                          return (
                            <Text key={i} style={styles.sectionHeader}>
                              {line}
                            </Text>
                          );
                        }

                        if (line.startsWith("- ")) {
                          const conditionText = line.substring(2);

                          // Red flag bullets
                          if (isInRedFlagSection) {
                            return (
                              <View key={i} style={styles.redFlagItem}>
                                <Text style={styles.redFlagBullet}>•</Text>
                                <Text style={styles.redFlagText}>
                                  {conditionText}
                                </Text>
                              </View>
                            );
                          }

                          // Condition with percentage
                          if (conditionText.match(/\((\d+)%\)/)) {
                            const [conditionName, ...percentageParts] =
                              conditionText.split("(");
                            const percentage = "(" + percentageParts.join("(");

                            return (
                              <View key={i} style={styles.conditionContainer}>
                                <Text style={styles.conditionText}>
                                  <Text style={styles.conditionBullet}>• </Text>
                                  <Text style={styles.conditionName}>
                                    {conditionName.trim()}
                                  </Text>
                                  <Text style={styles.conditionPercentage}>
                                    {percentage}
                                  </Text>
                                </Text>
                              </View>
                            );
                          }

                          // Regular bullets
                          return (
                            <View key={i} style={styles.bulletItem}>
                              <Text style={styles.bulletPoint}>•</Text>
                              <Text style={styles.bulletText}>
                                {conditionText}
                              </Text>
                            </View>
                          );
                        }

                        // Regular text
                        return (
                          <Text key={i} style={styles.resultText}>
                            {line}
                          </Text>
                        );
                      });
                    })()}
                  </View>

                  <Text style={styles.disclaimer}>
                    Results are not a substitute for professional medical
                    advice, diagnosis, or treatment. Consult a healthcare
                    provider for any health decisions.
                  </Text>

                  <TouchableOpacity
                    style={styles.doneButton}
                    onPress={() => router.back()}
                  >
                    <Text style={styles.startButtonText}>Return to Home</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}

              {/* Extra padding for keyboard space */}
              <View style={{ height: 100 }} />
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  background: { flex: 1 },
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    flexGrow: 1,
    paddingBottom: 50,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 4,
    marginTop: 20,
  },
  backText: { fontSize: 16, color: "#4F7CFF", fontFamily: "Poppins-Medium" },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#0F3A5D",
  },

  // Top card
  topCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },

  avatarWrapper: {
    width: 150,
    height: 150,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  avatar: {
    width: 150,
    height: 100,
    marginLeft: -20,
  },

  questionWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    marginRight: 5,
  },
  questionText: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#0F3A5D",
    lineHeight: 26,
    textAlign: "left",
    alignSelf: "flex-start",
  },
  loadingLabel: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: "#6B7280",
    textAlign: "left",
    alignSelf: "flex-start",
  },
  welcomeText: {
    fontSize: 16,
    color: "#475569",
    fontFamily: "Poppins-Medium",
    textAlign: "left",
    alignSelf: "flex-start",
  },

  // Options container
  optionsContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  optionWrapper: { marginBottom: 12 },
  optionButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  optionText: { fontSize: 16, fontFamily: "Poppins-Medium", color: "#0F3A5D" },

  // Input section
  inputSection: {
    marginTop: 20,
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    minHeight: 140,
    fontFamily: "Poppins-Medium",
    color: "#0F3A5D",
    shadowColor: "#4F7CFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E3ECFF",
    textAlignVertical: "top",
  },
  inputFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  charCount: {
    fontSize: 12,
    color: "#64748B",
    fontFamily: "Poppins-Medium",
  },
  submitButton: {
    backgroundColor: "#4F7CFF",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#4F7CFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
  },

  // Profile
  profileWrapper: {
    width: 56,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  profileImage: { width: 48, height: 48, borderRadius: 24 },

  // Results
  resultContainer: { marginTop: 12 },
  resultTitle: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: "#0F3A5D",
    marginBottom: 12,
    textAlign: "center",
  },
  resultBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  mainHeader: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#0F3A5D",
    marginBottom: 12,
    textAlign: "center",
  },
  sectionHeader: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#0F3A5D",
    marginTop: 12,
    marginBottom: 8,
  },
  // conditionContainer: {
  //   marginVertical: 6,
  //   paddingLeft: 8,
  //   borderLeftWidth: 3,
  //   borderLeftColor: "#4F7CFF",
  // },
  // conditionText: {
  //   fontSize: 15,
  //   lineHeight: 22,
  //   color: "#334155",
  //   fontFamily: "Poppins-Medium",
  // },
  // conditionName: { fontFamily: "Poppins-SemiBold", color: "#0F3A5D" },
  // conditionPercentage: { color: "#4F7CFF", fontFamily: "Poppins-SemiBold" },
  resultText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#334155",
    marginBottom: 8,
    fontFamily: "Poppins-Medium",
  },
  // redFlagItem: {
  //   flexDirection: "row",
  //   marginVertical: 4,
  //   alignItems: "flex-start",
  // },
  // redFlagBullet: { color: "#EF4444", fontSize: 16, marginRight: 8 },
  // redFlagText: {
  //   fontSize: 15,
  //   lineHeight: 22,
  //   color: "#EF4444",
  //   flex: 1,
  //   fontFamily: "Poppins-Medium",
  // },

  doneButton: {
    backgroundColor: "#4F7CFF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  startButtonText: {
    color: "#FFF",
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },
  conditionContainer: {
    marginVertical: 8,
    paddingLeft: 4,
  },
  conditionText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#334155",
    fontFamily: "Poppins-Medium",
  },
  conditionBullet: {
    color: "#0F3A5D",
    fontFamily: "Poppins-SemiBold",
  },
  conditionName: {
    fontFamily: "Poppins-SemiBold",
    color: "#0F3A5D",
  },
  conditionPercentage: {
    color: "#0F3A5D",
    fontFamily: "Poppins-SemiBold",
  },
  redFlagSectionHeader: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#EF4444",
    marginTop: 16,
    marginBottom: 8,
  },
  redFlagItem: {
    color: "#EF4444",
    flexDirection: "row",
    marginVertical: 6,
    alignItems: "flex-start",
    paddingLeft: 4,
  },
  redFlagBullet: {
    color: "#EF4444",
    fontSize: 16,
    marginRight: 12,
    fontFamily: "Poppins-SemiBold",
  },
  redFlagText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#EF4444",
    flex: 1,
    fontFamily: "Poppins-Medium",
  },
  bulletItem: {
    flexDirection: "row",
    marginVertical: 4,
    alignItems: "flex-start",
    paddingLeft: 4,
  },
  bulletPoint: {
    color: "#0F3A5D",
    fontSize: 16,
    marginRight: 12,
    fontFamily: "Poppins-SemiBold",
  },
  bulletText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#334155",
    flex: 1,
    fontFamily: "Poppins-Medium",
  },
  disclaimer: {
    marginTop: 20,
    fontSize: 12,
    color: "#6B6B6B",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 20,
    fontFamily: "Poppins-Regular",
    marginBottom: 20,
  },
  redFlagOptionButton: {
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  selectedOptionButton: {
    backgroundColor: "#FEE2E2",
    borderWidth: 2,
    borderColor: "#EF4444",
  },
  redFlagOptionText: {
    color: "#991B1B",
  },
  noneOptionText: {
    color: "#4F7CFF",
    fontFamily: "Poppins-SemiBold",
  },
  redFlagSubmitButton: {
    backgroundColor: "#EF4444",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  redFlagSubmitText: {
    color: "#FFFFFF",
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
  },
  // New styles for red flag selection UI
  optionCard: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  redFlagOptionCard: {
    backgroundColor: "#FFF5F5",
    borderColor: "#FECACA",
  },
  optionCardSelected: {
    backgroundColor: "#F3E5F5",
    borderColor: "#8E24AA",
    borderWidth: 2,
  },
  noneOptionCardSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: "#4F7CFF",
  },
  optionTextSelected: {
    color: "#8E24AA",
    fontFamily: "Poppins-SemiBold",
  },
  noneOptionTextSelected: {
    color: "#4F7CFF",
    fontFamily: "Poppins-SemiBold",
  },
  redFlagSubmitButtonDisabled: {
    opacity: 0.5,
  },
});
