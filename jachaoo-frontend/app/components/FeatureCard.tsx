// components/FeatureCard.tsx

import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";

type FeatureCardProps = {
  title: string;
  icon: ImageSourcePropType;
  onPress: () => void;
  bgColor?: string;
};

export function FeatureCard({
  title,
  icon,
  onPress,
  bgColor,
}: FeatureCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: bgColor || "#ffffff" }]}
    >
      <Image source={icon} style={styles.icon} />
      <Text style={styles.title}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    textAlign: "center",
  },
});
