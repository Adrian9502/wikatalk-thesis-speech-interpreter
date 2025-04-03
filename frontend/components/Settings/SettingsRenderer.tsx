import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import SettingItem from "@/components/Settings/SettingItem";
import ThemeSelector from "@/components/Settings/ThemeSelector";
import { BASE_COLORS, TITLE_COLORS } from "@/constant/colors";
import { FeatherIconName } from "@/types/types";

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

export const renderHeader = () => (
  <Text style={styles.headerText}>Settings</Text>
);

export const renderProfile = (userData: any, themeColor: string) => (
  <View style={styles.profileContainer}>
    <View style={styles.profileCard}>
      <View style={[styles.avatarContainer, { backgroundColor: themeColor }]}>
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
      </View>

      <View style={styles.userInfoContainer}>
        <Text style={styles.userName}>{userData?.fullName || "User"}</Text>
        <Text style={[styles.userEmail, { color: themeColor }]}>
          {userData?.email || "email@example.com"}
        </Text>
      </View>
    </View>
  </View>
);

export const renderAppearance = () => (
  <View style={styles.appearanceContainer}>
    <Text style={styles.sectionTitle}>Appearance</Text>
    <ThemeSelector />
  </View>
);

export const renderSectionTitle = (title: string) => (
  <View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

export const renderSettingItem = (
  item: SettingItemType,
  isLast: boolean,
  isFirstItem: boolean
) => (
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

export const renderLogoutButton = (onPressLogout: () => void) => (
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
    fontSize: 24,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    marginBottom: 12,
  },
  profileContainer: {
    marginBottom: 24,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: TITLE_COLORS.customWhite,
    padding: 12,
    borderRadius: 14,
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
    borderRadius: 8,
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
