import { View, Image, Text, StyleSheet } from "react-native";
import React from "react";
import { BASE_COLORS, TITLE_COLORS } from "@/constants/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constants/fontSizes";

interface LogoProps {
  logoSize?: number;
  wikaTextSize?: number;
  talkTextSize?: number;
  taglineTextSize?: number;
}

const Logo: React.FC<LogoProps> = ({
  logoSize = 90,
  wikaTextSize,
  talkTextSize,
  taglineTextSize,
}) => {
  // Use responsive font sizes if not provided as props
  const responsiveWikaTextSize =
    wikaTextSize || COMPONENT_FONT_SIZES.navigation.headerTitle * 1.5;
  const responsiveTalkTextSize =
    talkTextSize || COMPONENT_FONT_SIZES.navigation.headerTitle * 1.5;
  const responsiveTaglineTextSize =
    taglineTextSize || COMPONENT_FONT_SIZES.card.subtitle;

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
            { color: "#FFEC18", fontSize: responsiveWikaTextSize },
          ]}
          allowFontScaling={false}
        >
          Wika
        </Text>
        <Text
          style={[styles.talkText, { fontSize: responsiveTalkTextSize }]}
          allowFontScaling={false}
        >
          Talk
        </Text>
      </View>
      <Text style={[styles.tagline, { fontSize: responsiveTaglineTextSize }]}>
        Speak Freely, Understand Instantly.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
    justifyContent: "center",
  },
  logo: {
    // width and height will be overridden by props
  },
  wikaText: {
    fontFamily: POPPINS_FONT.bold,
    // fontSize will be overridden by props
    color: TITLE_COLORS.customYellow,
    flexShrink: 1,
  },
  talkText: {
    fontFamily: POPPINS_FONT.bold,
    // fontSize will be overridden by props
    color: BASE_COLORS.white,
    flexShrink: 1,
  },
  tagline: {
    fontFamily: POPPINS_FONT.medium,
    // fontSize will be overridden by props
    marginTop: -10,
    color: TITLE_COLORS.customWhite,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    flexShrink: 1,
  },
});

export default Logo;
