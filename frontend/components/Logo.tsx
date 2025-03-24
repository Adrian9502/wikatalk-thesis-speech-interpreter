import { View, Image, Text, StyleSheet } from "react-native";
import React from "react";
import { BASE_COLORS, TITLE_COLORS } from "@/constant/colors";

const Logo: React.FC = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/wikatalk-logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={{ flexDirection: "row" }}>
        <Text style={[styles.wikaText, { color: "#FFEC18" }]}>Wika</Text>
        <Text style={styles.talkText}>Talk</Text>
      </View>
      <Text style={styles.tagline}>Speak Freely, Understand Instantly.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 15,
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

export default Logo;
