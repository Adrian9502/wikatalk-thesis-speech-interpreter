import React, { useState, useCallback, useRef, useEffect } from "react";
import { FlatList, Animated } from "react-native"; // NEW: Added Animated import
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
} from "@/components/settings/SettingsRenderer";
import { router } from "expo-router";
import ContactSupportModal from "@/components/helpAndFAQ/ContactSupportModal";
import { clearAllAccountData } from "@/utils/accountUtils";

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
  sectionIndex?: number; // NEW: Add section index for animation timing
  itemIndex?: number; // NEW: Add item index for animation timing
};

// NEW: Animated components with fade-in effects
const AnimatedHeader = React.memo(({ delay }: { delay: number }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, fadeAnim]);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Header />
    </Animated.View>
  );
});

const AnimatedProfileSection = React.memo(
  ({
    userData,
    themeColor,
    delay,
  }: {
    userData: any;
    themeColor: string;
    delay: number;
  }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      }, delay);

      return () => clearTimeout(timer);
    }, [delay, fadeAnim]);

    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <ProfileSection userData={userData} themeColor={themeColor} />
      </Animated.View>
    );
  }
);

const AnimatedAppearanceSection = React.memo(({ delay }: { delay: number }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, fadeAnim]);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <AppearanceSection />
    </Animated.View>
  );
});

const AnimatedSectionTitle = React.memo(
  ({ title, delay }: { title: string; delay: number }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }, delay);

      return () => clearTimeout(timer);
    }, [delay, fadeAnim]);

    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <SectionTitle title={title} />
      </Animated.View>
    );
  }
);

const AnimatedSettingItem = React.memo(
  ({
    item,
    isLast,
    isFirstItem,
    delay,
  }: {
    item: any;
    isLast: boolean;
    isFirstItem: boolean;
    delay: number;
  }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }, delay);

      return () => clearTimeout(timer);
    }, [delay, fadeAnim]);

    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <SettingItemComponent
          item={item}
          isLast={isLast}
          isFirstItem={isFirstItem}
        />
      </Animated.View>
    );
  }
);

const AnimatedLogoutButton = React.memo(
  ({ onPressLogout, delay }: { onPressLogout: () => void; delay: number }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }, delay);

      return () => clearTimeout(timer);
    }, [delay, fadeAnim]);

    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <LogoutButton onPressLogout={onPressLogout} />
      </Animated.View>
    );
  }
);

const Settings = () => {
  // auth context
  const { logout, userData } = useAuth();
  // Get theme from store
  const { activeTheme } = useThemeStore();
  // Modal state
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);

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

  const renderItem = ({ item, index }: { item: ListItem; index: number }) => {
    // NEW: Calculate animation delays
    const baseDelay = 100; // Initial delay
    const sectionDelay = 300; // Delay between sections
    const itemDelay = 150; // Delay between items within a section

    switch (item.type) {
      case "header":
        return <AnimatedHeader delay={baseDelay} />;

      case "profile":
        return (
          <AnimatedProfileSection
            userData={userData}
            themeColor={activeTheme.secondaryColor}
            delay={baseDelay + 200}
          />
        );

      case "appearance":
        return <AnimatedAppearanceSection delay={baseDelay + 400} />;

      case "section":
        const sectionAnimationDelay =
          baseDelay + 600 + (item.sectionIndex || 0) * sectionDelay;
        return (
          <AnimatedSectionTitle
            title={item.data}
            delay={sectionAnimationDelay}
          />
        );

      case "item":
        const { item: settingItem, isLast, isFirstItem } = item.data;
        const itemAnimationDelay =
          baseDelay +
          600 +
          (item.sectionIndex || 0) * sectionDelay +
          100 + // Add delay after section title
          (item.itemIndex || 0) * itemDelay;

        return (
          <AnimatedSettingItem
            item={settingItem}
            isLast={isLast}
            isFirstItem={isFirstItem}
            delay={itemAnimationDelay}
          />
        );

      case "logout":
        const logoutDelay =
          baseDelay + 600 + sections.length * sectionDelay + 400;
        return (
          <AnimatedLogoutButton
            onPressLogout={() => setLogoutModalVisible(true)}
            delay={logoutDelay}
          />
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

      <FlatList
        data={createListItems()}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }} // NEW: Add padding for better spacing
      />
    </SafeAreaView>
  );
};

export default Settings;
