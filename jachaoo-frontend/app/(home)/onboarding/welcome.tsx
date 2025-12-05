import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";
import NextButton from "../../components/NextButton";
import OnboardingLayout from "../../components/OnboardingLayout";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <OnboardingLayout currentStep={1} totalSteps={9}>
      <View style={styles.content}>
        <Image
          source={require("../../../assets/images/heart-icon.png")} // Add your illustration
          style={styles.illustration}
          resizeMode="contain"
        />

        <Text style={styles.title}>Welcome to Jachao</Text>
        <Text style={styles.subtitle}>
          Let's personalize your health experience
        </Text>

        <Text style={styles.disclaimer}>
          Disclaimer: Jachao provides AI-based health insights for informational
          purposes only. It is not a substitute for professional medical advice,
          diagnosis, or treatment. Always consult a healthcare professional.
        </Text>
      </View>

      <NextButton
        onPress={() => router.push("/(home)/onboarding/name")}
        title="Start"
      />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  illustration: {
    width: 120,
    height: 120,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: "#0F3A5D",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
  disclaimer: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#9CA3AF", // subtle gray
    textAlign: "center",
    marginTop: 20,
    paddingHorizontal: 20,
    lineHeight: 16,
  },
});
