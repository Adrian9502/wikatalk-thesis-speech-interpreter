import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import SettingItem from "@/components/Settings/SettingItem";
import ThemeSelector from "@/components/Settings/ThemeSelector";
import { BASE_COLORS, TITLE_COLORS } from "@/constant/colors";
import { FeatherIconName } from "@/types/types";
import ProfilePictureModal from "../AccountDetails/ProfilePictureModal";

// Types
type SettingItemWithToggle = {
  icon: FeatherIconName;
  label: string;
  value: boolean;
  toggleSwitch: () => void;
  onPress?: undefined;
};

type SettingItemWithPress = {
  icon: FeatherIconName;
  label: string;
  onPress: () => void;
  value?: undefined;
  toggleSwitch?: undefined;
};

type SettingItemType = SettingItemWithToggle | SettingItemWithPress;

// Convert render functions to proper React components
export const Header = () => <Text style={styles.headerText}>Settings</Text>;

export const ProfileSection = ({
  userData,
  themeColor,
}: {
  userData: any;
  themeColor: string;
}) => {
  // Hooks are valid here because this is a proper component
  const [showPictureModal, setShowPictureModal] = useState(false);

  return (
    <View style={styles.profileContainer}>
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
            {userData?.email || "email@example.com"}
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
    </View>
  );
};

export const AppearanceSection = () => (
  <View style={styles.appearanceContainer}>
    <Text style={styles.sectionTitle}>Appearance</Text>
    <ThemeSelector />
  </View>
);

export const SectionTitle = ({ title }: { title: string }) => (
  <View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

export const SettingItemComponent = ({
  item,
  isLast,
  isFirstItem,
}: {
  item: SettingItemType;
  isLast: boolean;
  isFirstItem: boolean;
}) => (
  <View style={{ marginBottom: isLast ? 24 : 0 }}>
    <View
      style={[
        styles.settingItemCard,
        {
          borderRadius: isLast ? 16 : 0,
          borderTopLeftRadius: isFirstItem ? 16 : 0,
          borderTopRightRadius: isFirstItem ? 16 : 0,
        },
      ]}
    >
      <View
        style={[
          styles.settingItemDivider,
          { borderBottomWidth: isLast ? 0 : 1 },
        ]}
      >
        <SettingItem
          icon={item.icon}
          label={item.label}
          value={item.value}
          onPress={item.onPress}
          toggleSwitch={item.toggleSwitch}
        />
      </View>
    </View>
  </View>
);

export const LogoutButton = ({
  onPressLogout,
}: {
  onPressLogout: () => void;
}) => (
  <View style={styles.logoutContainer}>
    <TouchableOpacity style={styles.logoutButton} onPress={onPressLogout}>
      <Feather
        name="log-out"
        size={20}
        color={TITLE_COLORS.customWhite}
        style={styles.logoutIcon}
      />
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  </View>
);

// Styles
const styles = StyleSheet.create({
  headerText: {
    fontSize: 20,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    marginBottom: 7,
  },
  profileContainer: {
    marginBottom: 24,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: TITLE_COLORS.customWhite,
    padding: 12,
    borderRadius: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarText: {
    fontSize: 24,
    color: "white",
    fontFamily: "Poppins-Medium",
  },
  userInfoContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.darkText,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
  },
  appearanceContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    marginBottom: 5,
  },
  settingItemCard: {
    backgroundColor: TITLE_COLORS.customWhite,
    overflow: "hidden",
  },
  settingItemDivider: {
    borderBottomColor: BASE_COLORS.borderColor,
  },
  logoutContainer: {
    marginBottom: 15,
  },
  logoutButton: {
    backgroundColor: TITLE_COLORS.customRed,
    borderRadius: 16,
    padding: 13,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: TITLE_COLORS.customWhite,
    fontSize: 16,
    fontFamily: "Poppins-Medium",
  },
});

export default styles;
