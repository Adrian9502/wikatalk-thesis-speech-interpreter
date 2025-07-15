import React, { useRef, useMemo } from "react";
import { Text, View, TouchableOpacity, Animated } from "react-native";
import { Star, Lock, Check } from "react-native-feather";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { LevelData } from "@/types/gameTypes";
import { renderFocusIcon } from "@/utils/games/renderFocusIcon";
import { getStarCount, formatDifficulty } from "@/utils/games/difficultyUtils";
import { levelStyles as styles } from "@/styles/games/levels.styles";

interface LevelCardProps {
  level: LevelData;
  onSelect: (level: LevelData) => void;
  gradientColors: readonly [string, string];
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  index?: number;
}

const LevelCard: React.FC<LevelCardProps> = React.memo(
  ({ level, onSelect, gradientColors }) => {
    // Memoize extracted props to prevent recalculation
    const levelProps = useMemo(() => {
      const {
        levelString = "",
        title = "",
        difficulty = "Easy",
        status = "current",
        focusArea = "Vocabulary",
      } = level || {};

      return {
        levelString,
        title,
        difficulty,
        status,
        focusArea,
        starCount: getStarCount(difficulty),
        levelNumber: levelString.replace(/^Level\s+/, ""),
        formattedDifficulty: formatDifficulty(difficulty),
        isLocked: status === "locked",
        isCompleted: status === "completed",
      };
    }, [level]);

    // Animation reference for press feedback only
    const scaleAnim = useRef(new Animated.Value(1)).current;

    // Memoize animation handlers
    const animationHandlers = useMemo(() => {
      const handlePressIn = () => {
        if (levelProps.isLocked) return;

        Animated.spring(scaleAnim, {
          toValue: 0.95,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        }).start();
      };

      const handlePressOut = () => {
        if (levelProps.isLocked) return;

        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        }).start();
      };

      return { handlePressIn, handlePressOut };
    }, [levelProps.isLocked, scaleAnim]);

    // Memoize stars array to prevent recreation
    const starsArray = useMemo(
      () => Array.from({ length: 3 }, (_, i) => i),
      []
    );

    // Memoize focus icon
    const focusIcon = useMemo(
      () => renderFocusIcon(levelProps.focusArea),
      [levelProps.focusArea]
    );

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={styles.levelCard}
          onPress={() => onSelect(level)}
          onPressIn={animationHandlers.handlePressIn}
          onPressOut={animationHandlers.handlePressOut}
          activeOpacity={0.9}
          disabled={levelProps.isLocked}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.levelCardGradient}
          >
            {/* Decorative elements */}
            <View style={styles.cardDeco1} />
            <View style={styles.cardDeco2} />
            <View style={styles.cardDeco3} />

            {/* Level number pill */}
            <View style={styles.levelPill}>
              <Text style={styles.levelNumberText}>
                {levelProps.levelNumber}
              </Text>
            </View>

            {/* Completed Badge */}
            {levelProps.isCompleted && (
              <View style={styles.completedPill}>
                <Check width={14} height={14} color="#FFFFFF" strokeWidth={3} />
                <Text style={styles.completedPillText}>Finished</Text>
              </View>
            )}

            {/* Level content */}
            <View style={styles.levelCardInner}>
              <View style={styles.levelContentContainer}>
                <Text style={styles.levelTitle} numberOfLines={2}>
                  {levelProps.title}
                </Text>

                {/* Focus area badge */}
                <View style={styles.focusAreaPill}>
                  {focusIcon}
                  <Text style={styles.focusAreaText}>
                    {levelProps.focusArea}
                  </Text>
                </View>

                {/* Difficulty stars */}
                <View style={styles.difficultyContainer}>
                  <View style={styles.difficultyStarsWrapper}>
                    {starsArray.map((i) => (
                      <Star
                        key={i}
                        width={14}
                        height={14}
                        fill={
                          i < levelProps.starCount ? "#FFC107" : "transparent"
                        }
                        stroke={
                          i < levelProps.starCount
                            ? "#FFC107"
                            : "rgba(255, 255, 255, 0.4)"
                        }
                        style={{ marginRight: 2 }}
                      />
                    ))}
                  </View>
                  <Text style={styles.difficultyLabel}>
                    {levelProps.formattedDifficulty}
                  </Text>
                </View>
              </View>
            </View>

            {/* Locked overlay */}
            {levelProps.isLocked && (
              <View style={styles.levelLock}>
                <Animatable.View
                  animation="pulse"
                  iterationCount="infinite"
                  duration={2000}
                  style={styles.levelLockIcon}
                >
                  <Lock width={24} height={24} color="#FFFFFF" />
                </Animatable.View>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  },
  // Enhanced memo comparison - more specific comparisons
  (prevProps, nextProps) => {
    const prevLevel = prevProps.level;
    const nextLevel = nextProps.level;

    return (
      prevLevel.id === nextLevel.id &&
      prevLevel.status === nextLevel.status &&
      prevLevel.title === nextLevel.title &&
      prevLevel.difficulty === nextLevel.difficulty &&
      prevLevel.focusArea === nextLevel.focusArea &&
      prevLevel.levelString === nextLevel.levelString &&
      prevProps.gradientColors[0] === nextProps.gradientColors[0] &&
      prevProps.gradientColors[1] === nextProps.gradientColors[1]
    );
  }
);

export default LevelCard;
