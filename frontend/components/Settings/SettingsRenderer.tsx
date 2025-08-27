import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import SettingItem from "@/components/settings/SettingItem";
import ThemeSelector from "@/components/settings/ThemeSelector";
import { BASE_COLORS, TITLE_COLORS } from "@/constant/colors";
import { FeatherIconName } from "@/types/types";
import { SettingsSection, SettingsItemType } from "@/types/settingsTypes";
import useThemeStore from "@/store/useThemeStore";

// Section title component
export const SectionTitle: React.FC<{ title: string }> = ({ title }) => {
  const { activeTheme } = useThemeStore();

  return (
    <Text
      style={[styles.sectionTitle, { color: activeTheme.tabInactiveColor }]}
    >
      {title}
    </Text>
  );
};

// Card wrapper component
export const SettingsCard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <View style={styles.card}>{children}</View>;

// Divider component
export const SettingsDivider: React.FC = () => <View style={styles.divider} />;

interface SettingsRendererProps {
  sections: SettingsSection[];
  onItemPress: (item: SettingsItemType) => void;
}

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

export const AppearanceSection = () => (
  <View style={styles.appearanceContainer}>
    <Text style={[styles.sectionTitle, { color: "rgba(255, 255, 255, 0.7)" }]}>
      Choose Theme
    </Text>
    <ThemeSelector />
  </View>
);

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
    fontSize: 13,
    fontFamily: "Poppins-Medium",
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
});

export default SettingsRenderer;
