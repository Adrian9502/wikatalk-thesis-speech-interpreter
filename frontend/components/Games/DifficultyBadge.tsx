import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BASE_COLORS, iconColors } from "@/constant/colors";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

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
          <MaterialCommunityIcons
            name="star"
            size={16}
            color={iconColors.brightYellow}
          />
          <MaterialCommunityIcons
            name="star"
            size={16}
            color={iconColors.brightYellow}
          />
        </>
      )}
      {difficulty === "hard" && (
        <>
          <MaterialCommunityIcons
            name="star"
            size={16}
            color={iconColors.brightYellow}
          />
          <MaterialCommunityIcons
            name="star"
            size={16}
            color={iconColors.brightYellow}
          />
          <MaterialCommunityIcons
            name="star"
            size={16}
            color={iconColors.brightYellow}
          />
        </>
      )}
      {(difficulty === "easy" || !difficulty) && (
        <MaterialCommunityIcons
          name="star"
          size={16}
          color={iconColors.brightYellow}
        />
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
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  difficultyText: {
    fontSize: 12,
    marginLeft: 6,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
  },
});

export default DifficultyBadge;
