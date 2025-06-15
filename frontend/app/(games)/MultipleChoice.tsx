import React, { useEffect } from "react";
import useQuizStore from "@/store/games/useQuizStore";
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
  // Add the user progress hook
  const { progress, updateProgress, fetchProgress } = useUserProgress(
    // Use questionId from levelData if available, otherwise use levelId
    levelData?.questionId || levelId
  );

  // Get state and actions from the centralized store
  const {
    gameState: { score, gameStatus, timerRunning, timeElapsed },
    multipleChoiceState: { selectedOption, currentQuestion },
    initialize,
    startGame,
    handleRestart,
    handleOptionSelect,
    setTimeElapsed,
  } = useQuizStore();

  // Set initial time from progress when component mounts
  useEffect(() => {
    if (progress && progress.totalTimeSpent > 0) {
      setTimeElapsed(progress.totalTimeSpent);
    }
  }, [progress]);

  // Custom option select handler with progress tracking
  const handleOptionSelectWithProgress = async (optionId: string) => {
    // First get the option details
    const selectedOptionObj = currentQuestion?.options.find(
      (option) => option.id === optionId
    );
    const isCorrect = !!selectedOptionObj?.isCorrect;

    // Call the original handler
    handleOptionSelect(optionId);

    // Update progress with current time and completion status
    await updateProgress(timeElapsed, isCorrect);
  };

  // Custom restart handler that preserves time
  const handleRestartWithProgress = async () => {
    // Call original restart
    handleRestart();

    // Refetch progress to ensure we have latest data
    const latestProgress = await fetchProgress();

    // Set timer to continue from where they left off
    if (latestProgress && latestProgress.totalTimeSpent > 0) {
      setTimeElapsed(latestProgress.totalTimeSpent);
    }
  };

  // Initialize the game with common hook and pass initial time
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
    progress?.totalTimeSpent // Pass the total time spent
  );
  const focusArea =
    currentQuestion?.focusArea || levelData?.focusArea || "Vocabulary";

  // Calculate correct answer for review
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
          initialTime={progress?.totalTimeSpent}
        >
          <MultipleChoicePlayingContent
            difficulty={difficulty}
            levelData={levelData}
            currentQuestion={currentQuestion}
            selectedOption={selectedOption}
            handleOptionSelect={handleOptionSelectWithProgress} // Use new handler
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
          onRestart={handleRestartWithProgress} // Use custom handler
        />
      )}
    </GameContainer>
  );
};

export default MultipleChoice;
