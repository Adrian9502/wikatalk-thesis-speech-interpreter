import useProgressStore from "@/store/games/useProgressStore";
import {
  GameModeProgress,
  EnhancedGameModeProgress,
} from "@/types/gameProgressTypes";

export interface OverallProgressStats {
  totalCompletedCount: number;
  totalQuizCount: number;
  overallProgressPercentage: number;
  completionStatus: "not_started" | "in_progress" | "completed";
  completionStatusText: string;
}

export interface GameModeStats {
  gameMode: string;
  completed: number;
  total: number;
  completionPercentage: number;
  remainingCount: number;
  isComplete: boolean;
  progressStatus: "not_started" | "in_progress" | "completed";
}

// NEW: Enhanced summary stats interface
export interface GameModeSummaryStats extends GameModeStats {
  totalAttempts: number;
  correctAttempts: number;
  successRate: number;
  totalTimeSpent: number;
  averageScore: number;
  formattedTotalTime: string;
}

export interface DetailedGameModeStats extends GameModeStats {
  enhancedData: EnhancedGameModeProgress | null;
  totalAttempts: number;
  correctAttempts: number;
  averageScore: number;
  totalTimeSpent: number;
  completedLevels: number;
  totalLevels: number;
  difficultyBreakdown: {
    easy: { completed: number; total: number; percentage: number };
    medium: { completed: number; total: number; percentage: number };
    hard: { completed: number; total: number; percentage: number };
  } | null;
}

export interface AllGameModesStats {
  overall: OverallProgressStats;
  gameModes: {
    multipleChoice: GameModeStats;
    identification: GameModeStats;
    fillBlanks: GameModeStats;
  };
  summary: {
    bestPerformingMode: string;
    worstPerformingMode: string;
    totalGameModes: number;
    completedGameModes: number;
  };
}

/**
 * Get overall progress statistics across all game modes
 */
export const getOverallProgressStats = (): OverallProgressStats => {
  const { totalCompletedCount, totalQuizCount } = useProgressStore.getState();

  const overallProgressPercentage =
    totalQuizCount > 0
      ? Math.round((totalCompletedCount / totalQuizCount) * 100)
      : 0;

  const getCompletionStatus = ():
    | "not_started"
    | "in_progress"
    | "completed" => {
    if (totalCompletedCount === 0) return "not_started";
    if (totalCompletedCount === totalQuizCount) return "completed";
    return "in_progress";
  };

  const getCompletionStatusText = (status: string): string => {
    switch (status) {
      case "not_started":
        return "Ready to start your learning journey!";
      case "in_progress":
        return `Great progress! ${
          totalQuizCount - totalCompletedCount
        } more to go`;
      case "completed":
        return "Amazing! You've completed all levels!";
      default:
        return "Keep learning!";
    }
  };

  const completionStatus = getCompletionStatus();

  return {
    totalCompletedCount,
    totalQuizCount,
    overallProgressPercentage,
    completionStatus,
    completionStatusText: getCompletionStatusText(completionStatus),
  };
};

/**
 * Get progress statistics for a specific game mode
 */
export const getGameModeStats = (gameMode: string): GameModeStats => {
  const { getGameModeProgress } = useProgressStore.getState();
  const progress = getGameModeProgress(gameMode);

  const completionPercentage =
    progress.total > 0
      ? Math.round((progress.completed / progress.total) * 100)
      : 0;

  const remainingCount = progress.total - progress.completed;
  const isComplete =
    progress.completed === progress.total && progress.total > 0;

  const getProgressStatus = (): "not_started" | "in_progress" | "completed" => {
    if (progress.completed === 0) return "not_started";
    if (isComplete) return "completed";
    return "in_progress";
  };

  return {
    gameMode,
    completed: progress.completed,
    total: progress.total,
    completionPercentage,
    remainingCount,
    isComplete,
    progressStatus: getProgressStatus(),
  };
};

/**
 * NEW: Get summary statistics for a specific game mode (includes enhanced data for summary display)
 */
