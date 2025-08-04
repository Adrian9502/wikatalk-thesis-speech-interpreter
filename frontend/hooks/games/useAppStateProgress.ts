import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import useGameStore from "@/store/games/useGameStore";
import { useGameProgress } from "@/hooks/games/useGameProgress";

interface AppStateProgressOptions {
  levelData: any;
  levelId: number;
  gameMode: string;
}

export const useAppStateProgress = ({
  levelData,
  levelId,
  gameMode,
}: AppStateProgressOptions) => {
  const appState = useRef(AppState.currentState);
  const { updateProgress } = useGameProgress(levelData, levelId);

  // Track if we've already handled the background transition
  const hasHandledBackgroundRef = useRef(false);
  const lastSaveTimeRef = useRef(0);

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      const gameStore = useGameStore.getState();
      const { gameStatus, timerRunning, timeElapsed, currentMode } =
        gameStore.gameState;

      console.log(
        `[AppStateProgress] App state changing: ${appState.current} -> ${nextAppState}`
      );
      console.log(`[AppStateProgress] Game state:`, {
        gameStatus,
        isActive: gameStatus === "playing",
        timeElapsed,
        timerRunning,
        currentMode,
        targetMode: gameMode,
      });

      // Only handle if this is the active game mode and we're in a playing state
      const isActiveGame = currentMode === gameMode;
      const isPlayingState = gameStatus === "playing" && timerRunning;

      // STRICT: Handle ANY transition away from active (background OR inactive)
      if (
        appState.current === "active" &&
        (nextAppState === "background" || nextAppState === "inactive") &&
        isActiveGame &&
        isPlayingState &&
        !hasHandledBackgroundRef.current
      ) {
        console.log(
          `[AppStateProgress] App went to ${nextAppState} - IMMEDIATELY stopping game and saving progress`
        );

        // Prevent duplicate handling
        hasHandledBackgroundRef.current = true;
        lastSaveTimeRef.current = Date.now();

        try {
          // CRITICAL: Capture the exact time BEFORE any state changes
          const exactFinalTime = Math.round(timeElapsed * 100) / 100;

          console.log(
            `[AppStateProgress] Captured exact time before state changes: ${exactFinalTime}s`
          );

          // STEP 1: Stop the timer immediately
          gameStore.setTimerRunning(false);

          // STEP 2: Set background completion flag FIRST
          gameStore.setBackgroundCompletion(true);

          // STEP 3: Set game status to completed
          gameStore.setGameStatus("completed");

          // IMPORTANT: Don't modify timeElapsed - let it stay as the background exit time

          console.log(
            `[AppStateProgress] Recording background exit: ${exactFinalTime}s for ${gameMode} level ${levelId}`
          );

          // STEP 4: Save progress as incorrect/incomplete attempt
          const result = await updateProgress(
            exactFinalTime,
            false, // isCorrect = false (incomplete due to background)
            false // completed = false (not a real completion)
          );

          if (result) {
            console.log(
              `[AppStateProgress] Background exit recorded: ${exactFinalTime}s for ${gameMode} level ${levelId}`
            );
          } else {
            console.error(
              `[AppStateProgress] Failed to record background exit`
            );
          }
        } catch (error) {
          console.error(
            `[AppStateProgress] Error recording background exit:`,
            error
          );
        }
      } else if (nextAppState === "active" && appState.current !== "active") {
        // App returned to active - reset the flag for next time
        console.log(
          `[AppStateProgress] App became active - resetting background flag`
        );
        hasHandledBackgroundRef.current = false;
      }

      appState.current = nextAppState;
    };

    // Subscribe to app state changes
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // Cleanup
    return () => {
      subscription?.remove();
    };
  }, [levelData, levelId, gameMode, updateProgress]);

  // Reset flag when game starts/restarts
  useEffect(() => {
    const gameStore = useGameStore.getState();
    if (gameStore.gameState.gameStatus === "playing") {
      hasHandledBackgroundRef.current = false;
      lastSaveTimeRef.current = 0;
    }
  }, []);

  return {
    // Expose method to manually reset if needed
    resetAutoSaveFlag: () => {
      hasHandledBackgroundRef.current = false;
      lastSaveTimeRef.current = 0;
    },
  };
};
