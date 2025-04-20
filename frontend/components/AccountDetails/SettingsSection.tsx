import React, { useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Edit2, ChevronRight } from "react-native-feather";
import styles from "@/styles/accountDetailsStyles";
import EditProfileModal from "./EditProfileModal";
import { useAuth } from "@/context/AuthContext";
import { showToast } from "@/lib/showToast";

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

  const handleEditProfile = () => {
    setIsModalVisible(true);
  };

  const handleSaveProfile = async (updatedData: {
    fullName: string;
    username: string;
  }) => {
    try {
      // Use the updateUserProfile method from useAuth
      const result = await updateUserProfile(updatedData);

      if (result.success) {
        showToast({
          type: "success",
          title: "Profile Updated",
          description: "Your profile has been updated successfully",
        });

        // Call the onProfileUpdate callback if provided
        if (onProfileUpdate) {
          onProfileUpdate();
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error("Failed to update profile:", error);

      showToast({
        type: "error",
        title: "Update Failed",
        description: error.message || "Failed to update profile",
      });
    } finally {
      setIsModalVisible(false);
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
