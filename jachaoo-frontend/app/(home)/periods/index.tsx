import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function PeriodTrackerGetStarted() {
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    const checkPeriodData = async () => {
      try {
        if (!user?.id) return;

        const token = await getToken();
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/periods/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (data.exists !== false) {
          // User has period data, go to dashboard
          router.replace("/(home)/periods/dashboard");
        } else {
          // No period data, go directly to onboarding
          router.replace("/(home)/periods/onboarding/welcome");
        }
      } catch (error) {
        console.error("Error checking period data:", error);
        // On error, still go to onboarding
        router.replace("/(home)/periods/onboarding/welcome");
      }
    };

    checkPeriodData();
  }, [user?.id]);

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#9b59b6" />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
