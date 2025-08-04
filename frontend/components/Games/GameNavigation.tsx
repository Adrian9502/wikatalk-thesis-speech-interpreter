import React, { useMemo, useState, useCallback, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import * as Animatable from "react-native-animatable";
import { BASE_COLORS, gameModeNavigationColors } from "@/constant/colors";
import { GameMode } from "@/types/gameTypes";
import useGameStore from "@/store/games/useGameStore";
import { NAVIGATION_COLORS } from "@/constant/gameConstants";
import GameButton from "@/components/games/GameButton";
import { useLevelData } from "@/hooks/useLevelData";
import LevelInfoModal from "@/components/games/levels/LevelInfoModal";
import useProgressStore from "@/store/games/useProgressStore";
import { useSplashStore } from "@/store/useSplashStore";

interface GameNavigationProps {
  levelId: number;
  gameMode: GameMode | string;
  gameTitle: string;
  difficulty: string;
  onRestart: () => void;
  nextLevelTitle?: string;
  isCurrentLevelCompleted?: boolean;
  isCorrectAnswer?: boolean;
}

const GameNavigation: React.FC<GameNavigationProps> = ({
  levelId,
  gameMode,
  gameTitle,
  difficulty,
  onRestart,
  nextLevelTitle,
  isCurrentLevelCompleted = false,
  isCorrectAnswer = false,
}) => {
  // Modal state
  const [showNextLevelModal, setShowNextLevelModal] = useState(false);
  const [nextLevelData, setNextLevelData] = useState<any>(null);
  const [isRetryLoading, setIsRetryLoading] = useState(false);

  // NEW: Track animation state
  const [isAnimating, setIsAnimating] = useState(true);

  // NEW: Enable interactions after animations complete
  useEffect(() => {
    // Calculate total animation duration based on your existing delays
    const totalAnimationDuration = 800 + 300 + 500; // slideInUp + fadeInUp + fadeIn delays

    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, totalAnimationDuration);

    return () => clearTimeout(timer);
  }, []);

  // Ensure levelId is parsed as a number
  const numericLevelId = Number(levelId);

  // Get level data to check next level availability and lock status
  const { levels, isLoading } = useLevelData(gameMode);

  // ENHANCED: Calculate navigation state with comprehensive checks
  const navigationState = useMemo(() => {
    // Find current level in the levels array
    const currentLevel = levels.find((level) => level.id === numericLevelId);

    // Find next level
    const nextLevelId = numericLevelId + 1;
    const nextLevel = levels.find((level) => level.id === nextLevelId);

    // FIXED: Don't use simple comparison - check if next level actually exists
    const isLastLevel = !nextLevel; // Only true if no next level exists

    // Get total levels count for this game mode
    const totalLevels = levels.length;

    // Calculate completion stats for difficulty-based locking
    const difficultyStats = {
      easy: { total: 0, completed: 0 },
      medium: { total: 0, completed: 0 },
      hard: { total: 0, completed: 0 },
    };

    levels.forEach((level) => {
      const diff = level.difficultyCategory?.toLowerCase() || "easy";
      if (difficultyStats[diff as keyof typeof difficultyStats]) {
        difficultyStats[diff as keyof typeof difficultyStats].total++;
        if (level.status === "completed") {
          difficultyStats[diff as keyof typeof difficultyStats].completed++;
        }
      }
    });

    const isEasyComplete =
      difficultyStats.easy.total > 0 &&
      difficultyStats.easy.completed >= difficultyStats.easy.total;
    const isMediumComplete =
      difficultyStats.medium.total > 0 &&
      difficultyStats.medium.completed >= difficultyStats.medium.total;

    // Get current and next level difficulties
    const currentDifficulty =
      currentLevel?.difficultyCategory?.toLowerCase() || "easy";
    const nextDifficulty =
      nextLevel?.difficultyCategory?.toLowerCase() || "easy";

    // Helper function to create next level display text
    const createNextLevelText = (level: any) => {
      const levelString =
        level?.levelString ||
        level?.questionData?.level ||
        `Level ${nextLevelId}`;
      const title = level?.title || level?.questionData?.title;

      if (title) {
        return `${levelString} - ${title}`;
      }
      return levelString;
    };

    // Determine next level status and reasons
    let nextLevelStatus = "available";
    let nextLevelTitle = "";
    let nextLevelSubtitle = "";
    let retryStatus = "available";
    let retryMessage = "";

    // FIXED: Enhanced next level availability check
    if (isLastLevel) {
      nextLevelStatus = "disabled";
      nextLevelTitle = "All Levels Complete!";
      nextLevelSubtitle = `🎉 You've completed all ${totalLevels} levels in ${gameTitle}`;
    } else if (nextLevel) {
      // Next level exists, check its status and conditions

      // CASE 1: Next level is locked due to difficulty progression
      if (nextLevel.status === "locked") {
        nextLevelStatus = "disabled";

        if (nextDifficulty === "medium" && !isEasyComplete) {
          nextLevelTitle = "Next Level Locked";
          nextLevelSubtitle = "🔒 Complete all Easy levels first";
        } else if (nextDifficulty === "hard" && !isMediumComplete) {
          nextLevelTitle = "Next Level Locked";
          nextLevelSubtitle = "🔒 Complete all Medium levels first";
        } else {
          nextLevelTitle = "Next Level Locked";
          nextLevelSubtitle = "🔒 This level is currently locked";
        }
      }
      // CASE 2: Check progression rules based on difficulty transition
      else {
        const isSameDifficulty = currentDifficulty === nextDifficulty;
        const isDifficultyIncrease =
          (currentDifficulty === "easy" && nextDifficulty === "medium") ||
          (currentDifficulty === "medium" && nextDifficulty === "hard");

        if (isSameDifficulty) {
          nextLevelTitle = "Next Level";
          nextLevelSubtitle = createNextLevelText(nextLevel);

          if (nextLevel.status === "completed") {
            nextLevelTitle = "Next Level (Completed)";
            nextLevelSubtitle = "You'll be redirected to level selection";
          }
        } else if (isDifficultyIncrease) {
          if (!isCurrentLevelCompleted || !isCorrectAnswer) {
            nextLevelStatus = "disabled";
            nextLevelTitle = "Complete Current Level";
            nextLevelSubtitle = "✅ Answer correctly to unlock next difficulty";
          } else {
            nextLevelTitle = "Next Level";
            const levelText = createNextLevelText(nextLevel);
            const difficultyText =
              nextDifficulty.charAt(0).toUpperCase() + nextDifficulty.slice(1);
            nextLevelSubtitle = `${levelText} (${difficultyText})`;
          }
        } else {
          nextLevelTitle = "Next Level";
          nextLevelSubtitle = createNextLevelText(nextLevel);
        }
      }
    } else {
      nextLevelStatus = "disabled";
      nextLevelTitle = "No More Levels";
      nextLevelSubtitle = "🎯 Try other difficulty modes";
    }

    // ENHANCED: Check Retry availability with better logic
    if (isCurrentLevelCompleted && isCorrectAnswer) {
      retryStatus = "disabled";
      retryMessage =
        "🌟 Level completed correctly! Try the next level or explore other game modes.";
    } else if (isCurrentLevelCompleted && !isCorrectAnswer) {
      retryStatus = "available";
      retryMessage = "";
    }

    return {
      nextLevel: {
        status: nextLevelStatus,
        title: nextLevelTitle,
        subtitle: nextLevelSubtitle,
        exists: !isLastLevel && !!nextLevel,
        data: nextLevel,
      },
      retry: {
        status: retryStatus,
        message: retryMessage,
      },
      currentLevel,
      totalLevels,
      isLastLevel,
      difficultyStats,
    };
  }, [
    levels,
    numericLevelId,
    gameTitle,
    nextLevelTitle,
    isCurrentLevelCompleted,
    isCorrectAnswer,
    isLoading,
  ]);

  // Enhanced handlers with validation
  const handleBackToLevels = useCallback(() => {
    if (isAnimating) {
      console.log("[GameNavigation] Back to levels disabled during animation");
      return;
    }

    console.log("[GameNavigation] Navigating back to levels with replace");

    const gameStore = useGameStore.getState();
    gameStore.setGameStatus("idle");
    gameStore.setScore(0);
    gameStore.setTimerRunning(false);
    gameStore.resetTimer();
    gameStore.handleRestart();

    router.replace({
      pathname: "/(games)/LevelSelection",
      params: { gameMode, gameTitle, difficulty },
    });
  }, [isAnimating]);

  // UPDATED: Show modal instead of direct navigation
  const handleNextLevel = useCallback(() => {
    if (isAnimating || navigationState.nextLevel.status === "disabled") {
      console.log("[GameNavigation] Next level disabled or animating");
      return;
    }

    const nextLevelId = numericLevelId + 1;
    const nextLevel = levels.find((level) => level.id === nextLevelId);

    console.log(`[GameNavigation] Showing modal for level ${nextLevelId}`);

    // ENHANCED: Handle already completed levels
    if (nextLevel?.status === "completed") {
      console.log(
        `[GameNavigation] Next level ${nextLevelId} is already completed - going to level selection instead`
      );

      router.replace({
        pathname: "/(games)/LevelSelection",
        params: {
          gameMode,
          gameTitle,
          difficulty,
          message: `Level ${nextLevelId} already completed!`,
        },
      });
    } else {
      if (nextLevel) {
        const modalLevelData = {
          ...nextLevel.questionData,
          ...nextLevel,
          levelString:
            nextLevel.levelString ||
            nextLevel.questionData?.level ||
            `Level ${nextLevelId}`,
          title: nextLevel.title || nextLevel.questionData?.title,
          levelNumber: nextLevelId,
        };

        console.log(`[GameNavigation] Prepared modal data:`, {
          levelString: modalLevelData.levelString,
          title: modalLevelData.title,
          levelNumber: modalLevelData.levelNumber,
        });

        setNextLevelData(modalLevelData);
        setShowNextLevelModal(true);
      }
    }
  }, [isAnimating, navigationState.nextLevel.status /* ...other deps */]);

  // Handle modal start - this is where actual navigation happens
  const handleModalStart = () => {
    const nextLevelId = numericLevelId + 1;
    console.log(`[GameNavigation] Starting level ${nextLevelId} from modal`);

    // Close modal first
    setShowNextLevelModal(false);
    setNextLevelData(null);

    // Reset game store state
    const gameStore = useGameStore.getState();
    gameStore.setGameStatus("idle");
    gameStore.setScore(0);
    gameStore.setTimerRunning(false);
    gameStore.resetTimer();
    gameStore.handleRestart();

    // FIXED: Add fromGameNavigation parameter to prevent double modal
    router.replace({
      pathname: "/(games)/Questions",
      params: {
        levelId: nextLevelId,
        gameMode,
        gameTitle,
        difficulty,
        fromGameNavigation: "true",
      },
    });
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowNextLevelModal(false);
    setNextLevelData(null);
  };

  // FIXED: Properly access stores without breaking hooks rules
  const handleRetry = useCallback(async () => {
    if (
      isAnimating ||
      navigationState.retry.status === "disabled" ||
      isRetryLoading
    ) {
      console.log("[GameNavigation] Retry disabled or animating");
      return;
    }

    console.log("[GameNavigation] Retrying current level - forcing fresh data");

    try {
      // NEW: Set loading state FIRST
      setIsRetryLoading(true);

      // CRITICAL: Add delay to prevent race conditions
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 1. Clean up game store state FIRST
      const gameStore = useGameStore.getState();
      gameStore.setGameStatus("idle");
      gameStore.setScore(0);
      gameStore.setTimerRunning(false);

      // 2. Clear progress store cache
      const progressStore = useProgressStore.getState();
      progressStore.clearCache();

      // 3. SEQUENTIAL: Wait for cache clear before fetching
      await new Promise((resolve) => setTimeout(resolve, 200));

      // 4. Force refresh progress
      await progressStore.fetchProgress(true);

      // 5. Clear splash store
      const splashStore = useSplashStore.getState();
      splashStore.reset();

      // 6. CRITICAL: Wait for all operations to complete
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 7. Now call restart in a controlled manner
      console.log("[GameNavigation] All caches cleared, calling onRestart");
      onRestart();

      // 8. ENHANCED: Longer loading state to prevent force start interference
      setTimeout(() => {
        setIsRetryLoading(false);
        console.log("[GameNavigation] Retry process completed");
      }, 1800); // INCREASED: From 1200ms to 1800ms to prevent force start
    } catch (error) {
      console.error("[GameNavigation] Error during retry preparation:", error);
      // Always call onRestart as fallback and reset loading
      onRestart();
      setTimeout(() => {
        setIsRetryLoading(false);
      }, 1800); // INCREASED: Match the success timeout
    }
  }, [
    isAnimating,
    navigationState.retry.status,
    navigationState.retry.message,
    onRestart,
    isRetryLoading,
  ]);

  const handleGameModeNavigation = useCallback(
    (newGameMode: string, newGameTitle: string) => {
      if (isAnimating) {
        console.log(
          "[GameNavigation] Game mode navigation disabled during animation"
        );
        return;
      }

      console.log(`[GameNavigation] Switching to ${newGameMode}`);

      const gameStore = useGameStore.getState();
      gameStore.setGameStatus("idle");
      gameStore.setScore(0);
      gameStore.setTimerRunning(false);
      gameStore.resetTimer();
      gameStore.handleRestart();

      router.replace({
        pathname: "/(games)/LevelSelection",
        params: {
          gameMode: newGameMode,
          gameTitle: newGameTitle,
          difficulty,
        },
      });
    },
    [isAnimating, difficulty]
  );

  // FIXED: Filter game modes based on current mode
  const availableGameModes = useMemo(() => {
    const currentMode =
      typeof gameMode === "string" ? gameMode : String(gameMode);
    const allModes = [
      {
        mode: "multipleChoice",
        title: "Multiple Choice",
        subtitle: "Pick the right answer",
        iconName: "format-list-bulleted",
        colors: gameModeNavigationColors.multipleChoice,
      },
      {
        mode: "identification",
        title: "Word Identification",
        subtitle: "Find the correct word",
        iconName: "crosshairs-gps",
        colors: gameModeNavigationColors.identification,
      },
      {
        mode: "fillBlanks",
        title: "Fill in the Blank",
        subtitle: "Complete the sentence",
        iconName: "pencil",
        colors: gameModeNavigationColors.fillBlanks,
      },
    ];

    // Filter out current mode
    return allModes.filter((mode) => mode.mode !== currentMode);
  }, [gameMode]);

  return (
    <>
      <View style={styles.container}>
        {/* Floating Decorative Elements */}
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          duration={4000}
          style={[styles.floatingElement, styles.element1]}
        />
        <Animatable.View
          animation="rotate"
          iterationCount="infinite"
          duration={8000}
          style={[styles.floatingElement, styles.element2]}
        />

        {/* Primary Section */}
        <Animatable.View
          animation="slideInUp"
          duration={800}
          delay={100}
          style={styles.primarySection}
        >
          <GameButton
            variant="primary"
            title={navigationState.nextLevel.title}
            subtitle={navigationState.nextLevel.subtitle}
            iconName={"play"}
            iconSize={26}
            colors={
              navigationState.nextLevel.status === "disabled"
                ? (["#666666", "#444444"] as const)
                : NAVIGATION_COLORS.green
            }
            onPress={handleNextLevel}
            disabled={navigationState.nextLevel.status === "disabled"}
          />
        </Animatable.View>

        {/* Status Message - Only show retry message now */}
        {navigationState.retry.message && (
          <Animatable.View
            animation="fadeIn"
            duration={600}
            delay={200}
            style={styles.statusMessageContainer}
          >
            <Text style={styles.statusMessage}>
              {navigationState.retry.message}
            </Text>
          </Animatable.View>
        )}

        {/* Secondary Actions Grid */}
        <Animatable.View animation="fadeInUp" duration={700} delay={300}>
          <View style={styles.secondaryGrid}>
            <GameButton
              variant="secondary"
              title="Retry"
              iconName="rotate-left"
              colors={
                navigationState.retry.status === "disabled" || isRetryLoading
                  ? (["#666666", "#444444"] as const)
                  : NAVIGATION_COLORS.yellow
              }
              onPress={handleRetry}
              flex={1}
              disabled={
                navigationState.retry.status === "disabled" || isRetryLoading
              }
              isLoading={isRetryLoading}
            />

            <GameButton
              variant="secondary"
              title="Levels"
              iconName="view-grid"
              colors={NAVIGATION_COLORS.blue}
              onPress={handleBackToLevels}
              flex={1}
            />
          </View>
        </Animatable.View>

        {/* FIXED: Game Mode Navigation - Only show other modes */}
        <Animatable.View animation="fadeIn" duration={600} delay={500}>
          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Other Game Modes</Text>
          <Text style={styles.sectionSubtitle}>
            Try different learning styles
          </Text>

          <View style={styles.gameModeGrid}>
            {availableGameModes.map((mode) => (
              <GameButton
                key={mode.mode}
                variant="gameMode"
                title={mode.title}
                subtitle={mode.subtitle}
                iconName={mode.iconName}
                colors={mode.colors}
                onPress={() => handleGameModeNavigation(mode.mode, mode.title)}
              />
            ))}
          </View>
        </Animatable.View>
      </View>

      {/* Next Level Modal */}
      {showNextLevelModal && nextLevelData && (
        <View style={styles.modalOverlay}>
          <LevelInfoModal
            visible={showNextLevelModal}
            onClose={handleModalClose}
            onStart={handleModalStart}
            levelData={nextLevelData}
            gameMode={gameMode}
            isLoading={false}
            difficulty={nextLevelData?.difficultyCategory || difficulty}
          />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },

  // Floating Elements
  floatingElement: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 50,
    zIndex: 1,
  },
  element1: {
    width: 60,
    height: 60,
    top: -10,
    right: -20,
  },
  element2: {
    width: 40,
    height: 40,
    bottom: 20,
    left: -15,
  },

  // Primary Section
  primarySection: {
    marginBottom: 12,
    zIndex: 2,
  },

  // Status Message Styles - Only for retry message now
  statusMessageContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  statusMessage: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    textAlign: "center",
    lineHeight: 20,
  },

  // Secondary Section
  secondaryGrid: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    margin: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    textAlign: "center",
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 16,
  },
  gameModeGrid: {
    gap: 8,
  },

  // Modal overlay
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
});

export default GameNavigation;
