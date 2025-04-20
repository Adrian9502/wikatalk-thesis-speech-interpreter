import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Platform,
} from "react-native";
import { BASE_COLORS } from "@/constant/colors";
import { UserDataTypes } from "@/types/types";
import { SafeAreaView } from "react-native-safe-area-context";

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (userData: { fullName: string; username: string }) => Promise<void>;
  userData: UserDataTypes;
  theme: any;
}

const EditProfileModal = ({
  visible,
  onClose,
  onSave,
  userData,
  theme,
}: EditProfileModalProps) => {
  const [fullName, setFullName] = useState(userData?.fullName || "");
  const [username, setUsername] = useState(userData?.username || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible) {
      StatusBar.setBarStyle("light-content");
      if (Platform.OS === "android") {
        StatusBar.setBackgroundColor("transparent");
      }
    }
    return () => {
      StatusBar.setBarStyle("default");
      if (Platform.OS === "android") {
        StatusBar.setBackgroundColor("transparent");
      }
    };
  }, [visible]);

  const handleSave = async () => {
    // Reset any previous error
    setError("");

    // Check for empty fields
    if (!fullName.trim() || !username.trim()) {
      setError("Full name and username cannot be empty");
      return;
    }

    // Check if anything has changed
    if (
      fullName.trim() === userData?.fullName?.trim() &&
      username.trim() === userData?.username?.trim()
    ) {
      setError(
        "Looks like nothing was changed. Please update your name or username to save."
      );
      return;
    }

    try {
      setIsLoading(true);
      await onSave({ fullName, username });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.headerContainer,
              { backgroundColor: theme.secondaryColor },
            ]}
          >
            <Text style={styles.headerTitle}>Edit Profile</Text>
          </View>

          <ScrollView style={styles.formContainer}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.textInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              autoCapitalize="words"
            />

            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={styles.textInput}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: theme.secondaryColor },
              ]}
              onPress={handleSave}
              disabled={isLoading}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isLoading && (
                  <ActivityIndicator
                    size="small"
                    color="white"
                    style={{ marginRight: 8 }}
                  />
                )}
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.cancelButtonText,
                  { color: theme.secondaryColor },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 0,
    marginTop: 0,
  },
  modalContainer: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerContainer: {
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: "white",
  },
  closeButton: {
    padding: 5,
  },
  formContainer: {
    padding: 16,
    maxHeight: 500,
  },
  errorText: {
    color: BASE_COLORS.orange,
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    marginBottom: 8,
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.placeholderText,
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    marginBottom: 16,
    backgroundColor: "#F9FAFB",
  },
  saveButton: {
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  saveButtonText: {
    color: "white",
    fontSize: 14,
    fontFamily: "Poppins-Medium",
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
  },
});

export default EditProfileModal;
