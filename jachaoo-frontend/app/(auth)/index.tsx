import { useOAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

WebBrowser.maybeCompleteAuthSession(); // Required for handling redirects

export default function LoginScreen() {
  // ✅ Correct warm-up logic
  useEffect(() => {
    WebBrowser.warmUpAsync();

    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const [isLoading, setIsLoading] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);
  const router = useRouter();

  const onGoogleSignIn = React.useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const { createdSessionId, setActive } = await startOAuthFlow();

      if (createdSessionId) {
        await setActive?.({ session: createdSessionId });
        router.replace("/");
      }
    } catch (err: any) {
      console.error("OAuth error:", err);
      Alert.alert("Error", "Failed to sign in with Google");
    } finally {
      setIsLoading(false);
    }
  }, [startOAuthFlow, isLoading]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/jachao-logo.jpg")} // Your app logo
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>Welcome to Jachao</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <TouchableOpacity
        style={[
          styles.googleButton,
          isLoading && styles.buttonDisabled,
          isPressed && styles.buttonPressed,
        ]}
        onPress={onGoogleSignIn}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        disabled={isLoading}
      >
        <View style={styles.buttonContent}>
          <Image
            source={require("../../assets/images/google-logo.png")}
            style={styles.googleIcon}
            resizeMode="contain"
          />
          <Text style={styles.googleButtonText}>
            {isLoading ? "Signing in..." : "Continue with Google"}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By continuing, you agree to our Terms of Service
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F9FAFB",
  },
  logoContainer: {
    marginTop: 100,
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 28,
    fontFamily: "Poppins-Bold", // or "Inter" depending on which font you prefer
    // fontWeight: "700",
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
  },
  googleButton: {
    backgroundColor: "#FFFFFF",
    width: "85%", // 80-85% of screen width
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 40,
    // Shadow for depth (optional)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingLeft: 24, // Icon left padding
  },
  googleIcon: {
    width: 22,
    height: 22,
    marginRight: 12,
  },
  buttonDisabled: {
    backgroundColor: "#f0f0f0",
    opacity: 0.7,
  },
  // For pressed state - you'll need to handle this with state
  buttonPressed: {
    backgroundColor: "#F3F4F6",
    transform: [{ scale: 0.97 }],
  },
  googleButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold", // Weight 600 = SemiBold
    color: "#1F2937",
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#9CA3AF",
    marginTop: 40,
    textAlign: "center",
  },
});
