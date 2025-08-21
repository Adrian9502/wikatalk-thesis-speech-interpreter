import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import {
  Lock,
  Play,
  ChevronRight,
  RotateCcw,
  Grid,
  Zap,
} from "react-native-feather";
import { BASE_COLORS, ICON_COLORS } from "@/constant/colors";
import {
  NAVIGATION_COLORS,
  GAME_MODES,
  GAME_ICONS,
} from "@/constant/gameConstants";
import { useLevelData } from "@/hooks/useLevelData";
import useGameStore from "@/store/games/useGameStore";
import useProgressStore from "@/store/games/useProgressStore";
import { useSplashStore } from "@/store/useSplashStore";
import LevelInfoModal from "@/components/games/levels/LevelInfoModal";

const { width: screenWidth } = Dimensions.get("window");

// Helper function to format difficulty
const formatDifficulty = (difficulty: string): string => {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
};

interface GameNavigationProps {
  levelId: number;
  gameMode: string;
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

  // Animation state
  const [isAnimating, setIsAnimating] = useState(true);

  // Enable interactions after animations complete
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const numericLevelId = Number(levelId);
  const { levels, isLoading } = useLevelData(gameMode);

  // SIMPLIFIED: Calculate navigation state with FIXED difficulty completion logic
  const navigationState = useMemo(() => {
    const currentLevel = levels.find((level) => level.id === numericLevelId);
    const nextLevelId = numericLevelId + 1;
    const nextLevel = levels.find((level) => level.id === nextLevelId);
    const isLastLevel = !nextLevel;
    const totalLevels = levels.length;

    // Get current difficulty normalized
    const currentDifficulty = (
      currentLevel?.difficultyCategory?.toLowerCase() ||
      difficulty.toLowerCase()
    ).trim();
    const nextDifficulty = nextLevel?.difficultyCategory?.toLowerCase()?.trim();

    console.log("[GameNavigation] Navigation state calculation:", {
      currentLevelId: numericLevelId,
      nextLevelId,
      currentDifficulty,
      nextDifficulty,
      isLastLevel,
      nextLevelExists: !!nextLevel,
      nextLevelStatus: nextLevel?.status,
    });

    // FIXED: Calculate difficulty completion stats
    const difficultyStats = {
      easy: { total: 0, completed: 0 },
      medium: { total: 0, completed: 0 },
      hard: { total: 0, completed: 0 },
    };

    // Count total and completed levels per difficulty
    levels.forEach((level) => {
      const diff = level.difficultyCategory?.toLowerCase() || "easy";
      if (difficultyStats[diff as keyof typeof difficultyStats]) {
        difficultyStats[diff as keyof typeof difficultyStats].total++;
        if (level.status === "completed") {
          difficultyStats[diff as keyof typeof difficultyStats].completed++;
        }
      }
    });

    // Check if current difficulty is actually completed (ALL levels)
    const currentDifficultyCompleted =
      difficultyStats[currentDifficulty as keyof typeof difficultyStats]
        ?.total > 0 &&
      difficultyStats[currentDifficulty as keyof typeof difficultyStats]
        ?.completed >=
        difficultyStats[currentDifficulty as keyof typeof difficultyStats]
          ?.total;

    console.log("[GameNavigation] Difficulty completion stats:", {
      difficultyStats,
      currentDifficulty,
      currentDifficultyCompleted,
    });

    let nextLevelStatus = "available";
    let nextLevelTitle = "";
    let nextLevelSubtitle = "";
    let retryStatus = "available";
    let retryMessage = "";

    if (isLastLevel) {
      // SIMPLIFIED: No more levels in this game mode
      nextLevelStatus = "disabled";
      nextLevelTitle = "All Levels Complete! 🎉";
      nextLevelSubtitle = `You've mastered all ${totalLevels} levels in ${gameTitle}`;
    } else if (nextLevel) {
      // Check if next level has different difficulty
      const isDifferentDifficulty = currentDifficulty !== nextDifficulty;

      if (isDifferentDifficulty) {
        // FIXED: Check if current difficulty is ACTUALLY completed
        if (currentDifficultyCompleted) {
          // All levels in current difficulty are completed
          nextLevelStatus = "available";
          nextLevelTitle = `All ${formatDifficulty(
            currentDifficulty
          )} Levels Complete!`;
          nextLevelSubtitle = "Navigate to level selection to continue";
        } else {
          // Not all levels in current difficulty are completed
          nextLevelStatus = "disabled";
          nextLevelTitle = "Locked Level";
          nextLevelSubtitle = `Complete all ${formatDifficulty(
            currentDifficulty
          )} levels to unlock`;
        }
      } else {
        // Same difficulty - continue to next level
        if (nextLevel.status === "locked") {
          nextLevelStatus = "disabled";
          nextLevelTitle = "Locked Level";
          nextLevelSubtitle = `Complete previous levels to unlock`;
        } else {
          nextLevelStatus = "available";
          nextLevelTitle = "Next Level";

          // Create level text
          const levelString =
            nextLevel?.levelString ||
            nextLevel?.questionData?.level ||
            `Level ${nextLevelId}`;
          const title = nextLevel?.title || nextLevel?.questionData?.title;
          nextLevelSubtitle = title ? `${levelString} - ${title}` : levelString;

          if (nextLevel.status === "completed") {
            nextLevelTitle = "Next Level Already Completed!";
            nextLevelSubtitle = "Redirects to level selection";
          }
        }
      }
    } else {
      nextLevelStatus = "disabled";
      nextLevelTitle = "No More Levels";
      nextLevelSubtitle = "Try other game modes";
    }

    // Retry logic remains the same
    if (isCurrentLevelCompleted && isCorrectAnswer) {
      retryStatus = "disabled";
      retryMessage = "Level completed perfectly!";
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
        isDifferentDifficulty: nextLevel
          ? currentDifficulty !== nextDifficulty
          : false,
        currentDifficultyCompleted, // NEW: Add this for the handler
      },
      retry: {
        status: retryStatus,
        message: retryMessage,
      },
      currentLevel,
      totalLevels,
      isLastLevel,
      currentDifficulty,
      difficultyStats, // NEW: Add this for debugging
    };
  }, [
    levels,
    numericLevelId,
    gameTitle,
    difficulty,
    isCurrentLevelCompleted,
    isCorrectAnswer,
    isLoading,
  ]);

  // SIMPLIFIED: Handle next level action
  const handleNextLevel = useCallback(() => {
    if (isAnimating || navigationState.nextLevel.status === "disabled") return;

    const nextLevelId = numericLevelId + 1;
    const nextLevel = levels.find((level) => level.id === nextLevelId);

    // FIXED: Only redirect to level selection if difficulty is actually completed OR level is already completed
    if (
      (navigationState.nextLevel.isDifferentDifficulty &&
        navigationState.nextLevel.currentDifficultyCompleted) ||
      nextLevel?.status === "completed"
    ) {
      console.log(
        "[GameNavigation] Redirecting to level selection - difficulty fully completed or level already completed"
      );

      router.replace({
        pathname: "/(games)/LevelSelection",
        params: {
          gameMode,
          gameTitle,
          difficulty: nextLevel?.difficultyCategory || difficulty,
          message: navigationState.nextLevel.currentDifficultyCompleted
            ? `${formatDifficulty(
                navigationState.currentDifficulty
              )} difficulty completed!`
            : `Level ${nextLevelId} already completed!`,
        },
      });
    } else if (nextLevel && nextLevel.status !== "locked") {
      // Same difficulty or available next level - show modal
      console.log(
        "[GameNavigation] Showing modal for next level in same difficulty"
      );

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
      setNextLevelData(modalLevelData);
      setShowNextLevelModal(true);
    }
    // If next level is locked, do nothing (button should be disabled anyway)
  }, [
    isAnimating,
    navigationState.nextLevel.status,
    navigationState.nextLevel.isDifferentDifficulty,
    navigationState.nextLevel.currentDifficultyCompleted,
    navigationState.currentDifficulty,
    levels,
    numericLevelId,
    gameMode,
    gameTitle,
    difficulty,
  ]);

  // Other handlers remain the same
  const handleBackToLevels = useCallback(() => {
    if (isAnimating) return;
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
  }, [isAnimating, gameMode, gameTitle, difficulty]);

  const handleModalStart = () => {
    const nextLevelId = numericLevelId + 1;
    setShowNextLevelModal(false);
    setNextLevelData(null);

    const gameStore = useGameStore.getState();
    gameStore.setGameStatus("idle");
    gameStore.setScore(0);
    gameStore.setTimerRunning(false);
    gameStore.resetTimer();
    gameStore.handleRestart();

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

  const handleModalClose = () => {
    setShowNextLevelModal(false);
    setNextLevelData(null);
  };

  const handleRetry = useCallback(async () => {
    if (
      isAnimating ||
      navigationState.retry.status === "disabled" ||
      isRetryLoading
    )
      return;

    try {
      setIsRetryLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const gameStore = useGameStore.getState();
      gameStore.setGameStatus("idle");
      gameStore.setScore(0);
      gameStore.setTimerRunning(false);

      const progressStore = useProgressStore.getState();
      progressStore.clearCache();
      await new Promise((resolve) => setTimeout(resolve, 200));
      await progressStore.fetchProgress(true);

      const splashStore = useSplashStore.getState();
      splashStore.reset();

      await new Promise((resolve) => setTimeout(resolve, 500));
      onRestart();

      setTimeout(() => {
        setIsRetryLoading(false);
      }, 1800);
    } catch (error) {
      console.error("[GameNavigation] Error during retry:", error);
      onRestart();
      setTimeout(() => {
        setIsRetryLoading(false);
      }, 1800);
    }
  }, [isAnimating, navigationState.retry.status, onRestart, isRetryLoading]);

  const handleGameModeNavigation = useCallback(
    (newGameMode: string, newGameTitle: string) => {
      if (isAnimating) return;

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

  // Available game modes
  const availableGameModes = useMemo(() => {
    const currentMode =
      typeof gameMode === "string" ? gameMode : String(gameMode);
    const allModes = [
      {
        mode: GAME_MODES.MULTIPLE_CHOICE,
        title: "Multiple Choice",
        subtitle: "Pick the right answer",
        colors: ["#4361EE", "#3A0CA3"],
      },
      {
        mode: GAME_MODES.IDENTIFICATION,
        title: "Word Identification",
        subtitle: "Find the correct word",
        colors: ["#e01f78", "#6a03ad"],
      },
      {
        mode: GAME_MODES.FILL_BLANKS,
        title: "Fill in the Blank",
        subtitle: "Complete the sentence",
        colors: ["#22C216", "#007F3B"],
      },
    ];
    return allModes.filter((mode) => mode.mode !== currentMode);
  }, [gameMode]);

  return (
    <>
      <View style={styles.container}>
        {/* Primary Actions Row - Next Level & Retry */}
        <Animatable.View
          animation="fadeInUp"
          duration={600}
          delay={200}
          style={styles.primaryActionsContainer}
        >
          <View style={styles.primaryActionsRow}>
            <TouchableOpacity
              style={[
                styles.primaryActionCard,
                navigationState.nextLevel.status === "disabled" &&
                  styles.disabledCard,
              ]}
              onPress={handleNextLevel}
              disabled={
                navigationState.nextLevel.status === "disabled" || isAnimating
              }
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  navigationState.nextLevel.status === "disabled"
                    ? NAVIGATION_COLORS.disabled
                    : NAVIGATION_COLORS.green
                }
                style={styles.primaryActionGradient}
              >
                <View style={styles.primaryActionIcon}>
                  {navigationState.nextLevel.status === "disabled" ? (
                    <Lock
                      width={20}
                      height={20}
                      color="rgba(255, 255, 255, 0.5)"
                    />
                  ) : (
                    <Play width={20} height={20} color={BASE_COLORS.white} />
                  )}
                </View>
                <View style={styles.primaryActionContent}>
                  <Text
                    style={[
                      styles.primaryActionTitle,
                      navigationState.nextLevel.status === "disabled" &&
                        styles.disabledText,
                    ]}
                  >
                    {navigationState.nextLevel.title}
                  </Text>
                  <Text
                    style={[
                      styles.primaryActionSubtitle,
                      navigationState.nextLevel.status === "disabled" &&
                        styles.disabledText,
                    ]}
                  >
                    {navigationState.nextLevel.subtitle}
                  </Text>
                </View>
                {navigationState.nextLevel.status !== "disabled" && (
                  <ChevronRight
                    width={16}
                    height={16}
                    color={BASE_COLORS.white}
                  />
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.primaryActionCard,
                (navigationState.retry.status === "disabled" ||
                  isRetryLoading) &&
                  styles.disabledCard,
              ]}
              onPress={handleRetry}
              disabled={
                navigationState.retry.status === "disabled" ||
                isRetryLoading ||
                isAnimating
              }
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  navigationState.retry.status === "disabled" || isRetryLoading
                    ? NAVIGATION_COLORS.disabled
                    : NAVIGATION_COLORS.yellow
                }
                style={styles.primaryActionGradient}
              >
                <View style={styles.primaryActionIcon}>
                  <RotateCcw
                    width={18}
                    height={18}
                    color={
                      navigationState.retry.status === "disabled" ||
                      isRetryLoading
                        ? "rgba(255, 255, 255, 0.5)"
                        : BASE_COLORS.white
                    }
                  />
                </View>
                <View style={styles.primaryActionContent}>
                  <Text
                    style={[
                      styles.primaryActionTitle,
                      (navigationState.retry.status === "disabled" ||
                        isRetryLoading) &&
                        styles.disabledText,
                    ]}
                  >
                    {navigationState.retry.status === "disabled"
                      ? "Perfect!"
                      : "Try Again"}
                  </Text>
                  <Text
                    style={[
                      styles.primaryActionSubtitle,
                      (navigationState.retry.status === "disabled" ||
                        isRetryLoading) &&
                        styles.disabledText,
                    ]}
                  >
                    {navigationState.retry.status === "disabled"
                      ? "Level completed!"
                      : "Timer will continue from where you left off."}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animatable.View>

        {/* Quick Navigation Row */}
        <Animatable.View
          animation="fadeInUp"
          duration={600}
          delay={300}
          style={styles.quickNavContainer}
        >
          <View style={styles.quickNavRow}>
            <TouchableOpacity
              style={styles.quickNavCard}
              onPress={handleBackToLevels}
              disabled={isAnimating}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={NAVIGATION_COLORS.purple}
                style={styles.quickNavGradient}
              >
                <Grid width={18} height={18} color={BASE_COLORS.white} />
                <Text style={styles.quickNavText}>Level Selection</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickNavCard}
              onPress={() => router.replace("/(tabs)/Games")}
              disabled={isAnimating}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={NAVIGATION_COLORS.indigo}
                style={styles.quickNavGradient}
              >
                <Ionicons
                  name="game-controller-outline"
                  size={18}
                  color={BASE_COLORS.white}
                />
                <Text style={styles.quickNavText}>Back to Home</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animatable.View>

        {/* Game Modes Section */}
        <Animatable.View
          animation="fadeInUp"
          duration={600}
          delay={400}
          style={styles.gameModesContainer}
        >
          <View style={styles.gameModesHeader}>
            <Zap width={16} height={16} color={ICON_COLORS.brightYellow} />
            <Text style={styles.gameModesTitle}>Try Other Modes</Text>
          </View>

          <View style={styles.gameModesGrid}>
            {availableGameModes.map((mode, index) => {
              // Get the icon component from GAME_ICONS
              const IconComponent = GAME_ICONS[mode.mode];

              return (
                <TouchableOpacity
                  key={mode.mode}
                  style={styles.gameModeCard}
                  onPress={() =>
                    handleGameModeNavigation(mode.mode, mode.title)
                  }
                  disabled={isAnimating}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[mode.colors[0], mode.colors[1]]}
                    style={styles.gameModeGradient}
                  >
                    <View
                      style={[
                        styles.gameModeIcon,
                        { backgroundColor: mode.colors[0] },
                      ]}
                    >
                      {/* Use the icon component from GAME_ICONS */}
                      <IconComponent width={20} height={20} />
                    </View>
                    <Text style={styles.gameModeTitle}>{mode.title}</Text>
                    <Text style={styles.gameModeSubtitle}>{mode.subtitle}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animatable.View>
      </View>

      {/* Next Level Modal - Only for same difficulty */}
      {showNextLevelModal &&
        nextLevelData &&
        !navigationState.nextLevel.isDifferentDifficulty && (
          <LevelInfoModal
            visible={showNextLevelModal}
            onClose={handleModalClose}
            onStart={handleModalStart}
            levelData={nextLevelData}
            gameMode={gameMode}
            difficulty={difficulty}
          />
        )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Primary Actions
  primaryActionsContainer: {
    marginBottom: 16,
  },
  primaryActionsRow: {
    gap: 12,
  },
  primaryActionCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 8,
  },
  disabledCard: {
    shadowOpacity: 0.1,
    elevation: 4,
  },
  primaryActionGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  primaryActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  primaryActionContent: {
    flex: 1,
  },
  primaryActionTitle: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  primaryActionSubtitle: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.85)",
  },
  disabledText: {
    color: "rgba(255, 255, 255, 0.5)",
  },

  // Quick Navigation
  quickNavContainer: {
    marginBottom: 20,
  },
  quickNavRow: {
    flexDirection: "row",
    gap: 12,
  },
  quickNavCard: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
  },
  quickNavGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  quickNavText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
  },

  // Game Modes
  gameModesContainer: {
    marginBottom: 20,
  },
  gameModesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    gap: 6,
  },
  gameModesTitle: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  gameModesGrid: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  gameModeCard: {
    flex: 1,
    overflow: "hidden",
  },
  gameModeGradient: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    borderRadius: 20,
    position: "relative",
    minHeight: 60,
  },
  gameModeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  gameModeTitle: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    textAlign: "center",
    lineHeight: 14,
  },
  gameModeSubtitle: {
    fontSize: 10,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.60)",
    textAlign: "center",
  },
});

export default GameNavigation;
