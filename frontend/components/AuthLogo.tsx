import { View, Image, Text, StyleSheet } from "react-native";
import React from "react";
import WikaTalkLogo from "./WikaTalkLogo";
import { TITLE_COLORS } from "@/constant/colors";

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
      <WikaTalkLogo title={title} fontSize={35} />
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
    width: 100,
    height: 100,
  },
  tagline: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    marginTop: -15,
    color: TITLE_COLORS.customYellow,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});

export default AuthLogo;
