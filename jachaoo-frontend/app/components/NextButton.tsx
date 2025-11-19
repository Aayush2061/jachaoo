import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface NextButtonProps {
  onPress: () => void;
  title?: string;
  disabled?: boolean;
}

export default function NextButton({
  onPress,
  title = "Next",
  disabled = false,
}: NextButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.buttonDisabled,
        isPressed && styles.buttonPressed,
      ]}
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#0F3A5D",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    backgroundColor: "#0D2E4A",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },
});