export const getGameModeSummaryStats = (
  gameMode: string,
  enhancedData: EnhancedGameModeProgress | null = null
): GameModeSummaryStats => {
  const basicStats = getGameModeStats(gameMode);

  // Extract enhanced stats if available
  const totalAttempts = enhancedData?.totalAttempts || 0;
  const correctAttempts = enhancedData?.correctAttempts || 0;
  const totalTimeSpent = enhancedData?.totalTimeSpent || 0;
  const averageScore = enhancedData?.overallAverageScore || 0;

  // Calculate success rate
  const successRate =
    totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

  // Format total time (helper function)
  const formatTotalTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  };

  return {
    ...basicStats,
    totalAttempts,
    correctAttempts,
    successRate,
    totalTimeSpent,
    averageScore,
    formattedTotalTime: formatTotalTime(totalTimeSpent),
  };
};

/**
 * Get detailed statistics for a specific game mode (includes enhanced data)
 */
export const getDetailedGameModeStats = async (
  gameMode: string
): Promise<DetailedGameModeStats> => {
  const basicStats = getGameModeStats(gameMode);
  const { getEnhancedGameProgress } = useProgressStore.getState();

  let enhancedData: EnhancedGameModeProgress | null = null;
  let difficultyBreakdown = null;

  try {
    enhancedData = await getEnhancedGameProgress(gameMode);

    if (enhancedData && enhancedData.difficultyBreakdown) {
      difficultyBreakdown = {
        easy: {
          completed:
            enhancedData.difficultyBreakdown.find(
              (d) => d.difficulty === "easy"
            )?.completedLevels || 0,
          total:
            enhancedData.difficultyBreakdown.find(
              (d) => d.difficulty === "easy"
            )?.totalLevels || 0,
          percentage:
            enhancedData.difficultyBreakdown.find(
              (d) => d.difficulty === "easy"
            )?.completionRate || 0,
        },
        medium: {
          completed:
            enhancedData.difficultyBreakdown.find(
              (d) => d.difficulty === "medium"
            )?.completedLevels || 0,
          total:
            enhancedData.difficultyBreakdown.find(
              (d) => d.difficulty === "medium"
            )?.totalLevels || 0,
          percentage:
            enhancedData.difficultyBreakdown.find(
              (d) => d.difficulty === "medium"
            )?.completionRate || 0,
        },
        hard: {
          completed:
            enhancedData.difficultyBreakdown.find(
              (d) => d.difficulty === "hard"
            )?.completedLevels || 0,
          total:
            enhancedData.difficultyBreakdown.find(
              (d) => d.difficulty === "hard"
            )?.totalLevels || 0,
          percentage:
            enhancedData.difficultyBreakdown.find(
              (d) => d.difficulty === "hard"
            )?.completionRate || 0,
        },
      };
    }
  } catch (error) {
    console.warn(
      `[gameStatsUtils] Failed to get enhanced data for ${gameMode}:`,
      error
    );
  }

  return {
    ...basicStats,
    enhancedData,
    totalAttempts: enhancedData?.totalAttempts || 0,
    correctAttempts: enhancedData?.correctAttempts || 0,
    averageScore: enhancedData?.overallAverageScore || 0,
    totalTimeSpent: enhancedData?.totalTimeSpent || 0,
    completedLevels: enhancedData?.completedLevels || basicStats.completed,
    totalLevels: enhancedData?.totalLevels || basicStats.total,
    difficultyBreakdown,
  };
};

/**
 * Get comprehensive statistics for all game modes
 */
export const getAllGameModesStats = (): AllGameModesStats => {
  const overall = getOverallProgressStats();

  const multipleChoice = getGameModeStats("multipleChoice");
  const identification = getGameModeStats("identification");
  const fillBlanks = getGameModeStats("fillBlanks");

  const gameModes = { multipleChoice, identification, fillBlanks };

  // Find best and worst performing modes
  const modeStats = Object.entries(gameModes);
  const sortedByCompletion = modeStats.sort(
    (a, b) => b[1].completionPercentage - a[1].completionPercentage
  );

  const bestPerformingMode = sortedByCompletion[0][0];
  const worstPerformingMode =
    sortedByCompletion[sortedByCompletion.length - 1][0];

  const completedGameModes = modeStats.filter(
    ([, stats]) => stats.isComplete
  ).length;

  return {
    overall,
    gameModes,
    summary: {
      bestPerformingMode,
      worstPerformingMode,
      totalGameModes: 3,
      completedGameModes,
    },
  };
};

