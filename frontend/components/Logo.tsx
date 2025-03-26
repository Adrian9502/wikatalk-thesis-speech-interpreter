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
      <View
        style={{
          flexDirection: "row",
          alignSelf: "center",
          width: "100%",
          justifyContent: "center",
        }}
      >
        <Text
          style={[styles.wikaText, { color: "#FFEC18" }]}
          allowFontScaling={false}
        >
          Wika
        </Text>
        <Text style={styles.talkText} allowFontScaling={false}>
          Talk
        </Text>
      </View>
      <Text style={styles.tagline}>Speak Freely, Understand Instantly.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    marginBottom: 15,
    justifyContent: "center",
  },
  logo: {
    width: 100,
    height: 100,
  },
  wikaText: {
    fontFamily: "Poppins-Bold",
    fontSize: 30,
    color: TITLE_COLORS.customYellow,
    flexShrink: 1,
  },
  talkText: {
    fontFamily: "Poppins-Bold",
    fontSize: 30,
    color: BASE_COLORS.white,
    flexShrink: 1,
  },
  tagline: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    marginTop: -12,
    color: TITLE_COLORS.customWhite,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    flexShrink: 1,
  },
});

export default Logo;
