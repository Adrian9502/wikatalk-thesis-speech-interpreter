import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BASE_COLORS, ICON_COLORS } from "@/constant/colors";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

interface DifficultyBadgeProps {
  difficulty?: string;
  showStars?: boolean;
  showText?: boolean;
}

const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({
  difficulty = "easy",
  showStars = true,
  showText = true,
}) => {
  // Render difficulty stars
  const renderStars = () => {
    const stars = [];
    const starCount =
      difficulty === "hard" ? 3 : difficulty === "medium" ? 2 : 1;

    for (let i = 0; i < starCount; i++) {
      stars.push(
        <MaterialCommunityIcons
          key={i}
          name="star"
          size={16}
          color={ICON_COLORS.brightYellow}
        />
      );
    }
    return stars;
  };

  return (
    <View style={styles.difficultyBadge}>
      {showStars && <View style={styles.starsContainer}>{renderStars()}</View>}
      {showText && (
        <Text style={styles.difficultyText}>
          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  difficultyBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  starsContainer: {
    flexDirection: "row",
    gap: 2,
  },
  difficultyText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
  },
});

export default DifficultyBadge;
