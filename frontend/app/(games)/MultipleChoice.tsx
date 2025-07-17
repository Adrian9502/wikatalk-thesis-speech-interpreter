import React, { useEffect, useMemo, useCallback } from "react";
import useGameStore from "@/store/games/useGameStore";
import GameContainer from "@/components/games/GameContainer";
import GamePlayingContent from "@/components/games/GamePlayingContent";
import GameCompletedContent from "@/components/games/GameCompletedContent";
import { useGameInitialization } from "@/hooks/useGameInitialization";
import MultipleChoicePlayingContent from "@/components/games/multipleChoice/MultipleChoicePlayingContent";
import { useUserProgress } from "@/hooks/useUserProgress";

interface MultipleChoiceProps {
  levelId: number;
  levelData: any;
  difficulty?: string;
  isStarted?: boolean;
}

const MultipleChoice: React.FC<MultipleChoiceProps> = React.memo(
  ({ levelId, levelData, difficulty = "easy", isStarted = false }) => {
    // Get user progress
    const { progress, updateProgress } = useUserProgress(
      levelData?.questionId || levelId
    );

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

    // Set initial time from progress when component mounts
    useEffect(() => {
      if (progress && !Array.isArray(progress) && progress.totalTimeSpent > 0) {
        console.log(
          `[MultipleChoice] Setting initial time from progress: ${progress.totalTimeSpent}`
        );
        setTimeElapsed(progress.totalTimeSpent);
      } else {
        console.log(`[MultipleChoice] Resetting timer to 0`);
        setTimeElapsed(0);
      }
    }, [progress, setTimeElapsed]);

    // PERFORMANCE: Memoize the option selection handler
    const handleOptionSelectWithProgress = useCallback(
      async (optionId: string) => {
        try {
          console.log(`[MultipleChoice] Option selected: ${optionId}`);

          // 1. Stop the timer and capture current time
          setTimerRunning(false);
          const currentTime = timeElapsed;
          console.log(`[MultipleChoice] Time captured: ${currentTime}`);

          // 2. Get if the answer is correct
          const isCorrect = !!currentQuestion?.options.find(
            (option) => option.id === optionId && option.isCorrect
          );

          // 3. Call the option select handler in quiz store
          handleOptionSelect(optionId);

          // 4. Update progress with completion status immediately
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
        timeElapsed,
        setTimerRunning,
        handleOptionSelect,
        updateProgress,
      ]
    );

    // PERFORMANCE: Memoize restart handler
    const handleRestartWithProgress = useCallback(async () => {
      handleRestart();

      // Reset timer to continue from where they left off if they have progress
      if (progress && !Array.isArray(progress) && progress.totalTimeSpent > 0) {
        setTimeElapsed(progress.totalTimeSpent);
      } else {
        setTimeElapsed(0);
      }

      console.log(`[MultipleChoice] Restarting game`);
    }, [handleRestart, progress, setTimeElapsed]);

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
      progress && !Array.isArray(progress) ? progress.totalTimeSpent : 0
    );

    // PERFORMANCE: Memoize derived values
    const gameConfig = useMemo(
      () => ({
        focusArea:
          currentQuestion?.focusArea || levelData?.focusArea || "Vocabulary",
        selectedAnswerText:
          currentQuestion?.options?.find((o) => o.id === selectedOption)
            ?.text || "",
        isSelectedCorrect:
          currentQuestion?.options?.find((o) => o.id === selectedOption)
            ?.isCorrect || false,
        initialTime:
          progress && !Array.isArray(progress) ? progress.totalTimeSpent : 0,
      }),
      [currentQuestion, levelData, selectedOption, progress]
    );

    return (
      <GameContainer
        title="Multiple Choice"
        level={currentQuestion?.level || `Level ${levelId}`}
        levelTitle={currentQuestion?.title || "Multiple Choice Quiz"}
        timerRunning={timerRunning}
        gameStatus={gameStatus}
        variant="triple"
      >
        {gameStatus === "playing" ? (
          <GamePlayingContent
            timerRunning={timerRunning}
            difficulty={difficulty}
            isStarted={isStarted}
            focusArea={gameConfig.focusArea}
            gameStatus={gameStatus}
            initialTime={gameConfig.initialTime}
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
          />
        )}
      </GameContainer>
    );
  }
);

export default MultipleChoice;
