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
  const hasInitialized = useRef(false);
  const hasStarted = useRef(false);
  const initializationLock = useRef(false);

  // FIXED: Better initialization logic
  useEffect(() => {
    if (
      levelData &&
      gameStatus === "idle" &&
      !hasInitialized.current &&
      !initializationLock.current
    ) {
      console.log(
        `[useGameInitialization] Initializing ${gameMode} at level ${levelId}`
      );

      initializationLock.current = true;

      // CRITICAL: Use requestAnimationFrame to ensure proper timing
      requestAnimationFrame(() => {
        initialize(levelData, levelId, gameMode, difficulty);
        hasInitialized.current = true;
        initializationLock.current = false;

        console.log(
          `[useGameInitialization] ${gameMode} initialized, status should be idle`
        );
      });
    }
  }, [levelData, levelId, gameMode, difficulty, gameStatus, initialize]);

  // FIXED: Better game start logic
  useEffect(() => {
    console.log(
      `[useGameInitialization] Start check - gameStatus: ${gameStatus}, isStarted: ${isStarted}, hasInitialized: ${hasInitialized.current}, hasStarted: ${hasStarted.current}`
    );

    if (
      levelData &&
      gameStatus === "idle" &&
      isStarted &&
      hasInitialized.current &&
      !hasStarted.current
    ) {
      console.log(
        `[useGameInitialization] Starting ${gameMode} game with initial time: ${initialTime}`
      );

      // CRITICAL: Add longer delay for identification and fillBlanks
      const startDelay = gameMode === "multipleChoice" ? 100 : 300;

      setTimeout(() => {
        console.log(
          `[useGameInitialization] Calling startGame() for ${gameMode}`
        );
        startGame();
        hasStarted.current = true;

        // Verify the game started
        setTimeout(() => {
          console.log(
            `[useGameInitialization] ${gameMode} should now be playing`
          );
        }, 100);
      }, startDelay);
    }
  }, [
    levelData,
    gameStatus,
    isStarted,
    startGame,
    initialTime,
    gameMode,
    hasInitialized.current,
  ]);

  // FIXED: Reset refs when level changes
  useEffect(() => {
    console.log(
      `[useGameInitialization] Resetting refs for ${gameMode} level ${levelId}`
    );
    hasInitialized.current = false;
    hasStarted.current = false;
    initializationLock.current = false;
  }, [levelId, gameMode]);
};
