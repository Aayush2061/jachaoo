import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
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

export default function FirstAidScreen() {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "What is your Problem",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

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
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, keyboardHeight]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const newUserMessage = {
      role: "user",
      text: inputText,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_FLASK_API_URL}/firstaid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: inputText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Request failed');
      }

      const data = await response.json();
      
      if (data.status !== 'success') {
        throw new Error(data.error || 'Invalid response');
      }

      const newBotMessage = {
        role: "assistant",
        text: data.reply,
      };

      setMessages((prev) => [...prev, newBotMessage]);
    } catch (error) {
      console.error("Full error details:", error);
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          text: `Error: ${error.message}. Please try again.` 
        },
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
          <View style={styles.logoRow}>
            <Text style={styles.logoText}>Jachaoo</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/")}>
            <Ionicons name="home-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Chat messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.chatBox} 
          contentContainerStyle={styles.messagesContainer}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg, index) => (
            <View
              key={index}
              style={
                msg.role === "user" ? styles.userMessage : styles.botMessage
              }
            >
              {msg.role === "assistant" ? (
                <Ionicons name="time" size={20} color="black" />
              ) : null}
              <Text style={msg.role === "user" ? styles.userText : styles.botText}>
                {msg.text}
              </Text>
              {msg.role === "user" ? (
                <MaterialCommunityIcons name="account" size={20} color="black" />
              ) : null}
            </View>
          ))}
          {isLoading && (
            <View style={styles.botMessage}>
              <Ionicons name="time" size={20} color="black" />
              <Text style={styles.botText}>Thinking...</Text>
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
                ? keyboardHeight + 25
                : 0 
            },
          ]}
        >
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="you can text here"
              placeholderTextColor="#6e3e3e"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              multiline
            />
            <TouchableOpacity onPress={handleSend}>
              <Ionicons name="send" size={24} color="black" />
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
    backgroundColor: "#fef6f7",
  },
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: Platform.OS === 'android' ? 10 : 0,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#d04aa6",
    marginRight: 8,
  },
  messagesContainer: {
    paddingBottom: 15,
  },
  chatBox: {
    flex: 1,
    marginBottom: 10,
  },
  botMessage: {
    flexDirection: "row",
    backgroundColor: "#e766b8",
    padding: 10,
    marginBottom: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
    maxWidth: "80%",
    alignItems: "center",
    gap: 6,
  },
  botText: {
    color: "#fff",
    fontWeight: "bold",
  },
  userMessage: {
    flexDirection: "row",
    backgroundColor: "#786c6c",
    padding: 10,
    marginBottom: 10,
    borderRadius: 20,
    alignSelf: "flex-end",
    maxWidth: "80%",
    alignItems: "center",
    gap: 6,
  },
  userText: {
    color: "#fff",
  },
  inputWrapper: {
    paddingHorizontal: 10,
    paddingBottom: Platform.OS === 'ios' ? 25 : 15,
    backgroundColor: "#fef6f7",
  },
  inputRow: {
    flexDirection: "row",
    backgroundColor: "#dedede",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#6e3e3e",
    marginRight: 10,
  },
});