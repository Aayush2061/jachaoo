import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Animated,
  ScrollView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";

const audioFiles = {
  "forest-night": {
    uri: "https://res.cloudinary.com/drgny2hcw/video/upload/v1763371245/fast_forest-night_mqy8h2.m4a",
  },
  "camp-fire": {
    uri: "https://res.cloudinary.com/drgny2hcw/video/upload/v1763371241/fast_camp-fire_hxoe6l.m4a",
  },
  "soft-wind": {
    uri: "https://res.cloudinary.com/drgny2hcw/video/upload/v1763371250/fast_soft-wind_am8o9n.mp3",
  },
  "ocean-waves": {
    uri: "https://res.cloudinary.com/drgny2hcw/video/upload/v1763371241/relaxing_river_audio_lp1trq.mp3",
  },
  rainfall: {
    uri: "https://res.cloudinary.com/drgny2hcw/video/upload/v1763371230/fast_rainfall_oy6smd.m4a",
  },
};

const audioOptions = [
  {
    id: 1,
    name: "Forest Night",
    key: "forest-night",
    duration: "25 min",
  },
  {
    id: 2,
    name: "Camp Fire",
    key: "camp-fire",
    duration: "25 min",
  },
  {
    id: 3,
    name: "Soft Wind",
    key: "soft-wind",
    duration: "25 min",
  },
  {
    id: 4,
    name: "River",
    key: "ocean-waves",
    duration: "25 min",
  },
  {
    id: 5,
    name: "Rainfall",
    key: "rainfall",
    duration: "25 min",
  },
];

export default function AudioSection() {
  const router = useRouter();
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const soundsRef = useRef<Record<string, Audio.Sound>>({});
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();

    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
    });

    return () => {
      Object.values(soundsRef.current).forEach(sound => {
        sound?.unloadAsync();
      });
    };
  }, []);

  const playSound = async (audioKey: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      // Stop currently playing sound
      if (currentPlaying && soundsRef.current[currentPlaying]) {
        await soundsRef.current[currentPlaying].stopAsync();
      }

      // If clicking the same sound, toggle off
      if (currentPlaying === audioKey) {
        setCurrentPlaying(null);
        return;
      }

      // Load and play new sound
      if (!soundsRef.current[audioKey]) {
        setIsLoading(true);
        const { sound } = await Audio.Sound.createAsync(
          audioFiles[audioKey as keyof typeof audioFiles],
          { shouldPlay: false }
        );
        soundsRef.current[audioKey] = sound;
        setIsLoading(false);
      }

      await soundsRef.current[audioKey].replayAsync();
      setCurrentPlaying(audioKey);
    } catch (error) {
      console.error("Audio error:", error);
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentPlaying && soundsRef.current[currentPlaying]) {
      soundsRef.current[currentPlaying].stopAsync();
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.background}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#1B3C73" />
            </Pressable>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Relaxing Audio</Text>
              <Text style={styles.subtitle}>Calming sounds for better sleep</Text>
            </View>
          </View>

          {/* Audio List */}
          <View style={styles.audioList}>
            {audioOptions.map((option) => (
              <AudioCard
                key={option.id}
                option={option}
                isPlaying={currentPlaying === option.key}
                isLoading={isLoading}
                onPress={() => playSound(option.key)}
              />
            ))}
          </View>

          {/* Tips */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Tips for best experience:</Text>
            <View style={styles.tipsGrid}>
              <View style={styles.tipItem}>
                <Ionicons name="headset" size={18} color="#4A90E2" />
                <Text style={styles.tipText}>Use headphones</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="volume-low" size={18} color="#4A90E2" />
                <Text style={styles.tipText}>Medium volume</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="bed" size={18} color="#4A90E2" />
                <Text style={styles.tipText}>Comfortable position</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

function AudioCard({ option, isPlaying, isLoading, onPress }: any) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={onPress}
        style={styles.audioCard}
      >
        <View style={styles.audioIcon}>
          <Ionicons name="musical-note" size={24} color="#4A90E2" />
        </View>
        <View style={styles.audioInfo}>
          <Text style={styles.audioName}>{option.name}</Text>
          <Text style={styles.audioDuration}>{option.duration}</Text>
        </View>
        <View style={styles.playButton}>
          {isLoading ? (
            <Ionicons name="time" size={20} color="#FFFFFF" />
          ) : (
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={20}
              color="#FFFFFF"
            />
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#FAFAF7",
  },
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
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
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins-Regular",
    marginTop: 2,
  },
  audioList: {
    gap: 12,
    marginBottom: 28,
  },
  audioCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  audioIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F0F7FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  audioInfo: {
    flex: 1,
  },
  audioName: {
    fontSize: 16,
    color: "#1B3C73",
    fontFamily: "Poppins-SemiBold",
    marginBottom: 2,
  },
  audioDuration: {
    fontSize: 13,
    color: "#666",
    fontFamily: "Poppins-Regular",
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
  },
  tipsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 16,
    color: "#1B3C73",
    fontFamily: "Poppins-SemiBold",
    marginBottom: 12,
  },
  tipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F7FF",
    borderRadius: 12,
    padding: 12,
    flex: 1,
    minWidth: "48%",
  },
  tipText: {
    fontSize: 13,
    color: "#666",
    fontFamily: "Poppins-Regular",
    marginLeft: 8,
    flex: 1,
  },
});