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

// Remove the AnimatedDots component since we're using typing indicator
// Remove formatMessageText function since we're using simple text

export default function FirstAidScreen() {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Array<{
    id: string;
    role: "user" | "assistant";
    text: string;
    timestamp: Date;
  }>>([
    {
      id: "1",
      role: "assistant",
      text: "Hello! I'm your first aid assistant. What medical help do you need today?",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const { getToken } = useAuth();
  const router = useRouter();
  const MAX_MESSAGE_LENGTH = 300;

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

  // Auto-scroll effect - same as mental health chat
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, keyboardHeight]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    if (inputText.length > MAX_MESSAGE_LENGTH) {
      alert(`Message too long (max ${MAX_MESSAGE_LENGTH} characters)`);
      return;
    }

    // Create user message
    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      text: inputText,
      timestamp: new Date(),
    };

    // Add user message immediately (optimistic UI)
    setMessages(prev => [...prev, userMessage]);
    setInputText("");
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
        // Remove the user message if rate-limited
        setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
        alert(`You've used your ${error.limit} daily messages. Try again tomorrow.`);
        return;
      }

      if (!response.ok) throw new Error('Request failed');
      
      const data = await response.json();
      if (data.status !== 'success') throw new Error(data.error || 'Invalid response');

      // Add assistant response
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        text: data.reply,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      // Add error message
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        text: `Error: ${error.message}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
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
            onContentSizeChange={() => {
              // Auto-scroll when content size changes (additional safety)
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 50);
            }}
          >
            {/* Render all messages */}
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageBubble,
                  msg.role === "user" ? styles.userBubble : styles.botBubble,
                ]}
              >
                {msg.role === "assistant" && (
                  <View style={styles.botAvatar}>
                    <Ionicons name="medical" size={16} color="#FFFFFF" />
                  </View>
                )}
                <View style={styles.messageContent}>
                  <Text
                    style={[
                      styles.messageText,
                      msg.role === "user" ? styles.userText : styles.botText,
                    ]}
                  >
                    {msg.text}
                  </Text>
                  <Text style={styles.timestamp}>
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
                {msg.role === "user" && (
                  <View style={styles.userAvatar}>
                    <MaterialCommunityIcons name="account" size={16} color="#FFFFFF" />
                  </View>
                )}
              </View>
            ))}
            
            {isLoading && (
              <View style={[styles.messageBubble, styles.botBubble]}>
                <View style={styles.botAvatar}>
                  <Ionicons name="medical" size={16} color="#FFFFFF" />
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

          {/* Input Box */}
          <View style={[
            styles.inputWrapper,
            Platform.OS === "ios" && keyboardHeight > 0 ? { 
              paddingBottom: 0
            } : {}
          ]}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type your medical question..."
                placeholderTextColor="#9e9e9e"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSend}
                multiline
                blurOnSubmit={false}
                maxLength={MAX_MESSAGE_LENGTH}
              />
              <TouchableOpacity 
                onPress={handleSend}
                style={[
                  styles.sendButton,
                  inputText.trim() === "" && styles.sendButtonDisabled,
                ]}
                disabled={!inputText.trim() || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons 
                    name="send" 
                    size={22} 
                    color={inputText.trim() ? "#fff" : "#ccc"} 
                  />
                )}
              </TouchableOpacity>
            </View>
            {keyboardHeight === 0 && (
              <Text style={styles.inputHint}>
                {inputText.length}/{MAX_MESSAGE_LENGTH} • Not a substitute for professional care.
              </Text>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
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
  chatBox: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
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
    backgroundColor: "#d04aa6",
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
    backgroundColor: "#6e3e3e",
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
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  botText: {
    color: "#d04aa6",
    backgroundColor: "#fce8f5",
    borderTopLeftRadius: 4,
  },
  userText: {
    color: "#FFFFFF",
    backgroundColor: "#6e3e3e",
    borderTopRightRadius: 4,
  },
  timestamp: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  typingIndicator: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fce8f5",
    borderRadius: 20,
    borderTopLeftRadius: 4,
    alignSelf: "flex-start",
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#d04aa6",
    marginHorizontal: 2,
  },
  typingDot2: {
    opacity: 0.7,
  },
  typingDot3: {
    opacity: 0.4,
  },
  inputWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
    backgroundColor: "#f8f9fa",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    maxHeight: 100,
    minHeight: 40,
    paddingVertical: 10,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#d04aa6",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: "#E0E0E0",
  },
  inputHint: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    marginTop: 8,
  },
});