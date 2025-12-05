import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

export default function SymptomGreeting() {
  const router = useRouter();

  return (
    <LinearGradient colors={["#E3ECFF", "#FFFFFF"]} style={styles.container}>
      <View style={styles.inner}>
        {/* Avatar + Chat Bubble Wrapper */}
        <View style={{ alignItems: "center", width: "100%" }}>
          {/* Chat Bubble */}
          {/* <Animated.View
            entering={FadeInUp.delay(100).duration(600)}
            style={styles.chatBubble}
          >
            <Text style={styles.chatText}>Hi! I'm here to help 😊</Text>
          </Animated.View> */}

          {/* Avatar */}
          <Animated.View
            entering={FadeInUp.duration(700)}
            style={styles.avatarWrapper}
          >
            <View style={styles.glow} />
            <Image
              source={require("../../../assets/avatars/idle.png")}
              style={styles.avatar}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        {/* Greeting Text */}
        <Animated.Text
          entering={FadeInUp.delay(200).duration(600)}
          style={styles.title}
        >
          Let’s begin your symptom check
        </Animated.Text>

        <Animated.Text
          entering={FadeInUp.delay(300).duration(600)}
          style={styles.subtitle}
        >
          Answer a few simple questions and get personalized guidance.
        </Animated.Text>

        {/* Button */}
        <Animated.View
          entering={FadeInUp.delay(400).duration(600)}
          style={styles.buttonWrapper}
        >
          <TouchableOpacity
            style={styles.startButton}
            activeOpacity={0.8}
            onPress={() => router.push("/(home)/symptoms/diagnose")}
          >
            <Text style={styles.buttonText}>Begin Diagnosis</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Privacy Note */}
        <Animated.Text entering={FadeInDown.delay(500)} style={styles.safeNote}>
          🔒 Your answers are private and secure
        </Animated.Text>

        <Animated.Text
          entering={FadeInDown.delay(500)}
          style={{
            fontSize: 12,
            color: "#6B7280",
            textAlign: "center",
            marginTop: 24,
            marginBottom: 10,
            fontFamily: "Poppins-Regular",
            lineHeight: 18,
          }}
        >
          Results are not a substitute for professional medical advice,
          diagnosis, or treatment. Consult a healthcare provider for any health
          decisions.
        </Animated.Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  inner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  // Chat Bubble
  chatBubble: {
    maxWidth: "75%",
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    // marginBottom: 10,
  },

  chatText: {
    fontSize: 15,
    color: "#0F3A5D",
    fontFamily: "Poppins-Medium",
  },

  // Avatar section
  avatarWrapper: {
    width: "100%",
    height: 260,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  glow: {
    position: "absolute",
    width: 260,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(79, 124, 255, 0.20)",
    zIndex: -1,
  },

  avatar: {
    width: 260,
    height: 160,
  },

  // Greeting Text
  title: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#0F3A5D",
    letterSpacing: 0.2,
  },

  subtitle: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    textAlign: "center",
    marginBottom: 40,
    color: "#6B7280",
    lineHeight: 22,
    width: "85%",
  },

  // Button
  buttonWrapper: {
    width: "100%",
    alignItems: "center",
  },

  startButton: {
    backgroundColor: "#4F7CFF",
    paddingVertical: 16,
    width: "80%",
    borderRadius: 16,
    shadowColor: "#4F7CFF",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },

  buttonText: {
    color: "#FFF",
    textAlign: "center",
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
  },

  // Safe note
  safeNote: {
    marginTop: 16,
    fontSize: 13,
    color: "#777",
    textAlign: "center",
  },
});
