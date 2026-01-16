import { useRouter } from "expo-router";
import { useState, useRef } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  Animated as RNAnimated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";

const options = [
  {
    id: "anxiety",
    title: "I worry a lot and can't relax",
    description: "My mind keeps thinking too much",
    icon: "😰",
    gradient: ["#FF6B6B", "#FF8E53"],
    iconColor: "#FF6B6B",
  },
  {
    id: "depression",
    title: "I feel sad or empty most days",
    description: "Low mood, low energy",
    icon: "😞",
    gradient: ["#4A90E2", "#6BC4A1"],
    iconColor: "#4A90E2",
  },
  {
    id: "stress",
    title: "I feel very stressed or burned out",
    description: "Too much pressure, always tired",
    icon: "😵",
    gradient: ["#FFA726", "#FF7043"],
    iconColor: "#FFA726",
  },
  {
    id: "mixed",
    title: "I'm not sure / everything feels mixed",
    description: "Hard to explain",
    icon: "😐",
    gradient: ["#9575CD", "#7986CB"],
    iconColor: "#9575CD",
  },
];

export default function MentalHealthCheckStart() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  // Create scale animations for each option
  const scaleAnims = useRef(
    options.reduce((acc, option) => {
      acc[option.id] = new RNAnimated.Value(1);
      return acc;
    }, {} as Record<string, RNAnimated.Value>)
  ).current;

  const handleSelect = (type: "anxiety" | "depression" | "stress" | "mixed") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedOption(type);
    
    // Scale animation
    RNAnimated.spring(scaleAnims[type], {
      toValue: 0.96,
      useNativeDriver: true,
    }).start(() => {
      RNAnimated.spring(scaleAnims[type], {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }).start();
    });
    
    // Navigate after animation
    setTimeout(() => {
      router.push(`/(home)/mental-health/check/${type}/intro`);
    }, 200);
  };

  const handlePressIn = (type: string) => {
    RNAnimated.spring(scaleAnims[type], {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (type: string) => {
    RNAnimated.spring(scaleAnims[type], {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={styles.background}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
           {/* Back Button */}
<Pressable
  style={styles.backButton}
  onPress={() => router.push("/(home)/mental-health/dashboard")}
>
  <Ionicons name="arrow-back" size={24} color="#1B3C73" />
</Pressable>
         

          {/* Title */}
          <Text style={styles.title}>Mental Health Check</Text>
          
          
          {/* Intro Card */}
          <Animated.View 
            entering={FadeInDown.delay(100)}
            style={styles.introCard}
          >
            <Text style={styles.introTitle}>
              How have you been feeling lately?
            </Text>
            <Text style={styles.introDescription}>
              Choose the option that feels closest. There is no right or wrong.
            </Text>
          </Animated.View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {options.map((option, index) => (
              <Animated.View
                key={option.id}
                entering={FadeInDown.delay(200 + index * 100)}
                style={{ width: "100%" }}
              >
                <RNAnimated.View style={{ transform: [{ scale: scaleAnims[option.id] }] }}>
                  <Pressable
                    onPressIn={() => handlePressIn(option.id)}
                    onPressOut={() => handlePressOut(option.id)}
                    onPress={() => handleSelect(option.id as any)}
                    style={({ pressed }) => [
                      styles.optionCard,
                      pressed && styles.optionCardPressed,
                    ]}
                  >
                    <LinearGradient
                      colors={option.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.optionIconContainer}
                    >
                      <Text style={styles.optionIcon}>{option.icon}</Text>
                    </LinearGradient>

                    <View style={styles.optionContent}>
                      <Text style={styles.optionTitle}>{option.title}</Text>
                      <Text style={styles.optionDescription}>
                        {option.description}
                      </Text>
                    </View>

                    <Ionicons 
                      name="chevron-forward" 
                      size={20} 
                      color={option.iconColor}
                    />
                  </Pressable>
                </RNAnimated.View>
              </Animated.View>
            ))}
          </View>

          {/* Help Card */}
          <Animated.View 
            entering={FadeInDown.delay(600)}
            style={{ width: "100%" }}
          >
            <Pressable
              style={styles.helpCard}
              onPress={() => router.push("/(home)/mental-health/chat")}
            >
              <Ionicons name="chatbubble-ellipses" size={24} color="#4A90E2" />
              <View style={styles.helpContent}>
                <Text style={styles.helpTitle}>Need immediate support?</Text>
                <Text style={styles.helpDescription}>
                  Connect with our AI listener or find professional resources
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={18} color="#4A90E2" />
            </Pressable>
          </Animated.View>

          {/* Footer */}
          <Text style={styles.footer}>
            This check is not a medical diagnosis. It helps us guide you better.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
  position: "absolute",
  top: 40,
  left: 16,
  padding: 8,
  zIndex: 10,
},

  background: {
    flex: 1,
    backgroundColor: "#FAFAF7",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    color: "#1B3C73",
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 24,
  },
  introCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  introTitle: {
    fontSize: 20,
    color: "#1B3C73",
    fontFamily: "Poppins-SemiBold",
    marginBottom: 12,
    lineHeight: 28,
  },
  introDescription: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins-Regular",
    lineHeight: 22,
  },
  optionsContainer: {
    width: "100%",
    gap: 16,
    marginBottom: 24,
  },
  optionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionCardPressed: {
    opacity: 0.9,
  },
  optionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionIcon: {
    fontSize: 24,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    color: "#1B3C73",
    fontFamily: "Poppins-SemiBold",
    marginBottom: 4,
    lineHeight: 22,
  },
  optionDescription: {
    fontSize: 13,
    color: "#666",
    fontFamily: "Poppins-Regular",
    lineHeight: 18,
  },
  helpCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 14,
    color: "#1B3C73",
    fontFamily: "Poppins-SemiBold",
    marginBottom: 2,
  },
  helpDescription: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Poppins-Regular",
  },
  footer: {
    marginTop: 24,
    fontSize: 12,
    color: "#777",
    textAlign: "center",
    fontFamily: "Poppins-Regular",
    width: "100%",
  },
});