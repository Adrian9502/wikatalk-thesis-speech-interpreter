import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Star } from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";

interface DifficultyBadgeProps {
  difficulty?: string;
}

const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({
  difficulty = "easy",
}) => {
  return (
    <View style={styles.difficultyBadge}>
      {difficulty === "medium" && (
        <>
          <Star width={14} height={14} color={BASE_COLORS.white} />
          <Star width={14} height={14} color={BASE_COLORS.white} />
        </>
      )}
      {difficulty === "hard" && (
        <>
          <Star width={14} height={14} color={BASE_COLORS.white} />
          <Star width={14} height={14} color={BASE_COLORS.white} />
          <Star width={14} height={14} color={BASE_COLORS.white} />
        </>
      )}
      {(difficulty === "easy" || !difficulty) && (
        <Star width={14} height={14} color={BASE_COLORS.white} />
      )}
      <Text style={styles.difficultyText}>
        {difficulty
          ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
          : "Easy"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  difficultyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  difficultyText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
});

export default DifficultyBadge;
