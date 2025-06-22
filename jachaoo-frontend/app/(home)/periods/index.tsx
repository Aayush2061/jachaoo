import { useRouter } from "expo-router";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function PeriodTrackerGetStarted() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require("@/assets/images/period-tracker.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Balance & Care</Text>
          <Text style={styles.subtitle}>
            Track your menstrual cycle, symptoms, and patterns to better
            understand your body
          </Text>
          <Pressable
            style={styles.button}
            onPress={() => router.push("/(home)/periods/onboarding")}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </Pressable>
        </View>
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
    backgroundColor: "rgba(255, 255, 255, 0.5)", // Semi-transparent white overlay
    // justifyContent: "center",
  },
  contentContainer: {
    alignItems: "center",
    padding: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 36, // Slightly larger for better visibility
    fontWeight: "bold",
    color: "#9b59b6",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    color: "#555",
    // marginTop: 200,
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 24, // Better readability
  },
  button: {
    backgroundColor: "#9b59b6",
    marginTop: 500,
    padding: 18, // Slightly larger padding
    borderRadius: 10,
    width: "80%", // Not full width for better aesthetics
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
