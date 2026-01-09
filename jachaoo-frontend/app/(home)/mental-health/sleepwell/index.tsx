import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MentalHealthBackground from "../MentalHealthBackground";
export default function SleepwellScreen() {
  const router = useRouter();

  const features = [
    {
      title: "Audio Section",
      route: "/(home)/mental-health/sleepwell/audio",
      icon: <Ionicons name="musical-notes" size={24} color="#6366f1" />,
      bgColor: "#e0e7ff",
    },
    {
      title: "Herbal Remedies",
      route: "/(home)/mental-health/sleepwell/herbal",
      icon: <FontAwesome5 name="leaf" size={24} color="#10b981" />,
      bgColor: "#d1fae5",
    },
    {
      title: "Home Rituals",
      route: "/(home)/mental-health/sleepwell/rituals",
      icon: <MaterialCommunityIcons name="candle" size={24} color="#f59e0b" />,
      bgColor: "#fef3c7",
    },
    {
      title: "Sleep Checklist",
      route: "/(home)/mental-health/sleepwell/checklist",
      icon: <Feather name="check-circle" size={24} color="#3b82f6" />,
      bgColor: "#dbeafe",
    },
  ];

  return (
    <MentalHealthBackground>
      <View style={styles.container}>
        <Text style={styles.header}>Sleepwell</Text>
        <Text style={styles.subheader}>Choose what helps you sleep better</Text>

        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.featureButton,
                { backgroundColor: feature.bgColor },
                pressed && styles.buttonPressed,
              ]}
              onPress={() => router.push(feature.route)}
            >
              <View style={styles.iconContainer}>{feature.icon}</View>
              <Text style={styles.featureText}>{feature.title}</Text>
              <Ionicons name="chevron-forward" size={20} color="#64748b" />
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
    padding: 24,
    // backgroundColor: "rgba(255,255,255,0.1)",
    marginTop: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    color: "#0f172a",
    fontFamily: "Inter_600SemiBold",
  },
  subheader: {
    fontSize: 16,
    marginBottom: 32,
    color: "#64748b",
    fontFamily: "Inter_400Regular",
  },
  featuresContainer: {
    gap: 16,
  },
  featureButton: {
    width: "100%",
    padding: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  featureText: {
    fontSize: 18,
    flex: 1,
    color: "#0f172a",
    fontFamily: "Inter_500Medium",
  },
});
