import { BackHandler, ToastAndroid, Platform } from "react-native";
import { router } from "expo-router";
import { BASE_COLORS } from "@/constant/colors";

// Type definitions
export type GameMode = "identification" | "multipleChoice" | "fillBlanks";
export type GameStatus = "playing" | "completed";
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
 * Format seconds to mm:ss format
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
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
