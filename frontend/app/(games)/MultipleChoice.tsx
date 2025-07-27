import React, { useEffect, useMemo, useCallback, useRef } from "react";
import useGameStore from "@/store/games/useGameStore";
import GameContainer from "@/components/games/GameContainer";
import GamePlayingContent from "@/components/games/GamePlayingContent";
import GameCompletedContent from "@/components/games/GameCompletedContent";
import { useGameInitialization } from "@/hooks/useGameInitialization";
import MultipleChoicePlayingContent from "@/components/games/multipleChoice/MultipleChoicePlayingContent";
import { useUserProgress } from "@/hooks/useUserProgress";
// NEW: Import the utility function
import { useNextLevelData } from "@/utils/games/levelUtils";

interface MultipleChoiceProps {
  levelId: number;
  levelData: any;
  difficulty?: string;
  isStarted?: boolean;
}

const MultipleChoice: React.FC<MultipleChoiceProps> = React.memo(
  ({ levelId, levelData, difficulty = "easy", isStarted = false }) => {
    // Get user progress - DECLARE AT TOP LEVEL
    const { progress, updateProgress, fetchProgress } = useUserProgress(
      levelData?.questionId || levelId
    );

    // NEW: Track if initial setup is complete
    const initialSetupComplete = useRef(false);
    const lastProgressTimeRef = useRef<number>(0);
    const gameStartedRef = useRef(false);
    // ADD: Track restart state to prevent double rendering
    const isRestartingRef = useRef(false);

    // Get quiz store state and actions
    const {
      gameState: { score, gameStatus, timerRunning, timeElapsed },
      multipleChoiceState: { selectedOption, currentQuestion },
      initialize,
      startGame,
      handleRestart,
      handleOptionSelect,
      setTimeElapsed,
      setTimerRunning,
    } = useGameStore();

    // NEW: Use the utility hook for next level data
    const { getNextLevelTitle } = useNextLevelData(
      "multipleChoice",
      levelId,
      difficulty
    );

    // FIXED: Set initial time from progress when component mounts - prevent multiple calls
    useEffect(() => {
      // CRITICAL: Don't update during restart process
      if (isRestartingRef.current) {
        console.log(`[MultipleChoice] Skipping progress update during restart`);
        return;
      }

      if (progress && !Array.isArray(progress)) {
        const progressTime = progress.totalTimeSpent || 0;

        // Only update if time has actually changed and we haven't done initial setup
        if (
          progressTime !== lastProgressTimeRef.current ||
          !initialSetupComplete.current
        ) {
          console.log(
            `[MultipleChoice] Setting initial time from progress: ${progressTime} (was: ${lastProgressTimeRef.current})`
          );

          lastProgressTimeRef.current = progressTime;
          setTimeElapsed(progressTime);
          initialSetupComplete.current = true;
        }
      } else if (!initialSetupComplete.current) {
        console.log(`[MultipleChoice] No previous progress, starting from 0`);
        setTimeElapsed(0);
        lastProgressTimeRef.current = 0;
        initialSetupComplete.current = true;
      }
    }, [progress, setTimeElapsed]);

    const handleOptionSelectWithProgress = useCallback(
      async (optionId: string) => {
        try {
          console.log(`[MultipleChoice] Option selected: ${optionId}`);

          // FIXED: Get current time from store first, then stop timer
          const currentTime = useGameStore.getState().gameState.timeElapsed;
          console.log(`[MultipleChoice] Time captured: ${currentTime}`);

          // Stop the timer
          setTimerRunning(false);

          // Get if the answer is correct
          const isCorrect = !!currentQuestion?.options.find(
            (option) => option.id === optionId && option.isCorrect
          );

          // Call the option select handler in quiz store
          handleOptionSelect(optionId);

          // Update progress with completion status immediately
          console.log(
            `[MultipleChoice] Updating progress - Time: ${currentTime}, Correct: ${isCorrect}, Completed: ${isCorrect}`
          );

          const updatedProgress = await updateProgress(
            currentTime,
            isCorrect,
            isCorrect
          );

          if (updatedProgress) {
            console.log(`[MultipleChoice] Progress updated successfully`);
          }
        } catch (error) {
          console.error("[MultipleChoice] Error in option selection:", error);
        }
      },
      [
        currentQuestion?.options,
        setTimerRunning,
        handleOptionSelect,
        updateProgress,
      ]
    );

    const handleRestartWithProgress = useCallback(async () => {
      console.log(`[MultipleChoice] Restarting with complete cache refresh`);

      // CRITICAL: Set restart flag to prevent double rendering
      isRestartingRef.current = true;

      try {
        // 1. Clear all local state first, but DON'T reset timeElapsed to 0 yet
        lastProgressTimeRef.current = 0;
        initialSetupComplete.current = false;
        gameStartedRef.current = false;

        // 2. Clear game store state but preserve current time temporarily
        const gameStore = useGameStore.getState();
        const currentGameTime = gameStore.gameState.timeElapsed;

        gameStore.setGameStatus("idle");
        // REMOVED: Don't reset timer here - let fresh progress data determine the time
        // gameStore.resetTimer();
        // gameStore.setTimeElapsed(0);

        // 3. CRITICAL: Force fetch fresh progress data BEFORE restarting
        console.log(`[MultipleChoice] Force fetching fresh progress data`);

        try {
          const freshProgress = await fetchProgress(true); // Force refresh

          // 4. Use the fresh progress time
          let progressTime = 0;
          if (freshProgress && !Array.isArray(freshProgress)) {
            progressTime = freshProgress.totalTimeSpent || 0;
            console.log(
              `[MultipleChoice] Using fresh progress time: ${progressTime}`
            );
          } else {
            console.log(
              `[MultipleChoice] No fresh progress found, using current time: ${currentGameTime}`
            );
            progressTime = currentGameTime; // Use current time instead of 0
          }

          // 5. CRITICAL: Update local state with fresh time SYNCHRONOUSLY
          setTimeElapsed(progressTime);
          lastProgressTimeRef.current = progressTime;
          initialSetupComplete.current = true;

          // 6. CRITICAL: Small delay to ensure state is applied
          await new Promise((resolve) => setTimeout(resolve, 50));

          // 7. Now restart the game
          handleRestart();

          console.log(
            `[MultipleChoice] Restart completed with fresh time: ${progressTime}`
          );
        } catch (fetchError) {
          console.error(
            `[MultipleChoice] Error fetching fresh progress:`,
            fetchError
          );
          // Fallback: restart with current time instead of 0
          setTimeElapsed(currentGameTime);
          lastProgressTimeRef.current = currentGameTime;
          initialSetupComplete.current = true;
          handleRestart();
        }
      } catch (error) {
        console.error(`[MultipleChoice] Error during restart:`, error);
        // Fallback: restart with current time
        const currentTime = useGameStore.getState().gameState.timeElapsed;
        setTimeElapsed(currentTime);
        lastProgressTimeRef.current = currentTime;
        initialSetupComplete.current = true;
        handleRestart();
      } finally {
        // CRITICAL: Clear restart flag after a delay
        setTimeout(() => {
          isRestartingRef.current = false;
          console.log(`[MultipleChoice] Restart process completed`);
        }, 100);
      }
    }, [handleRestart, setTimeElapsed, fetchProgress]);

    const gameConfig = useMemo(() => {
      const progressTime =
        progress && !Array.isArray(progress) ? progress.totalTimeSpent || 0 : 0;

      // FIXED: Better focus area extraction with fallbacks
      const focusArea =
        currentQuestion?.focusArea ||
        levelData?.focusArea ||
        levelData?.questions?.[0]?.focusArea ||
        "Vocabulary";

      return {
        focusArea,
        selectedAnswerText:
          currentQuestion?.options?.find((o) => o.id === selectedOption)
            ?.text || "",
        isSelectedCorrect:
          currentQuestion?.options?.find((o) => o.id === selectedOption)
            ?.isCorrect || false,
        initialTime: progressTime,
      };
    }, [
      currentQuestion?.focusArea,
      currentQuestion?.options,
      levelData?.focusArea,
      levelData?.questions,
      selectedOption,
      progress,
    ]);

    // Initialize game
    useGameInitialization(
      levelData,
      levelId,
      "multipleChoice",
      difficulty,
      isStarted,
      initialize,
      startGame,
      gameStatus,
      timerRunning,
      gameConfig.initialTime
    );

    if (gameStatus === "playing" && !gameStartedRef.current) {
      console.log(
        `[MultipleChoice] Game started with initialTime: ${gameConfig.initialTime}`
      );
      gameStartedRef.current = true;
    }

    const handleTimerReset = useCallback(() => {
      console.log(
        `[MultipleChoice] Timer reset received - resetting timer data only, staying on completed screen`
      );

      setTimeElapsed(0);
      lastProgressTimeRef.current = 0;

      const gameStore = useGameStore.getState();
      gameStore.resetTimer();
      gameStore.setTimeElapsed(0);

      console.log(
        `[MultipleChoice] Timer reset completed - staying on completed screen`
      );
    }, [setTimeElapsed]);

    return (
      <GameContainer
        title="Multiple Choice"
        timerRunning={timerRunning}
        gameStatus={gameStatus}
        variant="triple"
        difficulty={difficulty}
        focusArea={gameConfig.focusArea}
        showTimer={true}
        initialTime={gameConfig.initialTime}
        isStarted={isStarted}
        finalTime={timeElapsed}
        levelId={levelId}
        onTimerReset={handleTimerReset}
        isCorrectAnswer={gameConfig.isSelectedCorrect}
      >
        {gameStatus === "playing" ? (
          <GamePlayingContent
            timerRunning={timerRunning}
            difficulty={difficulty}
            isStarted={isStarted}
            focusArea={gameConfig.focusArea}
            gameStatus={gameStatus}
            initialTime={gameConfig.initialTime}
            levelString={currentQuestion?.level}
            actualTitle={currentQuestion?.title}
          >
            <MultipleChoicePlayingContent
              difficulty={difficulty}
              levelData={levelData}
              currentQuestion={currentQuestion}
              selectedOption={selectedOption}
              handleOptionSelect={handleOptionSelectWithProgress}
              isStarted={isStarted}
            />
          </GamePlayingContent>
        ) : (
          <GameCompletedContent
            score={score}
            timeElapsed={timeElapsed}
            difficulty={difficulty}
            question={currentQuestion?.question || ""}
            userAnswer={gameConfig.selectedAnswerText}
            isCorrect={gameConfig.isSelectedCorrect}
            levelId={levelId}
            gameMode="multipleChoice"
            gameTitle="Multiple Choice"
            onRestart={handleRestartWithProgress}
            focusArea={gameConfig.focusArea}
            levelString={currentQuestion?.level}
            actualTitle={currentQuestion?.title}
            nextLevelTitle={getNextLevelTitle()}
            isCurrentLevelCompleted={gameConfig.isSelectedCorrect}
            isCorrectAnswer={gameConfig.isSelectedCorrect}
          />
        )}
      </GameContainer>
    );
  }
);

export default MultipleChoice;
