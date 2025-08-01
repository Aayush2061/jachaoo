// app/(home)/mental-health/chat.tsx
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
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
import MentalHealthBackground from "./MentalHealthBackground";

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

  useFocusEffect(
    useCallback(() => {
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
          console.log(data);
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
        `${process.env.EXPO_PUBLIC_API_URL}/mental-chat`, // Changed to use Node route
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
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, keyboardHeight]);

  if (isFetchingData) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2980b9" />
      </View>
    );
  }

  return (
    <MentalHealthBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#2980b9" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Mental Health Support</Text>
            <View style={{ width: 24 }} />
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
                <ActivityIndicator size="small" color="#2980b9" />
              </View>
            )}
          </ScrollView>

          {/* Input Area */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 55 : 0} // Try 20-60 depending on header height
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
                placeholder="How are you feeling today..."
                placeholderTextColor="#999"
                multiline
                enablesReturnKeyAutomatically
                returnKeyType="send"
                onSubmitEditing={handleSend}
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSend}
                disabled={inputText.trim() === "" || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#ccc" />
                ) : (
                  <Ionicons
                    name="send"
                    size={24}
                    color={inputText.trim() === "" ? "#ccc" : "#2980b9"}
                  />
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </SafeAreaView>
    </MentalHealthBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    marginTop: 20,
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
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginTop: Platform.OS === "android" ? 10 : 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  messagesContainer: {
    padding: 15,
    paddingBottom: 15,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#e3f2fd",
    borderBottomLeftRadius: 5,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#2980b9",
    borderBottomRightRadius: 5,
  },
  messageText: {
    fontSize: 16,
  },
  botText: {
    color: "#2c3e50",
  },
  userText: {
    color: "#fff",
  },
  timestamp: {
    fontSize: 10,
    color: "#999",
    marginTop: 5,
    alignSelf: "flex-end",
  },
  inputWrapper: {
    paddingHorizontal: 10,
    paddingBottom: Platform.OS === "ios" ? 25 : 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 20,
    fontSize: 16,
    color: "#2c3e50",
  },
  sendButton: {
    marginLeft: 10,
    padding: 10,
  },
});