/**
 * Get formatted statistics for display in UI components
 */
export const getFormattedStats = (gameMode?: string) => {
  if (gameMode) {
    const stats = getGameModeStats(gameMode);
    return {
      completed: stats.completed.toString(),
      total: stats.total.toString(),
      percentage: `${stats.completionPercentage}%`,
      remaining: stats.remainingCount.toString(),
      status: stats.progressStatus,
      progressText: `${stats.completed}/${stats.total} completed`,
    };
  }

  const overallStats = getOverallProgressStats();
  return {
    completed: overallStats.totalCompletedCount.toString(),
    total: overallStats.totalQuizCount.toString(),
    percentage: `${overallStats.overallProgressPercentage}%`,
    remaining: (
      overallStats.totalQuizCount - overallStats.totalCompletedCount
    ).toString(),
    status: overallStats.completionStatus,
    progressText: `${overallStats.totalCompletedCount}/${overallStats.totalQuizCount} completed`,
    statusText: overallStats.completionStatusText,
  };
};

/**
 * React hook for reactive stats that update when progress changes
 */
export const useGameStats = (gameMode?: string) => {
  const { lastUpdated } = useProgressStore();

  if (gameMode) {
    return React.useMemo(() => {
      return getGameModeStats(gameMode);
    }, [gameMode, lastUpdated]);
  }

  return React.useMemo(() => {
    return getOverallProgressStats();
  }, [lastUpdated]);
};

/**
 * React hook for formatted stats (ready for UI display)
 */
export const useFormattedStats = (gameMode?: string) => {
  const { lastUpdated } = useProgressStore();

  return React.useMemo(() => {
    return getFormattedStats(gameMode);
  }, [gameMode, lastUpdated]);
};

/**
 * NEW: React hook for summary stats (includes enhanced data)
 */
export const useGameModeSummaryStats = (
  gameMode: string,
  enhancedData: EnhancedGameModeProgress | null = null
) => {
  const { lastUpdated } = useProgressStore();

  return React.useMemo(() => {
    return getGameModeSummaryStats(gameMode, enhancedData);
  }, [gameMode, enhancedData, lastUpdated]);
};

/**
 * React hook specifically for completion percentage
 * This is what we'll use in LevelSelection and other components
 */
export const useCompletionPercentage = (gameMode: string) => {
  const { lastUpdated } = useProgressStore();

  return React.useMemo(() => {
    const stats = getGameModeStats(gameMode);
    return stats.completionPercentage;
  }, [gameMode, lastUpdated]);
};

/**
 * Get completion percentage directly (non-hook version)
 */
export const getCompletionPercentage = (gameMode: string): number => {
  const stats = getGameModeStats(gameMode);
  return stats.completionPercentage;
};

/**
 * Utility to check if user has made significant progress
 */
export const hasSignificantProgress = (gameMode?: string): boolean => {
  if (gameMode) {
    const stats = getGameModeStats(gameMode);
    return stats.completionPercentage >= 10; // At least 10% completed
  }

  const overallStats = getOverallProgressStats();
  return overallStats.overallProgressPercentage >= 5; // At least 5% overall
};

/**
 * Get motivation message based on progress
 */
export const getMotivationMessage = (gameMode?: string): string => {
  const stats = gameMode
    ? getGameModeStats(gameMode)
    : getOverallProgressStats();
  const percentage = gameMode
    ? (stats as GameModeStats).completionPercentage
    : (stats as OverallProgressStats).overallProgressPercentage;

  if (percentage === 0) {
    return "Ready to start your learning journey? Let's go!";
  } else if (percentage < 25) {
    return "Great start! Keep building momentum!";
  } else if (percentage < 50) {
    return "You're making solid progress! Keep it up!";
  } else if (percentage < 75) {
    return "Excellent work! You're more than halfway there!";
  } else if (percentage < 100) {
    return "Amazing progress! You're almost at the finish line!";
  } else {
    return "Outstanding! You've mastered this completely!";
  }
};

// Add React import for hooks
import React from "react";
