import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { BASE_COLORS } from "@/constant/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constant/fontSizes";

interface AuthSwitcherProps {
  activeTab: "signin" | "signup";
  onSwitch: () => void;
}

const AuthSwitcher: React.FC<AuthSwitcherProps> = ({ activeTab, onSwitch }) => {
  return (
    <View style={styles.switchContainer}>
      <Text style={[styles.switchText, { color: BASE_COLORS.placeholderText }]}>
        {activeTab === "signin"
          ? "Don't have an account?"
          : "Already have an account?"}
      </Text>
      <TouchableOpacity onPress={onSwitch}>
        <Text style={[styles.switchButtonText, { color: BASE_COLORS.blue }]}>
          {activeTab === "signin" ? "Sign Up" : "Sign In"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  switchText: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.regular,
  },
  switchButtonText: {
    fontFamily: POPPINS_FONT.regular,
    fontSize: COMPONENT_FONT_SIZES.card.description,
    marginLeft: 4,
  },
});

export default AuthSwitcher;
