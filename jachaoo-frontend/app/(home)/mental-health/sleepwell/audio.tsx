import { Ionicons } from "@expo/vector-icons";
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 40 - 12) / 2; // 20 padding on each side + 12 gap

const audioOptions = [
  {
    id: 1,
    name: "Forest Night",
    image: require("../../../../assets/images/sleepwell-audio/forest-night.jpg"),
    duration: "45 min",
  },
  {
    id: 2,
    name: "Camp Fire",
    image: require("../../../../assets/images/sleepwell-audio/camp-fire.webp"),
    duration: "30 min",
  },
  {
    id: 3,
    name: "Soft Wind",
    image: require("../../../../assets/images/sleepwell-audio/soft-wind.webp"),
    duration: "60 min",
  },
  {
    id: 4,
    name: "Ocean Waves",
    image: require("../../../../assets/images/sleepwell-audio/ocean-waves.jpg"),
    duration: "50 min",
  },
  {
    id: 5,
    name: "Rainfall",
    image: require("../../../../assets/images/sleepwell-audio/rainfall.webp"),
    duration: "40 min",
  },
];

export default function AudioSection() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Listen, Breathe & Sleep</Text>

      <View style={styles.gridContainer}>
        {audioOptions.map((option) => (
          <Pressable
            key={option.id}
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
                <Ionicons name="play" size={20} color="white" />
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8fafc",
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
    height: CARD_WIDTH * 1.2, // Slightly taller than wide
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
});
