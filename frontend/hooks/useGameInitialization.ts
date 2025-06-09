import { useEffect } from "react";
import { setupBackButtonHandler } from "@/utils/gameUtils";

export function useGameInitialization(
  levelData: any,
  levelId: number,
  gameMode: string,
  difficulty: string,
  isStarted: boolean,
  initialize: (data: any, id: number, mode: string, diff: string) => void,
  startGame: () => void,
  gameStatus: string,
  timerRunning: boolean
) {
  // Handle back button
  useEffect(() => {
    const cleanupBackHandler = setupBackButtonHandler(gameStatus, timerRunning);
    return () => cleanupBackHandler();
  }, [gameStatus, timerRunning]);

  // Initialize and start game
  useEffect(() => {
    if (levelData && isStarted) {
      console.log(`Initializing ${gameMode} game with data:`, levelData);

      // Initialize the game
      initialize(levelData, levelId, gameMode, difficulty);

      // Add a small delay to ensure initialization completes
      const timer = setTimeout(() => {
        console.log(`Starting ${gameMode} game`);
        startGame();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [levelData, isStarted, levelId, gameMode, difficulty]);
}
