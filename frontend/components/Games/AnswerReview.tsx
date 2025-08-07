import React, { useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { Check, X, Star } from "react-native-feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { BASE_COLORS, difficultyColors, TITLE_COLORS } from "@/constant/colors";
import { getDifficultyColors } from "@/utils/gameUtils";
import { formatTimerDisplay, getGameModeGradient } from "@/utils/gameUtils";
import { safeTextRender } from "@/utils/textUtils";
import { NAVIGATION_COLORS } from "@/constant/gameConstants";
import DifficultyBadge from "@/components/games/DifficultyBadge";
import FocusAreaBadge from "@/components/games/FocusAreaBadge";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

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
      {/* Hero Result Card - Larger, more prominent */}
      <Animatable.View
        animation="bounceIn"
        duration={1000}
        delay={delay + 200}
        style={styles.heroCardContainer}
      >
        <LinearGradient
          colors={resultColors}
          style={styles.heroCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Large Result Icon */}
          <View style={styles.heroIcon}>
            {isBackgroundCompletion || isUserExit ? (
              <MaterialCommunityIcons
                name={isUserExit ? "exit-to-app" : "alert-circle"}
                size={48}
                color={BASE_COLORS.white}
              />
            ) : isCorrect ? (
              <Check width={48} height={48} color={BASE_COLORS.white} />
            ) : (
              <X width={48} height={48} color={BASE_COLORS.white} />
            )}
          </View>

          {/* Result Title */}
          <Text style={styles.heroTitle}>{resultData.title}</Text>
          <Text style={styles.heroMessage}>{resultData.message}</Text>

          {/* Floating decorative elements */}
          <View style={styles.heroDecoration1} />
          <View style={styles.heroDecoration2} />
          <View style={styles.heroDecoration3} />
        </LinearGradient>
      </Animatable.View>

      {/* Stats Row - Horizontal layout with rounded cards */}
      <View style={styles.statsRow}>
        {/* Level Info Card */}
        <Animatable.View
          animation="slideInLeft"
          duration={600}
          delay={delay + 400}
          style={styles.statsCard}
        >
          <View style={styles.levelInfoCard}>
            <Text style={styles.levelTitleLabel}>{levelString}</Text>
            <Text style={styles.statsValue}>{levelDisplayText}</Text>
          </View>
        </Animatable.View>

        {/* Time Card */}
        {timeElapsed !== undefined && (
          <Animatable.View
            animation="slideInRight"
            duration={600}
            delay={delay + 500}
            style={styles.statsCard}
          >
            <View style={styles.timeCard}>
              <MaterialCommunityIcons
                name="clock"
                size={18}
                color={BASE_COLORS.white}
              />
              <Text style={styles.statsLabel}>Time Taken</Text>
              <Text style={styles.statsValue}>
                {formatTimerDisplay(timeElapsed as number)}
              </Text>
            </View>
          </Animatable.View>
        )}
      </View>

      {/* Badges Row - Curved layout */}
      <Animatable.View
        animation="fadeInUp"
        duration={600}
        delay={delay + 600}
        style={styles.badgesRow}
      >
        <View style={styles.curvedBadgeContainer}>
          <DifficultyBadge difficulty={difficulty} />
          <FocusAreaBadge focusArea={focusArea} />
        </View>
      </Animatable.View>

      {/* Reward Card - Special floating design */}
      {rewardInfo && rewardInfo.coins > 0 && isCorrect && (
        <Animatable.View
          animation="bounceIn"
          duration={800}
          delay={delay + 800}
          style={styles.rewardFloatingCard}
        >
          <LinearGradient
            colors={getDifficultyColors(rewardInfo.difficulty)}
            style={styles.rewardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.rewardIconBg}>
              <Star width={24} height={24} color={BASE_COLORS.white} />
            </View>

            <View style={styles.rewardContent}>
              <Text style={styles.rewardTitle}>Reward Earned!</Text>
              <View style={styles.rewardCoinsDisplay}>
                <Image
                  source={require("@/assets/images/coin.png")}
                  style={styles.rewardCoinImage}
                />
                <Text style={styles.rewardCoinsText}>
                  +{rewardInfo.coins} coins
                </Text>
              </View>
              <Text style={styles.rewardSubtitle}>{rewardInfo.label}</Text>
            </View>

            {/* Floating particles effect */}
            <View style={styles.particle1} />
            <View style={styles.particle2} />
            <View style={styles.particle3} />
          </LinearGradient>
        </Animatable.View>
      )}

      {/* Q&A Section - Asymmetric cards */}
      {/* Question Card - Tilted left */}
      <Animatable.View
        animation="fadeInUp"
        duration={700}
        delay={delay + 700}
        style={styles.combinedCardContainer}
      >
        <LinearGradient
          colors={gameGradientColors}
          style={styles.combinedCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Level Summary Title*/}
          <Animatable.View
            animation="fadeInUp"
            duration={600}
            delay={delay + 650}
            style={styles.sectionTitleContainer}
          >
            <Text style={styles.sectionTitleText}>Level Summary</Text>
          </Animatable.View>
          {/* Question Section */}
          <View style={styles.cardSection}>
            <View style={styles.cardHeader}>
              <View style={styles.iconBubble}>
                <Text style={styles.cardEmoji}>❓</Text>
              </View>
              <Text style={styles.cardTitle}>Question</Text>
            </View>
            <Text style={styles.cardContent}>{safeTextRender(question)}</Text>
          </View>

          {/* Divider */}
          <View style={styles.sectionDivider} />

          {/* Answer Section */}
          <View style={styles.cardSection}>
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.iconBubble,
                  isBackgroundCompletion || isUserExit
                    ? styles.warningBubble
                    : isCorrect
                    ? styles.correctBubble
                    : styles.incorrectBubble,
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
              <Text style={styles.cardTitle}>Your Answer</Text>
            </View>
            <Text
              style={[
                styles.cardContent,
                (isBackgroundCompletion || isUserExit) && styles.exitAnswerText,
              ]}
            >
              {safeTextRender(userAnswer) || "No answer provided"}
            </Text>
          </View>

          {/* Card Decorations */}
          <View style={styles.heroDecoration1} />
          <View style={styles.heroDecoration2} />
          <View style={styles.heroDecoration3} />
        </LinearGradient>
      </Animatable.View>

      {/* Background decorative elements */}
      <View style={styles.backgroundDecor1} />
      <View style={styles.backgroundDecor2} />
      <View style={styles.backgroundDecor3} />
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  // Hero Card - Main result display
  heroCardContainer: {
    marginBottom: 24,
    alignItems: "center",
  },
  heroCard: {
    width: screenWidth - 52,
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    minHeight: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: BASE_COLORS.white,
    marginBottom: 8,
    textAlign: "center",
  },
  heroMessage: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 24,
  },
  heroDecoration1: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  heroDecoration2: {
    position: "absolute",
    bottom: -30,
    left: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  heroDecoration3: {
    position: "absolute",
    top: 20,
    left: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },

  // Stats Row - Horizontal cards
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  statsCard: {
    flex: 1,
  },
  levelInfoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    transform: [{ rotate: "-3deg" }],
  },
  timeCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    transform: [{ rotate: "3deg" }],
  },
  statsLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    textAlign: "center",
  },
  levelTitleLabel: {
    fontFamily: "Poppins-Bold",
    color: TITLE_COLORS.customYellow,
    textAlign: "center",
    fontSize: 16,
  },
  // Badges Row
  badgesRow: {
    alignItems: "center",
    marginBottom: 24,
  },
  curvedBadgeContainer: {
    flexDirection: "row",
    gap: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },

  // Reward Floating Card
  rewardFloatingCard: {
    alignSelf: "center",
    marginBottom: 24,
    transform: [{ rotate: "-1deg" }],
    width: screenWidth * 0.65,
    maxWidth: 280,
  },
  rewardGradient: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    minHeight: 85,
  },
  rewardIconBg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    flexShrink: 0,
  },
  rewardContent: {
    flex: 1,
    minWidth: 0,
  },
  rewardTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    marginBottom: 4,
  },
  rewardCoinsDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
    flexWrap: "wrap", // Allow wrapping if needed
  },
  rewardCoinImage: {
    width: 24,
    height: 24,
    flexShrink: 0,
  },
  rewardCoinsText: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: BASE_COLORS.white,
  },
  rewardSubtitle: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 16,
    marginTop: 8,
  },
  particle1: {
    position: "absolute",
    top: 10,
    right: 20,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  particle2: {
    position: "absolute",
    bottom: 15,
    right: 40,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  particle3: {
    position: "absolute",
    top: 30,
    right: 60,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  //  Level title Title Styles
  sectionTitleContainer: {
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 20,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  sectionTitleText: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    textAlign: "center",
    letterSpacing: 0.5,
  },

  // Q&A Section - Asymmetric cards
  combinedCardContainer: {
    alignSelf: "center",
    width: "95%",
    marginBottom: 20,
  },
  combinedCard: {
    borderRadius: 20,
    padding: 20,
    position: "relative",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  cardSection: {
    marginBottom: 5,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 10,
    borderRadius: 0.5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  correctBubble: {
    backgroundColor: "rgba(76, 175, 80, 0.8)",
  },
  incorrectBubble: {
    backgroundColor: "rgba(244, 67, 54, 0.8)",
  },
  warningBubble: {
    backgroundColor: "rgba(255, 152, 0, 0.8)",
  },
  cardEmoji: {
    fontSize: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  cardContent: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 22,
    textAlign: "center",
  },
  exitAnswerText: {
    color: "#e4a84fff",
    fontFamily: "Poppins-SemiBold",
  },

  // Background decorations
  backgroundDecor1: {
    position: "absolute",
    top: 300,
    right: 10,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    zIndex: -1,
  },
  backgroundDecor2: {
    position: "absolute",
    bottom: 100,
    left: 0,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    zIndex: -1,
  },
  backgroundDecor3: {
    position: "absolute",
    top: "50%",
    left: 10,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    zIndex: -1,
  },
});

export default AnswerReview;
