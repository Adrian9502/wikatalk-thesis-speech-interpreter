import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BASE_COLORS, TITLE_COLORS } from "@/constant/colors";

const SocialLogin = () => {
  return (
    <>
      <View style={styles.dividerContainer}>
        <View
          style={[styles.dividerLine, { backgroundColor: BASE_COLORS.blue }]}
        />
        <Text
          style={[styles.dividerText, { color: BASE_COLORS.placeholderText }]}
        >
          OR
        </Text>
        <View
          style={[styles.dividerLine, { backgroundColor: BASE_COLORS.blue }]}
        />
      </View>

      <View style={styles.socialButtonsContainer}>
        <View style={styles.googleButtonContainer}>
          <TouchableOpacity style={styles.googleButton}>
            <View style={styles.googleIconContainer}>
              <Ionicons
                name="logo-google"
                size={20}
                color={TITLE_COLORS.customRed}
              />
            </View>
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 0.7,
  },
  dividerText: {
    paddingHorizontal: 8,
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
  },
  googleButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: BASE_COLORS.blue,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  googleIconContainer: {
    marginRight: 10,
    padding: 5,
    borderRadius: 5,
    backgroundColor: BASE_COLORS.white,
  },
  googleButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
  },
});

export default SocialLogin;
