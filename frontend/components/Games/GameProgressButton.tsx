import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { BarChart2 } from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";

interface GameProgressButtonProps {
  onPress: () => void;
  completedLevels: number;
  totalLevels: number;
}

const GameProgressButton: React.FC<GameProgressButtonProps> = ({
  onPress,
  completedLevels,
  totalLevels,
}) => {
  const completionPercentage =
    totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0;

  return (
    <TouchableOpacity style={styles.progressButton} onPress={onPress}>
      <BarChart2 width={16} height={16} color={BASE_COLORS.white} />
      <Text style={styles.progressText}>{completionPercentage}%</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  progressButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  progressText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
});

export default GameProgressButton;
