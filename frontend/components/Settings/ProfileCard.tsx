import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { User } from "react-native-feather";
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
              {userData?.fullName?.charAt(0) ||
                userData?.username?.charAt(0) ||
                "U"}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.userInfoContainer}>
          {/* Full Name as main title */}
          <Text style={styles.userName}>{userData?.fullName || "User"}</Text>

          {/* Username with clear indicator */}
          <View style={styles.usernameRow}>
            <View style={[styles.usernameBadge, { borderColor: themeColor }]}>
              <User width={10} height={10} color={themeColor} />
              <Text style={[styles.usernameText, { color: themeColor }]}>
                {userData?.username || "username"}
              </Text>
            </View>
          </View>

          {/* Email */}
          <Text style={styles.userEmail}>
            {userData?.email || "No email provided"}
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarText: {
    fontSize: 24,
    color: "white",
    fontFamily: "Poppins-SemiBold",
  },
  userInfoContainer: {
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 11,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.placeholderText,
    marginRight: 6,
    minWidth: 35,
  },
  userName: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.darkText,
    flex: 1,
  },
  usernameRow: {
    marginVertical: 4,
  },
  usernameBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
    backgroundColor: "rgba(0, 0, 0, 0.02)",
  },
  usernameText: {
    fontSize: 11,
    fontFamily: "Poppins-Medium",
    marginLeft: 3,
  },
  userEmail: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.placeholderText,
    marginTop: 2,
  },
});
