import { View, Image, Text, StyleSheet } from "react-native";
import React from "react";
import { BASE_COLORS, TITLE_COLORS } from "@/constant/colors";

interface LogoProps {
  title: string;
}

const AuthLogo: React.FC<LogoProps> = ({ title }) => {
  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/wikatalk-logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.wikaText}>
        Wika<Text style={styles.talkText}>Talk</Text>
      </Text>
      <Text style={styles.tagline}>Speak Freely, Understand Instantly.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 120,
    height: 120,
  },
  wikaText: {
    fontFamily: "Poppins-Bold",
    fontSize: 34,
    color: TITLE_COLORS.customYellow,
  },
  talkText: {
    fontFamily: "Poppins-Bold",
    fontSize: 34,
    color: BASE_COLORS.white,
  },
  tagline: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    marginTop: -12,
    color: TITLE_COLORS.customWhite,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});

export default AuthLogo;
