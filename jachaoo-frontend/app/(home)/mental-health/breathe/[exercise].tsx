// app/(home)/mental-health/breathe/[exercise].tsx
import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  SafeAreaView,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import MentalHealthBackground from "../MentalHealthBackground";

const { width } = Dimensions.get("window");

// Your Cloudinary audio URLs
const AUDIO_URLS = {
  "four-seven-eight":
    "https://res.cloudinary.com/drgny2hcw/video/upload/v1767717212/4_7_8_breathing_Audio_sx4w7a.mp3",
  "box-breathing":
    "https://res.cloudinary.com/drgny2hcw/video/upload/v1767717212/Box_breathing_Audio_g2un46.mp3",
  "coherent-breathing":
    "https://res.cloudinary.com/drgny2hcw/video/upload/v1767717213/Coherent_breathing_Audio_pgvjsv.mp3",
};

const EXERCISES = {
  "four-seven-eight": {
    title: "4-7-8 Breathing",
    description: "Calms your nervous system",
    steps: [
      "Inhale for 4 seconds",
      "Hold for 7 seconds",
      "Exhale for 8 seconds",
    ],
    benefits: ["Reduces anxiety", "Improves sleep", "Calms the mind"],
    phases: [
      { label: "INHALE", duration: 4000, color: "#3498db" },
      { label: "HOLD", duration: 7000, color: "#9b59b6" },
      { label: "EXHALE", duration: 8000, color: "#2ecc71" },
    ],
    audioUrl: AUDIO_URLS["four-seven-eight"],
  },
  "box-breathing": {
    title: "Box Breathing",
    description: "Increases focus and reduces stress",
    steps: [
      "Inhale for 4 seconds",
      "Hold for 4 seconds",
      "Exhale for 4 seconds",
      "Hold for 4 seconds",
    ],
    benefits: [
      "Improves concentration",
      "Reduces stress",
      "Regulates breathing",
    ],
    phases: [
      { label: "INHALE", duration: 4000, color: "#3498db" },
      { label: "HOLD", duration: 4000, color: "#2980b9" },
      { label: "EXHALE", duration: 4000, color: "#2ecc71" },
      { label: "HOLD", duration: 4000, color: "#27ae60" },
    ],
    audioUrl: AUDIO_URLS["box-breathing"],
  },
  "coherent-breathing": {
    title: "Coherent Breathing",
    description: "Balances emotions and steadies the mind",
    steps: ["Inhale for 5 seconds", "Exhale for 5 seconds"],
    benefits: ["Emotional balance", "Reduces anxiety", "Improves heart rate"],
    phases: [
      { label: "INHALE", duration: 5000, color: "#3498db" },
      { label: "EXHALE", duration: 5000, color: "#2ecc71" },
    ],
    audioUrl: AUDIO_URLS["coherent-breathing"],
  },
};

