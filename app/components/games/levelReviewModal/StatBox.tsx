import { StatItem } from "@/types/gameTypes";
import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { BASE_COLORS } from "@/constants/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constants/fontSizes";

const StatBox: React.FC<StatItem> = ({ label, value }) => (
  <View style={styles.statBox}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

export default StatBox;

const styles = StyleSheet.create({
  statLabel: {
    fontSize: COMPONENT_FONT_SIZES.card.caption,
    fontFamily: POPPINS_FONT.regular,
    color: "rgba(255, 255, 255,0.9)",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  statBox: {
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  statValue: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
    marginTop: 6,
    textAlign: "center",
    letterSpacing: 0.2,
  },
});
