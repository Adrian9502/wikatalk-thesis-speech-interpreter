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
import { BASE_COLORS, gameModeNavigationColors } from "@/constant/colors";
import { GameMode } from "@/types/gameTypes";
import useGameStore from "@/store/games/useGameStore";
import {
  NAVIGATION_COLORS,
  GAME_ICONS,
  GAME_MODES,
} from "@/constant/gameConstants";
import { iconColors } from "@/constant/colors";
import { useLevelData } from "@/hooks/useLevelData";
import LevelInfoModal from "@/components/games/levels/LevelInfoModal";
import useProgressStore from "@/store/games/useProgressStore";
import { useSplashStore } from "@/store/useSplashStore";
import {
  Home,
  RotateCcw,
  ChevronRight,
  Lock,
  CheckCircle,
  Star,
  Grid,
  Play,
  Zap,
} from "react-native-feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const { width: screenWidth } = Dimensions.get("window");

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

  // Calculate navigation state (keeping existing logic)
  const navigationState = useMemo(() => {
    const currentLevel = levels.find((level) => level.id === numericLevelId);
    const nextLevelId = numericLevelId + 1;
    const nextLevel = levels.find((level) => level.id === nextLevelId);
    const isLastLevel = !nextLevel;
    const totalLevels = levels.length;

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

    const currentDifficulty =
      currentLevel?.difficultyCategory?.toLowerCase() || "easy";
    const nextDifficulty =
      nextLevel?.difficultyCategory?.toLowerCase() || "easy";

    const createNextLevelText = (level: any) => {
      const levelString =
        level?.levelString ||
        level?.questionData?.level ||
        `Level ${nextLevelId}`;
      const title = level?.title || level?.questionData?.title;
      return title ? `${levelString} - ${title}` : levelString;
    };

    let nextLevelStatus = "available";
    let nextLevelTitle = "";
    let nextLevelSubtitle = "";
    let retryStatus = "available";
    let retryMessage = "";

    if (isLastLevel) {
      nextLevelStatus = "disabled";
      nextLevelTitle = "All Complete! 🎉";
      nextLevelSubtitle = `You've mastered all ${totalLevels} levels`;
    } else if (nextLevel) {
      if (nextLevel.status === "locked") {
        nextLevelStatus = "disabled";
        if (nextDifficulty === "medium" && !isEasyComplete) {
          nextLevelTitle = "Locked Level";
          nextLevelSubtitle = "Complete all Easy levels first";
        } else if (nextDifficulty === "hard" && !isMediumComplete) {
          nextLevelTitle = "Locked Level";
          nextLevelSubtitle = "Complete all Medium levels first";
        } else {
          nextLevelTitle = "Locked Level";
          nextLevelSubtitle = "This level is currently locked";
        }
      } else {
        const isSameDifficulty = currentDifficulty === nextDifficulty;
        const isDifficultyIncrease =
          (currentDifficulty === "easy" && nextDifficulty === "medium") ||
          (currentDifficulty === "medium" && nextDifficulty === "hard");

        if (isSameDifficulty) {
          nextLevelTitle = "Next Level";
          nextLevelSubtitle = createNextLevelText(nextLevel);
          if (nextLevel.status === "completed") {
            nextLevelTitle = "Completed Level";
            nextLevelSubtitle = "Redirects to level selection";
          }
        } else if (isDifficultyIncrease) {
          if (!isCurrentLevelCompleted || !isCorrectAnswer) {
            nextLevelStatus = "disabled";
            nextLevelTitle = "Complete Current";
            nextLevelSubtitle = "Answer correctly to unlock";
          } else {
            nextLevelTitle = "Next Difficulty";
            const levelText = createNextLevelText(nextLevel);
            const difficultyText =
              nextDifficulty.charAt(0).toUpperCase() + nextDifficulty.slice(1);
            nextLevelSubtitle = `${levelText} (${difficultyText})`;
          }
        } else {
          nextLevelTitle = "Next Challenge";
          nextLevelSubtitle = createNextLevelText(nextLevel);
        }
      }
    } else {
      nextLevelStatus = "disabled";
      nextLevelTitle = "No More Levels";
      nextLevelSubtitle = "Try other difficulty modes";
    }

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

  // Handlers (keeping existing logic)
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

  const handleNextLevel = useCallback(() => {
    if (isAnimating || navigationState.nextLevel.status === "disabled") return;

    const nextLevelId = numericLevelId + 1;
    const nextLevel = levels.find((level) => level.id === nextLevelId);

    if (nextLevel?.status === "completed") {
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
        setNextLevelData(modalLevelData);
        setShowNextLevelModal(true);
      }
    }
  }, [
    isAnimating,
    navigationState.nextLevel.status,
    levels,
    numericLevelId,
    gameMode,
    gameTitle,
    difficulty,
  ]);

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
        colors: gameModeNavigationColors.multipleChoice,
      },
      {
        mode: GAME_MODES.IDENTIFICATION,
        title: "Word Identification",
        subtitle: "Find the correct word",
        colors: gameModeNavigationColors.identification,
      },
      {
        mode: GAME_MODES.FILL_BLANKS,
        title: "Fill in the Blank",
        subtitle: "Complete the sentence",
        colors: gameModeNavigationColors.fillBlanks,
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
            <Zap width={16} height={16} color={iconColors.brightYellow} />
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

      {/* Next Level Modal */}
      {showNextLevelModal && nextLevelData && (
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
    fontSize: 15,
    fontFamily: "Poppins-Bold",
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
