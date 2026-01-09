import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import NextButton from "../../../components/NextButton";
import PeriodOnboardingLayout from "./components/PeriodOnboardingLayout";
import { periodData } from "./period-data";

export default function SummaryScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/periods`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: user?.id,
            ...periodData,
            // Convert Date to ISO string for API
            lastPeriodDate: periodData.lastPeriodDate?.toISOString(),
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to save period data");

      // Clear the period data after successful submission
      Object.keys(periodData).forEach((key) => {
        const k = key as keyof typeof periodData;
        if (Array.isArray(periodData[k])) {
          (periodData[k] as any) = [];
        } else if (periodData[k] instanceof Date) {
          periodData[k] = null;
        } else {
          periodData[k] = null;
        }
      });

      Alert.alert(
        "Success!",
        "Your period tracking has been set up successfully.",
        [
          {
            text: "Go to Dashboard",
            onPress: () => router.replace("/(home)/periods/dashboard"),
          },
        ]
      );
    } catch (error) {
      console.error("Error saving period data:", error);
      Alert.alert(
        "Error",
        "Failed to save your period information. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (step: number) => {
    const routes = [
      "basic-info", // Step 2
      "symptoms", // Step 3
      "appearance", // Step 4
      "conditions", // Step 5
      "contraceptive", // Step 6
      "concern", // Step 7 (Main Concern)
    ];

    if (step >= 2 && step <= 7) {
      const routeIndex = step - 2; // Convert step to array index
      if (routeIndex < routes.length) {
        // console.log(
        //   `Navigating to: /(home)/periods/onboarding/${routes[routeIndex]}`
        // );
        router.push(`/(home)/periods/onboarding/${routes[routeIndex]}`);
      }
    }
  };

  const getSummaryItems = () => {
    return [
      {
        title: "Basic Information",
        step: 2,
        details: [
          `Last period: ${
            periodData.lastPeriodDate?.toLocaleDateString() || "Not set"
          }`,
          `Duration: ${periodData.duration || "?"} days`,
          `Cycle length: ${periodData.cycleLength || "?"} days`,
        ],
      },
      {
        title: "Symptoms",
        step: 3,
        details:
          periodData.symptoms.length > 0
            ? periodData.symptoms.filter((s) => s !== "None of the above")
            : ["None selected"],
      },
      {
        title: "Flow Appearance",
        step: 4,
        details: [periodData.appearance || "Not selected"],
      },
      {
        title: "Conditions",
        step: 5,
        details:
          periodData.conditions.length > 0
            ? periodData.conditions.filter((c) => c !== "None of the above")
            : ["None selected"],
      },
      {
        title: "Reproductive Health",
        step: 6,
        details: [
          `Contraceptive: ${periodData.contraceptive || "Not selected"}`,
          `Trying to conceive: ${
            periodData.tryingToConceive || "Not selected"
          }`,
        ],
      },
      {
        title: "Main Concern",
        step: 7,
        details: [periodData.mainConcern || "Not selected"],
      },
    ];
  };

  if (isSubmitting) {
    return (
      <PeriodOnboardingLayout currentStep={8} totalSteps={8}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8E24AA" />
          <Text style={styles.loadingText}>Saving your period profile...</Text>
        </View>
      </PeriodOnboardingLayout>
    );
  }

  return (
    <PeriodOnboardingLayout currentStep={8} totalSteps={8}>
      <View style={styles.content}>
        <Text style={styles.title}>Review Your Information</Text>
        <Text style={styles.subtitle}>
          Please review and submit your period profile
        </Text>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {getSummaryItems().map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.summaryCard}
              onPress={() => handleEdit(item.step)}
            >
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryTitle}>{item.title}</Text>
                <Text style={styles.editText}>Edit</Text>
              </View>
              {item.details.map((detail, idx) => (
                <Text key={idx} style={styles.summaryDetail}>
                  • {detail}
                </Text>
              ))}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <NextButton
        onPress={handleComplete}
        title={isSubmitting ? "Saving..." : "Complete Setup"}
        disabled={isSubmitting}
      />
    </PeriodOnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: "#8E24AA",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
    marginBottom: 24,
  },
  scrollView: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#1F2937",
  },
  editText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#8E24AA",
  },
  summaryDetail: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#8E24AA",
  },
});
