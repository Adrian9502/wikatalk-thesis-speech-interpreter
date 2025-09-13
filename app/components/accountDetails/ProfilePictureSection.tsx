import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Camera, User } from "react-native-feather";
import styles from "@/styles/editProfileStyles";

interface ProfilePictureSectionProps {
  profilePicture: string | null;
  handleSelectImage: () => void;
  theme: any;
}

export const ProfilePictureSection = React.memo<ProfilePictureSectionProps>(
  ({ profilePicture, handleSelectImage, theme }) => (
    <View style={styles.profilePictureContainer}>
      <View
        style={[styles.avatarContainer, { backgroundColor: theme.lightColor }]}
      >
        {profilePicture ? (
          <Image source={{ uri: profilePicture }} style={styles.avatarImage} />
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
          <Camera width={14} height={14} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  )
);

ProfilePictureSection.displayName = "ProfilePictureSection";
