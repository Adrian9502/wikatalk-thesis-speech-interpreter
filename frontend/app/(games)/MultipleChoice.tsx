import React, { useEffect } from "react";
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

const MultipleChoice: React.FC<MultipleChoiceProps> = ({
  levelId,
  levelData,
  difficulty = "easy",
  isStarted = false,
}) => {
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

  // ENHANCED: Option selection handler with progress tracking and completion
  const handleOptionSelectWithProgress = async (optionId: string) => {
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

      // FIXED: Use the result to avoid unused variable warning
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
  };

  // Restart handler with progress sync
  const handleRestartWithProgress = async () => {
    handleRestart();

    // Reset timer to continue from where they left off if they have progress
    if (progress && !Array.isArray(progress) && progress.totalTimeSpent > 0) {
      setTimeElapsed(progress.totalTimeSpent);
    } else {
      setTimeElapsed(0);
    }

    console.log(`[MultipleChoice] Restarting game`);
  };

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

  // Game content configuration
  const focusArea =
    currentQuestion?.focusArea || levelData?.focusArea || "Vocabulary";
  const selectedAnswerText =
    currentQuestion?.options?.find((o) => o.id === selectedOption)?.text || "";
  const isSelectedCorrect =
    currentQuestion?.options?.find((o) => o.id === selectedOption)?.isCorrect ||
    false;

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
          focusArea={focusArea}
          gameStatus={gameStatus}
          initialTime={
            progress && !Array.isArray(progress) ? progress.totalTimeSpent : 0
          }
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
          userAnswer={selectedAnswerText}
          isCorrect={isSelectedCorrect}
          levelId={levelId}
          gameMode="multipleChoice"
          gameTitle="Multiple Choice"
          onRestart={handleRestartWithProgress}
          focusArea={focusArea}
        />
      )}
    </GameContainer>
  );
};

export default MultipleChoice;
