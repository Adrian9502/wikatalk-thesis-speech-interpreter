import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import * as Animatable from "react-native-animatable";
import { BASE_COLORS, gameModeNavigationColors } from "@/constant/colors";
import { GameMode } from "@/types/gameTypes";
import useGameStore from "@/store/games/useGameStore";
import { NAVIGATION_COLORS } from "@/constant/gameConstants";
import GameButton from "@/components/games/GameButton";
import { useLevelData } from "@/hooks/useLevelData";
import LevelInfoModal from "@/components/games/levels/LevelInfoModal"; // NEW: Import modal

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
  // NEW: Modal state
  const [showNextLevelModal, setShowNextLevelModal] = useState(false);
  const [nextLevelData, setNextLevelData] = useState<any>(null);

  // Ensure levelId is parsed as a number
  const numericLevelId = Number(levelId);

  // Get level data to check next level availability and lock status
  const { levels, isLoading } = useLevelData(gameMode);
  const { getLevelData } = useGameStore();

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

    // Determine next level status and reasons
    let nextLevelStatus = "available";
    let nextLevelTitle = "";
    let nextLevelSubtitle = "";
    let retryStatus = "available";
    let retryMessage = "";

    // FIXED: Enhanced next level availability check
    if (isLastLevel) {
      // Only show "All Levels Complete" if there truly are no more levels
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
          // FIXED: Within same difficulty - allow progression regardless of correctness
          // This handles the case where user answers incorrectly but should still progress
          nextLevelTitle = "Next Level";
          nextLevelSubtitle = nextLevel.title || `Level ${nextLevelId}`;

          // Special case: If next level is already completed, show different text
          if (nextLevel.status === "completed") {
            nextLevelTitle = "Next Level (Completed)";
            nextLevelSubtitle = "You'll be redirected to level selection";
          }
        } else if (isDifficultyIncrease) {
          // FIXED: Difficulty increase - check if current level was completed correctly
          if (!isCurrentLevelCompleted || !isCorrectAnswer) {
            nextLevelStatus = "disabled";
            nextLevelTitle = "Complete Current Level";
            nextLevelSubtitle = "✅ Answer correctly to unlock next difficulty";
          } else {
            nextLevelTitle = "Next Level";
            nextLevelSubtitle = `${
              nextLevel.title || `Level ${nextLevelId}`
            } (${
              nextDifficulty.charAt(0).toUpperCase() + nextDifficulty.slice(1)
            })`;
          }
        } else {
          // This shouldn't happen in normal flow, but handle it
          nextLevelTitle = "Next Level";
          nextLevelSubtitle = nextLevel.title || `Level ${nextLevelId}`;
        }
      }
    } else {
      // This shouldn't happen if isLastLevel logic is correct, but as a fallback
      nextLevelStatus = "disabled";
      nextLevelTitle = "No More Levels";
      nextLevelSubtitle = "🎯 Try other difficulty modes";
    }

    // ENHANCED: Check Retry availability with better logic
    if (isCurrentLevelCompleted && isCorrectAnswer) {
      // Only disable retry if user got it right
      retryStatus = "disabled";
      retryMessage =
        "🌟 Level completed correctly! Try the next level or explore other game modes.";
    } else if (isCurrentLevelCompleted && !isCorrectAnswer) {
      // Allow retry if user completed but got it wrong
      retryStatus = "available";
      retryMessage = "";
    }

    // FIXED: Enhanced debug logging
    console.log(`[GameNavigation] Navigation state calculated:`, {
      currentLevelId: numericLevelId,
      currentDifficulty,
      nextLevelId,
      nextDifficulty,
      nextLevelExists: !!nextLevel,
      nextLevelStatus: nextLevel?.status,
      isLastLevel,
      totalLevels,
      difficultyStats,
      isEasyComplete,
      isMediumComplete,
      isCurrentLevelCompleted,
      isCorrectAnswer,
      finalStatus: nextLevelStatus,
      finalTitle: nextLevelTitle,
      finalSubtitle: nextLevelSubtitle,
      isSameDifficulty: currentDifficulty === nextDifficulty,
      isDifficultyIncrease:
        (currentDifficulty === "easy" && nextDifficulty === "medium") ||
        (currentDifficulty === "medium" && nextDifficulty === "hard"),
    });

    return {
      nextLevel: {
        status: nextLevelStatus,
        title: nextLevelTitle,
        subtitle: nextLevelSubtitle,
        exists: !isLastLevel && !!nextLevel,
        data: nextLevel, // NEW: Include the actual level data
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
  const handleBackToLevels = () => {
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
  };

  const handleBackToHome = () => {
    console.log("[GameNavigation] Navigating to home with replace");

    const gameStore = useGameStore.getState();
    gameStore.setGameStatus("idle");
    gameStore.setScore(0);
    gameStore.setTimerRunning(false);
    gameStore.resetTimer();
    gameStore.handleRestart();

    router.replace("/(tabs)/Games");
  };

  // UPDATED: Show modal instead of direct navigation
  const handleNextLevel = () => {
    if (navigationState.nextLevel.status === "disabled") {
      console.log(
        "[GameNavigation] Next level is disabled:",
        navigationState.nextLevel.subtitle
      );
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
      // NEW: Show modal instead of direct navigation
      if (nextLevel) {
        setNextLevelData({
          ...nextLevel.questionData,
          ...nextLevel,
          levelString: nextLevel.levelString,
        });
        setShowNextLevelModal(true);
      }
    }
  };

  // NEW: Handle modal start - this is where actual navigation happens
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

  // NEW: Handle modal close
  const handleModalClose = () => {
    setShowNextLevelModal(false);
    setNextLevelData(null);
  };

  const handleRetry = () => {
    if (navigationState.retry.status === "disabled") {
      console.log(
        "[GameNavigation] Retry is disabled:",
        navigationState.retry.message
      );
      return;
    }

    console.log("[GameNavigation] Retrying current level");
    onRestart();
  };

  const handleGameModeNavigation = (
    newGameMode: string,
    newGameTitle: string
  ) => {
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
  };

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

        {/* Primary Action Section */}
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
                navigationState.retry.status === "disabled"
                  ? (["#666666", "#444444"] as const)
                  : NAVIGATION_COLORS.yellow
              }
              onPress={handleRetry}
              flex={1}
              disabled={navigationState.retry.status === "disabled"}
            />

            <GameButton
              variant="secondary"
              title="Levels"
              iconName="view-grid"
              colors={NAVIGATION_COLORS.blue}
              onPress={handleBackToLevels}
              flex={1}
            />

            <GameButton
              variant="secondary"
              title="Home"
              iconName="home"
              colors={NAVIGATION_COLORS.purple}
              onPress={handleBackToHome}
              flex={1}
            />
          </View>
        </Animatable.View>

        {/* Game Mode Navigation Section */}
        <Animatable.View animation="fadeIn" duration={600} delay={500}>
          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Try Other Game Modes</Text>
          <Text style={styles.sectionSubtitle}>
            Challenge yourself with different learning styles
          </Text>

          <View style={styles.gameModeGrid}>
            {gameMode !== "multipleChoice" && (
              <GameButton
                variant="gameMode"
                title="Multiple Choice"
                subtitle="Select the correct answer"
                iconName="flash"
                colors={gameModeNavigationColors.multipleChoice}
                onPress={() =>
                  handleGameModeNavigation("multipleChoice", "Multiple Choice")
                }
                animation="slideInLeft"
                delay={600}
              />
            )}

            {gameMode !== "identification" && (
              <GameButton
                variant="gameMode"
                title="Word Identification"
                subtitle="Find the correct word"
                iconName="eye"
                colors={gameModeNavigationColors.identification}
                onPress={() =>
                  handleGameModeNavigation(
                    "identification",
                    "Word Identification"
                  )
                }
                animation="slideInUp"
                delay={700}
              />
            )}

            {gameMode !== "fillBlanks" && (
              <GameButton
                variant="gameMode"
                title="Fill in the Blanks"
                subtitle="Complete the sentence"
                iconName="pencil"
                colors={gameModeNavigationColors.fillBlanks}
                onPress={() =>
                  handleGameModeNavigation("fillBlanks", "Fill in the Blanks")
                }
                animation="slideInRight"
                delay={800}
              />
            )}
          </View>
        </Animatable.View>
      </View>

      {/* NEW: Next Level Modal */}
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

  // NEW: Modal overlay
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
