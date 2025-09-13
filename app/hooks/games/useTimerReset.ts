import { useCallback } from "react";
import useGameStore from "@/store/games/useGameStore";

export const useTimerReset = (
  setTimeElapsed: (time: number) => void,
  gameMode: string
) => {
  return useCallback(() => {
    console.log(
      `[${gameMode}] Timer reset received - resetting timer data only, staying on completed screen`
    );

    // CRITICAL: Reset the local timeElapsed state which feeds finalTime
    setTimeElapsed(0);

    const gameStore = useGameStore.getState();
    gameStore.resetTimer();
    gameStore.setTimeElapsed(0);

    // NEW: Also reset the finalTimeRef if it exists in the component
    // This will be handled by the component's gameConfig recalculation

    console.log(
      `[${gameMode}] Timer reset completed - staying on completed screen`
    );
  }, [setTimeElapsed, gameMode]);
};
