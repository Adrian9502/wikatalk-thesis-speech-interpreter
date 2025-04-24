import React, { useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Edit2, ChevronRight } from "react-native-feather";
import styles from "@/styles/accountDetailsStyles";
import EditProfileModal from "./EditProfileModal";
import { useAuth } from "@/context/AuthContext";
import { showToast } from "@/lib/showToast";
import { useAuthStore } from "@/store/useAuthStore";
type SettingsSectionProps = {
  theme: any;
  onProfileUpdate?: () => void;
};

export const SettingsSection = ({
  theme,
  onProfileUpdate,
}: SettingsSectionProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { userData, updateUserProfile } = useAuth();
  // Get the changePassword function from the store
  const changePassword = useAuthStore((state) => state.changePassword);

  const handleEditProfile = () => {
    setIsModalVisible(true);
  };

  const handleSaveProfile = async (updatedData: {
    fullName: string;
    username: string;
    profilePicture?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => {
    try {
      // Extract password data if it exists
      const { currentPassword, newPassword, ...profileData } = updatedData;

      // Handle password change if provided
      if (currentPassword && newPassword) {
        // Use the changePassword function from useAuthStore
        const passwordResult = await changePassword(
          currentPassword,
          newPassword
        );

        if (!passwordResult.success) {
          // Don't close modal - return the error to be handled by the modal
          throw new Error(passwordResult.message || "Password change failed");
        }
      }

      // Handle profile data update
      if (Object.keys(profileData).length > 0) {
        const result = await updateUserProfile(profileData);
        if (!result.success) {
          throw new Error(result.message || "Failed to update profile");
        }
      }

      // Show success message only on success
      showToast({
        type: "success",
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });

      // Call the onProfileUpdate callback if provided
      if (onProfileUpdate) {
        onProfileUpdate();
      }

      // Only close modal if everything succeeded
      setIsModalVisible(false);
    } catch (error: any) {
      console.error("Failed to update profile:", error);

      // For password errors, show the error in the modal and don't close it
      if (updatedData.currentPassword && error.message.includes("password")) {
        // Return the error to EditProfileModal instead of showing toast
        throw error;
      } else {
        // For other errors, show toast and close modal
        showToast({
          type: "error",
          title: "Update Failed",
          description: error.message || "Failed to update profile",
        });
        setIsModalVisible(false);
      }
    }
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.settingItem} onPress={handleEditProfile}>
        <View
          style={[
            styles.settingIconContainer,
            { backgroundColor: theme.lightColor },
          ]}
        >
          <Edit2 width={20} height={20} color={theme.secondaryColor} />
        </View>
        <Text style={styles.settingText}>Edit Profile</Text>
        <ChevronRight width={20} height={20} color="#C0C0C8" />
      </TouchableOpacity>

      {userData && (
        <EditProfileModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onSave={handleSaveProfile}
          userData={userData}
          theme={theme}
        />
      )}
    </View>
  );
};
