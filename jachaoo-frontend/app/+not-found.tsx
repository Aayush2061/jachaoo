// app/+not-found.tsx
import { Link } from "expo-router";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/jachao-logo.jpg")}
        style={styles.logo}
        resizeMode="contain"
      />

      <ActivityIndicator size="large" color="#1B3C73" style={styles.spinner} />

      <Text style={styles.title}>Taking you to Jachao...</Text>
      <Text style={styles.subtitle}>Please wait a moment</Text>

      <Link href="/" style={styles.link}>
        <Text style={styles.linkText}>If stuck, go to home screen</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#FAFAF7",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 40,
    borderRadius: 20,
  },
  spinner: {
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontFamily: "Poppins-SemiBold",
    color: "#1B3C73",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#666666",
    marginBottom: 40,
  },
  link: {
    marginTop: 15,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#E8F0FE",
    borderRadius: 10,
  },
  linkText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#1B3C73",
  },
});
