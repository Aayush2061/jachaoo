import { useRouter } from "expo-router";
import { 
  StyleSheet, 
  Text, 
  View, 
  Pressable, 
  SafeAreaView,
  Animated,
  ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";

const checklistItems = [
  "Fix your bedtime - Go to bed and wake up at the same time every day",
  "Limit screen time - Turn off phones and laptops 1 hour before sleeping",
  "Dim the lights - Use soft, warm lighting in the evening",
  "Keep your room cool - Ideal temperature is 18–22°C",
  "Avoid heavy meals - Finish dinner at least 2 hours before sleeping",
  "No caffeine in evening - Avoid coffee or tea after 4 PM",
  "Do light stretches - 5–10 minutes of calm breathing or stretching",
  "Use bed only for sleep - Avoid watching TV or scrolling in bed",
  "Keep noise low - Use earplugs or white noise if needed",
  "Clear your mind - Think of 3 good things from the day before sleep",
];

export default function ChecklistScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
              <Text style={styles.title}>Sleep Checklist</Text>
              <Text style={styles.subtitle}>10 habits for better sleep</Text>
            </View>
          </View>

          {/* Checklist */}
          <View style={styles.checklistContainer}>
            {checklistItems.map((item, index) => (
              <View key={index} style={styles.checklistItem}>
                <View style={styles.itemNumber}>
                  <Text style={styles.numberText}>{index + 1}</Text>
                </View>
                <Text style={styles.itemText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Ionicons name="checkmark-circle" size={24} color="#4A90E2" />
            <Text style={styles.footerText}>
              Try to follow at least 3–4 habits daily for better sleep
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
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
  checklistContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  itemNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  numberText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontFamily: "Poppins-SemiBold",
  },
  itemText: {
    fontSize: 15,
    color: "#1B3C73",
    fontFamily: "Poppins-Regular",
    flex: 1,
    lineHeight: 22,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F7FF",
    borderRadius: 18,
    padding: 16,
  },
  footerText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins-Regular",
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});