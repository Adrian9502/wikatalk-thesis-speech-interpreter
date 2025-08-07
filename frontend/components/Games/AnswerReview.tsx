import React, { useMemo, useRef, useEffect } from "react";
import { View, Text, StyleSheet, Animated, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { Check, X, Star } from "react-native-feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { BASE_COLORS, difficultyColors } from "@/constant/colors";
import { getDifficultyColors } from "@/utils/gameUtils";

import { formatTimerDisplay, getGameModeGradient } from "@/utils/gameUtils";
import { safeTextRender } from "@/utils/textUtils";
import { NAVIGATION_COLORS } from "@/constant/gameConstants";
// NEW: Import badge components
import DifficultyBadge from "@/components/games/DifficultyBadge";
import FocusAreaBadge from "@/components/games/FocusAreaBadge";

interface RewardInfo {
  coins: number;
  label: string;
  difficulty: string;
  timeSpent: number;
  tier?: any;
}

interface AnswerReviewProps {
  question: string | any;
  userAnswer: string | any;
  isCorrect: boolean;
  timeElapsed?: number;
  difficulty?: string;
  focusArea?: string;
  gameMode?: string;
  levelId?: number;
  levelTitle?: string;
  levelString?: string;
  actualTitle?: string;
  animation?: string;
  duration?: number;
  delay?: number;
  questionLabel?: string;
  answerLabel?: string;
  isBackgroundCompletion?: boolean;
  isUserExit?: boolean;
  rewardInfo?: RewardInfo | null;
}

const AnswerReview: React.FC<AnswerReviewProps> = ({
  question,
  userAnswer,
  isCorrect,
  timeElapsed,
  difficulty = "easy",
  focusArea = "Vocabulary",
  gameMode = "multipleChoice",
  levelId,
  levelTitle,
  levelString,
  actualTitle,
  animation = "fadeInUp",
  duration = 800,
  delay = 300,
  questionLabel = "Question:",
  answerLabel = "Your Answer:",
  isBackgroundCompletion = false,
  isUserExit = false,
  rewardInfo = null,
}) => {
  // Get game mode gradient for consistency
  const gameGradientColors = useMemo(
    () => getGameModeGradient(gameMode as any),
    [gameMode]
  );

  // ENHANCED: Handle different exit scenarios
  const getResultData = () => {
    if (isUserExit) {
      return {
        title: "Game Exited",
        message:
          "You chose to exit the game. Your progress has been saved and you can continue later.",
        colors: ["#FF9800", "#EF6C00"] as const,
      };
    }

    if (isBackgroundCompletion) {
      return {
        title: "Game Interrupted!",
        message:
          "You left the game while it was running. Your progress has been saved.",
        colors: ["#FF9800", "#EF6C00"] as const, // Orange warning gradient
      };
    }

    return {
      title: isCorrect ? "Excellent!" : "Oops! Try again.",
      message: isCorrect
        ? "You got it right! Well done."
        : "Keep practicing to improve your skills.",
      colors: isCorrect
        ? (NAVIGATION_COLORS.green as readonly [string, string])
        : (difficultyColors.Hard as readonly [string, string]),
    };
  };

  const resultData = getResultData();
  const resultColors = resultData.colors;

  // Format the level display text
  const levelDisplayText = useMemo(() => {
    // Priority order: actualTitle > levelTitle > levelString > fallback
    if (actualTitle) {
      return actualTitle;
    }

    if (levelTitle) {
      return levelTitle;
    }

    if (levelString) {
      return levelString;
    }

    // Fallback to level ID
    return levelId ? `Level ${levelId}` : "Level";
  }, [actualTitle, levelTitle, levelString, levelId]);

  // NEW: Format time helper
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    } else {
      return `${(seconds / 60).toFixed(1)}m`;
    }
  };

  return (
    <Animatable.View
      animation={animation}
      duration={duration}
      delay={delay}
      style={styles.container}
    >
      {/* Main Result Card */}
      <Animatable.View
        animation="bounceIn"
        duration={1000}
        delay={delay + 200}
        style={styles.resultCardContainer}
      >
        <LinearGradient
          colors={resultColors}
          style={styles.resultCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Result Icon */}
          <View style={styles.resultIcon}>
            {isBackgroundCompletion || isUserExit ? (
              <MaterialCommunityIcons
                name={isUserExit ? "exit-to-app" : "alert-circle"}
                size={32}
                color={BASE_COLORS.white}
              />
            ) : isCorrect ? (
              <Check width={32} height={32} color={BASE_COLORS.white} />
            ) : (
              <X width={32} height={32} color={BASE_COLORS.white} />
            )}
          </View>

          {/* Result Title */}
          <Text style={styles.resultTitle}>{resultData.title}</Text>

          {/* Result Message */}
          <Text style={styles.resultMessage}>{resultData.message}</Text>

          {/* Level Information */}
          <View style={styles.levelInfoContainer}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>
                {levelString} - {levelDisplayText}
              </Text>
            </View>
          </View>

          {/* Level Details Badges */}
          <View style={styles.levelDetailsContainer}>
            <DifficultyBadge difficulty={difficulty} />
            <FocusAreaBadge focusArea={focusArea} />
          </View>

          {/* Time Taken Section - ALWAYS show if timeElapsed is available */}
          {timeElapsed !== undefined && (
            <View style={styles.timeInfoContainer}>
              <View style={styles.timeBadge}>
                <MaterialCommunityIcons
                  name="clock"
                  size={15}
                  color={BASE_COLORS.white}
                />
                <Text style={styles.timeText}>
                  Time: {formatTimerDisplay(timeElapsed as number)}
                </Text>
              </View>
            </View>
          )}

          {/* NEW: Reward Display - Only show for correct answers - MOVED BELOW TIME */}
          {rewardInfo && rewardInfo.coins > 0 && isCorrect && (
            <Animatable.View
              animation="bounceIn"
              duration={800}
              delay={delay + 800}
              style={styles.rewardContainer}
            >
              <View style={styles.rewardContent}>
                <View style={styles.rewardIconContainer}>
                  <Star width={18} height={18} color={BASE_COLORS.white} />
                </View>
                <Image
                  source={require("@/assets/images/coin.png")}
                  style={styles.rewardCoinImage}
                />
                <Text style={styles.rewardCoinsText}>+{rewardInfo.coins}</Text>
                <Text style={styles.rewardCoinsLabel}>coins</Text>
              </View>
              <Text style={styles.rewardSubtitle}>{rewardInfo.label}</Text>
              {/* Reward Badge Decorations */}
              <View style={styles.rewardDecoration1} />
              <View style={styles.rewardDecoration2} />
            </Animatable.View>
          )}

          {/* Decorative Elements */}
          <View style={styles.cardDecoration1} />
          <View style={styles.cardDecoration2} />
        </LinearGradient>
      </Animatable.View>

      {/* Review Details Card */}
      <Animatable.View
        animation="slideInUp"
        duration={700}
        delay={delay + 600}
        style={styles.reviewCardContainer}
      >
        <LinearGradient
          colors={gameGradientColors}
          style={styles.reviewCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Question Section */}
          <View style={styles.reviewSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Text style={styles.sectionIcon}>❓</Text>
              </View>
              <Text style={styles.sectionTitle}>{questionLabel}</Text>
            </View>
            <View style={styles.contentContainer}>
              <Text style={styles.questionText}>
                {safeTextRender(question)}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Answer Section */}
          <View style={styles.reviewSection}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIconContainer,
                  isBackgroundCompletion || isUserExit
                    ? styles.warningIcon
                    : isCorrect
                    ? styles.correctIcon
                    : styles.incorrectIcon,
                ]}
              >
                {isBackgroundCompletion || isUserExit ? (
                  <MaterialCommunityIcons
                    name={isUserExit ? "exit-to-app" : "alert-circle"}
                    size={16}
                    color={BASE_COLORS.white}
                  />
                ) : isCorrect ? (
                  <Check width={16} height={16} color={BASE_COLORS.white} />
                ) : (
                  <X width={16} height={16} color={BASE_COLORS.white} />
                )}
              </View>
              <Text style={styles.sectionTitle}>{answerLabel}</Text>
            </View>
            <View style={styles.contentContainer}>
              <Text
                style={[
                  styles.answerText,
                  (isBackgroundCompletion || isUserExit) &&
                    styles.backgroundAnswerText,
                ]}
              >
                {safeTextRender(userAnswer) || "(No answer provided)"}
              </Text>
            </View>
          </View>

          {/* Card Decorations */}
          <View style={styles.reviewCardDecoration1} />
          <View style={styles.reviewCardDecoration2} />
        </LinearGradient>
      </Animatable.View>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    position: "relative",
  },

  // Result Card
  resultCardContainer: {
    marginBottom: 12,
    zIndex: 2,
  },
  resultCard: {
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    minHeight: 100,
    justifyContent: "center",
  },
  resultIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: BASE_COLORS.white,
    marginBottom: 8,
    textAlign: "center",
  },
  resultMessage: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16,
  },

  // Level Information Styles
  levelInfoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  levelBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  levelText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    textAlign: "center",
    letterSpacing: 0.3,
  },

  // NEW: Level Details Badges Container
  levelDetailsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
    paddingHorizontal: 8,
  },

  // Time Information
  timeInfoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    letterSpacing: 0.3,
  },

  rewardContainer: {
    alignItems: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    marginBottom: 6,
    minWidth: 140,
  },

  rewardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    zIndex: 2,
  },
  rewardIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  rewardCoinImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  rewardCoinsText: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: BASE_COLORS.white,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  rewardCoinsLabel: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "rgba(255, 255, 255, 0.9)",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  rewardSubtitle: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  // Reward Badge Decorations
  rewardDecoration1: {
    position: "absolute",
    top: -10,
    left: -10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  rewardDecoration2: {
    position: "absolute",
    bottom: -8,
    right: -8,
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },

  // Review Card
  reviewCardContainer: {
    zIndex: 2,
    marginVertical: 12,
  },
  reviewCard: {
    borderRadius: 20,
    padding: 20,
    position: "relative",
    overflow: "hidden",
  },
  reviewSection: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  correctIcon: {
    backgroundColor: "rgba(0, 255, 8, 0.6)",
  },
  incorrectIcon: {
    backgroundColor: "rgba(255, 17, 0, 0.6)",
  },
  sectionIcon: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  contentContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  questionText: {
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 22,
  },
  answerText: {
    fontSize: 16,
    color: BASE_COLORS.white,
    textAlign: "center",
    fontFamily: "Poppins-Medium",
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: 8,
  },
  reviewCardDecoration1: {
    position: "absolute",
    top: -15,
    left: -15,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  reviewCardDecoration2: {
    position: "absolute",
    bottom: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },

  warningIcon: {
    backgroundColor: "rgba(255, 167, 38, 0.6)",
  },

  backgroundAnswerText: {
    fontFamily: "Poppins-SemiBold",
    color: "#e4a84fff",
  },

  // Decorative Elements
  cardDecoration1: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  cardDecoration2: {
    position: "absolute",
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
});

export default AnswerReview;
