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

const rituals = [
  {
    name: "Oil Massage on Feet",
    benefits: "Relaxes your body and soothes your nerves.",
    time: "30 minutes before bed",
    method: "Warm sesame or mustard oil and gently massage the soles of your feet for 5–7 minutes.",
    precaution: "Don't walk immediately after",
  },
  {
    name: "Ghee in Nose",
    benefits: "Cools and calms your mind, helps with easier breathing.",
    time: "Just before sleep",
    method: "Lie on your back and gently put 1 drop of pure cow ghee in each nostril.",
    precaution: "Use only pure ghee. Avoid if you have a cold or sinus problem.",
  },
  {
    name: "Warm Foot Soak",
    benefits: "Reduces tiredness and calms your body.",
    time: "1 hour before bed",
    method: "Soak your feet in warm water mixed with a little salt for 10 minutes.",
    precaution: "Water should be warm, not hot",
  },
  {
    name: "Lighting Lamp or Incense",
    benefits: "Creates a peaceful and relaxing sleep environment.",
    time: "Evening time, around 8–9 PM",
    method: "Light a small oil lamp or natural incense stick to make the space calming.",
    precaution: "Place safely",
  },
  {
    name: "Warm Milk with Nutmeg",
    benefits: "Promotes natural sleep and soothes your mind.",
    time: "20–30 minutes before bed",
    method: "Add a small pinch of nutmeg to warm milk, stir well, and drink slowly.",
    precaution: "Don't use too much nutmeg",
  },
  {
    name: "Mantra or Prayer",
    benefits: "Clears your mind, reduces stress, and brings inner peace.",
    time: "Right before going to sleep",
    method: "Sit or lie down and softly chant or say a quiet prayer.",
    precaution: "Keep it soft and peaceful — avoid loud or energizing chants at night.",
  },
  {
    name: "Quiet Reading",
    benefits: "Helps your mind shift away from screens and daily stress.",
    time: "Last 15 minutes before bed",
    method: "Read a calming book, story, or scripture under a soft yellow lamp.",
    precaution: "Avoid phone or tablet screens",
  },
];

export default function RitualsScreen() {
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
              <Text style={styles.title}>Home Rituals</Text>
              <Text style={styles.subtitle}>Traditional practices for better sleep</Text>
            </View>
          </View>

          {/* Rituals List */}
          <View style={styles.ritualsContainer}>
            {rituals.map((ritual, index) => (
              <View key={index} style={styles.ritualCard}>
                <Text style={styles.ritualName}>{ritual.name}</Text>
                
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Benefits</Text>
                  <Text style={[styles.sectionContent, styles.benefitsText]}>
                    {ritual.benefits}
                  </Text>
                </View>
                
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Best Time</Text>
                  <Text style={styles.sectionContent}>{ritual.time}</Text>
                </View>
                
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Method</Text>
                  <Text style={styles.sectionContent}>{ritual.method}</Text>
                </View>
                
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Precautions</Text>
                  <Text style={[styles.sectionContent, styles.precautionText]}>
                    {ritual.precaution}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Tips */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Tips for success:</Text>
            <View style={styles.tipsGrid}>
              <View style={styles.tipItem}>
                <Ionicons name="repeat" size={18} color="#4A90E2" />
                <Text style={styles.tipText}>Be consistent</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="create" size={18} color="#4A90E2" />
                <Text style={styles.tipText}>Personalize to your needs</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="moon" size={18} color="#4A90E2" />
                <Text style={styles.tipText}>Create a peaceful space</Text>
              </View>
            </View>
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
  ritualsContainer: {
    gap: 16,
    marginBottom: 20,
  },
  ritualCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  ritualName: {
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