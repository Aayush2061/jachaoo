// app/(home)/mental-health/breathe/[exercise].tsx
import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Animated,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";

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
    description: "Calms anxiety, improves sleep",
    steps: ["Inhale for 4 seconds", "Hold for 7 seconds", "Exhale for 8 seconds"],
    audioUrl: AUDIO_URLS["four-seven-eight"],
  },
  "box-breathing": {
    title: "Box Breathing",
    description: "Increases focus, reduces stress",
    steps: ["Inhale for 4 seconds", "Hold for 4 seconds", "Exhale for 4 seconds", "Hold for 4 seconds"],
    audioUrl: AUDIO_URLS["box-breathing"],
  },
  "coherent-breathing": {
    title: "Coherent Breathing",
    description: "Balances emotions, steadies mind",
    steps: ["Inhale for 5 seconds", "Exhale for 5 seconds"],
    audioUrl: AUDIO_URLS["coherent-breathing"],
  },
};

export default function BreathingExercise() {
  const { exercise } = useLocalSearchParams();
  const router = useRouter();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const exerciseData = EXERCISES[exercise as keyof typeof EXERCISES] || EXERCISES["four-seven-eight"];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();

    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    });

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const loadAndPlayAudio = async () => {
    try {
      setIsLoading(true);
      
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: exerciseData.audioUrl },
        { shouldPlay: false }
      );

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });

      soundRef.current = sound;
      await sound.playAsync();
      setIsPlaying(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error("Audio error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayback = async () => {
    if (!soundRef.current) {
      await loadAndPlayAudio();
      return;
    }

    try {
      const status = await soundRef.current.getStatusAsync();
      
      if (status.isLoaded) {
        if (status.isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
        } else {
          await soundRef.current.playAsync();
          setIsPlaying(true);
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error("Playback error:", error);
    }
  };

  const stopAudio = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      } catch (error) {
        console.error("Stop error:", error);
      }
    }
    setIsPlaying(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleBack = () => {
    stopAudio();
    router.back();
  };

  return (
    <SafeAreaView style={styles.background}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable 
            onPress={handleBack}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#1B3C73" />
          </Pressable>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{exerciseData.title}</Text>
            <Text style={styles.subtitle}>{exerciseData.description}</Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Steps List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How to practice:</Text>
            <View style={styles.stepsContainer}>
              {exerciseData.steps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Audio Player */}
          <View style={styles.audioPlayer}>
            <View style={styles.playerHeader}>
              <Ionicons name="headset" size={22} color="#4A90E2" />
              <Text style={styles.playerTitle}>Guided Audio Session</Text>
            </View>
            
            <View style={styles.playerControls}>
              <Pressable
                onPress={togglePlayback}
                disabled={isLoading}
                style={[
                  styles.playButton,
                  isPlaying && styles.playButtonActive
                ]}
              >
                {isLoading ? (
                  <Ionicons name="time" size={28} color="#FFFFFF" />
                ) : isPlaying ? (
                  <Ionicons name="pause" size={28} color="#FFFFFF" />
                ) : (
                  <Ionicons name="play" size={28} color="#FFFFFF" />
                )}
              </Pressable>
              
              {isPlaying && (
                <Pressable onPress={stopAudio} style={styles.stopButton}>
                  <Ionicons name="stop" size={24} color="#FFFFFF" />
                </Pressable>
              )}
            </View>
            
            <Text style={styles.playerHint}>
              {isLoading ? "Loading audio..." : 
               isPlaying ? "Playing guided session..." : 
               "Tap play to start"}
            </Text>
          </View>

          {/* Tips */}
          <View style={styles.tipsSection}>
            <Text style={styles.sectionTitle}>Tips:</Text>
            <View style={styles.tipsContainer}>
              <View style={styles.tipItem}>
                <Ionicons name="body" size={18} color="#4A90E2" />
                <Text style={styles.tipText}>Sit comfortably</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="eye-off" size={18} color="#4A90E2" />
                <Text style={styles.tipText}>Close your eyes</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="volume-high" size={18} color="#4A90E2" />
                <Text style={styles.tipText}>Use headphones</Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#FAFAF7",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 24,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    color: "#1B3C73",
    fontFamily: "Poppins-SemiBold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins-Regular",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#1B3C73",
    fontFamily: "Poppins-SemiBold",
    marginBottom: 16,
  },
  stepsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontFamily: "Poppins-SemiBold",
  },
  stepText: {
    fontSize: 15,
    color: "#1B3C73",
    fontFamily: "Poppins-Regular",
    flex: 1,
    lineHeight: 22,
  },
  audioPlayer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 28,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  playerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  playerTitle: {
    fontSize: 16,
    color: "#1B3C73",
    fontFamily: "Poppins-SemiBold",
    marginLeft: 10,
  },
  playerControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginBottom: 16,
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
  },
  playButtonActive: {
    backgroundColor: "#3A80D2",
  },
  stopButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E74C3C",
    justifyContent: "center",
    alignItems: "center",
  },
  playerHint: {
    fontSize: 13,
    color: "#666",
    fontFamily: "Poppins-Regular",
    textAlign: "center",
  },
  tipsSection: {
    marginBottom: 20,
  },
  tipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    flex: 1,
    minWidth: "48%",
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  tipText: {
    fontSize: 13,
    color: "#666",
    fontFamily: "Poppins-Regular",
    marginLeft: 8,
    flex: 1,
  },
});