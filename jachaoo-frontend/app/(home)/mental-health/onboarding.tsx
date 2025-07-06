import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function MentalHealthOnboarding() {
  const { user } = useUser();
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({
    diagnosed: "",
    support: "",
    frequency: "",
    goals: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allQuestions = [
    {
      id: "diagnosed",
      question: "Have you ever been diagnosed with a mental health condition?",
      options: ["Yes", "No", "I'm not sure"],
      type: "single",
    },
    {
      id: "support",
      question:
        "Are you currently receiving any mental health support or medication?",
      options: ["Therapy", "Medication", "Both", "No"],
      type: "single",
      showIf: (answers: Record<string, string | string[]>) =>
        answers.diagnosed === "Yes",
    },
    {
      id: "frequency",
      question: "How often do you think about mental health?",
      options: ["Every day", "Sometimes", "Rarely", "Not really"],
      type: "single",
    },
    {
      id: "goals",
      question: "What are you mainly looking for in this app?",
      options: [
        "Stress or anxiety relief",
        "Feeling low or depressed",
        "Sleep problems",
        "Journaling or self-reflection",
        "Just exploring",
        "Others",
      ],
      type: "multiple",
    },
  ];

  // Filter questions based on conditional logic
  const getVisibleQuestions = () => {
    return allQuestions.filter((question) => {
      if (question.showIf) {
        return question.showIf(answers);
      }
      return true;
    });
  };

  const visibleQuestions = getVisibleQuestions();
  const currentQuestion = visibleQuestions[currentQuestionIndex];
  const totalVisibleQuestions = visibleQuestions.length;

  const handleAnswer = (answer: string) => {
    if (currentQuestion.type === "multiple") {
      const currentAnswers = (answers[currentQuestion.id] as string[]) || [];
      const newAnswers = currentAnswers.includes(answer)
        ? currentAnswers.filter((a) => a !== answer)
        : [...currentAnswers, answer];

      setAnswers({
        ...answers,
        [currentQuestion.id]: newAnswers,
      });
    } else {
      const newAnswers = {
        ...answers,
        [currentQuestion.id]: answer,
      };

      setAnswers(newAnswers);

      // If answering "diagnosed" question, we might need to adjust the current question index
      if (currentQuestion.id === "diagnosed") {
        const newVisibleQuestions = getVisibleQuestions();
        const newTotal = newVisibleQuestions.length;

        // If we added the support question, stay on current index (it will now point to support question)
        // If we removed it, we might need to adjust
        if (newTotal !== totalVisibleQuestions) {
          // The simplest approach is to recalculate the position
          const currentQuestionId = currentQuestion.id;
          const newIndex = newVisibleQuestions.findIndex(
            (q) => q.id === currentQuestionId
          );
          setCurrentQuestionIndex(Math.min(newIndex, newTotal - 1));
        }
      }
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalVisibleQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    console.log("Submitted answers:", answers);

    // try {
    //   const response = await fetch(
    //     `${process.env.EXPO_PUBLIC_API_URL}/mental-health/onboarding`,
    //     {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify({
    //         userId: user?.id,
    //         answers,
    //       }),
    //     }
    //   );

    //   if (!response.ok) throw new Error("Failed to save mental health data");
    router.replace("/(home)/mental-health/dashboard");
    // } catch (error) {
    //   console.error("Error saving mental health data:", error);
    //   Alert.alert("Error", "Failed to save your information");
    // } finally {
    //   setIsSubmitting(false);
    // }
  };

  const isAnswered =
    currentQuestion.type === "multiple"
      ? (answers[currentQuestion.id] as string[])?.length > 0
      : answers[currentQuestion.id];

  return (
    <ImageBackground
      source={require("@/assets/images/mental-health-background.jpg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Question {currentQuestionIndex + 1} of {totalVisibleQuestions}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      ((currentQuestionIndex + 1) / totalVisibleQuestions) * 100
                    }%`,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>

            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option) => {
                const isSelected =
                  currentQuestion.type === "multiple"
                    ? (answers[currentQuestion.id] as string[])?.includes(
                        option
                      )
                    : answers[currentQuestion.id] === option;

                return (
                  <Pressable
                    key={option}
                    style={({ pressed }) => [
                      styles.optionButton,
                      isSelected && styles.selectedOption,
                      pressed && styles.pressedOption,
                    ]}
                    onPress={() => handleAnswer(option)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.selectedOptionText,
                      ]}
                    >
                      {option}
                    </Text>
                    {currentQuestion.type === "multiple" && (
                      <View style={styles.checkbox}>
                        {isSelected && <View style={styles.checkboxSelected} />}
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.navigationContainer}>
            {currentQuestionIndex > 0 && (
              <Pressable style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>Back</Text>
              </Pressable>
            )}

            <Pressable
              style={[
                styles.nextButton,
                !isAnswered && styles.nextButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={!isAnswered || isSubmitting}
            >
              <Text style={styles.nextButtonText}>
                {currentQuestionIndex === totalVisibleQuestions - 1
                  ? isSubmitting
                    ? "Submitting..."
                    : "Complete"
                  : "Next"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  container: {
    flexGrow: 1,
    padding: 25,
    paddingTop: 50,
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
    textAlign: "center",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2980b9",
    borderRadius: 4,
  },
  questionContainer: {
    flex: 1,
    justifyContent: "center",
  },
  questionText: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 30,
    color: "#2c3e50",
    textAlign: "center",
    lineHeight: 36,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: "#f8f9fa",
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedOption: {
    backgroundColor: "#2980b9",
    borderColor: "#2980b9",
  },
  pressedOption: {
    opacity: 0.8,
  },
  optionText: {
    fontSize: 16,
    textAlign: "left",
    color: "#333",
    flex: 1,
  },
  selectedOptionText: {
    color: "#fff",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  checkboxSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  backButton: {
    padding: 12,
    minWidth: 100,
    alignItems: "center",
  },
  backButtonText: {
    color: "#2980b9",
    fontSize: 16,
    fontWeight: "600",
  },
  nextButton: {
    backgroundColor: "#2980b9",
    padding: 16,
    borderRadius: 30,
    minWidth: 150,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
