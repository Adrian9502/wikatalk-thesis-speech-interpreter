import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { Star, Lock } from "react-native-feather";
import { LinearGradient } from "expo-linear-gradient";
import { BASE_COLORS } from "@/constant/colors";
import { LevelData } from "@/types/gameTypes";
import { renderFocusIcon } from "@/utils/games/renderFocusIcon";
import { getStarCount, formatDifficulty } from "@/utils/games/difficultyUtils";
import { levelStyles as styles } from "@/styles/games/levels.styles";

interface LevelCardProps {
  level: LevelData;
  onSelect: (level: LevelData) => void;
  gradientColors: readonly [string, string];
}

const LevelCard = React.memo(
  ({ level, onSelect, gradientColors }: LevelCardProps) => {
    // Pull out needed props with type assertion to handle possible undefined
    const {
      levelString = "",
      title = "",
      difficulty = "Easy",
      status = "current",
      focusArea = "Vocabulary",
    } = level || {};

    const starCount = getStarCount(difficulty);

    return (
      <TouchableOpacity
        style={styles.levelCard}
        onPress={() => onSelect(level)}
        activeOpacity={0.8}
        disabled={status === "locked"}
      >
        <LinearGradient
          colors={gradientColors}
          style={styles.levelCardGradient}
        >
          {/* Decorative elements */}
          <View style={styles.decorativeShape} />
          <View style={[styles.decorativeShape, styles.decorativeShape2]} />

          {/* Card header with level number and lock status */}
          <View style={styles.levelHeader}>
            <View style={styles.levelNumberContainer}>
              <Text style={styles.levelNumber}>
                {levelString.replace(/^Level\s+/, "")}
              </Text>
            </View>
            <View style={styles.specialIconContainer}>
              {status === "locked" ? (
                <Lock width={18} height={18} color={BASE_COLORS.white} />
              ) : null}
            </View>
          </View>

          {/* Card content with title and metadata */}
          <View style={styles.levelInfo}>
            <Text
              style={styles.levelTitle}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {title}
            </Text>

            {/* Focus area badge */}
            <View style={styles.levelMetadataRow}>
              <View style={styles.focusAreaBadge}>
                {renderFocusIcon(focusArea)}
                <Text style={styles.focusAreaText}>{focusArea}</Text>
              </View>
            </View>

            {/* Difficulty stars */}
            <View style={styles.difficultyStarsContainer}>
              {Array(3)
                .fill(0)
                .map((_, index) => (
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
              <Text style={styles.difficultyText}>
                {formatDifficulty(difficulty)}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  },
  // Ensure the memo comparison function is optimized:
  (prevProps, nextProps) => {
    return (
      prevProps.level.id === nextProps.level.id &&
      prevProps.gradientColors[0] === nextProps.gradientColors[0] &&
      prevProps.level.status === nextProps.level.status
    );
  }
);

export default LevelCard;
