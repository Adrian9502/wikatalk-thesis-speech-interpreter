import { useEffect, useRef } from "react";
import { setupBackButtonHandler } from "@/utils/gameUtils";
import { GameStatus } from "@/types/gameTypes";
import useQuizStore from "@/store/games/useQuizStore";

export function useGameInitialization(
  levelData: any,
  levelId: number,
  gameMode: string,
  difficulty: string,
  isStarted: boolean,
  initialize: (data: any, id: number, mode: string, diff: string) => void,
  startGame: () => void,
  gameStatus: string,
  timerRunning: boolean,
  initialTime: number = 0 // Added this parameter for previous time
) {
  // Track initialization to prevent repeated calls
  const isInitializedRef = useRef(false);

  // Handle back button
  useEffect(() => {
    const cleanupBackHandler = setupBackButtonHandler(
      gameStatus as GameStatus,
      timerRunning
    );
    return () => cleanupBackHandler();
  }, [gameStatus, timerRunning]);

  // Initialize and start game
  useEffect(() => {
    // Only initialize once per component instance
    if (!isInitializedRef.current) {
      console.log(`[useGameInitialization] Initializing ${gameMode} at level ${levelId}`);

      // Initialize game data
      initialize(levelData, levelId, gameMode, difficulty);
      isInitializedRef.current = true;

      // Set initial elapsed time if provided
      if (initialTime > 0) {
        console.log(`[useGameInitialization] Setting initial time: ${initialTime}s`);
        useQuizStore.getState().setTimeElapsed(initialTime);
      }
    }

    // Only start game if it's not already playing and isStarted is true
    if (isStarted && gameStatus === "idle") {
      startGame();
    }
  }, [isStarted, gameStatus]);
}
