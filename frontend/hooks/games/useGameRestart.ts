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
      // STEP 1: Clear game store state FIRST
      const gameStore = useGameStore.getState();
      gameStore.setGameStatus("idle");
      gameStore.resetTimer();
      gameStore.setTimeElapsed(0);

      // STEP 2: Fetch fresh progress data
      console.log(`[${gameMode}] Force fetching fresh progress data`);
      const freshProgress = await fetchProgress(true);

      let progressTime = 0;
      if (freshProgress && !Array.isArray(freshProgress)) {
        progressTime = freshProgress.totalTimeSpent || 0;
        console.log(`[${gameMode}] Using fresh progress time: ${progressTime}`);
      }

      // STEP 3: Update local state
      setTimeElapsed(progressTime);

      // STEP 4: Small delay to ensure state is applied
      await new Promise((resolve) => setTimeout(resolve, 100));

      // STEP 5: Restart the game
      handleRestart();

      // STEP 6: ENHANCED - Much longer delay before unlocking to prevent force start
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log(
        `[${gameMode}] Restart completed with fresh time: ${progressTime}`
      );
    } catch (error) {
      console.error(`[${gameMode}] Error during restart:`, error);
      setTimeElapsed(0);
      handleRestart();
    } finally {
      // CRITICAL: Much longer delay before clearing restart flags
      setTimeout(() => {
        isRestartingRef.current = false;
        restartLockRef.current = false;
        console.log(`[${gameMode}] Restart process completed`);
      }, 1500); // INCREASED: From 1000ms to 1500ms to prevent early force start
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