export default function BreathingExercise() {
  const { exercise } = useLocalSearchParams();
  const router = useRouter();

  const [isActive, setIsActive] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [showInstruction, setShowInstruction] = useState(true);

  const soundRef = useRef<Audio.Sound | null>(null);

  const exerciseData =
    EXERCISES[exercise as keyof typeof EXERCISES] ||
    EXERCISES["four-seven-eight"];

  // Initialize audio on mount
  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    return () => {
      cleanup();
    };
  }, []);

  const cleanup = async () => {
    // Unload audio
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (error) {
        console.log("Error cleaning up audio:", error);
      }
    }
  };

  const loadAudio = async () => {
    if (!exerciseData.audioUrl) return;

    try {
      setIsLoadingAudio(true);
      console.log("Loading audio:", exerciseData.audioUrl);

      const { sound } = await Audio.Sound.createAsync(
        { uri: exerciseData.audioUrl },
        { shouldPlay: false }
      );

      // Add playback status update listener
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          if (status.didJustFinish) {
            console.log("Audio finished playing");
            setIsActive(false);
            setShowInstruction(false); // Show completion screen
          }
        }
      });

      soundRef.current = sound;
      setAudioLoaded(true);
      console.log("Audio loaded successfully");
    } catch (error) {
      console.error("Error loading audio:", error);
      Alert.alert(
        "Audio Error",
        "Could not load audio guide. Please check your internet connection."
      );
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const startExercise = async () => {
    // Load audio first if not loaded
    if (!soundRef.current) {
      await loadAudio();
    }

    if (!soundRef.current) {
      Alert.alert("Error", "Could not load audio. Please try again.");
      return;
    }

    setIsActive(true);
    setShowInstruction(false);

    // Start playing audio
    try {
      await soundRef.current.replayAsync();
    } catch (error) {
      console.error("Error playing audio:", error);
      Alert.alert("Playback Error", "Could not play audio. Please try again.");
      setIsActive(false);
      setShowInstruction(true);
    }
  };

  const stopExercise = async () => {
    setIsActive(false);
    setShowInstruction(true);

    // Stop audio
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
      } catch (error) {
        console.error("Error stopping audio:", error);
      }
    }
  };

  const pauseExercise = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.pauseAsync();
        setIsActive(false);
      } catch (error) {
        console.error("Error pausing audio:", error);
      }
    }
  };

  const resumeExercise = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.playAsync();
        setIsActive(true);
      } catch (error) {
        console.error("Error resuming audio:", error);
      }
    }
  };

  return (
    <MentalHealthBackground>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              stopExercise();
              router.back();
            }}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color="#2c3e50" />
          </Pressable>
          <Text style={styles.headerTitle}>{exerciseData.title}</Text>
          <View style={styles.placeholder} />
        </View>

        {showInstruction ? (
          // Instruction View
          <View style={styles.instructionContainer}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🌬</Text>
            </View>

            <Text style={styles.exerciseTitle}>{exerciseData.title}</Text>
            <Text style={styles.exerciseDescription}>
              {exerciseData.description}
            </Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What this does:</Text>
              {exerciseData.benefits.map((benefit, index) => (
                <View key={index} style={styles.bulletPoint}>
                  <Ionicons name="checkmark-circle" size={20} color="#2ecc71" />
                  <Text style={styles.bulletText}>{benefit}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How to do it:</Text>
              {exerciseData.steps.map((step, index) => (
                <View key={index} style={styles.bulletPoint}>
                  <Ionicons name="ellipse" size={10} color="#3498db" />
                  <Text style={styles.bulletText}>{step}</Text>
                </View>
              ))}
            </View>

            <View style={styles.audioNote}>
              <Ionicons name="headset" size={20} color="#3498db" />
              <Text style={styles.audioNoteText}>
                Includes guided audio instructions
              </Text>
            </View>

            <Pressable
              style={[
                styles.startButton,
                isLoadingAudio && styles.startButtonDisabled,
              ]}
              onPress={startExercise}
              disabled={isLoadingAudio}
            >
              {isLoadingAudio ? (
                <>
                  <Ionicons name="time-outline" size={24} color="white" />
                  <Text style={styles.startButtonText}>Loading Audio...</Text>
                </>
              ) : audioLoaded ? (
                <>
                  <Ionicons name="play" size={24} color="white" />
                  <Text style={styles.startButtonText}>
                    Start Guided Session
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="download" size={24} color="white" />
                  <Text style={styles.startButtonText}>
                    Load & Start Session
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        ) : isActive ? (
          // Active Session View
          <View style={styles.sessionContainer}>
            <View style={styles.audioPlayingContainer}>
              <View style={styles.playingIcon}>
                <Ionicons name="volume-high" size={40} color="#3498db" />
              </View>

              <Text style={styles.listeningTitle}>Listening to Guide</Text>
              <Text style={styles.listeningSubtitle}>
                Follow the audio instructions
              </Text>

              <View style={styles.phaseIndicator}>
                {exerciseData.phases.map((phase, index) => (
                  <View key={index} style={styles.phaseItem}>
                    <View
                      style={[
                        styles.phaseDot,
                        { backgroundColor: phase.color },
                      ]}
                    />
                    <Text style={styles.phaseLabel}>{phase.label}</Text>
                    <Text style={styles.phaseDuration}>
                      {phase.duration / 1000}s
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.audioControls}>
                <Pressable style={styles.pauseButton} onPress={pauseExercise}>
                  <Ionicons name="pause" size={24} color="white" />
                  <Text style={styles.pauseButtonText}>Pause</Text>
                </Pressable>

                <Pressable style={styles.stopButton} onPress={stopExercise}>
                  <Ionicons name="stop" size={24} color="white" />
                  <Text style={styles.stopButtonText}>Stop</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : (
          // Paused or Completed View
          <View style={styles.sessionContainer}>
            <View style={styles.pausedContainer}>
              <View style={styles.pausedIcon}>
                <Ionicons name="pause-circle" size={60} color="#f39c12" />
              </View>

              <Text style={styles.pausedTitle}>
                {soundRef.current ? "Session Paused" : "Session Completed"}
              </Text>
              <Text style={styles.pausedSubtitle}>
                {soundRef.current
                  ? "Tap resume to continue"
                  : "Great job! You completed the breathing exercise."}
              </Text>

              <View style={styles.resumeControls}>
                {soundRef.current ? (
                  <Pressable
                    style={styles.resumeButton}
                    onPress={resumeExercise}
                  >
                    <Ionicons name="play" size={24} color="white" />
                    <Text style={styles.resumeButtonText}>Resume Session</Text>
                  </Pressable>
                ) : null}

                <Pressable
                  style={styles.restartButton}
                  onPress={() => {
                    stopExercise();
                    setShowInstruction(true);
                  }}
                >
                  <Ionicons name="refresh" size={24} color="#3498db" />
                  <Text style={styles.restartButtonText}>
                    Start New Session
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </MentalHealthBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  instructionContainer: {
    flex: 1,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 20,
  },
  icon: {
    fontSize: 64,
  },
  exerciseTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 8,
  },
  exerciseDescription: {
    fontSize: 18,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 30,
  },
  section: {
    width: "100%",
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 12,
  },
  bulletPoint: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 12,
  },
  bulletText: {
    fontSize: 16,
    color: "#34495e",
    flex: 1,
    lineHeight: 22,
  },
  audioNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f4fc",
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  audioNoteText: {
    fontSize: 14,
    color: "#3498db",
    fontWeight: "500",
  },
  startButton: {
    backgroundColor: "#3498db",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  startButtonDisabled: {
    backgroundColor: "#95a5a6",
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  sessionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  audioPlayingContainer: {
    alignItems: "center",
    width: "100%",
  },
  playingIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e8f4fc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  listeningTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 8,
  },
  listeningSubtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 40,
  },
  phaseIndicator: {
    width: "100%",
    gap: 12,
    marginBottom: 40,
  },
  phaseItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    gap: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  phaseDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  phaseLabel: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
  },
  phaseDuration: {
    fontSize: 16,
    color: "#7f8c8d",
    fontWeight: "500",
  },
  audioControls: {
    flexDirection: "row",
    gap: 20,
    width: "100%",
  },
  pauseButton: {
    flex: 1,
    backgroundColor: "#f39c12",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  pauseButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  stopButton: {
    flex: 1,
    backgroundColor: "#e74c3c",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  pausedContainer: {
    alignItems: "center",
    width: "100%",
  },
  pausedIcon: {
    marginBottom: 24,
  },
  pausedTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 8,
  },
  pausedSubtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  resumeControls: {
    width: "100%",
    gap: 16,
  },
  resumeButton: {
    backgroundColor: "#2ecc71",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  resumeButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  restartButton: {
    backgroundColor: "white",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: "#3498db",
  },
  restartButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3498db",
  },
});
