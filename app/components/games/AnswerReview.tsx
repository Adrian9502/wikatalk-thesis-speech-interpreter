import React, { useMemo, useState, useCallback, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { Check, X } from "react-native-feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { BASE_COLORS, TITLE_COLORS } from "@/constants/colors";
import { GAME_RESULT_COLORS } from "@/constants/colors";
import { formatTimerDisplay, getGameModeGradient } from "@/utils/gameUtils";
import { safeTextRender } from "@/utils/textUtils";
import DifficultyBadge from "@/components/games/DifficultyBadge";
import FocusAreaBadge from "@/components/games/FocusAreaBadge";

import ResetButton from "@/components/games/buttons/ResetButton";
import ResetTimerModal from "@/components/games/modals/ResetTimerModal";

import { calculateResetCost } from "@/utils/resetCostUtils";
import { useUserProgress } from "@/hooks/useUserProgress";
import useCoinsStore from "@/store/games/useCoinsStore";
import useGameStore from "@/store/games/useGameStore";
import useProgressStore from "@/store/games/useProgressStore";
import { useSplashStore } from "@/store/useSplashStore";

// sound
import { playSound } from "@/utils/playSound";
import {
  COMPONENT_FONT_SIZES,
  FONT_SIZES,
  POPPINS_FONT,
} from "@/constants/fontSizes";

const { width: screenWidth } = Dimensions.get("window");

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
  onTimerReset?: () => void;
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
  animation = "fadeIn",
  duration = 600,
  delay = 100,
  isBackgroundCompletion = false,
  isUserExit = false,
  rewardInfo = null,
  onTimerReset,
}) => {
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  const { resetTimer } = useUserProgress(levelId || "");
  const { coins, fetchCoinsBalance } = useCoinsStore();

  const resetCost = useMemo(() => {
    if (levelId && timeElapsed && timeElapsed > 0) {
      return calculateResetCost(timeElapsed);
    }
    return 0;
  }, [levelId, timeElapsed]);

  const canAfford = coins >= resetCost;
  const shouldDisableReset =
    !canAfford || isCorrect || !timeElapsed || timeElapsed === 0;

  // Get game mode gradient for consistency
  const gameGradientColors = useMemo(
    () => getGameModeGradient(gameMode as any),
    [gameMode]
  );

  const getResultData = () => {
    if (isUserExit) {
      return {
        title: "Game Exited",
        message:
          "You chose to exit the game. Your progress has been saved and you can continue later.",
        colors: GAME_RESULT_COLORS.userExit,
      };
    }

    if (isBackgroundCompletion) {
      return {
        title: "Game Interrupted!",
        message:
          "You left the game while it was running. Your progress has been saved.",
        colors: GAME_RESULT_COLORS.userExit,
      };
    }

    return {
      title: isCorrect ? "Excellent!" : "Oops! Try again.",
      message: isCorrect
        ? "You got it right! Well done."
        : "Keep practicing to improve your skills.",
      colors: isCorrect
        ? GAME_RESULT_COLORS.correctAnswer
        : GAME_RESULT_COLORS.incorrectAnswer,
    };
  };

  const resultData = getResultData();
  const resultColors = resultData.colors;

  // Format the level display text
  const levelDisplayText = useMemo(() => {
    if (actualTitle) return actualTitle;
    if (levelTitle) return levelTitle;
    if (levelString) return levelString;
    return levelId ? `Level ${levelId}` : "Level";
  }, [actualTitle, levelTitle, levelString, levelId]);

  const handleResetPress = useCallback(() => {
    if (levelId && timeElapsed && timeElapsed > 0 && !isCorrect) {
      setShowResetModal(true);
      setShowSuccessMessage(false);
    }
  }, [levelId, timeElapsed, isCorrect]);

  const handleConfirmReset = useCallback(async () => {
    if (!levelId || isResetting) return;

    try {
      setIsResetting(true);

      const result = await resetTimer(levelId);

      if (result.success) {
        fetchCoinsBalance(true);

        if (onTimerReset) {
          console.log("[AnswerReview] Calling parent's onTimerReset callback");
          onTimerReset();
        }

        const coinsDeducted = result.coinsDeducted || resetCost;
        const successMsg = `Timer reset successfully! 🪙 ${coinsDeducted} coins deducted.`;

        setResetMessage(successMsg);
        setShowSuccessMessage(true);

        // Clear caches
        const gameStore = useGameStore.getState();
        gameStore.resetTimer();
        gameStore.setTimeElapsed(0);

        const progressStore = useProgressStore.getState();
        progressStore.clearCache();
        progressStore.fetchProgress(true);

        const splashStore = useSplashStore.getState();
        const existingProgress = splashStore.getIndividualProgress
          ? splashStore.getIndividualProgress(String(levelId))
          : null;

        if (splashStore.setIndividualProgress) {
          const resetProgress = existingProgress
            ? {
                ...existingProgress,
                totalTimeSpent: 0,
                lastAttemptTime: 0,
                attempts: [],
              }
            : {
                totalTimeSpent: 0,
                lastAttemptTime: 0,
                attempts: [],
                completed: false,
                quizId: String(levelId),
              };

          splashStore.setIndividualProgress(String(levelId), resetProgress);
        }
      } else {
        console.error("[AnswerReview] Reset failed:", result.message);
        setResetMessage("Reset failed. Please try again.");
        setShowSuccessMessage(true);
      }
    } catch (error) {
      console.error("[AnswerReview] Reset error:", error);
      setResetMessage("Reset failed. Please try again.");
      setShowSuccessMessage(true);
    } finally {
      setIsResetting(false);
    }
  }, [levelId, resetTimer, fetchCoinsBalance, resetCost, onTimerReset]);

  const handleSuccessAcknowledge = useCallback(() => {
    setShowSuccessMessage(false);
    setShowResetModal(false);
  }, []);

  const handleCloseModal = useCallback(() => {
    if (!isResetting && !showSuccessMessage) {
      setShowResetModal(false);
    }
  }, [isResetting, showSuccessMessage]);

  // Sound effect for answer result
  useEffect(() => {
    // Only play sound for actual game completion, not user exits or background completion
    if (!isBackgroundCompletion && !isUserExit) {
      // Delay sound to match hero card animation
      const soundDelay = setTimeout(() => {
        if (isCorrect) {
          console.log("[AnswerReview] Playing correct answer sound");
          playSound("correct");

          // Play level complete sound after correct sound (if this completes the level)
          if (rewardInfo && rewardInfo.coins > 0) {
            setTimeout(() => {
              console.log("[AnswerReview] Playing level complete sound");
              playSound("levelComplete");
            }, 1500); // Play after correct sound finishes
          }
        } else {
          console.log("[AnswerReview] Playing wrong answer sound");
          playSound("wrong");
        }
      }, delay + 400); // Match hero card animation timing

      return () => clearTimeout(soundDelay);
    }
  }, [isCorrect, isBackgroundCompletion, isUserExit, delay, rewardInfo]);

  return (
    <>
      {/* Main container */}
      <Animatable.View
        animation={animation}
        duration={duration}
        delay={delay}
        style={styles.container}
      >
        {/* Hero Result Card */}
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
            <View style={styles.heroIcon}>
              {isBackgroundCompletion || isUserExit ? (
                <MaterialCommunityIcons
                  name={isUserExit ? "exit-to-app" : "alert-circle"}
                  size={48}
                  color={BASE_COLORS.white}
                />
              ) : isCorrect ? (
                <Check width={45} height={45} color={BASE_COLORS.white} />
              ) : (
                <X width={45} height={45} color={BASE_COLORS.white} />
              )}
            </View>

            <Text style={styles.heroTitle}>{resultData.title}</Text>
            <Text style={styles.heroMessage}>{resultData.message}</Text>

            {timeElapsed === 0 && (
              <View style={styles.resetSuccessContainer}>
                <View style={styles.resetSuccessIndicator}>
                  <Text style={styles.resetSuccessText}>
                    🎉 Timer Reset Successfully!
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.heroDecoration1} />
            <View style={styles.heroDecoration2} />
            <View style={styles.heroDecoration3} />
          </LinearGradient>
        </Animatable.View>

        {/* Reward Card - SIMPLIFIED: Single fadeIn with slight delay */}
        {rewardInfo && rewardInfo.coins > 0 && isCorrect && (
          <Animatable.View
            animation="fadeIn"
            duration={500}
            delay={delay + 200}
            style={styles.rewardFloatingCard}
          >
            <LinearGradient
              colors={GAME_RESULT_COLORS.correctAnswer}
              style={styles.rewardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.rewardTopRow}>
                <Text>🎉</Text>
                <Text style={styles.rewardTitle}>Reward Earned!</Text>
                <Text>✨</Text>
              </View>

              <View style={styles.rewardMainRow}>
                <View style={styles.rewardCoinsSection}>
                  <View style={styles.rewardCoinsDisplay}>
                    <Image
                      source={require("@/assets/images/coin.png")}
                      style={styles.rewardCoinImage}
                    />
                    <Text style={styles.rewardCoinsText}>
                      +{rewardInfo.coins} coins
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.rewardSubtitle}>{rewardInfo.label}</Text>
              <View style={styles.heroDecoration2} />
              <View style={styles.heroDecoration3} />
            </LinearGradient>
          </Animatable.View>
        )}

        {/* Stats Row  */}
        <View style={styles.statsRow}>
          <Animatable.View
            animation="fadeIn"
            duration={400}
            delay={delay + 500}
            style={styles.statsCard}
          >
            <View style={styles.levelInfoCard}>
              <Text style={styles.levelTitleLabel}>{levelString}</Text>
              <Text style={styles.statsValue}>{levelDisplayText}</Text>
            </View>
          </Animatable.View>

          <Animatable.View
            animation="fadeIn"
            duration={400}
            delay={delay + 600}
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
            <View style={styles.resetSection}>
              <ResetButton
                onPress={handleResetPress}
                disabled={shouldDisableReset}
                isLoading={isResetting}
                cost={resetCost}
                showCostLabel={true}
                costLabel="Reset"
                variant="expanded"
                size="small"
                showOnlyWhen={true}
              />
            </View>
          </Animatable.View>
        </View>

        {/* Badges Row  */}
        <Animatable.View
          animation="fadeIn"
          duration={400}
          delay={delay + 700}
          style={styles.badgesRow}
        >
          <View style={styles.curvedBadgeContainer}>
            <DifficultyBadge difficulty={difficulty} />
            <FocusAreaBadge focusArea={focusArea} />
          </View>
        </Animatable.View>

        {/* Q&A Card */}
        <Animatable.View
          animation="fadeIn"
          duration={500}
          delay={delay + 800}
          style={styles.combinedCardContainer}
        >
          <LinearGradient
            colors={gameGradientColors}
            style={styles.combinedCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Level Summary Title - NO separate animation */}
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitleText}>Level Summary</Text>
            </View>

            {/* Question Section */}
            <View style={styles.cardSection}>
              <View style={styles.cardHeader}>
                <View style={styles.iconBubble}>
                  <Text style={styles.cardEmoji}>❔</Text>
                </View>
                <Text style={styles.cardTitle}>Question</Text>
              </View>
              <Text style={styles.cardContent}>{safeTextRender(question)}</Text>
            </View>

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
              <Text style={styles.cardContent}>
                {safeTextRender(userAnswer) || "No answer provided"}
              </Text>
            </View>

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

      <ResetTimerModal
        visible={showResetModal}
        onClose={handleCloseModal}
        onConfirmReset={handleConfirmReset}
        showSuccessMessage={showSuccessMessage}
        resetMessage={resetMessage}
        isResetting={isResetting}
        shouldDisableReset={shouldDisableReset}
        resetCost={resetCost}
        coins={coins}
        onSuccessAcknowledge={handleSuccessAcknowledge}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
    alignItems: "center",
  },
  heroCardContainer: {
    marginBottom: 24,
    alignItems: "center",
  },
  heroCard: {
    width: screenWidth - 62,
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    minHeight: 180,
  },
  heroIcon: {
    width: 75,
    height: 75,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  heroTitle: {
    fontSize: FONT_SIZES["4xl"],
    fontFamily: POPPINS_FONT.bold,
    color: BASE_COLORS.white,
    marginBottom: 8,
    textAlign: "center",
  },
  heroMessage: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.medium,
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
  resetSuccessContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  resetSuccessIndicator: {
    backgroundColor: BASE_COLORS.success,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  resetSuccessText: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  statsRow: {
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
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
    borderColor: "rgba(255, 255, 255, 0.3)",
    transform: [{ rotate: "-3deg" }],
  },
  timeCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    position: "relative",
    borderColor: "rgba(255, 255, 255, 0.3)",
    transform: [{ rotate: "3deg" }],
    minHeight: 135,
  },
  statsLabel: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.medium,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  statsValue: {
    fontSize: COMPONENT_FONT_SIZES.card.title,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.white,
    textAlign: "center",
  },
  levelTitleLabel: {
    fontFamily: POPPINS_FONT.bold,
    color: TITLE_COLORS.customYellow,
    textAlign: "center",
    fontSize: COMPONENT_FONT_SIZES.card.title,
  },
  resetSection: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: "center",
    transform: [{ rotate: "3deg" }],
  },
  badgesRow: {
    alignItems: "center",
    marginBottom: 24,
  },
  curvedBadgeContainer: {
    flexDirection: "row",
    gap: 16,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  rewardFloatingCard: {
    marginBottom: 24,
    alignItems: "center",
  },
  rewardGradient: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: "relative",
    overflow: "hidden",
    width: "100%",
  },
  rewardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 4,
    justifyContent: "center",
  },
  rewardTitle: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
    textAlign: "center",
  },
  rewardMainRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  rewardCoinsSection: {
    alignItems: "center",
    flex: 1,
  },
  rewardCoinsDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rewardCoinImage: {
    width: 18,
    height: 18,
  },
  rewardCoinsText: {
    fontSize: COMPONENT_FONT_SIZES.card.title,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.white,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  rewardSubtitle: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.regular,
    color: "rgba(255, 255, 255, 0.95)",
    letterSpacing: 0.3,
    textAlign: "center",
  },
  sectionTitleContainer: {
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 20,
    borderColor: "rgba(255, 255, 255, 0.3)",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  sectionTitleText: {
    fontSize: COMPONENT_FONT_SIZES.card.title,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.white,
    textAlign: "center",
  },
  combinedCardContainer: {
    alignSelf: "center",
    marginBottom: 20,
    width: "100%",
    flex: 1,
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
    fontSize: 15,
    color: BASE_COLORS.white,
  },
  cardTitle: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.white,
  },
  cardContent: {
    fontSize: COMPONENT_FONT_SIZES.card.title,
    fontFamily: POPPINS_FONT.medium,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 22,
    textAlign: "center",
  },

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
