import { useEffect, useRef } from "react";

export const useGameInitialization = (
  levelData: any,
  levelId: number,
  gameMode: string,
  difficulty: string,
  isStarted: boolean,
  initialize: (
    levelData: any,
    levelId: number,
    gameMode: string,
    difficulty: string
  ) => void,
  startGame: () => void,
  gameStatus: string,
  timerRunning: boolean,
  initialTime: number = 0
) => {
  // NEW: Track if we've already initialized to prevent multiple calls
  const hasInitialized = useRef(false);
  const hasStarted = useRef(false);
  const initializationLock = useRef(false); // NEW: Add initialization lock

  useEffect(() => {
    if (
      levelData &&
      gameStatus === "idle" &&
      !hasInitialized.current &&
      !initializationLock.current // NEW: Check lock
    ) {
      console.log(
        `[useGameInitialization] Initializing ${gameMode} at level ${levelId}`
      );

      // NEW: Set lock to prevent multiple initializations
      initializationLock.current = true;

      // Add small delay to prevent race conditions
      setTimeout(() => {
        initialize(levelData, levelId, gameMode, difficulty);
        hasInitialized.current = true;
        initializationLock.current = false; // Release lock
      }, 50);
    }
  }, [levelData, levelId, gameMode, difficulty, gameStatus, initialize]);

  useEffect(() => {
    if (
      levelData &&
      gameStatus === "idle" &&
      isStarted &&
      hasInitialized.current &&
      !hasStarted.current
    ) {
      console.log(
        `[useGameInitialization] Starting game with initial time: ${initialTime}`
      );

      // FIXED: Don't reset timer if we have initial time
      if (initialTime > 0) {
        console.log(
          `[useGameInitialization] Continuing from previous time: ${initialTime}`
        );
      }

      // NEW: Add delay to prevent double start
      setTimeout(() => {
        startGame();
        hasStarted.current = true;
      }, 100);
    }
  }, [levelData, gameStatus, isStarted, startGame, initialTime]);

  // Reset refs when level changes
  useEffect(() => {
    hasInitialized.current = false;
    hasStarted.current = false;
    initializationLock.current = false; // NEW: Reset lock
  }, [levelId, gameMode]);
};
