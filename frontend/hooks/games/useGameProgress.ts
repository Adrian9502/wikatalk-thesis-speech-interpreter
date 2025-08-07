import { useCallback, useEffect, useRef } from "react";
import { useUserProgress } from "@/hooks/useUserProgress";
import useGameStore from "@/store/games/useGameStore";

import { calculateRewardCoins } from "@/utils/rewardCalculationUtils";

export const useGameProgress = (levelData: any, levelId: number) => {
  const {
    progress,
    updateProgress: originalUpdateProgress,
    fetchProgress,
    resetTimer,
    isLoading,
  } = useUserProgress(levelId);

  const isRestartingRef = useRef(false);
  const restartLockRef = useRef(false);
  const { setTimeElapsed } = useGameStore();

  // Set initial time from progress
  useEffect(() => {
    if (isRestartingRef.current || restartLockRef.current) {
      console.log(`[useGameProgress] Skipping progress update during restart`);
      return;
    }

    if (progress && !Array.isArray(progress) && progress.totalTimeSpent > 0) {
      console.log(
        `[useGameProgress] Setting initial time from progress: ${progress.totalTimeSpent}`
      );
      setTimeElapsed(progress.totalTimeSpent);
    } else {
      console.log(`[useGameProgress] Resetting timer to 0`);
      setTimeElapsed(0);
    }
  }, [progress, setTimeElapsed]);

  // UPDATED: Enhanced updateProgress with reward calculation
  const updateProgress = useCallback(
    async (
      timeSpent: number,
      isCorrect: boolean,
      completed: boolean,
      difficulty?: string // NEW: Add difficulty parameter
    ): Promise<any> => {
      try {
        // Extract difficulty from levelData if not provided
        const actualDifficulty =
          difficulty ||
          levelData?.difficulty ||
          levelData?.difficultyCategory ||
          "easy";

        console.log(`[useGameProgress] Updating progress:`, {
          timeSpent,
          isCorrect,
          completed,
          difficulty: actualDifficulty,
          levelId,
        });

        // Calculate reward on frontend for immediate feedback
        let rewardInfo = null;
        if (isCorrect) {
          const reward = calculateRewardCoins(
            actualDifficulty,
            timeSpent,
            true
          );
          rewardInfo = {
            coins: reward.coins,
            label: reward.label,
            difficulty: actualDifficulty,
            timeSpent,
            tier: reward.tier,
          };

          console.log(`[useGameProgress] Calculated reward:`, rewardInfo);
        }

        // UPDATED: Call original updateProgress with difficulty
        const result = await originalUpdateProgress(
          timeSpent,
          completed,
          isCorrect,
          actualDifficulty // NEW: Pass difficulty to backend
        );

        // Return enhanced result with reward info
        return {
          ...result,
          rewardInfo, // NEW: Include reward information
        };
      } catch (error) {
        console.error("[useGameProgress] Error updating progress:", error);
        throw error;
      }
    },
    [originalUpdateProgress, levelData]
  );

  return {
    progress,
    updateProgress, // This now includes reward calculation
    fetchProgress,
    resetTimer,
    isLoading,
    isRestartingRef,
    restartLockRef,
  };
};
