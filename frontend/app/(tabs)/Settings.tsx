import React, { useState } from "react";
import { FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@/context/AuthContext";
import useThemeStore from "@/store/useThemeStore";
import { FeatherIconName } from "@/types/types";
import ConfirmationModal from "@/components/ConfirmationModal";
import { globalStyles } from "@/styles/globalStyles";
import {
  Header,
  ProfileSection,
  AppearanceSection,
  SectionTitle,
  SettingItemComponent,
  LogoutButton,
} from "@/components/Settings/SettingsRenderer";
import { router } from "expo-router";

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

type SettingSection = {
  title: string;
  items: SettingItemType[];
};

// Define a type for our list items (for flat rendering)
type ListItem = {
  type: "header" | "profile" | "appearance" | "section" | "item" | "logout";
  data: any;
  key: string;
};

const Settings = () => {
  // auth context
  const { logout, userData } = useAuth();
  // Get theme from store
  const { activeTheme } = useThemeStore();
  // Modal state
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const sections: SettingSection[] = [
    {
      title: "Account",
      items: [
        {
          icon: "user",
          label: "Account Details",
          onPress: () => router.push("/(settings)/AccountDetails"),
        },
        {
          icon: "lock",
          label: "Change Password",
          onPress: () => router.push("/(settings)/ChangePassword"),
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: "help-circle",
          label: "Help & FAQ",
          onPress: () => router.push("/(settings)/HelpAndFAQ"),
        },
        {
          icon: "headphones",
          label: "Contact Support",
          onPress: () => router.push("/(settings)/ContactSupport"),
        },
      ],
    },
  ];

  // Create a flattened list of items for FlatList
  const createListItems = (): ListItem[] => {
    const items: ListItem[] = [];

    // Add header
    items.push({
      type: "header",
      data: "Settings",
      key: "header",
    });

    // Add profile section
    items.push({
      type: "profile",
      data: userData,
      key: "profile",
    });

    // Add appearance section
    items.push({
      type: "appearance",
      data: "Appearance",
      key: "appearance-title",
    });

    // Add settings sections
    sections.forEach((section, sectionIndex) => {
      // Add section title
      items.push({
        type: "section",
        data: section.title,
        key: `section-${sectionIndex}`,
      });

      // Add section items
      section.items.forEach((item, itemIndex) => {
        items.push({
          type: "item",
          data: {
            item,
            isLast: itemIndex === section.items.length - 1,
            isFirstItem: itemIndex === 0,
            sectionIndex,
          },
          key: `item-${sectionIndex}-${itemIndex}`,
        });
      });
    });

    // Add logout button
    items.push({
      type: "logout",
      data: null,
      key: "logout",
    });

    return items;
  };

  const renderItem = ({ item }: { item: ListItem }) => {
    switch (item.type) {
      case "header":
        return <Header />;

      case "profile":
        return (
          <ProfileSection
            userData={userData}
            themeColor={activeTheme.secondaryColor}
          />
        );

      case "appearance":
        return <AppearanceSection />;

      case "section":
        return <SectionTitle title={item.data} />;

      case "item":
        const { item: settingItem, isLast, isFirstItem } = item.data;
        return (
          <SettingItemComponent
            item={settingItem}
            isLast={isLast}
            isFirstItem={isFirstItem}
          />
        );

      case "logout":
        return (
          <LogoutButton onPressLogout={() => setLogoutModalVisible(true)} />
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      style={[
        globalStyles.container,
        { backgroundColor: activeTheme.backgroundColor },
      ]}
    >
      <StatusBar style="light" />

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={logoutModalVisible}
        title="Logout"
        text="Are you sure you want to logout from your account?"
        confirmButtonText="Logout"
        onCancel={() => setLogoutModalVisible(false)}
        onConfirm={() => {
          setLogoutModalVisible(false);
          handleLogout();
        }}
      />

      <FlatList
        data={createListItems()}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default Settings;
