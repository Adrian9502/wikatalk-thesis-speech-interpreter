import React, { useState, useCallback } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Edit2, ChevronRight } from "react-native-feather";
import styles from "@/styles/accountDetailsStyles";
import EditProfileModal from "./EditProfileModal";
import { useAuth } from "@/context/AuthContext";
import showNotification from "@/lib/showNotification";
import { useAuthStore } from "@/store/useAuthStore";

// Memoize the icon components
const EditIcon = React.memo((props: any) => <Edit2 {...props} />);
const ChevronIcon = React.memo((props: any) => <ChevronRight {...props} />);

type SettingsSectionProps = {
  theme: any;
  onProfileUpdate?: () => void;
};

const EditProfileSection = React.memo(
  ({ theme, onProfileUpdate }: SettingsSectionProps) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const { userData, updateUserProfile } = useAuth();
    // Get the changePassword function from the store
    const changePassword = useAuthStore((state) => state.changePassword);

    // Memoize callbacks
    const handleEditProfile = useCallback(() => {
      setIsModalVisible(true);
    }, []);

    const handleModalClose = useCallback(() => {
      setIsModalVisible(false);
    }, []);

    const handleSaveProfile = useCallback(
      async (updatedData: {
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
              throw new Error(
                passwordResult.message || "Password change failed"
              );
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
          showNotification({
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
          if (
            updatedData.currentPassword &&
            error.message.includes("password")
          ) {
            // Return the error to EditProfileModal instead of showing notification
            throw error;
          } else {
            // For other errors, show notification and close modal
            showNotification({
              type: "error",
              title: "Update Failed",
              description: error.message || "Failed to update profile",
            });
            setIsModalVisible(false);
          }
        }
      },
      [changePassword, updateUserProfile, onProfileUpdate]
    );

    // Memoize style objects
    const iconContainerStyle = React.useMemo(
      () => [
        styles.settingIconContainer,
        { backgroundColor: theme.lightColor },
      ],
      [theme.lightColor, styles.settingIconContainer]
    );

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={handleEditProfile}
          activeOpacity={0.7}
        >
          <View style={iconContainerStyle}>
            <EditIcon width={18} height={18} color={theme.secondaryColor} />
          </View>
          <Text style={styles.settingText}>Edit Profile</Text>
          <ChevronIcon width={18} height={18} color="#C0C0C8" />
        </TouchableOpacity>

        {userData && (
          <EditProfileModal
            visible={isModalVisible}
            onClose={handleModalClose}
            onSave={handleSaveProfile}
            userData={userData}
            theme={theme}
          />
        )}
      </View>
    );
  }
);

EditProfileSection.displayName = "EditProfileSection";
export default EditProfileSection;
