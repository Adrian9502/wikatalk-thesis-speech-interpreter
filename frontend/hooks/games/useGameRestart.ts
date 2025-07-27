import { useCallback } from "react";
import useGameStore from "@/store/games/useGameStore";

export const useGameRestart = (
  isRestartingRef: React.MutableRefObject<boolean>,
  restartLockRef: React.MutableRefObject<boolean>,
  fetchProgress: (force: boolean) => Promise<any>,
  handleRestart: () => void,
  setTimeElapsed: (time: number) => void,
  gameMode: string
) => {
  return useCallback(async () => {
    if (restartLockRef.current) {
      console.log(`[${gameMode}] Restart already in progress, ignoring`);
      return;
    }

    console.log(`[${gameMode}] Restarting with complete cache refresh`);

    isRestartingRef.current = true;
    restartLockRef.current = true;

    try {
      // Clear game store state
      const gameStore = useGameStore.getState();
      gameStore.setGameStatus("idle");
      gameStore.resetTimer();
      gameStore.setTimeElapsed(0);

      // Fetch fresh progress data
      console.log(`[${gameMode}] Force fetching fresh progress data`);
      const freshProgress = await fetchProgress(true);

      let progressTime = 0;
      if (freshProgress && !Array.isArray(freshProgress)) {
        progressTime = freshProgress.totalTimeSpent || 0;
        console.log(`[${gameMode}] Using fresh progress time: ${progressTime}`);
      }

      // Update local state
      setTimeElapsed(progressTime);

      // Small delay to ensure state is applied
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Restart the game
      handleRestart();

      console.log(
        `[${gameMode}] Restart completed with fresh time: ${progressTime}`
      );
    } catch (error) {
      console.error(`[${gameMode}] Error during restart:`, error);
      setTimeElapsed(0);
      handleRestart();
    } finally {
      setTimeout(() => {
        isRestartingRef.current = false;
        restartLockRef.current = false;
        console.log(`[${gameMode}] Restart process completed`);
      }, 500);
    }
  }, [
    isRestartingRef,
    restartLockRef,
    fetchProgress,
    handleRestart,
    setTimeElapsed,
    gameMode,
  ]);
};
