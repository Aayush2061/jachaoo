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

const remedies = [
  {
    name: "Jatamansi",
    preparation: "Boil 1 teaspoon of dried root in a cup of water and drink warm.",
    time: "1 hour before bed",
    benefits: "Makes your mind calm and helps you fall asleep.",
    precautions: "Use only a small amount",
  },
  {
    name: "Ashwagandha",
    preparation: "Mix 1 teaspoon of powder in warm milk or water and drink",
    time: "After dinner",
    benefits: "Reduces stress and relaxes your body for better sleep.",
    precautions: "Avoid during pregnancy or thyroid issues — consult a doctor.",
  },
  {
    name: "Nutmeg",
    preparation: "Add a small pinch of nutmeg to a cup of warm milk.",
    time: "20–30 minutes before sleep",
    benefits: "Helps your brain feel naturally healthy.",
    precautions: "Don't use too much. It may cause nausea.",
  },
  {
    name: "Tulsi",
    preparation: "Boil fresh or dried leaves in water to make tea.",
    time: "In the evening",
    benefits: "Helps you feel peaceful and reduces anxiety.",
    precautions: "Don't mix with caffeine like tea or coffee.",
  },
  {
    name: "Chamomile",
    preparation: "Make tea using dried chamomile flowers.",
    time: "Before bed",
    benefits: "Acts as a light relaxant — helps your body and mind wind down naturally.",
    precautions: "May cause drowsiness — avoid if you need to stay alert or drive afterward.",
  },
  {
    name: "Sarpagandha",
    preparation: "Take in powder form with water or as Ayurvedic tablets — only as prescribed.",
    time: "Only under expert guidance",
    benefits: "Helps with insomnia and high blood pressure (BP).",
    precautions: "Must be taken under doctor or Ayurvedic expert advice — can have strong effects on BP and nervous system.",
  },
  {
    name: "Tagar",
    preparation: "Use in capsule or tea form (consult Ayurvedic practitioner for correct dosage).",
    time: "30 minutes before bedtime",
    benefits: "Helps with stress and promotes deep sleep.",
    precautions: "Can cause very deep sleep — avoid during the daytime or when alertness is needed.",
  },
];

export default function HerbalRemediesScreen() {
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
              <Text style={styles.title}>Herbal Remedies</Text>
              <Text style={styles.subtitle}>Natural solutions for better sleep</Text>
            </View>
          </View>

          {/* Remedies List */}
          <View style={styles.remediesContainer}>
            {remedies.map((remedy, index) => (
              <View key={index} style={styles.remedyCard}>
                <Text style={styles.remedyName}>{remedy.name}</Text>
                
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Preparation</Text>
                  <Text style={styles.sectionContent}>{remedy.preparation}</Text>
                </View>
                
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Best Time</Text>
                  <Text style={styles.sectionContent}>{remedy.time}</Text>
                </View>
                
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Benefits</Text>
                  <Text style={[styles.sectionContent, styles.benefitsText]}>
                    {remedy.benefits}
                  </Text>
                </View>
                
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Precautions</Text>
                  <Text style={[styles.sectionContent, styles.precautionText]}>
                    {remedy.precautions}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimer}>
            <Ionicons name="medical" size={20} color="#4A90E2" />
            <Text style={styles.disclaimerText}>
              Always consult a healthcare professional before trying new herbal remedies
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
  remediesContainer: {
    gap: 16,
    marginBottom: 20,
  },
  remedyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  remedyName: {
    fontSize: 18,
    color: "#1B3C73",
    fontFamily: "Poppins-SemiBold",
    marginBottom: 16,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    color: "#4A90E2",
    fontFamily: "Poppins-SemiBold",
    marginBottom: 4,
  },
  sectionContent: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins-Regular",
    lineHeight: 20,
  },
  benefitsText: {
    color: "#6BC4A1",
  },
  precautionText: {
    color: "#E74C3C",
  },
  disclaimer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F7FF",
    borderRadius: 18,
    padding: 16,
  },
  disclaimerText: {
    fontSize: 13,
    color: "#666",
    fontFamily: "Poppins-Regular",
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
});