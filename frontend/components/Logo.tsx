import { View, Image, Text, StyleSheet } from "react-native";
import React from "react";
import { BASE_COLORS, TITLE_COLORS } from "@/constant/colors";

interface LogoProps {
  logoSize?: number;
  wikaTextSize?: number;
  talkTextSize?: number;
  taglineTextSize?: number;
}

const Logo: React.FC<LogoProps> = ({
  logoSize = 100,
  wikaTextSize = 30,
  talkTextSize = 30,
  taglineTextSize = 14,
}) => {
  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/icon.png")}
        style={[styles.logo, { width: logoSize, height: logoSize }]}
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
          style={[
            styles.wikaText,
            { color: "#FFEC18", fontSize: wikaTextSize },
          ]}
          allowFontScaling={false}
        >
          Wika
        </Text>
        <Text
          style={[styles.talkText, { fontSize: talkTextSize }]}
          allowFontScaling={false}
        >
          Talk
        </Text>
      </View>
      <Text style={[styles.tagline, { fontSize: taglineTextSize }]}>
        Speak Freely, Understand Instantly.
      </Text>
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
    // width and height will be overridden by props
  },
  wikaText: {
    fontFamily: "Poppins-Bold",
    // fontSize will be overridden by props
    color: TITLE_COLORS.customYellow,
    flexShrink: 1,
  },
  talkText: {
    fontFamily: "Poppins-Bold",
    // fontSize will be overridden by props
    color: BASE_COLORS.white,
    flexShrink: 1,
  },
  tagline: {
    fontFamily: "Poppins-Medium",
    // fontSize will be overridden by props
    marginTop: -10,
    color: TITLE_COLORS.customWhite,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    flexShrink: 1,
  },
});

export default Logo;
