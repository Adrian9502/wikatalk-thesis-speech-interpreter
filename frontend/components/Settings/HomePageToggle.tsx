import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import useHomePageStore from "@/store/useHomePageStore";
import useThemeStore from "@/store/useThemeStore";
import { BASE_COLORS } from "@/constant/colors";
import SettingItem from "./SettingItem";
import { SectionTitle } from "./SettingsRenderer";

const HomePageToggle: React.FC = () => {
  const { showHomePage, setShowHomePage } = useHomePageStore();
  const { activeTheme } = useThemeStore();

  const handleNavigateToHomePage = () => {
    router.push("/(settings)/HomePage");
  };

  return (
    <>
      <SectionTitle title="Startup" />
      <View style={styles.card}>
        {/* Homepage Toggle Switch using SettingItem */}
        <SettingItem
          icon="home"
          label="Show Homepage on startup"
          showSwitch={true}
          switchValue={showHomePage}
          onSwitchChange={setShowHomePage}
        />

        {/* Divider */}
        <View style={styles.divider} />

        {/* Navigate to HomePage Button using SettingItem */}
        <SettingItem
          icon="arrow-right"
          label="View Home Page"
          onPress={handleNavigateToHomePage}
          customIconColor={activeTheme.secondaryColor}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    marginBottom: 5,
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

export default HomePageToggle;
