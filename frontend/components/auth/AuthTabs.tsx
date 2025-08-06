import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from "react-native";
import { BASE_COLORS, TITLE_COLORS } from "@/constant/colors";

interface AuthTabsProps {
  activeTab: "signin" | "signup";
  switchTab: (tab: "signin" | "signup") => void;
  tabIndicatorPosition: Animated.Value;
}

const AuthTabs: React.FC<AuthTabsProps> = ({
  activeTab,
  switchTab,
  tabIndicatorPosition,
}) => {
  const tabIndicatorLeft = tabIndicatorPosition.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "50%"],
  });

  return (
    <View
      style={[styles.tabContainer, { backgroundColor: BASE_COLORS.lightBlue }]}
    >
      {/* Sign in tab */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => switchTab("signin")}
      >
        <Text
          style={[
            styles.tabButtonText,
            activeTab === "signin"
              ? [styles.activeTabText, { color: TITLE_COLORS.customYellow }]
              : { color: BASE_COLORS.blue },
          ]}
        >
          Sign In
        </Text>
      </TouchableOpacity>

      {/* Sign up tab */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => switchTab("signup")}
      >
        <Text
          style={[
            styles.tabButtonText,
            activeTab === "signin"
              ? [styles.activeTabText, { color: BASE_COLORS.blue }]
              : { color: TITLE_COLORS.customYellow },
          ]}
        >
          Sign Up
        </Text>
      </TouchableOpacity>

      {/* Animated tab indicator */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 0,
          width: "50%",
          height: "100%",
          backgroundColor: TITLE_COLORS.customBlue,
          borderRadius: 20,
          opacity: 0.9,
          zIndex: 0,
          left: tabIndicatorLeft,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    width: "100%",
    position: "relative",
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    zIndex: 10,
  },
  tabButtonText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  activeTabText: {
    fontFamily: "Poppins-Medium",
  },
});

export default AuthTabs;
