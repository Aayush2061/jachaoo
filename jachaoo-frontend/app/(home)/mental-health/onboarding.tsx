import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

export default function MentalHealthOnboarding() {
  const { user } = useUser();
  const { getToken } = useAuth();
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
      icon: "medical",
    },
    {
      id: "support",
      question:
        "Are you currently receiving any mental health support or medication?",
      options: ["Therapy", "Medication", "Both", "No"],
      type: "single",
      icon: "heart",
      showIf: (answers: Record<string, string | string[]>) =>
        answers.diagnosed === "Yes",
    },
    {
      id: "frequency",
      question: "How often do you think about your mental health?",
      options: ["Every day", "Sometimes", "Rarely", "Not really"],
      type: "single",
      icon: "time",
    },
    {
      id: "goals",
      question: "What would you like to focus on?",
      options: [
        "Stress or anxiety relief",
        "Feeling low or depressed",
        "Sleep problems",
        "Mindfulness & meditation",
        "Just exploring",
        "Others",
      ],
      type: "multiple",
      icon: "flag",
    },
  ];

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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalVisibleQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    console.log("Submitted answers:", answers);
    const token = await getToken();
    
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/mental-health`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: user?.id,
            answers,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to save mental health data");
      router.replace("/(home)/mental-health/dashboard");
    } catch (error) {
      console.error("Error saving mental health data:", error);
      Alert.alert("Error", "Failed to save your information");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAnswered =
    currentQuestion.type === "multiple"
      ? (answers[currentQuestion.id] as string[])?.length > 0
      : answers[currentQuestion.id];

  const getIconName = (iconType: string) => {
    switch (iconType) {
      case "medical": return "medical-outline";
      case "heart": return "heart-outline";
      case "time": return "time-outline";
      case "flag": return "flag-outline";
      default: return "help-outline";
    }
  };

  return (
    <LinearGradient
      colors={["#FAFAF7", "#E8F4F8"]}
      style={styles.background}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome to Mental Health</Text>
          <Text style={styles.subtitle}>
            Let's personalize your experience
          </Text>
        </View>

        {/* Progress */}
        <Animated.View 
          entering={FadeIn.delay(100)}
          style={styles.progressContainer}
        >
          <View style={styles.progressLabels}>
            <Text style={styles.progressText}>
              Step {currentQuestionIndex + 1} of {totalVisibleQuestions}
            </Text>
            <Text style={styles.progressPercentage}>
              {Math.round(((currentQuestionIndex + 1) / totalVisibleQuestions) * 100)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={["#4A90E2", "#6BC4A1"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.progressFill,
                { width: `${((currentQuestionIndex + 1) / totalVisibleQuestions) * 100}%` }
              ]}
            />
          </View>
        </Animated.View>

        {/* Question Card */}
        <Animated.View 
          entering={FadeInDown.delay(200)}
          style={styles.questionCard}
        >
          <View style={styles.questionHeader}>
            <View style={styles.iconContainer}>
              <Ionicons 
                name={getIconName(currentQuestion.icon)} 
                size={24} 
                color="#4A90E2" 
              />
            </View>
            <Text style={styles.questionNumber}>
              Question {currentQuestionIndex + 1}
            </Text>
          </View>
          
          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => {
              const isSelected =
                currentQuestion.type === "multiple"
                  ? (answers[currentQuestion.id] as string[])?.includes(option)
                  : answers[currentQuestion.id] === option;

              return (
                <Animated.View
                  key={option}
                  entering={FadeInDown.delay(300 + index * 100)}
                >
                  <Pressable
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
                    {currentQuestion.type === "multiple" ? (
                      <View style={styles.checkbox}>
                        {isSelected && (
                          <Ionicons name="checkmark" size={16} color="#4A90E2" />
                        )}
                      </View>
                    ) : (
                      <View style={styles.radio}>
                        {isSelected && <View style={styles.radioSelected} />}
                      </View>
                    )}
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        {/* Navigation */}
        <View style={styles.navigationContainer}>
          {currentQuestionIndex > 0 && (
            <Pressable
              style={styles.backButton}
              onPress={handleBack}
            >
              <Ionicons name="arrow-back" size={18} color="#1B3C73" />
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
            <LinearGradient
              colors={["#4A90E2", "#6BC4A1"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>
                {currentQuestionIndex === totalVisibleQuestions - 1
                  ? isSubmitting
                    ? "Completing..."
                    : "Complete Setup"
                  : "Continue"}
              </Text>
              <Ionicons 
                name={currentQuestionIndex === totalVisibleQuestions - 1 ? "checkmark" : "arrow-forward"} 
                size={18} 
                color="#FFFFFF" 
              />
            </LinearGradient>
          </Pressable>
        </View>

        {/* Privacy Note */}
        <Text style={styles.privacyNote}>
          Your answers are private and secure. We use this information to personalize your experience.
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
    marginTop: 20,
  },
  welcomeText: {
    fontSize: 28,
    color: "#1B3C73",
    fontFamily: "Poppins-SemiBold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    fontFamily: "Poppins-Regular",
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins-Regular",
  },
  progressPercentage: {
    fontSize: 14,
    color: "#1B3C73",
    fontFamily: "Poppins-SemiBold",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E8F4F8",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  questionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginBottom: 32,
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F8FF",
    justifyContent: "center",
    alignItems: "center",
  },
  questionNumber: {
    fontSize: 14,
    color: "#4A90E2",
    fontFamily: "Poppins-SemiBold",
  },
  questionText: {
    fontSize: 20,
    color: "#1B3C73",
    fontFamily: "Poppins-SemiBold",
    lineHeight: 28,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: "#FAFAF7",
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E8F4F8",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: "#F0F8FF",
    borderColor: "#4A90E2",
  },
  pressedOption: {
    opacity: 0.8,
  },
  optionText: {
    fontSize: 16,
    color: "#1B3C73",
    fontFamily: "Poppins-Regular",
    flex: 1,
  },
  selectedOptionText: {
    color: "#1B3C73",
    fontFamily: "Poppins-SemiBold",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4A90E2",
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: "#1B3C73",
    fontFamily: "Poppins-SemiBold",
  },
  nextButton: {
    flex: 1,
    marginLeft: 20,
    borderRadius: 20,
    overflow: "hidden",
  },
  nextButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: "Poppins-SemiBold",
  },
  privacyNote: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    lineHeight: 18,
    opacity: 0.7,
  },
});