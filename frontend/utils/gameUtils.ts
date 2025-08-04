import { BackHandler, ToastAndroid, Platform } from "react-native";
import { router } from "expo-router";
import { BASE_COLORS } from "@/constant/colors";
import { GameStatus } from "@/types/gameTypes";
import { GAME_GRADIENTS } from "@/constant/gameConstants";
// Type definitions
export type GameMode = "identification" | "multipleChoice" | "fillBlanks";
export type DifficultyLevel = "easy" | "medium" | "hard";

/**
 * Navigate to the next level
 */
export const handleNextLevel = (
  levelId: number,
  gameMode: GameMode,
  gameTitle: string,
  difficulty: string
): void => {
  const nextLevelId = levelId + 1;
  router.push({
    pathname: "/(games)/Questions",
    params: {
      levelId: nextLevelId.toString(),
      gameMode,
      gameTitle,
      difficulty,
      skipModal: "true",
    },
  });
};

/**
 * Navigate back to previous screen
 */
export const handleBackPress = (): void => {
  router.back();
};

/**
 * Handle back press with game status check
 */
export const handleCustomBackPress = (
  gameStatus: GameStatus,
  timerRunning: boolean
): void => {
  if (gameStatus === "completed" || !timerRunning) {
    router.back();
  }
};

/**
 * Format time to display with 2 decimal places
 */
export const formatTimeDecimal = (seconds: number): string => {
  return seconds.toFixed(2);
};

/**
 * Format seconds to a human-readable string with centiseconds precision
 * FIXED: Consistent rounding to prevent display differences
 */
export const formatTime = (seconds: number): string => {
  // Ensure we have a valid number
  if (!seconds || isNaN(seconds)) return "0.00s";

  // CRITICAL: Apply the EXACT SAME rounding as used everywhere else
  const preciseSeconds = Math.round(seconds * 100) / 100;

  // For times under 1 minute, show with centiseconds
  if (preciseSeconds < 60) {
    return `${preciseSeconds.toFixed(2)}s`;
  }

  // For times 1 minute and above
  const minutes = Math.floor(preciseSeconds / 60);
  const remainingSeconds = preciseSeconds % 60;

  // FIXED: Ensure consistent decimal places
  return `${minutes}m ${remainingSeconds.toFixed(2)}s`;
};

/**
 * Format time for timer display (MM:SS.CC format)
 * FIXED: Consistent rounding to prevent display differences
 */
export const formatTimerDisplay = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return "00:00.00";

  // CRITICAL: Apply the EXACT SAME rounding as formatTime
  const preciseSeconds = Math.round(seconds * 100) / 100;
  const minutes = Math.floor(preciseSeconds / 60);
  const remainingSeconds = preciseSeconds % 60;
  const centiseconds = Math.floor((remainingSeconds % 1) * 100);
  const wholeSeconds = Math.floor(remainingSeconds);

  return `${minutes.toString().padStart(2, "0")}:${wholeSeconds
    .toString()
    .padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
};

/**
 * Get gradient colors based on difficulty
 */
export const getDifficultyColors = (
  difficulty?: string,
  levelData?: any
): [string, string] => {
  const difficultyValue =
    difficulty?.toLowerCase() || levelData?.difficulty?.toLowerCase() || "easy";

  switch (difficultyValue) {
    case "medium":
      return ["#FF9800", "#EF6C00"];
    case "hard":
      return [BASE_COLORS.danger, "#C62828"];
    case "easy":
    default:
      return ["#4CAF50", "#2E7D32"];
  }
};

/**
 * Returns consistent gradient colors based on game mode
 * @param gameMode The game mode identifier (multipleChoice, identification, fillBlanks)
 * @param defaultGradient Optional default gradient to use if game mode is not recognized
 * @returns A tuple of two colors representing the gradient
 */
export const getGameModeGradient = (
  gameMode: string | undefined,
  defaultGradient?: [string, string]
): [string, string] => {
  const fallbackGradient: [string, string] = defaultGradient || [
    "#3B4DA3",
    "#251D79",
  ];

  if (!gameMode) return fallbackGradient;

  switch (gameMode) {
    case "multipleChoice":
      return GAME_GRADIENTS.multipleChoice as [string, string];
    case "identification":
      return GAME_GRADIENTS.identification as [string, string];
    case "fillBlanks":
      return GAME_GRADIENTS.fillBlanks as [string, string];
    default:
      return fallbackGradient;
  }
};

/**
 * Restart game by resetting all state variables
 * This is a template function that each component should adapt
 */
export const createRestartFunction = (stateResetters: Function[]) => {
  return () => {
    stateResetters.forEach((resetFn) => resetFn());
  };
};

/**
 * Setup hardware back button handler
 */
export const setupBackButtonHandler = (
  gameStatus: GameStatus,
  timerRunning: boolean
): (() => void) => {
  let backPressCount = 0;
  let backPressTimer: NodeJS.Timeout | null = null;

  const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
    // If game is completed or timer is not running, allow normal back navigation
    if (gameStatus === "completed" || !timerRunning) {
      return false; // Don't prevent default behavior
    }

    // First back press
    if (backPressCount === 0) {
      backPressCount = 1;

      // Show toast on Android
      if (Platform.OS === "android") {
        ToastAndroid.show(
          "Press back again to exit the game",
          ToastAndroid.SHORT
        );
      }

      // Reset counter after 2 seconds
      backPressTimer = setTimeout(() => {
        backPressCount = 0;
      }, 2000);

      return true; // Prevent default back action
    }

    // Second back press within 2 seconds
    if (backPressCount === 1) {
      // Clear timeout
      if (backPressTimer) clearTimeout(backPressTimer);

      // Navigate to Games screen
      router.replace("/(tabs)/Games");
      return true; // Prevent default back action
    }

    return true; // Always prevent default for safety
  });

  // Return a cleanup function
  return () => backHandler.remove();
};
