import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import CoinsDisplay from "@/components/games/rewards/CoinsDisplay";
import { BASE_COLORS, iconColors } from "@/constant/colors";

interface DashboardHeaderProps {
  onCoinsPress: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onCoinsPress }) => {
  return (
    <View style={styles.headerContainer}>
      {/* Actions Section */}
      {/* Coins Display */}
      <CoinsDisplay onPress={onCoinsPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 5,
    paddingVertical: 5,
  },
});

DashboardHeader.displayName = "DashboardHeader";
export default DashboardHeader;
