import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import SettingItem from "@/components/settings/SettingItem";
import ThemeSelector from "@/components/settings/ThemeSelector";
import { BASE_COLORS, TITLE_COLORS } from "@/constant/colors";
import { FeatherIconName } from "@/types/types";
import ProfilePictureModal from "../accountDetails/ProfilePictureModal";

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
  <View style={{ marginBottom: isLast ? 20 : 0 }}>
    <View
      style={[
        styles.settingItemCard,
        {
          borderRadius: isLast ? 20 : 0,
          borderTopLeftRadius: isFirstItem ? 20 : 0,
          borderTopRightRadius: isFirstItem ? 20 : 0,
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
          onPress={item.onPress}
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
  <TouchableOpacity style={styles.logoutButton} onPress={onPressLogout}>
    <Feather
      name="log-out"
      size={17}
      color={TITLE_COLORS.customWhite}
      style={styles.logoutIcon}
    />
    <Text style={styles.logoutText}>Logout</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  headerText: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    marginBottom: 7,
  },
  appearanceContainer: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    marginBottom: 5,
  },
  settingItemCard: {
    backgroundColor: BASE_COLORS.white,
    overflow: "hidden",
  },
  settingItemDivider: {
    borderBottomColor: BASE_COLORS.borderColor,
  },
  logoutButton: {
    backgroundColor: TITLE_COLORS.customRed,
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: BASE_COLORS.white,
    fontSize: 13,
    fontFamily: "Poppins-Medium",
  },
});

export default styles;
