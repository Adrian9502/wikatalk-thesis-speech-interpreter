import React, { useState, useRef, useEffect } from "react";
import { FlatList, Animated, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@/context/AuthContext";
import useThemeStore from "@/store/useThemeStore";
import { FeatherIconName } from "@/types/types";
import ConfirmationModal from "@/components/ConfirmationModal";
import { globalStyles } from "@/styles/globalStyles";
import {
  Header,
  AppearanceSection,
  SectionTitle,
  SettingItemComponent,
  LogoutButton,
} from "@/components/settings/SettingsRenderer";
import { router } from "expo-router";
import ContactSupportModal from "@/components/helpAndFAQ/ContactSupportModal";
import { clearAllAccountData } from "@/utils/accountUtils";
import ProfileCard from "@/components/settings/ProfileCard";

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

type ListItem = {
  type: "header" | "profile" | "appearance" | "section" | "item" | "logout";
  data: any;
  key: string;
  sectionIndex?: number;
  itemIndex?: number;
};

const Settings = () => {
  // auth context
  const { logout, userData } = useAuth();
  // Get theme from store
  const { activeTheme } = useThemeStore();
  // Modal state
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);

  // SIMPLIFIED: Single fade animation for entire list
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Simple fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleLogout = async () => {
    try {
      console.log("[Settings] Logging out user"); // Clear all account data before logout

      await clearAllAccountData();

      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const sections: SettingSection[] = [
    // Activity Section
    {
      title: "Activity",
      items: [
        {
          icon: "clock",
          label: "Recent Activity",
          onPress: () => router.push("/(settings)/RecentActivity"),
        },
      ],
    },
    // Account Section
    {
      title: "Account",
      items: [
        {
          icon: "user",
          label: "Account Details",
          onPress: () => router.push("/(settings)/AccountDetails"),
        },
      ],
    },
    // Support section
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
          onPress: () => setContactModalVisible(true),
        },
        {
          icon: "info",
          label: "About Us",
          onPress: () => router.push("/(settings)/About"),
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
        sectionIndex, // NEW: Add for animation timing
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
          sectionIndex, // NEW: Add for animation timing
          itemIndex, // NEW: Add for animation timing
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

  // SIMPLIFIED: Direct rendering without individual animations
  const renderItem = ({ item, index }: { item: ListItem; index: number }) => {
    switch (item.type) {
      case "header":
        return <Header />;

      case "profile":
        return (
          <ProfileCard
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

      <ContactSupportModal
        visible={contactModalVisible}
        onClose={() => setContactModalVisible(false)}
      />

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FlatList
          data={createListItems()}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={false}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={10}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

export default Settings;
