import React, { useRef } from "react";
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
  ({ level, onSelect, gradientColors, index = 0 }) => {
    // Pull out needed props with type assertion to handle possible undefined
    const {
      levelString = "",
      title = "",
      difficulty = "Easy",
      status = "current",
      focusArea = "Vocabulary",
    } = level || {};

    const starCount = getStarCount(difficulty);
    const animationDelay = 100 + (index % 10) * 50;

    // Animation reference for press feedback only
    const scaleAnim = useRef(new Animated.Value(1)).current;

    // Handling press animations
    const handlePressIn = () => {
      if (status === "locked") return;

      Animated.spring(scaleAnim, {
        toValue: 0.95,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      if (status === "locked") return;

      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }).start();
    };

    // Format level number
    const levelNumber = levelString.replace(/^Level\s+/, "");

    return (
      <>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={styles.levelCard}
            onPress={() => onSelect(level)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.9}
            disabled={status === "locked"}
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
                <Text style={styles.levelNumberText}>{levelNumber}</Text>
              </View>

              {/* New Completed Badge - Pill shaped with icon and text */}
              {status === "completed" && (
                <Animatable.View
                  animation="fadeIn"
                  style={styles.completedPill}
                >
                  <Check
                    width={14}
                    height={14}
                    color="#FFFFFF"
                    strokeWidth={3}
                  />
                  <Text style={styles.completedPillText}>Finished</Text>
                </Animatable.View>
              )}

              {/* Level content */}
              <View style={styles.levelCardInner}>
                <View style={styles.levelContentContainer}>
                  <Text style={styles.levelTitle} numberOfLines={2}>
                    {title}
                  </Text>

                  {/* Focus area badge */}
                  <View style={styles.focusAreaPill}>
                    {renderFocusIcon(focusArea)}
                    <Text style={styles.focusAreaText}>{focusArea}</Text>
                  </View>

                  {/* Difficulty stars */}
                  <View style={styles.difficultyContainer}>
                    <View style={styles.difficultyStarsWrapper}>
                      {[...Array(3)].map((_, i) => (
                        <Star
                          key={i}
                          width={14}
                          height={14}
                          fill={i < starCount ? "#FFC107" : "transparent"}
                          stroke={
                            i < starCount
                              ? "#FFC107"
                              : "rgba(255, 255, 255, 0.4)"
                          }
                          style={{ marginRight: 2 }}
                        />
                      ))}
                    </View>
                    <Text style={styles.difficultyLabel}>
                      {formatDifficulty(difficulty)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Locked overlay */}
              {status === "locked" && (
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
      </>
    );
  },
  // Enhanced memo comparison
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
