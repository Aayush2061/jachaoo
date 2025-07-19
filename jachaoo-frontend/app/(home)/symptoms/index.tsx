import { useUser } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
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

  const startDiagnosis = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_FLASK_API_URL}/symptoms/start`, // Verify this URL
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            smoker: "No",
            diabetes: "No",
            blood_pressure: "No",
          }),
        }
      );

      // Add error logging:
      if (!response.ok) {
        const errorData = await response.json();
        console.log("API Error:", errorData);
        throw new Error(errorData.message || "Failed to start diagnosis");
      }

      const data = await response.json();
      console.log("API Response:", data); // Log the response

      if (data.session_id) {
        setSessionId(data.session_id);
        setCurrentQuestion(data.message);
        setStage("question");
      }
    } catch (error) {
      console.error("Full Error:", error); // Detailed error logging
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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: sessionId,
            answer: answer,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data); // Debug log

      if (data.session_over) {
        setDiagnosis(data.diagnosis || "No diagnosis provided");
        setStage("diagnosis");
      } else {
        // Extract question and options properly
        const questionText = data.question.includes("?")
          ? data.question
          : `${data.question}?`;

        setCurrentQuestion(questionText);
        setOptions(data.options || []);

        // If no options provided, switch to text input mode
        if (!data.options || data.options.length === 0) {
          setUserInput("");
        }
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      Alert.alert("Error", "Failed to submit answer");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (option: string) => {
    // Get the index (1-based) of the selected option
    const optionIndex = options.indexOf(option) + 1;
    submitAnswer(optionIndex.toString());
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5E8BFF" />
        <Text style={styles.loadingText}>Processing...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#F8FAFF", "#ECF2FF"]}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {stage === "start" && (
            <View style={styles.startContainer}>
              <Text style={styles.title}>Symptom Checker</Text>
              <Text style={styles.subtitle}>
                Describe your symptoms and get potential diagnoses
              </Text>
              <TouchableOpacity
                style={styles.startButton}
                onPress={startDiagnosis}
              >
                <Text style={styles.buttonText}>Start Diagnosis</Text>
              </TouchableOpacity>
            </View>
          )}

          {stage === "question" && (
            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>{currentQuestion}</Text>

              {options.length > 0 ? (
                <View style={styles.optionsContainer}>
                  {options.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.optionButton}
                      onPress={() => handleOptionSelect(option)}
                    >
                      <Text style={styles.optionText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Describe your symptom..."
                    value={userInput}
                    onChangeText={setUserInput}
                    multiline
                  />
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={() => submitAnswer(userInput)}
                    disabled={!userInput.trim()}
                  >
                    <Text style={styles.buttonText}>Submit</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          {stage === "diagnosis" && (
            <View style={styles.diagnosisContainer}>
              <Text style={styles.diagnosisTitle}>Diagnosis Report</Text>
              <View style={styles.diagnosisBox}>
                <Text style={styles.diagnosisText}>
                  {diagnosis.split("\n").map((line, i) => (
                    <Text key={i}>
                      {line}
                      {"\n"}
                    </Text>
                  ))}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => router.back()}
              >
                <Text style={styles.buttonText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFF",
  },
  background: {
    flex: 1,
    width: "100%",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#5E8BFF",
  },
  startContainer: {
    alignItems: "center",
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A237E",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 40,
    textAlign: "center",
  },
  startButton: {
    backgroundColor: "#5E8BFF",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  questionContainer: {
    marginTop: 20,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A237E",
    marginBottom: 24,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButton: {
    backgroundColor: "#5E8BFF",
    paddingVertical: 16,
    borderRadius: 12,
  },
  optionsContainer: {
    marginTop: 8,
  },
  optionButton: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionText: {
    fontSize: 16,
    color: "#1A237E",
  },
  diagnosisContainer: {
    marginTop: 20,
  },
  diagnosisTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A237E",
    marginBottom: 16,
    textAlign: "center",
  },
  diagnosisBox: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  diagnosisText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#334155",
  },
  doneButton: {
    backgroundColor: "#5E8BFF",
    paddingVertical: 16,
    borderRadius: 12,
  },
});
