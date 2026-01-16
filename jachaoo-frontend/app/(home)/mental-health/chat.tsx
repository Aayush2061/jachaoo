// app/(home)/mental-health/chat.tsx
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
};

export default function MentalHealthChat() {
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [mentalHealthData, setMentalHealthData] = useState<any>(null);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm here to support your mental health journey. How are you feeling today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const MAX_MESSAGE_LENGTH = 300;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      // Fade-in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();

      const fetchMentalHealthData = async () => {
        try {
          setIsFetchingData(true);
          if (!user?.id) return;

          const token = await getToken();
          const response = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/mental-health/${user.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await response.json();
          setMentalHealthData(data);
        } catch (error) {
          console.error("Error fetching mental health data:", error);
        } finally {
          setIsFetchingData(false);
        }
      };

      fetchMentalHealthData();
    }, [user?.id])
  );

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleSend = async () => {
    if (inputText.trim() === "" || isFetchingData || !mentalHealthData) return;

    if (inputText.length > MAX_MESSAGE_LENGTH) {
      alert(`Message too long (max ${MAX_MESSAGE_LENGTH} characters)`);
      return;
    }

    // Add haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/mental-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: inputText,
            chat_history: chatHistory,
            user_context: {
              diagnosed: mentalHealthData.diagnosed,
              support: mentalHealthData.support,
              frequency: mentalHealthData.frequency,
              goals: mentalHealthData.goals,
            },
          }),
        }
      );

      if (response.status === 429) {
        const { error } = await response.json();
        setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
        alert(
          `You've used your ${error.limit} daily messages. Try again tomorrow.`
        );
        return;
      }

      const data = await response.json();

      if (data.success) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
        setChatHistory(data.chat_history);
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Sorry, I'm having trouble responding. Please try again.",
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Network error. Please check your connection.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, keyboardHeight]);

  if (isFetchingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B3C73" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.background}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {/* Header with gradient */}
        <LinearGradient
          colors={["#4A90E2", "#6BC4A1"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </Pressable>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Mental Health Support</Text>
              <Text style={styles.headerSubtitle}>
                Talk to someone • Private & safe
              </Text>
            </View>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
          {/* Messages Container - FIXED: Removed dynamic paddingBottom */}
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Welcome message as first bot message */}
            <View style={[styles.messageBubble, styles.botBubble]}>
              <View style={styles.botAvatar}>
                <Ionicons name="heart" size={16} color="#FFFFFF" />
              </View>
              <View style={styles.messageContent}>
                <Text style={[styles.messageText, styles.botText]}>
                  Hello! I'm here to support your mental health journey. How are you feeling today?
                </Text>
                <Text style={styles.timestamp}>
                  {messages[0].timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </View>

            {/* Other messages */}
            {messages.slice(1).map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageBubble,
                  message.sender === "user"
                    ? styles.userBubble
                    : styles.botBubble,
                ]}
              >
                {message.sender === "bot" && (
                  <View style={styles.botAvatar}>
                    <Ionicons name="heart" size={16} color="#FFFFFF" />
                  </View>
                )}
                <View style={styles.messageContent}>
                  <Text
                    style={[
                      styles.messageText,
                      message.sender === "user"
                        ? styles.userText
                        : styles.botText,
                    ]}
                  >
                    {message.text}
                  </Text>
                  <Text style={styles.timestamp}>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
                {message.sender === "user" && (
                  <View style={styles.userAvatar}>
                    <Ionicons name="person" size={16} color="#FFFFFF" />
                  </View>
                )}
              </View>
            ))}
            {isLoading && (
              <View style={[styles.messageBubble, styles.botBubble]}>
                <View style={styles.botAvatar}>
                  <Ionicons name="heart" size={16} color="#FFFFFF" />
                </View>
                <View style={styles.messageContent}>
                  <View style={styles.typingIndicator}>
                    <View style={styles.typingDot} />
                    <View style={[styles.typingDot, styles.typingDot2]} />
                    <View style={[styles.typingDot, styles.typingDot3]} />
                  </View>
                </View>
              </View>
            )}
            
            {/* Spacer for keyboard */}
            <View style={{ height: keyboardHeight > 0 ? 20 : 80 }} />
          </ScrollView>

          {/* Input Area - FIXED: Simplified keyboard handling */}
          <View style={[
            styles.inputWrapper,
            keyboardHeight > 0 && Platform.OS === 'ios' && { 
              paddingBottom: keyboardHeight 
            }
          ]}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Share your thoughts and feelings..."
                placeholderTextColor="#999"
                multiline
                enablesReturnKeyAutomatically
                returnKeyType="send"
                onSubmitEditing={handleSend}
                maxLength={MAX_MESSAGE_LENGTH}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  inputText.trim() === "" && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={inputText.trim() === "" || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons
                    name="send"
                    size={22}
                    color={inputText.trim() === "" ? "#CCCCCC" : "#FFFFFF"}
                  />
                )}
              </TouchableOpacity>
            </View>
            {keyboardHeight === 0 && (
              <Text style={styles.inputHint}>
                {inputText.length}/{MAX_MESSAGE_LENGTH} • Not a substitute for
                professional care
              </Text>
            )}
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#FAFAF7",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAF7",
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    color: "#FFFFFF",
    fontFamily: "Poppins-SemiBold",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.9,
    marginTop: 2,
    fontFamily: "Poppins-Regular",
  },
  container: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20, // Fixed padding instead of dynamic
  },
  messageBubble: {
    flexDirection: "row",
    marginBottom: 16,
    maxWidth: "85%",
  },
  botBubble: {
    alignSelf: "flex-start",
  },
  userBubble: {
    alignSelf: "flex-end",
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    alignSelf: "flex-end",
    marginBottom: 4,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#6BC4A1",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    alignSelf: "flex-end",
    marginBottom: 4,
  },
  messageContent: {
    flex: 1,
  },
  messageText: {
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  botText: {
    color: "#1B3C73",
    backgroundColor: "#F0F7FF",
    borderTopLeftRadius: 4,
  },
  userText: {
    color: "#FFFFFF",
    backgroundColor: "#4A90E2",
    borderTopRightRadius: 4,
  },
  timestamp: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
    fontFamily: "Poppins-Regular",
    alignSelf: "flex-end",
  },
  typingIndicator: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F0F7FF",
    borderRadius: 20,
    borderTopLeftRadius: 4,
    alignSelf: "flex-start",
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4A90E2",
    marginHorizontal: 2,
  },
  typingDot2: {
    opacity: 0.7,
  },
  typingDot3: {
    opacity: 0.4,
  },
  inputWrapper: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
    backgroundColor: "#FAFAF7",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: "#1B3C73",
    maxHeight: 100,
    minHeight: 40,
    paddingVertical: 10,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: "#E0E0E0",
  },
  inputHint: {
    fontSize: 11,
    color: "#999",
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    marginTop: 8,
  },
});