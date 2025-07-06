// import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
// import { useEffect, useState } from "react";
import {
  Image,
  //   ActivityIndicator,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function PeriodTrackerGetStarted() {
  const router = useRouter();
  //   const { user } = useUser();
  //   const { getToken } = useAuth();
  //   const [isChecking, setIsChecking] = useState(true);

  //   useEffect(() => {
  //     const checkPeriodData = async () => {
  //       try {
  //         if (!user?.id) return;
  //         setIsChecking(true); //this is added to add loading page at the time when checks at database whether user has filled the onboarding page or not
  //         const token = await getToken();
  //         const response = await fetch(
  //           `${process.env.EXPO_PUBLIC_API_URL}/periods/${user.id}`,
  //           {
  //             headers: {
  //               Authorization: `Bearer ${token}`,
  //             },
  //           }
  //         );
  //         // const text = await response.text();
  //         // console.log("Raw response:", text);
  //         const data = await response.json();

  //         if (data.exists !== false) {
  //           router.replace("/(home)/periods/dashboard");
  //         }
  //       } catch (error) {
  //         console.error("Error checking period data:", error);
  //       } finally {
  //         setIsChecking(false);
  //       }
  //     };

  //     checkPeriodData();
  //   }, [user?.id]);

  //   if (isChecking) {
  //     return (
  //       <View style={styles.loadingContainer}>
  //         <ActivityIndicator size="large" color="#9b59b6" />
  //       </View>
  //     );
  //   }

  return (
    <ImageBackground
      source={require("@/assets/images/mental-health-background.jpg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Own Your Peace</Text>

          {/* Centered Butterfly Image */}
          <Image
            source={require("@/assets/images/butterfly1.png")}
            style={styles.butterflyImage}
            resizeMode="contain"
          />

          <Pressable
            style={styles.button}
            onPress={() => router.push("/(home)/mental-health/onboarding")}
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
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    justifyContent: "center",
  },
  contentContainer: {
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2980b9", // Changed to blue to match mental health theme
    marginBottom: 100,
    textAlign: "center",
  },
  butterflyImage: {
    width: 250,
    height: 250,
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#2980b9", // Blue button to match theme
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30, // More rounded corners
    width: "70%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginTop: 50,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
