import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { BASE_COLORS } from "@/constant/colors";
import ProfilePictureModal from "../accountDetails/ProfilePictureModal";

const ProfileCard = ({
  userData,
  themeColor,
}: {
  userData: any;
  themeColor: string;
}) => {
  const [showPictureModal, setShowPictureModal] = useState(false);

  return (
    <>
      <View style={styles.profileCard}>
        <TouchableOpacity
          style={[styles.avatarContainer, { backgroundColor: themeColor }]}
          onPress={() => userData?.profilePicture && setShowPictureModal(true)}
        >
          {userData?.profilePicture ? (
            <Image
              source={{ uri: userData.profilePicture }}
              style={styles.avatarImage}
            />
          ) : (
            <Text style={styles.avatarText}>
              {userData?.fullName?.charAt(0) || "U"}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.userInfoContainer}>
          <Text style={styles.userName}>{userData?.fullName || "User"}</Text>
          <Text style={[styles.userEmail, { color: themeColor }]}>
            {userData?.email || "Guest - No email"}
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

export default ProfileCard;

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BASE_COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  avatarContainer: {
    width: 54,
    height: 54,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarImage: {
    width: 54,
    height: 54,
    borderRadius: 32,
  },
  avatarText: {
    fontSize: 22,
    color: "white",
    fontFamily: "Poppins-Medium",
  },
  userInfoContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.darkText,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
  },
});
