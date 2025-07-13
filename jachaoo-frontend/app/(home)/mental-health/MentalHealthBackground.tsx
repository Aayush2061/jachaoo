import React from "react";
import { ImageBackground, StyleSheet, View, ViewProps } from "react-native";

interface MentalHealthBackgroundProps extends ViewProps {
  children: React.ReactNode;
}

export default function MentalHealthBackground({
  children,
  style,
  ...props
}: MentalHealthBackgroundProps) {
  return (
    <ImageBackground
      source={require("@/assets/images/mental-health-background.jpg")}
      style={[styles.backgroundImage, style]}
      resizeMode="cover"
      {...props}
    >
      <View style={styles.overlay}>{children}</View>
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
  },
});
