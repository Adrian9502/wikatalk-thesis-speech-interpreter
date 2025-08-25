import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Header } from "@/components/Header";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";
import { useHardwareBack } from "@/hooks/useHardwareBack";
import HomePage from "@/components/home/HomePage";

const HomePagePreview: React.FC = () => {
  const { activeTheme } = useThemeStore();
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);

  // Hardware back button handling
  useHardwareBack({
    enabled: true,
    fallbackRoute: "/(tabs)/Settings",
    useExistingHeaderLogic: true,
  });

  const handleNavigateToTab = (tabName: string) => {
    console.log("HomePage Preview: Navigating to tab:", tabName);

    // Navigate to the appropriate tab and close the preview
    switch (tabName) {
      case "Speech":
        router.replace("/(tabs)/Speech");
        break;
      case "Translate":
        router.replace("/(tabs)/Translate");
        break;
      case "Scan":
        router.replace("/(tabs)/Scan");
        break;
      case "Games":
        router.replace("/(tabs)/Games");
        break;
      case "Pronounce":
        router.replace("/(tabs)/Pronounce");
        break;
      case "Settings":
        router.replace("/(tabs)/Settings");
        break;
      default:
        router.replace("/(tabs)/Speech");
    }
  };

  const handleBackFromSettings = () => {
    router.back(); // Go back to settings
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: activeTheme.backgroundColor },
      ]}
    >
      <StatusBar style="light" />

      {/* HomePage Component with settings context */}
      <View style={styles.homePageContainer}>
        <HomePage
          onNavigateToTab={handleNavigateToTab}
          context="settings"
          onBack={handleBackFromSettings}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  homePageContainer: {
    flex: 1,
  },
});

export default HomePagePreview;
