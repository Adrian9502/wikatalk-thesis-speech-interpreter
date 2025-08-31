import React, { useEffect, useRef } from "react";
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
}

const AuthTabs: React.FC<AuthTabsProps> = ({ activeTab, switchTab }) => {
  // Create animated value for tab indicator
  const indicatorPosition = useRef(new Animated.Value(0)).current;

  // Animate indicator when activeTab changes
  useEffect(() => {
    Animated.timing(indicatorPosition, {
      toValue: activeTab === "signin" ? 0 : 1,
      duration: 250,
      useNativeDriver: false, // Using false to avoid threading issues
    }).start();
  }, [activeTab, indicatorPosition]);

  // Calculate indicator position
  const indicatorLeft = indicatorPosition.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "50%"],
    extrapolate: "clamp",
  });

  return (
    <View
      style={[styles.tabContainer, { backgroundColor: BASE_COLORS.lightBlue }]}
    >
      {/* Animated tab indicator */}
      <Animated.View
        style={[
          styles.tabIndicator,
          {
            left: indicatorLeft,
          },
        ]}
      />

      {/* Sign in tab */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => switchTab("signin")}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.tabButtonText,
            activeTab === "signin"
              ? { color: TITLE_COLORS.customYellow }
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
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.tabButtonText,
            activeTab === "signup"
              ? { color: TITLE_COLORS.customYellow }
              : { color: BASE_COLORS.blue },
          ]}
        >
          Sign Up
        </Text>
      </TouchableOpacity>
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
    height: 44,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  tabButtonText: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    fontWeight: "600",
  },
  tabIndicator: {
    position: "absolute",
    top: 0,
    width: "50%",
    height: "100%",
    backgroundColor: TITLE_COLORS.customBlue,
    borderRadius: 20,
    opacity: 0.9,
    zIndex: 1,
  },
});

export default AuthTabs;
