import {
  BASE_COLORS,
  GAME_MODE_GRADIENTS,
  ICON_COLORS,
} from "@/constant/colors";
import { GameOption } from "@/types/gameTypes";
import { Edit3, Target, Search } from "react-native-feather";
import React from "react";

// Type definitions
export type GameMode = "identification" | "multipleChoice" | "fillBlanks";
export type DifficultyLevel = "easy" | "medium" | "hard";

// Play button colors based on game mode
export const getPlayButtonColor = (gameId: string) => {
  switch (gameId) {
    case "multipleChoice":
      return "#f1a849e5";
    case "identification":
      return "#58bdf0e0";
    case "fillBlanks":
      return "#f57171de";
    default:
      return BASE_COLORS.success;
  }
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
      return GAME_MODE_GRADIENTS.multipleChoice as [string, string];
    case "identification":
      return GAME_MODE_GRADIENTS.identification as [string, string];
    case "fillBlanks":
      return GAME_MODE_GRADIENTS.fillBlanks as [string, string];
    default:
      return fallbackGradient;
  }
};

// game options used in Gamecards

const gameOptions: GameOption[] = [
  {
    id: "multipleChoice",
    title: "Multiple Choice",
    icon: <Target width={28} height={28} color={ICON_COLORS.white} />,
    color: BASE_COLORS.blue,
    description: "Choose the correct answer from given options",
    difficulty: "Beginner",
  },
  {
    id: "identification",
    title: "Word Identification",
    icon: <Search width={28} height={28} color={ICON_COLORS.white} />,
    color: BASE_COLORS.orange,
    description: "Identify the correct words in context",
    difficulty: "Intermediate",
  },
  {
    id: "fillBlanks",
    title: "Fill in the Blanks",
    icon: <Edit3 width={28} height={28} color={ICON_COLORS.white} />,
    color: BASE_COLORS.success,
    description: "Complete sentences with the right words",
    difficulty: "Advanced",
  },
];

export default gameOptions;
