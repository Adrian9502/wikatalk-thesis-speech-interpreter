import React, { useState } from "react";
import { View, Image, TouchableOpacity, Text, StyleSheet } from "react-native";
import { BASE_COLORS } from "@/constant/colors";
import ProfilePictureModal from "@/components/accountDetails/ProfilePictureModal";

interface ProfilePictureProps {
  userData: any;
  activeTheme: any;
  onPress: () => void;
}

const ProfilePicture = React.memo(
  ({ userData, activeTheme, onPress }: ProfilePictureProps) => {
    const [showPictureModal, setShowPictureModal] = useState(false);

    const handleProfilePress = () => {
      if (userData?.profilePicture) {
        setShowPictureModal(true);
      } else {
        onPress(); // Navigate to settings if no profile picture
      }
    };

    return (
      <>
        <TouchableOpacity
          style={styles.profilePictureButton}
          onPress={handleProfilePress}
          activeOpacity={0.8}
        >
          {userData?.profilePicture ? (
            <Image
              source={{ uri: userData.profilePicture }}
              style={styles.profileImage}
            />
          ) : (
            <View
              style={[
                styles.profilePlaceholder,
                { backgroundColor: activeTheme.secondaryColor },
              ]}
            >
              <Text style={styles.profileInitials}>
                {userData?.fullName?.charAt(0) ||
                  userData?.username?.charAt(0) ||
                  "U"}
              </Text>
            </View>
          )}
        </TouchableOpacity>

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
  }
);

const styles = StyleSheet.create({
  profilePictureButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  profilePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitials: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
});

ProfilePicture.displayName = "ProfilePicture";
export default ProfilePicture;
