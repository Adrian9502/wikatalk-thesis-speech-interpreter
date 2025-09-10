import React, { useRef, useMemo, useEffect, useState } from "react";
import { Text, View, TouchableOpacity, Animated } from "react-native";
import { Star, Lock, Check } from "react-native-feather";
import { LinearGradient } from "expo-linear-gradient";
import { LevelData } from "@/types/gameTypes";
import { renderFocusIcon } from "@/utils/games/renderFocusIcon";
import { getStarCount, formatDifficulty } from "@/utils/games/difficultyUtils";
import { levelStyles as styles } from "@/styles/games/levels.styles";
import { BASE_COLORS, ICON_COLORS } from "@/constant/colors";

interface LevelCardProps {
  level: LevelData;
  onSelect: (level: LevelData) => void;
  gradientColors: readonly [string, string];
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  index?: number;
  shouldAnimate?: boolean;
  animationDelay?: number;
}

const LevelCard: React.FC<LevelCardProps> = React.memo(
  ({
    level,
    onSelect,
    gradientColors,
    index = 0,
    shouldAnimate = false,
    animationDelay = 0,
  }) => {
    // Memoize extracted props to prevent recalculation
    const levelProps = useMemo(() => {
      const {
        levelString = "",
        title = "",
        difficulty = "Easy",
        status = "current",
        focusArea = "Vocabulary",
        difficultyCategory = "easy",
      } = level || {};

      // NEW: Calculate lock reason for better UX
      const getLockReason = () => {
        if (status !== "locked") return null;

        const diffLower = difficultyCategory.toLowerCase();
        if (diffLower === "medium") {
          return "Complete all Easy levels to unlock";
        } else if (diffLower === "hard") {
          return "Complete all Medium levels to unlock";
        }
        return "Locked";
      };

      return {
        levelString,
        title,
        difficulty,
        status,
        focusArea,
        difficultyCategory,
        starCount: getStarCount(difficulty),
        levelNumber: levelString.replace(/^Level\s+/, ""),
        formattedDifficulty: formatDifficulty(difficulty),
        isLocked: status === "locked",
        isCompleted: status === "completed",
        lockReason: getLockReason(),
      };
    }, [level]);

    const scaleAnim = useRef(new Animated.Value(1)).current;
    const entranceOpacity = useRef(
      new Animated.Value(shouldAnimate ? 0 : 1)
    ).current;
    const entranceTranslateY = useRef(
      new Animated.Value(shouldAnimate ? 30 : 0)
    ).current;

    // Animation state
    const [hasAnimated, setHasAnimated] = useState(!shouldAnimate);
    const [isEntranceComplete, setIsEntranceComplete] = useState(
      !shouldAnimate
    );

    // SIMPLIFIED: Entrance animation
    useEffect(() => {
      if (shouldAnimate && !hasAnimated) {
        const timer = setTimeout(() => {
          Animated.parallel([
            Animated.timing(entranceOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(entranceTranslateY, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]).start(({ finished }) => {
            if (finished) {
              setHasAnimated(true);
              setIsEntranceComplete(true);
            }
          });
        }, animationDelay);

        return () => clearTimeout(timer);
      }
    }, [
      shouldAnimate,
      hasAnimated,
      animationDelay,
      entranceOpacity,
      entranceTranslateY,
    ]);

    // SIMPLIFIED: Press animation handlers
    const animationHandlers = useMemo(() => {
      const handlePressIn = () => {
        if (levelProps.isLocked || !isEntranceComplete) return;

        Animated.spring(scaleAnim, {
          toValue: 0.95,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }).start();
      };

      const handlePressOut = () => {
        if (levelProps.isLocked || !isEntranceComplete) return;

        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }).start();
      };

      return { handlePressIn, handlePressOut };
    }, [levelProps.isLocked, scaleAnim, isEntranceComplete]);

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
      <Animated.View
        style={[
          {
            opacity: entranceOpacity,
            transform: [
              { scale: scaleAnim },
              { translateY: entranceTranslateY },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.levelCard}
          onPress={() => onSelect(level)}
          onPressIn={animationHandlers.handlePressIn}
          onPressOut={animationHandlers.handlePressOut}
          activeOpacity={0.9}
          disabled={levelProps.isLocked}
        >
          <LinearGradient
            colors={
              levelProps.isLocked ? ["#666666", "#444444"] : gradientColors
            }
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
                <Check
                  width={12}
                  height={12}
                  color={BASE_COLORS.white}
                  strokeWidth={2}
                />
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
                        width={13}
                        height={13}
                        fill={
                          i < levelProps.starCount
                            ? ICON_COLORS.brightYellow
                            : "transparent"
                        }
                        stroke={
                          i < levelProps.starCount
                            ? ICON_COLORS.brightYellow
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

            {/* Locked overlay with reason */}
            {levelProps.isLocked && (
              <View style={styles.levelLock}>
                <Animated.View
                  style={[
                    styles.levelLockContent,
                    {
                      transform: [{ scale: scaleAnim }],
                    },
                  ]}
                >
                  <View style={styles.levelLockIcon}>
                    <Lock width={24} height={24} color={BASE_COLORS.white} />
                  </View>
                  {levelProps.lockReason && (
                    <Text style={styles.lockReasonText} numberOfLines={2}>
                      {levelProps.lockReason}
                    </Text>
                  )}
                </Animated.View>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  },
  // Enhanced memo comparison
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
      prevProps.gradientColors[1] === nextProps.gradientColors[1] &&
      prevProps.shouldAnimate === nextProps.shouldAnimate &&
      prevProps.animationDelay === nextProps.animationDelay
    );
  }
);

export default LevelCard;
