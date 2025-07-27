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

    setTimeElapsed(0);

    const gameStore = useGameStore.getState();
    gameStore.resetTimer();
    gameStore.setTimeElapsed(0);

    console.log(
      `[${gameMode}] Timer reset completed - staying on completed screen`
    );
  }, [setTimeElapsed, gameMode]);
};
