import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import SettingItem from "@/components/settings/SettingItem";
import ThemeSelector from "@/components/settings/ThemeSelector";
import { BASE_COLORS, TITLE_COLORS } from "@/constant/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constant/fontSizes";
import Ionicons from "react-native-vector-icons/Ionicons";
import { UserData } from "@/store/useAuthStore";
import { SettingsSection, SettingsItemType } from "@/types/settingsTypes";

interface SettingsRendererProps {
  sections: SettingsSection[];
  onItemPress: (item: SettingsItemType) => void;
}

interface LoginMethodsProps {
  userData: UserData;
}

// Section title component
export const SectionTitle: React.FC<{ title: string }> = ({ title }) => {
  return <Text style={styles.sectionTitle}>{title}</Text>;
};

// Card wrapper component
export const SettingsCard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <View style={styles.card}>{children}</View>;

// Divider component
export const SettingsDivider: React.FC = () => <View style={styles.divider} />;

// login methods component
export const LoginMethods: React.FC<LoginMethodsProps> = ({ userData }) => {
  const getAvailableMethods = (authProvider: string) => {
    switch (authProvider) {
      case "manual":
        return ["Username/Email & Password"];
      case "google":
        return ["Google Account"];
      case "both":
        return ["Username/Email & Password", "Google Account"];
      default:
        return ["Username/Email & Password"];
    }
  };

  // Get the actual login method used in current session
  const getCurrentSessionLoginMethod = () => {
    // First try to get from currentLoginMethod (for fresh sessions)
    const sessionMethod = userData.currentLoginMethod;
    const authProvider = userData.authProvider || "manual";

    // If we have a session method and it's valid for the auth provider, use it
    if (sessionMethod) {
      // Validate that the session method is actually available for this user
      const availableMethods = getAvailableMethods(authProvider);
      const isSessionMethodValid =
        (sessionMethod === "google" &&
          availableMethods.includes("Google Account")) ||
        (sessionMethod === "manual" &&
          availableMethods.includes("Username/Email & Password"));

      if (isSessionMethodValid) {
        if (sessionMethod === "google") {
          return { method: "Google", icon: "logo-google" };
        } else {
          return { method: "Username/Email & Password", icon: "mail" };
        }
      }
    }

    // For users with only one method, show that method
    if (authProvider === "google") {
      return { method: "Google", icon: "logo-google" };
    } else if (authProvider === "manual") {
      return { method: "Username/Email & Password", icon: "mail" };
    } else if (authProvider === "both") {
      // For users with both methods, try to determine from other indicators
      // or default to manual (since they originally signed up manually)
      return { method: "Username/Email & Password", icon: "mail" };
    }

    // Ultimate fallback
    return { method: "Username/Email & Password", icon: "mail" };
  };

  const currentLogin = getCurrentSessionLoginMethod();

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Login Methods</Text>
      <View style={styles.card}>
        <View style={styles.accountLinkingContainer}>
          {/* Available Login Methods Section */}
          <View style={styles.methodsSection}>
            <Text style={styles.sectionSubtitle}>Available Login Methods</Text>
            {getAvailableMethods(userData.authProvider || "manual").map(
              (method, index) => (
                <View key={index} style={styles.methodItem}>
                  <Ionicons
                    name={method === "Google Account" ? "logo-google" : "mail"}
                    size={16}
                    color={
                      method === "Google Account" ? "#DB4437" : BASE_COLORS.blue
                    }
                  />
                  <Text style={styles.methodText}>
                    {method === "Google Account"
                      ? "Google Account"
                      : "Username/Email & Password"}
                  </Text>
                </View>
              )
            )}
          </View>

          {/* Current Session Login Method */}
          <View style={styles.currentLoginSection}>
            <Text style={styles.sectionSubtitle}>
              You're now logged in using
            </Text>
            <View style={styles.currentMethodContainer}>
              <View style={styles.currentMethodItem}>
                <Ionicons
                  name={currentLogin.icon}
                  size={16}
                  color={
                    currentLogin.method === "Google"
                      ? "#DB4437"
                      : BASE_COLORS.blue
                  }
                />
                <Text style={styles.currentMethodText}>
                  {currentLogin.method}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const SettingsRenderer: React.FC<SettingsRendererProps> = ({
  sections,
  onItemPress,
}) => {
  const renderSection = (section: SettingsSection) => (
    <View key={section.title}>
      <SectionTitle title={section.title} />
      <SettingsCard>
        {section.items.map((item: SettingsItemType, index: number) => (
          <View key={item.id || index}>
            <SettingItem
              icon={item.icon}
              label={item.label}
              onPress={() => onItemPress(item)}
              showSwitch={item.showSwitch}
              switchValue={item.switchValue}
              onSwitchChange={item.onSwitchChange}
              customIconColor={item.customIconColor}
            />
            {index < section.items.length - 1 && <SettingsDivider />}
          </View>
        ))}
      </SettingsCard>
    </View>
  );

  return <View>{sections.map(renderSection)}</View>;
};

export const AppearanceSection = () => {
  return (
    <View style={styles.appearanceContainer}>
      <Text style={styles.sectionTitle}>Choose Theme</Text>
      <ThemeSelector />
    </View>
  );
};

export const SettingItemComponent = ({
  item,
  isLast,
  isFirstItem,
}: {
  item: any;
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
          showSwitch={item.showSwitch || typeof item.value === "boolean"}
          switchValue={item.value}
          onSwitchChange={item.toggleSwitch}
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
    fontSize: COMPONENT_FONT_SIZES.settings.itemTitle,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.white,
    marginBottom: 7,
  },
  appearanceContainer: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: COMPONENT_FONT_SIZES.settings.sectionHeader,
    color: BASE_COLORS.white,
    fontFamily: POPPINS_FONT.medium,
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
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.medium,
  },
  card: {
    backgroundColor: BASE_COLORS.white,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 16,
  },
  // login component styles
  container: {
    marginTop: 16,
  },
  accountLinkingContainer: {
    padding: 16,
  },
  methodsSection: {
    marginBottom: 20,
  },
  currentLoginSection: {
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: COMPONENT_FONT_SIZES.settings.sectionHeader,
    fontFamily: POPPINS_FONT.medium,
    color: "#666",
    marginBottom: 12,
  },
  methodItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(59, 111, 229, 0.05)",
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: BASE_COLORS.blue,
  },
  methodText: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.darkText,
    marginLeft: 12,
  },
  currentMethodContainer: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: BASE_COLORS.success,
  },
  currentMethodItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  currentMethodText: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.darkText,
    marginLeft: 12,
  },
});

export default SettingsRenderer;
