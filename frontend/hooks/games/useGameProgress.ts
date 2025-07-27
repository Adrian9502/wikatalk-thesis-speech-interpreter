import { useCallback, useEffect, useRef } from "react";
import { useUserProgress } from "@/hooks/useUserProgress";
import useGameStore from "@/store/games/useGameStore";

export const useGameProgress = (levelData: any, levelId: number) => {
  const { progress, updateProgress, fetchProgress } = useUserProgress(
    levelData?.questionId || levelId
  );

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

  return {
    progress,
    updateProgress,
    fetchProgress,
    isRestartingRef,
    restartLockRef,
  };
};
