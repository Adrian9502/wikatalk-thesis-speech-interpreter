import React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { Camera, User } from "react-native-feather";
import styles from "@/styles/editProfileStyles";

interface ProfilePictureSectionProps {
  profilePicture: string | null;
  handleSelectImage: () => void;
  theme: any;
}

export const ProfilePictureSection = ({
  profilePicture,
  handleSelectImage,
  theme,
}: ProfilePictureSectionProps) => (
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
        <Camera width={16} height={16} color="white" />
      </TouchableOpacity>
    </View>
  </View>
);
