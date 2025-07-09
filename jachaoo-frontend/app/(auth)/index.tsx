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
          source={require("../../assets/images/react-logo.png")} // Your app logo
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <TouchableOpacity
        style={[styles.googleButton, isLoading && styles.buttonDisabled]}
        onPress={onGoogleSignIn}
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
    backgroundColor: "#ffffff",
  },
  logoContainer: {
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 50,
    color: "#666",
  },
  googleButton: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    minWidth: 280,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  googleIcon: {
    width: 30,
    height: 30,
  },
  buttonDisabled: {
    backgroundColor: "#f0f0f0",
    opacity: 0.7,
  },
  googleButtonText: {
    color: "#444",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
});
