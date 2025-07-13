import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MentalHealthBackground from "../MentalHealthBackground";
const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 40 - 12) / 2;
const audioFiles = {
  "forest-night": require("../../../../assets/audio/fast_forest-night.m4a"),
  "camp-fire": require("../../../../assets/audio/fast_camp-fire.m4a"),
  "soft-wind": require("../../../../assets/audio/fast_soft-wind.m4a"),
  "ocean-waves": require("../../../../assets/audio/fast_ocean-waves.m4a"),
  rainfall: require("../../../../assets/audio/fast_rainfall.m4a"),
};

const audioOptions = [
  {
    id: 1,
    name: "Forest Night",
    key: "forest-night",
    image: require("../../../../assets/images/sleepwell-audio/forest-night.jpg"),
    duration: "45 min",
  },
  {
    id: 2,
    name: "Camp Fire",
    key: "camp-fire",
    image: require("../../../../assets/images/sleepwell-audio/camp-fire.webp"),
    duration: "30 min",
  },
  {
    id: 3,
    name: "Soft Wind",
    key: "soft-wind",
    image: require("../../../../assets/images/sleepwell-audio/soft-wind.webp"),
    duration: "60 min",
  },
  {
    id: 4,
    name: "Ocean Waves",
    key: "ocean-waves",
    image: require("../../../../assets/images/sleepwell-audio/ocean-waves.jpg"),
    duration: "50 min",
  },
  {
    id: 5,
    name: "Rainfall",
    key: "rainfall",
    image: require("../../../../assets/images/sleepwell-audio/rainfall.webp"),
    duration: "40 min",
  },
];

export default function AudioSection() {
  const [loadedSounds, setLoadedSounds] = useState<Record<string, Audio.Sound>>(
    {}
  );
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use a ref to always access current sounds
  const soundsRef = useRef<Record<string, Audio.Sound>>({});
  soundsRef.current = loadedSounds;

  useEffect(() => {
    console.log("[AudioSection] Starting audio setup");
    const startTime = Date.now();

    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    }).then(() => {
      console.log("[AudioSection] Audio mode set");
    });

    const loadSounds = async () => {
      console.log("[AudioSection] Starting sound preloading");
      const soundMap: Record<string, Audio.Sound> = {};

      try {
        for (const key in audioFiles) {
          const loadStart = Date.now();
          console.log(`[AudioSection] Loading sound: ${key}`);

          const { sound } = await Audio.Sound.createAsync(
            audioFiles[key as keyof typeof audioFiles],
            { shouldPlay: false }
          );

          const loadTime = Date.now() - loadStart;
          console.log(`[AudioSection] Loaded sound: ${key} in ${loadTime}ms`);

          sound.setOnPlaybackStatusUpdate((status) => {
            if ((status as Audio.PlaybackStatus).didJustFinish) {
              console.log(`[AudioSection] Sound finished: ${key}`);
              setCurrentPlaying(null);
            }
          });
          soundMap[key] = sound;
        }

        setLoadedSounds(soundMap);
        setIsLoading(false);
        console.log(
          `[AudioSection] All sounds loaded in ${Date.now() - startTime}ms`
        );
      } catch (error) {
        console.error("[AudioSection] Error loading sounds:", error);
        setIsLoading(false);
      }
    };

    loadSounds();

    // Proper cleanup function
    return () => {
      console.log("[AudioSection] Cleaning up sounds");
      const cleanup = async () => {
        // Stop currently playing sound
        if (currentPlaying && soundsRef.current[currentPlaying]) {
          console.log(
            `[AudioSection] Stopping currently playing sound: ${currentPlaying}`
          );
          await soundsRef.current[currentPlaying].stopAsync();
        }

        // Unload all sounds
        for (const key in soundsRef.current) {
          try {
            console.log(`[AudioSection] Unloading sound: ${key}`);
            await soundsRef.current[key].unloadAsync();
          } catch (error) {
            console.error(
              `[AudioSection] Error unloading sound ${key}:`,
              error
            );
          }
        }
      };

      // Don't wait for cleanup to complete to avoid memory leaks
      cleanup().catch((error) => {
        console.error("[AudioSection] Cleanup error:", error);
      });
    };
  }, []);

  const playSound = async (audioKey: string) => {
    console.log(`[AudioSection] Play sound request: ${audioKey}`);
    const startTime = Date.now();

    try {
      const currentSound = loadedSounds[audioKey];

      // If the user tapped the same sound that's currently playing
      if (currentPlaying === audioKey && currentSound) {
        console.log("[AudioSection] Stopping currently playing sound");
        await currentSound.stopAsync();
        setCurrentPlaying(null);
        console.log(
          `[AudioSection] Sound stopped in ${Date.now() - startTime}ms`
        );
        return;
      }

      // Stop the previously playing sound
      if (currentPlaying && loadedSounds[currentPlaying]) {
        console.log(
          `[AudioSection] Stopping previous sound: ${currentPlaying}`
        );
        await loadedSounds[currentPlaying].stopAsync();
      }

      // Play new sound
      if (currentSound) {
        console.log("[AudioSection] Starting playback");
        await currentSound.replayAsync();
        setCurrentPlaying(audioKey);
        console.log(
          `[AudioSection] Playback started in ${Date.now() - startTime}ms`
        );
      }
    } catch (error) {
      console.error("[AudioSection] Playback error:", error);
    }
  };

  return (
    <MentalHealthBackground>
      <View style={styles.container}>
        <Text style={styles.header}>Listen, Breathe & Sleep</Text>
        {isLoading && (
          <Text style={styles.loadingText}>Loading audio files...</Text>
        )}

        <View style={styles.gridContainer}>
          {audioOptions.map((option) => (
            <Pressable
              key={option.id}
              onPress={() => !isLoading && playSound(option.key)}
              style={({ pressed }) => [
                styles.audioCard,
                pressed && styles.buttonPressed,
              ]}
            >
              <Image
                source={option.image}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View style={styles.cardOverlay} />
              <View style={styles.cardContent}>
                <Text style={styles.audioName}>{option.name}</Text>
                <Text style={styles.audioDuration}>{option.duration}</Text>
                <View style={styles.playButton}>
                  {isLoading ? (
                    <Ionicons name="time-outline" size={20} color="white" />
                  ) : (
                    <Ionicons
                      name={currentPlaying === option.key ? "pause" : "play"}
                      size={20}
                      color="white"
                    />
                  )}
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </MentalHealthBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    // backgroundColor: "#f8fafc",
  },
  header: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111827",
    marginTop: 15,
    marginBottom: 24,
    fontFamily: "Inter_600SemiBold",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  audioCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.2,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: "flex-end",
  },
  audioName: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 4,
    fontFamily: "Inter_600SemiBold",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  audioDuration: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontFamily: "Inter_400Regular",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  playButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  loadingText: {
    color: "#64748b",
    textAlign: "center",
    marginBottom: 16,
    fontFamily: "Inter_400Regular",
  },
});
