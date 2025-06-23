import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { BASE_COLORS } from "@/constant/colors";

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
    fontSize: 12,
    fontFamily: "Poppins-Regular",
  },
  switchButtonText: {
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    marginLeft: 4,
  },
});

export default AuthSwitcher;
