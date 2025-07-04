import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Star, Check } from "react-native-feather";
import { LevelData } from "@/types/gameTypes";
import { getStarCount, formatDifficulty } from "@/utils/games/difficultyUtils";
import { renderFocusIcon } from "@/utils/games/renderFocusIcon";
import modalSharedStyles from "@/styles/games/modalSharedStyles";

interface LevelHeaderProps {
  level: LevelData;
}

const LevelHeader: React.FC<LevelHeaderProps> = ({ level }) => {
  const starCount = getStarCount(level.difficulty);

  return (
    <>
      {/* Level number pill */}
      <View style={modalSharedStyles.levelHeader}>
        <View style={modalSharedStyles.levelNumberContainer}>
          <Text style={modalSharedStyles.levelNumber}>
            Level {level.number}
          </Text>
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

        {/* Focus area badge */}
        <View style={modalSharedStyles.focusAreaBadge}>
          {renderFocusIcon(level.focusArea)}
          <Text style={modalSharedStyles.focusAreaText}>{level.focusArea}</Text>
        </View>
      </View>

      {/* Completed badge */}
      <View style={styles.completedBadgeContainer}>
        <View style={modalSharedStyles.completedBadge}>
          <Check width={18} height={18} color="#fff" />
          <Text style={styles.completedText}>Level Finished!</Text>
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
    color: "#fff",
    marginLeft: 4,
  },
});

export default React.memo(LevelHeader);
