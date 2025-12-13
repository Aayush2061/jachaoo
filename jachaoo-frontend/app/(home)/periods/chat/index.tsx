// app/(home)/periods/chat.tsx
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { getCyclePhaseInfo } from "../../../utils/cycleUtils";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
};

export default function PeriodChat() {
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [periodData, setPeriodData] = useState<any>(null);
  const [cyclePhaseInfo, setCyclePhaseInfo] = useState<any>(null);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi there! I'm your period health assistant. How can I help you today?",
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

  useFocusEffect(
    useCallback(() => {
      const fetchPeriodData = async () => {
        try {
          setIsFetchingData(true);
          if (!user?.id) return;

          const token = await getToken();
          const response = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/periods/${user.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await response.json();
          setPeriodData(data);

          // Calculate cycle phase information
          if (
            data &&
            data.lastPeriodDate &&
            data.cycleLength &&
            data.duration
          ) {
            try {
              const phaseInfo = getCyclePhaseInfo({
                lastPeriodDate: data.lastPeriodDate,
                cycleLength: data.cycleLength,
                duration: data.duration,
                today: new Date(),
              });
              setCyclePhaseInfo(phaseInfo);
            } catch (error) {
              console.error("Error calculating cycle phase:", error);
            }
          }
        } catch (error) {
          console.error("Error fetching period data:", error);
        } finally {
          setIsFetchingData(false);
        }
      };

      fetchPeriodData();
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
    if (inputText.trim() === "" || isFetchingData || !periodData) return;

    if (inputText.length > MAX_MESSAGE_LENGTH) {
      alert(`Message too long (max ${MAX_MESSAGE_LENGTH} characters)`);
      return;
    }

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
        `${process.env.EXPO_PUBLIC_API_URL}/menstrual-chat`,
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
              user_id: user?.id,
              duration_of_period: periodData.duration.toString(),
              cycle_length: periodData.cycleLength.toString(),
              previous_conditions: periodData.conditions.join(", "),
              trying_to_conceive: periodData.tryingToConceive !== "No",
              on_hormonal_contraceptive: periodData.contraceptive !== "No",
              first_day_of_last_period: periodData.lastPeriodDate.split("T")[0],
              current_cycle_phase: cyclePhaseInfo?.phase || "Unknown",
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
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, keyboardHeight]);

  if (isFetchingData) {
    return (
      <LinearGradient
        colors={["#FFF2F8", "#F2F0FF"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color="#B76CFD" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#FFF2F8", "#F2F0FF"]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={{ flex: 1, marginTop: 10 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#B76CFD" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Health Assistant</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={styles.scrollView}
          >
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageBubble,
                  message.sender === "user"
                    ? styles.userBubble
                    : styles.botBubble,
                ]}
              >
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
            ))}
            {isLoading && (
              <View style={[styles.messageBubble, styles.botBubble]}>
                <ActivityIndicator size="small" color="#B76CFD" />
              </View>
            )}
          </ScrollView>

          {/* Input Area */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 85 : 0}
            style={[
              styles.inputWrapper,
              Platform.OS === "ios"
                ? { marginBottom: 0 }
                : {
                    marginBottom: keyboardHeight > 0 ? keyboardHeight + 30 : 25,
                  },
            ]}
          >
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask about your period..."
                placeholderTextColor="#B0A9B9"
                multiline
                enablesReturnKeyAutomatically
                returnKeyType="send"
                onSubmitEditing={handleSend}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (inputText.trim() === "" || isLoading) &&
                    styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={inputText.trim() === "" || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons
                    name="send"
                    size={20}
                    color={inputText.trim() === "" ? "#D1D5DB" : "#FFFFFF"}
                  />
                )}
              </TouchableOpacity>
            </View>
            {keyboardHeight === 0 && (
              <View style={styles.disclaimerContainer}>
                <Text style={styles.disclaimerText}>
                  Not a substitute for professional care.
                </Text>
              </View>
            )}
          </KeyboardAvoidingView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(183,108,253,0.06)",
    shadowColor: "#B76CFD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(183,108,253,0.08)",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#2D2D2D",
    letterSpacing: 0.3,
  },
  messagesContainer: {
    padding: 20,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: "#B76CFD",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderBottomLeftRadius: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(183,108,253,0.08)",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#B76CFD",
    borderBottomRightRadius: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    shadowColor: "#B76CFD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  messageText: {
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    lineHeight: 22,
  },
  botText: {
    color: "#2D2D2D",
  },
  userText: {
    color: "#FFFFFF",
  },
  timestamp: {
    fontSize: 11,
    color: "#8B8691",
    marginTop: 6,
    alignSelf: "flex-end",
    fontFamily: "Poppins-Regular",
  },
  inputWrapper: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 25 : 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(183,108,253,0.06)",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(183,108,253,0.08)",
    shadowColor: "#B76CFD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderRadius: 24,
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: "#2D2D2D",
    borderWidth: 1,
    borderColor: "#F0E8FF",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#B76CFD",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
    shadowColor: "#B76CFD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: "#E0D7FF",
    shadowOpacity: 0,
  },
  disclaimerContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  disclaimerText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#8B8691",
    textAlign: "center",
  },
});
