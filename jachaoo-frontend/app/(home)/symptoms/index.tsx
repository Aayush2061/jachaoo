import { useUser } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

export default function SymptomChecker() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [userInput, setUserInput] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [stage, setStage] = useState<"start" | "question" | "diagnosis">(
    "start"
  );
  const [isSharing, setIsSharing] = useState(false);
  const reportRef = useRef<View>(null);

  const startDiagnosis = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_FLASK_API_URL}/symptoms/start`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            smoker: "No",
            diabetes: "No",
            blood_pressure: "No",
          }),
        }
      );

      const data = await response.json();
      if (response.ok && data.session_id) {
        setSessionId(data.session_id);
        setCurrentQuestion(data.message);
        setStage("question");
      } else {
        throw new Error(data.message || "Failed to start diagnosis");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to start diagnosis");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (answer: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_FLASK_API_URL}/symptoms/answer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId, answer }),
        }
      );

      const data = await response.json();
      if (data.session_over) {
        setDiagnosis(data.diagnosis || "No diagnosis provided");
        setStage("diagnosis");
      } else {
        setCurrentQuestion(
          data.question.includes("?") ? data.question : `${data.question}?`
        );
        setOptions(data.options || []);
        if (!data.options) setUserInput("");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to submit answer");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (option: string) => {
    const optionIndex = options.indexOf(option) + 1;
    submitAnswer(optionIndex.toString());
  };

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#4F7CFF" />
      <Text style={styles.loadingText}>Processing your response...</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#F8FAFF", "#E3ECFF"]} style={styles.background}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {loading && renderLoading()}

          {!loading && stage === "start" && (
            <Animated.View
              entering={FadeInUp.duration(600)}
              style={styles.centerContent}
            >
              <Text style={styles.title}>🩺 Symptom Checker</Text>
              <Text style={styles.subtitle}>
                Tell us what you're feeling and we'll help you understand it.
              </Text>
              <TouchableOpacity
                style={styles.startButton}
                onPress={startDiagnosis}
              >
                <Text style={styles.buttonText}>Begin Diagnosis</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {!loading && stage === "question" && (
            <Animated.View
              entering={FadeInUp.duration(400)}
              style={styles.questionSection}
            >
              <Text style={styles.questionText}>{currentQuestion}</Text>
              {options.length > 0 ? (
                options.map((option, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.optionButton}
                    onPress={() => handleOptionSelect(option)}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Type your answer..."
                    value={userInput}
                    onChangeText={setUserInput}
                    multiline
                  />
                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      !userInput.trim() && { opacity: 0.5 },
                    ]}
                    onPress={() => submitAnswer(userInput)}
                    disabled={!userInput.trim()}
                  >
                    <Text style={styles.buttonText}>Submit Answer</Text>
                  </TouchableOpacity>
                </>
              )}
            </Animated.View>
          )}

          {!loading && stage === "diagnosis" && (
            <Animated.View
              entering={FadeInUp.duration(500)}
              style={styles.resultContainer}
            >
              <View style={styles.headerRow}>
                <Text style={styles.resultTitle}>📝 Diagnosis Result</Text>
              </View>
              <View style={styles.resultBox}>
                {diagnosis.split("\n").map((line, i) => {
                  // Skip empty lines
                  if (!line.trim()) return null;

                  // Style the main header
                  if (line === "MEDICAL ASSESSMENT REPORT") {
                    return (
                      <Text key={i} style={styles.mainHeader}>
                        {line}
                      </Text>
                    );
                  }

                  // Style numbered section headers (like "1. Three most likely conditions:")
                  if (line.match(/^\d+\.\s+[A-Z][^:]+:/)) {
                    return (
                      <Text key={i} style={styles.sectionHeader}>
                        {line}
                      </Text>
                    );
                  }

                  // Style conditions with percentages
                  if (line.match(/^[A-Z][^%(]+\(\d+%\)/)) {
                    const [condition, ...rest] = line.split("(");
                    const percentage = rest.join("(");
                    return (
                      <View key={i} style={styles.conditionContainer}>
                        <Text style={styles.conditionText}>
                          <Text style={styles.conditionName}>{condition}</Text>
                          <Text style={styles.conditionPercentage}>
                            ({percentage}
                          </Text>
                        </Text>
                      </View>
                    );
                  }

                  // Style red flags with bullet points
                  if (line.startsWith("* ")) {
                    return (
                      <View key={i} style={styles.redFlagItem}>
                        <Text style={styles.redFlagBullet}>•</Text>
                        <Text style={styles.redFlagText}>
                          {line.substring(2)}
                        </Text>
                      </View>
                    );
                  }

                  // Default text style
                  return (
                    <Text key={i} style={styles.resultText}>
                      {line}
                    </Text>
                  );
                })}
              </View>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => router.back()}
              >
                <Text style={styles.buttonText}>Return to Home</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  scrollContainer: { padding: 20 },
  centerContent: { alignItems: "center", paddingTop: 60 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  loadingText: { marginTop: 16, fontSize: 16, color: "#4F7CFF" },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A237E",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#475569",
    textAlign: "center",
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: "#4F7CFF",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  questionSection: { marginTop: 50 },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 16,
  },
  optionButton: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  optionText: { fontSize: 16, color: "#1E293B" },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  submitButton: {
    backgroundColor: "#4F7CFF",
    paddingVertical: 14,
    borderRadius: 12,
  },
  resultContainer: { marginTop: 30 },
  resultTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1A237E",
    marginBottom: 16,
    textAlign: "center",
  },
  resultBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  mainHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A237E",
    marginBottom: 16,
    textAlign: "center",
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A237E",
    marginTop: 16,
    marginBottom: 8,
  },
  conditionContainer: {
    marginVertical: 8,
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#4F7CFF",
  },
  conditionText: {
    fontSize: 16,
    lineHeight: 22,
    color: "#334155",
  },
  conditionName: {
    fontWeight: "600",
    color: "#1E293B",
  },
  conditionPercentage: {
    color: "#4F7CFF",
    fontWeight: "600",
  },
  resultText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#334155",
    marginBottom: 8,
  },
  redFlagItem: {
    flexDirection: "row",
    marginVertical: 4,
    alignItems: "flex-start",
  },
  redFlagBullet: {
    color: "#EF4444",
    fontSize: 16,
    marginRight: 8,
  },
  redFlagText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#EF4444",
    flex: 1,
  },
  doneButton: {
    backgroundColor: "#4F7CFF",
    paddingVertical: 16,
    borderRadius: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
});
