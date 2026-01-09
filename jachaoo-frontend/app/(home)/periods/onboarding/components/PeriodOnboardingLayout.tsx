import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import ProgressBar from "../../../../components/ProgressBar";

interface PeriodOnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
}

export default function PeriodOnboardingLayout({
  children,
  currentStep,
  totalSteps,
}: PeriodOnboardingLayoutProps) {
  return (
    <LinearGradient
      colors={["#FCE4EC", "#F3E5F5"]} // Soft pink/purple gradient for period theme
      style={styles.container}
    >
      <View style={styles.content}>
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        {children}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
});
