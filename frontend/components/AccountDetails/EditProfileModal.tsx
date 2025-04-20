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
  Image,
} from "react-native";
import { BASE_COLORS } from "@/constant/colors";
import { UserDataTypes } from "@/types/types";
import { Camera, User } from "react-native-feather";
import * as ImagePicker from "expo-image-picker";

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (userData: {
    fullName: string;
    username: string;
    profilePicture?: string;
  }) => Promise<void>;
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
  const [profilePicture, setProfilePicture] = useState<string | null>(
    userData?.profilePicture || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageChanged, setImageChanged] = useState(false);

  useEffect(() => {
    const setStatusBar = (style: "default" | "light-content") => {
      StatusBar.setBarStyle(style);
      if (Platform.OS === "android") {
        StatusBar.setBackgroundColor("transparent");
      }
    };

    if (visible) setStatusBar("light-content");
    return () => setStatusBar("default");
  }, [visible]);

  // Reset state when modal becomes visible
  useEffect(() => {
    if (visible) {
      setFullName(userData?.fullName || "");
      setUsername(userData?.username || "");
      setProfilePicture(userData?.profilePicture || null);
      setImageChanged(false);
      setError("");
    }
  }, [visible, userData]);

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
      username.trim() === userData?.username?.trim() &&
      !imageChanged
    ) {
      setError(
        "Looks like nothing was changed. Please update your details to save."
      );
      return;
    }

    try {
      setIsLoading(true);
      const updateData: any = { fullName, username };

      // Only include profile picture if it was changed
      if (imageChanged && profilePicture) {
        updateData.profilePicture = profilePicture;
      }

      await onSave(updateData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectImage = async () => {
    try {
      // Request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        setError("Permission to access camera roll is required!");
        return;
      }

      // Use improved settings for smaller image size
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.4, // Reduced quality (0.7 -> 0.4)
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        // Convert to base64 with size limit check
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;

        // Check the approximate size (base64 is ~33% larger than the actual file)
        const approximateSize = (base64Image.length * 0.75) / (1024 * 1024);

        if (approximateSize > 10) {
          // If larger than 10MB
          setError(
            `Image too large (${approximateSize.toFixed(
              1
            )}MB). Please choose a smaller image.`
          );
          return;
        }

        setProfilePicture(base64Image);
        setImageChanged(true);
      }
    } catch (err) {
      console.error("Error selecting image:", err);
      setError("Failed to select image. Please try again.");
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

            {/* Profile Picture Section */}
            <View style={styles.profilePictureContainer}>
              <View
                style={[
                  styles.avatarContainer,
                  { backgroundColor: theme.lightColor },
                ]}
              >
                {profilePicture ? (
                  <Image
                    source={{ uri: profilePicture }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <User width={50} height={50} color={theme.secondaryColor} />
                )}
                <TouchableOpacity
                  style={[
                    styles.editPictureButton,
                    { backgroundColor: theme.secondaryColor },
                  ]}
                  onPress={handleSelectImage}
                >
                  <Camera width={16} height={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>

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
  formContainer: {
    padding: 16,
    maxHeight: 500,
  },
  profilePictureContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "visible",
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editPictureButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BASE_COLORS.blue,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
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
