import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { BASE_COLORS, TITLE_COLORS } from "@/constant/colors";
import { FONT_SIZES, POPPINS_FONT } from "@/constant/fontSizes";

const AppName = () => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignSelf: "center",
        width: "100%",
        justifyContent: "flex-start",
      }}
    >
      <Text style={styles.wikaText} allowFontScaling={false}>
        Wika
      </Text>
      <Text style={styles.talkText} allowFontScaling={false}>
        Talk
      </Text>
    </View>
  );
};

export default AppName;

const styles = StyleSheet.create({
  wikaText: {
    fontFamily: POPPINS_FONT.bold,
    fontSize: FONT_SIZES["3xl"],
    color: TITLE_COLORS.customYellow,
    flexShrink: 1,
  },
  talkText: {
    fontFamily: POPPINS_FONT.bold,
    fontSize: FONT_SIZES["3xl"],
    color: BASE_COLORS.white,
    flexShrink: 1,
  },
});
