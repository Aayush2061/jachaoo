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
          // console.log(data);
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

    // console.log("Sending user context:", {
    //   user_id: user?.id,
    //   duration_of_period: periodData.duration.toString(),
    //   cycle_length: periodData.cycleLength.toString(),
    //   previous_conditions: periodData.conditions.join(", "),
    //   trying_to_conceive: periodData.tryingToConceive !== "No",
    //   on_hormonal_contraceptive: periodData.contraceptive !== "No",
    //   first_day_of_last_period: periodData.lastPeriodDate.split("T")[0],
    // });

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
        <ActivityIndicator size="large" color="#9b59b6" />
      </View>
    );
  }

  return (
    <LinearGradient colors={["#b3e5fc", "#ffe0b2"]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#9b59b6" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Period Health Assistant</Text>
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
                <ActivityIndicator size="small" color="#9b59b6" />
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
                placeholder="Ask about your period..."
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
                    color={inputText.trim() === "" ? "#ccc" : "#9b59b6"}
                  />
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // backgroundColor: "#fff",
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
    backgroundColor: "#f0e6ff",
    borderBottomLeftRadius: 5,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#9b59b6",
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
    // backgroundColor: "#fff",
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
