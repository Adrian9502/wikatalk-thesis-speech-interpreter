import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Settings } from "react-native-feather";
import { BASE_COLORS } from "@/constants/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constants/fontSizes";
import AppName from "@/components/AppName";
import ProfilePicture from "./ProfilePicture";

interface HomeHeaderProps {
  userData: any;
  activeTheme: any;
  firstName: string;
  onSettingsPress: () => void;
}

const HomeHeader = React.memo(
  ({ userData, activeTheme, firstName, onSettingsPress }: HomeHeaderProps) => {
    return (
      <View style={styles.header}>
        <AppName />

        {/* Welcome Message */}
        {userData && (
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>
              Welcome back, {firstName}! 👋
            </Text>
          </View>
        )}

        {/* Settings Button with Profile Picture */}
        <View style={styles.settingsContainer}>
          {/* Profile Picture */}
          <ProfilePicture
            userData={userData}
            activeTheme={activeTheme}
            onPress={onSettingsPress}
          />

          {/* Settings Icon */}
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={onSettingsPress}
            activeOpacity={0.7}
          >
            <Settings
              width={16}
              height={16}
              color={activeTheme.tabActiveColor}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  header: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
    marginBottom: 20,
  },
  welcomeContainer: {
    marginTop: 8,
  },
  welcomeText: {
    fontSize: COMPONENT_FONT_SIZES.home.greeting,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
    textAlign: "left",
  },
  settingsContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingsButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
});

HomeHeader.displayName = "HomeHeader";
export default HomeHeader;
