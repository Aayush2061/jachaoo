import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function DeleteAccountScreen() {
  const { user } = useUser();
  const { getToken, signOut } = useAuth(); // Use useAuth to get getToken
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action is permanent and cannot be undone. All your data will be erased.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const token = await getToken(); // Get token from useAuth

              const response = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/account`,
                {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, // Use the token
                  },
                }
              );

              const result = await response.json();

              if (response.ok) {
                Alert.alert(
                  "Account Deleted",
                  "Your account has been successfully deleted.",
                  [
                    {
                      text: "OK",
                      onPress: () => {
                        signOut();
                        router.replace("/(auth)");
                      },
                    },
                  ]
                );
              } else {
                throw new Error(result.error || "Failed to delete account");
              }
            } catch (error: any) {
              console.error("Delete account error:", error);
              Alert.alert(
                "Error",
                error.message || "Failed to delete account. Please try again."
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="warning" size={64} color="#E74C3C" />
        <Text style={styles.title}>Delete Account</Text>
        <Text style={styles.subtitle}>This action cannot be undone</Text>
      </View>

      <View style={styles.warningCard}>
        <Text style={styles.warningTitle}>
          What happens when you delete your account?
        </Text>
        <View style={styles.warningItem}>
          <Ionicons name="close-circle" size={20} color="#E74C3C" />
          <Text style={styles.warningText}>
            All your personal information will be permanently deleted
          </Text>
        </View>
        <View style={styles.warningItem}>
          <Ionicons name="close-circle" size={20} color="#E74C3C" />
          <Text style={styles.warningText}>
            Your health data, reports, and analysis will be erased
          </Text>
        </View>
        <View style={styles.warningItem}>
          <Ionicons name="close-circle" size={20} color="#E74C3C" />
          <Text style={styles.warningText}>
            You won't be able to recover any of your data
          </Text>
        </View>
        <View style={styles.warningItem}>
          <Ionicons name="close-circle" size={20} color="#E74C3C" />
          <Text style={styles.warningText}>
            You'll need to create a new account to use the app again
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.deleteButton, loading && styles.deleteButtonDisabled]}
        onPress={handleDeleteAccount}
        disabled={loading}
      >
        <Ionicons name="trash" size={20} color="white" />
        <Text style={styles.deleteButtonText}>
          {loading ? "Deleting..." : "Permanently Delete Account"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
        disabled={loading}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFF",
    padding: 20,
  },
  header: {
    alignItems: "center",
    padding: 30,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#E74C3C",
    marginTop: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#7F8C8D",
    marginTop: 8,
    textAlign: "center",
  },
  warningCard: {
    backgroundColor: "#FDECEA",
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#C0392B",
    marginBottom: 16,
  },
  warningItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  warningText: {
    fontSize: 14,
    color: "#7F8C8D",
    marginLeft: 12,
    flex: 1,
  },
  deleteButton: {
    backgroundColor: "#E74C3C",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  cancelButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BDC3C7",
  },
  cancelButtonText: {
    color: "#7F8C8D",
    fontSize: 16,
    fontWeight: "600",
  },
});
