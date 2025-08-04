import React, { useEffect, useMemo, useCallback, useRef } from "react";
import useGameStore from "@/store/games/useGameStore";
import GameContainer from "@/components/games/GameContainer";
import GamePlayingContent from "@/components/games/GamePlayingContent";
import GameCompletedContent from "@/components/games/GameCompletedContent";
import { useGameInitialization } from "@/hooks/useGameInitialization";
import MultipleChoicePlayingContent from "@/components/games/multipleChoice/MultipleChoicePlayingContent";
import { useNextLevelData } from "@/utils/games/levelUtils";
import { useGameProgress } from "@/hooks/games/useGameProgress";
import { useGameRestart } from "@/hooks/games/useGameRestart";
import { useTimerReset } from "@/hooks/games/useTimerReset";
import useProgressStore from "@/store/games/useProgressStore";

interface MultipleChoiceProps {
  levelId: number;
  levelData: any;
  difficulty?: string;
  isStarted?: boolean;
}

const MultipleChoice: React.FC<MultipleChoiceProps> = React.memo(
  ({ levelId, levelData, difficulty = "easy", isStarted = false }) => {
    // Game state and actions
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

    // Custom hooks for shared logic
    const {
      progress,
      updateProgress,
      fetchProgress,
      isRestartingRef,
      restartLockRef,
    } = useGameProgress(levelData, levelId);

    const { getNextLevelTitle } = useNextLevelData(
      "multipleChoice",
      levelId,
      difficulty
    );

    const handleRestartWithProgress = useGameRestart(
      isRestartingRef,
      restartLockRef,
      fetchProgress,
      handleRestart,
      setTimeElapsed,
      "MultipleChoice"
    );

    const handleTimerReset = useTimerReset(setTimeElapsed, "MultipleChoice");

    // Track initial setup
    const initialSetupComplete = useRef(false);
    const lastProgressTimeRef = useRef<number>(0);
    const gameStartedRef = useRef(false);
    // Add a ref to capture the final time consistently
    const finalTimeRef = useRef<number>(0);

    // ADDED: Reset finalTimeRef when game restarts
    useEffect(() => {
      if (gameStatus === "idle" || gameStatus === "playing") {
        // Reset final time when starting new game session
        finalTimeRef.current = 0;
        console.log(`[MultipleChoice] Reset finalTimeRef on game restart`);
      }
    }, [gameStatus]);

    // Set initial time from progress with deduplication prevention
    useEffect(() => {
      if (isRestartingRef.current || restartLockRef.current) return;

      if (progress && !Array.isArray(progress)) {
        const progressTime = progress.totalTimeSpent || 0;

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
    }, [progress, setTimeElapsed, isRestartingRef, restartLockRef]);

    // Handle option selection with progress update
    const handleOptionSelectWithProgress = useCallback(
      async (optionId: string) => {
        try {
          console.log(`[MultipleChoice] Option selected: ${optionId}`);

          const gameStore = useGameStore.getState();
          const preciseTime = gameStore.gameState.timeElapsed;
          const exactFinalTime = Math.round(preciseTime * 100) / 100;
          finalTimeRef.current = exactFinalTime;

          console.log(
            `[MultipleChoice] Final time captured: ${exactFinalTime}s (will be used everywhere)`
          );

          setTimerRunning(false);

          const isCorrect = !!currentQuestion?.options.find(
            (option) => option.id === optionId && option.isCorrect
          );

          handleOptionSelect(optionId);

          console.log(
            `[MultipleChoice] Updating progress - Time: ${exactFinalTime}, Correct: ${isCorrect}, Completed: ${isCorrect}`
          );

          const updatedProgress = await updateProgress(
            exactFinalTime,
            isCorrect,
            isCorrect
          );

          if (updatedProgress) {
            console.log(`[MultipleChoice] Progress updated successfully`);

            // ADDED: Force refresh enhanced progress cache for ALL answers
            const progressStore = useProgressStore.getState();
            progressStore.enhancedProgress["multipleChoice"] = null; // Clear cache
            progressStore.lastUpdated = Date.now(); // Trigger UI updates

            console.log(
              `[MultipleChoice] Enhanced progress cache cleared for immediate refresh`
            );
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

    // FIXED: Game configuration - ensure EXACT SAME VALUE everywhere
    const gameConfig = useMemo(() => {
      const progressTime =
        progress && !Array.isArray(progress) ? progress.totalTimeSpent || 0 : 0;

      const focusArea =
        currentQuestion?.focusArea ||
        levelData?.focusArea ||
        levelData?.questions?.[0]?.focusArea ||
        "Vocabulary";

      // CRITICAL: Use the EXACT SAME finalTimeRef value for all displays
      let displayTime = progressTime;

      if (gameStatus === "completed" && finalTimeRef.current > 0) {
        displayTime = finalTimeRef.current; // This exact value will be used everywhere
      } else if (gameStatus === "playing") {
        displayTime = timeElapsed || progressTime;
      }

      return {
        focusArea,
        selectedAnswerText:
          currentQuestion?.options?.find((o) => o.id === selectedOption)
            ?.text || "",
        isSelectedCorrect:
          currentQuestion?.options?.find((o) => o.id === selectedOption)
            ?.isCorrect || false,
        initialTime: progressTime,
        finalTime: displayTime, // This EXACT value goes to both components
      };
    }, [
      currentQuestion,
      levelData,
      selectedOption,
      progress,
      gameStatus,
      timeElapsed,
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

    // Track game start
    useEffect(() => {
      if (gameStatus === "playing" && !gameStartedRef.current) {
        console.log(
          `[MultipleChoice] Game started with initialTime: ${gameConfig.initialTime}`
        );
        gameStartedRef.current = true;
      }
    }, [gameStatus, gameConfig.initialTime]);

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
        finalTime={gameConfig.finalTime} // Use consistent final time
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
            timeElapsed={gameConfig.finalTime} // Use consistent final time
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
