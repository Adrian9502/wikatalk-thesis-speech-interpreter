import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import styles from "@/styles/accountDetailsStyles";
import { UserDataTypes } from "@/types/types";
import ProfilePictureModal from "./ProfilePictureModal";
import { User } from "react-native-feather";

type ProfileCardProps = {
  userData: UserDataTypes;
  theme: any;
};

export const ProfileCard = ({ userData, theme }: ProfileCardProps) => {
  const [showPictureModal, setShowPictureModal] = useState(false);

  return (
    <>
      <View style={styles.profileCard}>
        <TouchableOpacity
          style={[
            styles.avatarContainer,
            { backgroundColor: theme.secondaryColor },
          ]}
          onPress={() => userData?.profilePicture && setShowPictureModal(true)}
        >
          {userData?.profilePicture ? (
            <Image
              source={{ uri: userData.profilePicture }}
              style={styles.avatarImage}
            />
          ) : (
            <Text style={styles.avatarText}>
              {userData?.fullName?.charAt(0) || "?"}
            </Text>
          )}
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userData.fullName}</Text>
          <Text style={[styles.userEmail, { color: theme.secondaryColor }]}>
            {userData.email}
          </Text>
        </View>
      </View>

      {/* Profile Picture Modal */}
      {userData?.profilePicture && (
        <ProfilePictureModal
          visible={showPictureModal}
          imageUrl={userData.profilePicture}
          onClose={() => setShowPictureModal(false)}
        />
      )}
    </>
  );
};
