import React, { useState, useEffect } from "react";
import { FlatList, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@/context/AuthContext";
import useThemeStore from "@/store/useThemeStore";
import { useGameSoundStore } from "@/store/useGameSoundStore";
import { FeatherIconName } from "@/types/types";
import ConfirmationModal from "@/components/ConfirmationModal";
import { globalStyles } from "@/styles/globalStyles";
import {
  AppearanceSection,
  SectionTitle,
  SettingItemComponent,
  LogoutButton,
  LoginMethods,
} from "@/components/settings/SettingsRenderer";
import { router } from "expo-router";
import ContactSupportModal from "@/components/helpAndFAQ/ContactSupportModal";
import { clearAllAccountData } from "@/utils/accountUtils";
import ProfileCard from "@/components/settings/ProfileCard";
import { Header as BackHeader } from "@/components/Header";
import TermsOfUseModal from "@/components/legal/TermsOfUseModal";
import { useTutorial } from "@/context/TutorialContext";
import { HOME_TUTORIAL } from "@/constants/tutorials";

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
  type:
    | "header"
    | "profile"
    | "login-methods"
    | "appearance"
    | "homepage-toggle"
    | "section"
    | "item"
    | "logout";
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
  // Game sound store
  const { isSoundEnabled, setGameSoundEnabled, loadSoundSettings } =
    useGameSoundStore();
  // Tutorial context
  const { startTutorial } = useTutorial();

  // Modal state
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  // NEW: Add tutorial confirmation modal state
  const [tutorialConfirmModalVisible, setTutorialConfirmModalVisible] =
    useState(false);

  // Load sound settings on component mount
  useEffect(() => {
    loadSoundSettings();
  }, [loadSoundSettings]);

  // Back navigation handler
  const handleBackPress = () => {
    console.log("[Settings] Back pressed, navigating to Home tab");
    router.push("/(tabs)/Home");
  };

  const handleLogout = async () => {
    try {
      console.log("[Settings] Logging out user");
      await clearAllAccountData();
      await logout(true);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Handle game sound toggle
  const handleGameSoundToggle = () => {
    setGameSoundEnabled(!isSoundEnabled);
  };

  // NEW: Show confirmation modal first
  const handleTutorialButtonPress = () => {
    console.log("[Settings] Tutorial button pressed, showing confirmation");
    setTutorialConfirmModalVisible(true);
  };

  // NEW: Handle confirmed tutorial trigger
  const handleConfirmedTutorialTrigger = () => {
    console.log("[Settings] Tutorial confirmed, starting replay");
    setTutorialConfirmModalVisible(false);

    // Navigate to home first
    router.push("/(tabs)/Home");
    // Start tutorial with forceStart=true to bypass all checks including local skip
    setTimeout(() => {
      startTutorial(HOME_TUTORIAL, true);
    }, 800);
  };

  // NEW: Handle tutorial confirmation cancel
  const handleTutorialCancel = () => {
    console.log("[Settings] Tutorial confirmation cancelled");
    setTutorialConfirmModalVisible(false);
  };

  const sections: SettingSection[] = [
    // Games Section
    {
      title: "Games",
      items: [
        {
          icon: "volume-2",
          label: "Game Sound Effects",
          value: isSoundEnabled,
          toggleSwitch: handleGameSoundToggle,
        },
      ],
    },
    // Activity Section
    {
      title: "Activity",
      items: [
        {
          icon: "clock",
          label: "Translation History",
          onPress: () => router.push("/(settings)/TranslationHistory"),
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
    // Tutorial Section
    {
      title: "Tutorial",
      items: [
        {
          icon: "play-circle",
          label: "Replay Full App Tutorial",
          onPress: handleTutorialButtonPress, // CHANGED: Show confirmation first
        },
      ],
    },
    // Legal Section
    {
      title: "Legal",
      items: [
        {
          icon: "file-text",
          label: "Terms of Use",
          onPress: () => setTermsModalVisible(true),
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
          icon: "message-circle",
          label: "Send Feedback",
          onPress: () => router.push("/(settings)/SendFeedback"),
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

    // Add profile section
    items.push({
      type: "profile",
      data: userData,
      key: "profile",
    });

    // Account linking info section
    if (userData) {
      items.push({
        type: "login-methods",
        data: userData,
        key: "login-methods",
      });
    }

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
        sectionIndex,
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
          sectionIndex,
          itemIndex,
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

  const renderItem = ({ item, index }: { item: ListItem; index: number }) => {
    switch (item.type) {
      case "profile":
        return (
          <ProfileCard
            userData={userData}
            themeColor={activeTheme.secondaryColor}
          />
        );

      case "login-methods":
        return <LoginMethods userData={item.data} />;

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

  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      edges={["left", "right", "bottom"]}
      style={[
        globalStyles.container,
        { backgroundColor: activeTheme.backgroundColor },
        { paddingTop: insets.top },
      ]}
    >
      <StatusBar style="light" />

      {/* Back Header */}
      <BackHeader title="Settings" onBackPress={handleBackPress} />

      {/* Logout Confirmation Modal */}
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

      {/* NEW: Tutorial Confirmation Modal */}
      <ConfirmationModal
        visible={tutorialConfirmModalVisible}
        title="Replay Tutorial"
        text="This will start the full app tutorial from the beginning, guiding you through all features. Continue?"
        confirmButtonText="Start Tutorial"
        cancelButtonText="Cancel"
        onCancel={handleTutorialCancel}
        onConfirm={handleConfirmedTutorialTrigger}
      />

      <ContactSupportModal
        visible={contactModalVisible}
        onClose={() => setContactModalVisible(false)}
      />

      {/* Terms of Use Modal */}
      <TermsOfUseModal
        visible={termsModalVisible}
        onClose={() => setTermsModalVisible(false)}
      />

      <View style={{ flex: 1 }}>
        <FlatList
          data={createListItems()}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={false}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={10}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </SafeAreaView>
  );
};

export default Settings;
