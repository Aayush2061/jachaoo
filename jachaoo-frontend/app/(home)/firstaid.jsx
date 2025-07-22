import { useAuth } from "@clerk/clerk-expo";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
  View
} from "react-native";

const AnimatedDots = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return <Text style={styles.thinkingText}>Thinking{dots}</Text>;
};

const formatMessageText = (text: string, isUser: boolean) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <Text style={isUser ? styles.userText : styles.botText}>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const boldText = part.slice(2, -2);
          return (
            <Text key={index} style={[styles.boldText, isUser ? styles.userText : styles.botText]}>
              {boldText}
            </Text>
          );
        }
        return part;
      })}
    </Text>
  );
};

export default function FirstAidScreen() {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I'm your first aid assistant. What medical help do you need today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const {  getToken } = useAuth();
  const router = useRouter();

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

  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, keyboardHeight]);



 const handleSend = async () => {
  if (!inputText.trim()) return;

  // 1. Create temporary message with loading state
  const tempMessageId = Date.now().toString();
  const newUserMessage = {
    id: tempMessageId, // Unique ID for later update
    role: "user",
    text: inputText,
    isSending: true // 👈 Loading state
  };

  // 2. Add to chat immediately (optimistic UI)
  setMessages((prev) => [...prev, newUserMessage]);
  setInputText(""); // Clear input right away
  setIsLoading(true);

  try {
    const token = await getToken();
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/firstaid`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message: inputText }),
    });

    if (response.status === 429) {
      const { error } = await response.json();
      // 3. Remove the temporary message if rate-limited
      setMessages((prev) => prev.filter(msg => msg.id !== tempMessageId));
      alert(`You've used your ${error.limit} daily messages. Try again tomorrow.`);
      return;
    }

    if (!response.ok) throw new Error('Request failed');
    
    const data = await response.json();
    if (data.status !== 'success') throw new Error(data.error || 'Invalid response');

    // 4. Replace temporary message with final version + AI response
    setMessages((prev) => [
      ...prev.filter(msg => msg.id !== tempMessageId), // Remove temp
      { 
        id: tempMessageId,
        role: "user",
        text: inputText // Final confirmed message
      },
      { 
        id: Date.now().toString(),
        role: "assistant", 
        text: data.reply 
      }
    ]);
    
  } catch (error) {
    // 5. Update temp message to show error
    setMessages((prev) => [
      ...prev.filter(msg => msg.id !== tempMessageId),
      { 
        id: tempMessageId,
        role: "user",
        text: inputText 
      },
      { 
        id: Date.now().toString(),
        role: "assistant",
        text: `Error: ${error.message}. Please try again.` 
      }
    ]);
  } finally {
    setIsLoading(false);
  }
};
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.logoText}>FirstAid</Text>
            <Text style={styles.subtitle}>Medical Assistant</Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push("/")}
            style={styles.homeButton}
          >
            <Ionicons name="home" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Chat messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.chatBox} 
          contentContainerStyle={styles.messagesContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg, index) => (
            <View
              key={index}
              style={[
                styles.messageContainer,
                msg.role === "user" ? styles.userMessage : styles.botMessage,
              ]}
            >
              {msg.role === "assistant" && (
                <Ionicons name="medical" size={20} color="#fff" style={styles.messageIcon} />
              )}
              {formatMessageText(msg.text, msg.role === "user")}
              {msg.role === "user" && (
                <MaterialCommunityIcons name="account" size={20} color="#fff" style={styles.messageIcon} />
              )}
            </View>
          ))}
          
          {isLoading && (
            <View style={styles.thinkingContainer}>
              <ActivityIndicator size="small" color="#6e3e3e" />
              <AnimatedDots />
            </View>
          )}
        </ScrollView>

        {/* Input Box */}
        <KeyboardAvoidingView
           behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.select({
            ios: 40,
            android: 25,
          })}
          style={[
            styles.inputWrapper,
            { 
              marginBottom: keyboardHeight > 0 
                ? keyboardHeight + 30
                : 10 
            },
          ]}
        >
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Type your medical question..."
              placeholderTextColor="#9e9e9e"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              multiline
              blurOnSubmit={false}
            />
            <TouchableOpacity 
              onPress={handleSend}
              style={styles.sendButton}
              disabled={!inputText.trim()}
            >
              <Ionicons 
                name="send" 
                size={22} 
                color={inputText.trim() ? "#fff" : "#ccc"} 
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerLeft: {
    flexDirection: "column",
  },
  logoText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#d04aa6",
  },
  subtitle: {
    fontSize: 14,
    color: "#6e3e3e",
    marginTop: 2,
  },
  homeButton: {
    backgroundColor: "#d04aa6",
    padding: 8,
    borderRadius: 20,
  },
  messagesContainer: {
    paddingBottom: 25,
  },
  chatBox: {
    flex: 1,
    marginBottom: 12,
  },
  messageContainer: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderRadius: 18,
    maxWidth: "82%",
    alignItems: "flex-start",
    gap: 8, 
  },
  messageIcon: {
    marginTop: 2,
  },
  botMessage: {
    backgroundColor: "#d04aa6",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  botText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 22,
    flexShrink: 1,
  },
  userMessage: {
    backgroundColor: "#6e3e3e",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  userText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 22,
    flexShrink: 1,
  },
  boldText: {
    fontWeight: '700',
  },
  inputWrapper: {
    paddingBottom: Platform.OS === 'ios' ? 25 : 15,
    backgroundColor: "#f8f9fa",
  },
  inputRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    maxHeight: 120,
    paddingVertical: 4,
  },
  sendButton: {
    backgroundColor: "#d04aa6",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  thinkingContainer: {
    flexDirection: "row",
    alignSelf: "flex-start",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
  },
  thinkingText: {
    color: "#6e3e3e",
    fontSize: 15,
    marginLeft: 8,
    fontStyle: "italic",
  },
});