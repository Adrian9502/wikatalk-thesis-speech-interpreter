import { StatItem } from "@/types/gameTypes";
import { StyleSheet, Text, View } from "react-native";
import React from "react";

const StatBox: React.FC<StatItem> = ({ icon, label, value }) => (
  <View style={styles.statBox}>
    {icon}
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

export default StatBox;

const styles = StyleSheet.create({
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.20)",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 6,
    textAlign: "center",
  },
  statValue: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
    marginTop: 2,
    textAlign: "center",
  },
});
