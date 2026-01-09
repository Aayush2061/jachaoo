// app/(home)/reports/components/AnalysisProgressScreen.tsx
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

interface AnalysisProgressScreenProps {
  status: "analyzing" | "complete" | "error";
  onComplete?: () => void;
}

export default function AnalysisProgressScreen({
  status,
  onComplete,
}: AnalysisProgressScreenProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Preparing analysis...");
  const [dot1Visible, setDot1Visible] = useState(true);
  const [dot2Visible, setDot2Visible] = useState(true);
  const [dot3Visible, setDot3Visible] = useState(true);

  // Safe avatar loader with fallbacks
  const getAvatarSource = (type: "thinking" | "success" | "idle") => {
    try {
      switch (type) {
        case "thinking":
          return require("../../../assets/avatars/report_thinking.png");
        case "success":
          return require("../../../assets/avatars/report_success.png");
        case "idle":
        default:
          return require("../../../assets/avatars/idle.png");
      }
    } catch (error) {
      return require("../../../assets/avatars/idle.png");
    }
  };

  // Animate the thinking dots
  useEffect(() => {
    if (status === "analyzing") {
      // Progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 10;

          if (newProgress < 30) {
            setStatusText("Uploading report image...");
          } else if (newProgress < 60) {
            setStatusText("Extracting report data...");
          } else if (newProgress < 90) {
            setStatusText("Analyzing medical values...");
          } else {
            setStatusText("Finalizing analysis...");
          }

          return newProgress > 100 ? 100 : newProgress;
        });
      }, 300);

      // Dot animation
      const dotInterval = setInterval(() => {
        setDot1Visible((prev) => !prev);
        setTimeout(() => {
          setDot2Visible((prev) => !prev);
          setTimeout(() => {
            setDot3Visible((prev) => !prev);
          }, 200);
        }, 200);
      }, 1000);

      return () => {
        clearInterval(progressInterval);
        clearInterval(dotInterval);
      };
    }
  }, [status]);

  // Error state - show briefly then auto-dismiss
  if (status === "error") {
    return (
      <Animated.View
        entering={FadeIn.duration(400)}
        exiting={FadeOut.duration(400)}
        style={styles.errorOverlay}
      >
        <View style={styles.errorContent}>
          <MaterialIcons name="error-outline" size={60} color="#e74c3c" />
          <Text style={styles.errorText}>Analysis Failed</Text>
          <Text style={styles.errorSubText}>Please try again</Text>
        </View>
      </Animated.View>
    );
  }

  // Main analyzing/success screen
  return (
    <LinearGradient colors={["#f0f7ff", "#e6f0ff"]} style={styles.container}>
      <View style={styles.content}>
        {/* Animated Avatar */}
        <Animated.View
          style={styles.avatarContainer}
          entering={FadeIn.duration(600)}
        >
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarGlow} />
            <Image
              source={getAvatarSource(
                status === "complete" ? "success" : "thinking"
              )}
              style={styles.avatar}
              resizeMode="contain"
            />
          </View>

          {/* Status Badge */}
          {status === "complete" && (
            <Animated.View
              entering={FadeIn.delay(300).duration(500)}
              style={styles.successBadge}
            >
              <MaterialIcons name="check-circle" size={30} color="#2ecc71" />
            </Animated.View>
          )}

          {/* Thinking Animation Dots - Only show when analyzing */}
          {status === "analyzing" && (
            <View style={styles.thinkingDots}>
              <View
                style={[
                  styles.thinkingDot,
                  styles.dot1,
                  { opacity: dot1Visible ? 0.6 : 0.2 },
                ]}
              />
              <View
                style={[
                  styles.thinkingDot,
                  styles.dot2,
                  { opacity: dot2Visible ? 0.8 : 0.3 },
                ]}
              />
              <View
                style={[
                  styles.thinkingDot,
                  styles.dot3,
                  { opacity: dot3Visible ? 1 : 0.4 },
                ]}
              />
            </View>
          )}
        </Animated.View>

        {/* Status Title */}
        <Text
          style={[
            styles.statusText,
            status === "complete" && styles.successText,
            status === "error" && styles.errorText,
          ]}
        >
          {status === "complete" ? "Analysis Complete! 🎉" : statusText}
        </Text>

        {/* Status Subtitle */}
        <Text style={styles.subText}>
          {status === "complete"
            ? "Your report is ready. Detailed analysis available on the next screen."
            : "This may take a few moments. Please don't close the app."}
        </Text>

        {/* Progress Bar - Only show when analyzing */}
        {status === "analyzing" && (
          <Animated.View
            entering={FadeIn.duration(400)}
            style={styles.progressSection}
          >
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${progress}%` }]}
                />
              </View>
              <Text style={styles.progressText}>{progress}%</Text>
            </View>
          </Animated.View>
        )}

        {/* Success Checkmarks - Show when complete */}
        {status === "complete" && (
          <Animated.View
            entering={FadeIn.delay(500).duration(600)}
            style={styles.successDetails}
          >
            <View style={styles.successDetailItem}>
              <MaterialIcons name="check-circle" size={24} color="#2ecc71" />
              <Text style={styles.successDetailText}>Report analyzed</Text>
            </View>
            <View style={styles.successDetailItem}>
              <MaterialIcons name="check-circle" size={24} color="#2ecc71" />
              <Text style={styles.successDetailText}>
                Recommendations generated
              </Text>
            </View>
            <View style={styles.successDetailItem}>
              <MaterialIcons name="check-circle" size={24} color="#2ecc71" />
              <Text style={styles.successDetailText}>Ready to view</Text>
            </View>
          </Animated.View>
        )}

        {/* Analysis Details - Only show when analyzing */}
        {status === "analyzing" && (
          <Animated.View
            entering={FadeIn.delay(300).duration(500)}
            style={styles.detailsContainer}
          >
            <View style={styles.detailItem}>
              <MaterialIcons name="check-circle" size={20} color="#4a90e2" />
              <Text style={styles.detailText}>
                Report uploaded successfully
              </Text>
            </View>

            <View style={styles.detailItem}>
              <MaterialIcons
                name="check-circle"
                size={20}
                color={progress > 30 ? "#4a90e2" : "#ccc"}
              />
              <Text
                style={[
                  styles.detailText,
                  progress > 30 ? styles.detailActive : styles.detailInactive,
                ]}
              >
                Extracting medical data
              </Text>
            </View>

            <View style={styles.detailItem}>
              <MaterialIcons
                name="check-circle"
                size={20}
                color={progress > 60 ? "#4a90e2" : "#ccc"}
              />
              <Text
                style={[
                  styles.detailText,
                  progress > 60 ? styles.detailActive : styles.detailInactive,
                ]}
              >
                Analyzing biomarkers
              </Text>
            </View>

            <View style={styles.detailItem}>
              <MaterialIcons
                name="check-circle"
                size={20}
                color={progress > 90 ? "#4a90e2" : "#ccc"}
              />
              <Text
                style={[
                  styles.detailText,
                  progress > 90 ? styles.detailActive : styles.detailInactive,
                ]}
              >
                Generating recommendations
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Redirecting Indicator - Show when complete */}
        {status === "complete" && (
          <Animated.View
            entering={FadeIn.delay(800).duration(400)}
            style={styles.redirectingContainer}
          >
            <ActivityIndicator size="small" color="#4a90e2" />
            <Text style={styles.redirectingText}>
              Redirecting to results...
            </Text>
          </Animated.View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  content: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },

  // Avatar Styles
  avatarContainer: {
    alignItems: "center",
    marginBottom: 40,
    position: "relative",
  },

  avatarWrapper: {
    width: 250,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  avatarGlow: {
    position: "absolute",
    width: 220,
    height: 140,
    borderRadius: 100,
    backgroundColor: "rgba(74, 144, 226, 0.2)",
    zIndex: -1,
  },

  avatar: {
    width: 220,
    height: 140,
  },

  successBadge: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  // Thinking Animation Dots
  thinkingDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  thinkingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4a90e2",
    marginHorizontal: 4,
  },

  dot1: {},
  dot2: {},
  dot3: {},

  // Text Styles
  statusText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 12,
  },

  successText: {
    color: "#2ecc71",
  },

  errorText: {
    color: "#e74c3c",
  },

  subText: {
    fontSize: 15,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },

  // Progress Section
  progressSection: {
    width: "100%",
    marginBottom: 30,
  },

  progressContainer: {
    width: "100%",
    alignItems: "center",
  },

  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: "#e0e6ed",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#4a90e2",
    borderRadius: 4,
  },

  progressText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
  },

  // Details Container
  detailsContainer: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },

  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  detailText: {
    fontSize: 15,
    marginLeft: 12,
    flex: 1,
  },

  detailActive: {
    color: "#2c3e50",
    fontWeight: "500",
  },

  detailInactive: {
    color: "#ccc",
  },

  // Success Details
  successDetails: {
    width: "100%",
    backgroundColor: "#f0fff4",
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#d1fae5",
  },

  successDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  successDetailText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
    color: "#065f46",
    fontWeight: "500",
  },

  // Redirecting
  redirectingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },

  redirectingText: {
    fontSize: 14,
    color: "#4a90e2",
    marginLeft: 10,
  },

  // Error Overlay
  errorOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 245, 245, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },

  errorContent: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "white",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },

  errorSubText: {
    fontSize: 14,
    color: "#c0392b",
    textAlign: "center",
    marginTop: 8,
  },
});
