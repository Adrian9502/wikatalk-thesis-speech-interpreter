import React,{useRef,useEffect} from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { Star, Lock, Check } from "react-native-feather";
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


const LevelCard: React.FC<LevelCardProps> = React.memo(
  ({ level, onSelect, gradientColors }) => {
    // Pull out needed props with type assertion to handle possible undefined
    const {
      levelString = "",
      title = "",
      difficulty = "Easy",
      status = "current",
      focusArea = "Vocabulary",
    } = level || {};

    const starCount = getStarCount(difficulty);
    const renderCount = useRef(0);
    useEffect(() => {
      renderCount.current += 1;
      if (renderCount.current > 5) {
        console.warn(`[PERFORMANCE] LevelSelection rendered ${renderCount.current} times - investigate!`);
      }
    });

    return (
      <TouchableOpacity
        style={styles.levelCard}
        onPress={() => onSelect(level)}
        activeOpacity={0.7}
        disabled={status === "locked"}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.levelCardGradient}
        >
          {/* Decorative elements */}
          <View style={styles.decorativeShape} />
          <View style={[styles.decorativeShape, styles.decorativeShape2]} />

          {/* Completed State Enhancements */}
          {status === "completed" && (
            <>
              {/* Improved Banner */}
              <View style={styles.completedBannerContainer}>
                <View style={styles.completedBanner}>
                  <Text style={styles.completedBannerText}>COMPLETED</Text>
                </View>
              </View>

              <View style={styles.completedCheckContainer}>
                <Check width={14} height={14} color="#FFFFFF" strokeWidth={3} />
              </View>
            </>
          )}

          {/* Level number */}
          <View style={styles.levelHeader}>
            <View style={styles.levelNumberContainer}>
              <Text style={styles.levelNumber}>
                {levelString.replace(/^Level\s+/, "")}
              </Text>
            </View>

            {/* Status indicators */}
            <View style={styles.specialIconContainer}>
              {status === "locked" ? (
                <Lock width={18} height={18} color={BASE_COLORS.white} />
              ) : null}
            </View>
          </View>

          {/* Level details */}
          <View style={styles.levelInfo}>
            <Text style={styles.levelTitle} numberOfLines={2}>
              {title}
            </Text>

            {/* Focus area badge */}
            <View style={styles.levelMetadataRow}>
              <View style={styles.focusAreaBadge}>
                {renderFocusIcon(focusArea)}
                <Text style={styles.focusAreaText}>{focusArea}</Text>
              </View>
            </View>

            {/* Difficulty stars - Enhanced for completed state */}
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
  // PERFORMANCE FIX: Enhanced memo comparison
  (prevProps, nextProps) => {
    return (
      prevProps.level.id === nextProps.level.id &&
      prevProps.level.status === nextProps.level.status &&
      prevProps.level.title === nextProps.level.title &&
      prevProps.gradientColors[0] === nextProps.gradientColors[0] &&
      prevProps.gradientColors[1] === nextProps.gradientColors[1]
    );
  }
);

export default LevelCard;
