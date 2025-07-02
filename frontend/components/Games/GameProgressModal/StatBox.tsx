import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface StatBoxProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}

const StatBox = React.memo(({ icon, value, label }: StatBoxProps) => {
  return (
    <View style={styles.statBox}>
      {icon}
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  statBox: {
    width: "47%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  statValue: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "#fff",
    marginTop: 6,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
});

StatBox.displayName = 'StatBox';
export default StatBox;