import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";
import NextButton from "../../../components/NextButton";
import PeriodOnboardingLayout from "./components/PeriodOnboardingLayout";

export default function PeriodWelcomeScreen() {
  const router = useRouter();

  return (
    <PeriodOnboardingLayout currentStep={1} totalSteps={8}>
      <View style={styles.content}>
        <Image
          source={require("../../../../assets/images/periods_girl.png")}
          style={styles.illustration}
          resizeMode="contain"
        />

        <Text style={styles.title}>Period Tracking</Text>
        <Text style={styles.subtitle}>
          Let's personalize your period tracking experience
        </Text>

        <Text style={styles.description}>
          Answer a few questions to help us understand your cycle better and
          provide personalized insights.
        </Text>
      </View>

      <NextButton
        onPress={() => router.push("/(home)/periods/onboarding/basic-info")}
        title="Get Started"
      />
    </PeriodOnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  illustration: {
    width: 200,
    height: 200,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: "#8E24AA", // Purple theme for periods
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#6A1B9A",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
});
