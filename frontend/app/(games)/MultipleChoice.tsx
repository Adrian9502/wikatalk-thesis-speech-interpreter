import React from "react";
import useQuizStore from "@/store/games/useQuizStore";
import GameContainer from "@/components/games/GameContainer";
import GamePlayingContent from "@/components/games/GamePlayingContent";
import GameCompletedContent from "@/components/games/GameCompletedContent";
import { useGameInitialization } from "@/hooks/useGameInitialization";
import MultipleChoicePlayingContent from "@/components/games/multipleChoice/MultipleChoicePlayingContent";

interface MultipleChoiceProps {
  levelId: number;
  levelData: any;
  difficulty?: string;
  isStarted?: boolean;
}

const MultipleChoice: React.FC<MultipleChoiceProps> = ({
  levelId,
  levelData,
  difficulty = "easy", // Default to easy
  isStarted = false,
}) => {
  // Get state and actions from the centralized store
  const {
    // Common game state
    gameState: { score, gameStatus, timerRunning, timeElapsed },
    // MultipleChoice specific state
    multipleChoiceState: { selectedOption, currentQuestion },
    // Actions
    initialize,
    startGame,
    handleRestart,
    handleOptionSelect,
  } = useQuizStore();

  // Initialize the game with common hook
  useGameInitialization(
    levelData,
    levelId,
    "multipleChoice",
    difficulty,
    isStarted,
    initialize,
    startGame,
    gameStatus,
    timerRunning
  );

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
        >
          <MultipleChoicePlayingContent
            difficulty={difficulty}
            levelData={levelData}
            currentQuestion={currentQuestion}
            selectedOption={selectedOption}
            handleOptionSelect={handleOptionSelect}
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
          onRestart={handleRestart}
        />
      )}
    </GameContainer>
  );
};

export default MultipleChoice;
