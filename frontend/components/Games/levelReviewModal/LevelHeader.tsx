import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Star, Check } from "react-native-feather";
import { LevelData } from "@/types/gameTypes";
import { getStarCount, formatDifficulty } from "@/utils/games/difficultyUtils";
import { renderFocusIcon } from "@/utils/games/renderFocusIcon";
import modalSharedStyles from "@/styles/games/modalSharedStyles";
import FocusAreaBadge from "@/components/games/FocusAreaBadge";
import { BASE_COLORS } from "@/constant/colors";

interface LevelHeaderProps {
  level: LevelData;
}

const LevelHeader: React.FC<LevelHeaderProps> = ({ level }) => {
  const starCount = getStarCount(level.difficulty);

  // Extract level number from levelString, similar to LevelCard
  const levelNumber = level.levelString
    ? level.levelString.replace(/^Level\s+/, "")
    : String(level.number || level.id);

  return (
    <>
      {/* Level number pill */}
      <View style={modalSharedStyles.levelHeader}>
        <View style={modalSharedStyles.levelNumberContainer}>
          <Text style={modalSharedStyles.levelNumber}>Level {levelNumber}</Text>
        </View>
      </View>

      {/* Level title */}
      <Text style={modalSharedStyles.levelTitle}>{level.title}</Text>

      {/* Badges row */}
      <View style={styles.badgesRow}>
        {/* Difficulty with stars */}
        <View style={modalSharedStyles.difficultyBadge}>
          <View style={modalSharedStyles.starContainer}>
            {[1, 2, 3].map((_, index) => (
              <Star
                key={index}
                width={14}
                height={14}
                fill={index < starCount ? "#FFC107" : "transparent"}
                stroke={
                  index < starCount ? "#FFC107" : "rgba(255, 255, 255, 0.4)"
                }
              />
            ))}
          </View>
          <Text style={modalSharedStyles.difficultyText}>
            {formatDifficulty(level.difficulty)}
          </Text>
        </View>

        <FocusAreaBadge focusArea={level.focusArea} />
      </View>

      {/* Completed badge */}
      <View style={styles.completedBadgeContainer}>
        <View style={modalSharedStyles.completedBadge}>
          <Check width={16} height={16} color={BASE_COLORS.white} />
          <Text style={styles.completedText}>Level Finished</Text>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  badgesRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
    gap: 10,
  },
  completedBadgeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  completedText: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    marginLeft: 4,
  },
});

export default React.memo(LevelHeader);
