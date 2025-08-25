import { BASE_COLORS, TITLE_COLORS } from "@/constant/colors";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface StatBoxProps {
  value: string | number;
  label: string;
}

const StatBox = React.memo(({ value, label }: StatBoxProps) => {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  statBox: {
    flexBasis: "48%",
    marginBottom: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  statValue: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: TITLE_COLORS.customYellow,
    marginTop: 6,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    textAlign: "center",
  },
});

StatBox.displayName = "StatBox";
export default StatBox;
