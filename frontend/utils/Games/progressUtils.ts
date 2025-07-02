import useGameStore from "@/store/games/useGameStore";
import { GameModeProgress } from "@/types/gameTypes";

interface OverallProgress {
  totalLevels: number;
  completedLevels: number;
  completionPercentage: number;
}

/**
 * Calculate the combined progress across all game modes
 * @param gameProgress The game progress object from useGameDashboard
 * @returns Combined statistics about overall progress
 */
export const calculateOverallProgress = (gameProgress: Record<string, GameModeProgress>): OverallProgress => {
  // Calculate total levels
  const totalLevels = Object.values(gameProgress).reduce(
    (sum, mode) => sum + mode.total,
    0
  );
  
  // Calculate completed levels
  const completedLevels = Object.values(gameProgress).reduce(
    (sum, mode) => sum + mode.completed,
    0
  );
  
  // Calculate completion percentage
  const completionPercentage = totalLevels
    ? Math.round((completedLevels / totalLevels) * 100)
    : 0;

  return {
    totalLevels,
    completedLevels,
    completionPercentage,
  };
};