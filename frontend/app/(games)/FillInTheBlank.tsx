import React, { useCallback, useEffect } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import useQuizStore from "@/store/games/useQuizStore";
import GameContainer from "@/components/games/GameContainer";
import GameCompletedContent from "@/components/games/GameCompletedContent";
import { useGameInitialization } from "@/hooks/useGameInitialization";
import FillInTheBlankPlayingContent from "@/components/games/fillInTheBlank/FillInTheBlankPlayingContent";
import GamePlayingContent from "@/components/games/GamePlayingContent";

interface FillInTheBlankProps {
  levelId: number;
  levelData: any;
  difficulty?: string;
  isStarted?: boolean;
}

const FillInTheBlank: React.FC<FillInTheBlankProps> = ({
  levelId,
  levelData,
  difficulty = "easy",
  isStarted = false,
}) => {
  // Get state and actions from the centralized store
  const {
    gameState: { score, gameStatus, timerRunning, timeElapsed },
    fillInTheBlankState: {
      exercises,
      currentExerciseIndex,
      userAnswer,
      showHint,
      showTranslation,
      showFeedback,
      isCorrect,
      attemptsLeft,
    },
    initialize,
    startGame,
    handleRestart,
    setUserAnswer,
    toggleHint,
    toggleTranslation,
    checkAnswer,
    setTimerRunning,
  } = useQuizStore();

  // Current exercise
  const currentExercise = exercises[currentExerciseIndex];
  const gameMode = "fillBlanks";

  const focusArea =
    currentExercise?.focusArea || levelData?.focusArea || "Vocabulary";

  // Initialize game
  useGameInitialization(
    levelData,
    levelId,
    gameMode,
    difficulty,
    isStarted,
    initialize,
    startGame,
    gameStatus,
    timerRunning
  );

  // Stop timer when answer is checked
  useEffect(() => {
    if (showFeedback) {
      setTimerRunning(false);
    }
  }, [showFeedback, setTimerRunning]);

  // Memoize toggle functions for better performance
  const memoizedToggleHint = useCallback(() => {
    toggleHint();
  }, [toggleHint]);

  const memoizedToggleTranslation = useCallback(() => {
    toggleTranslation();
  }, [toggleTranslation]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <GameContainer
        title="Fill in the Blank"
        level={currentExercise?.level || `Level ${levelId}`}
        levelTitle={currentExercise?.title || "Fill in the Blank"}
        timerRunning={timerRunning}
        gameStatus={gameStatus}
      >
        {gameStatus === "playing" ? (
          <GamePlayingContent
            timerRunning={timerRunning}
            difficulty={difficulty}
            focusArea={focusArea}
            isStarted={isStarted}
            gameStatus={gameStatus}
          >
            <FillInTheBlankPlayingContent
              difficulty={difficulty}
              levelData={levelData}
              timerRunning={timerRunning}
              userAnswer={userAnswer}
              showHint={showHint}
              showTranslation={showTranslation}
              showFeedback={showFeedback}
              isCorrect={isCorrect}
              attemptsLeft={attemptsLeft}
              currentExercise={currentExercise}
              setUserAnswer={setUserAnswer}
              toggleHint={memoizedToggleHint}
              toggleTranslation={memoizedToggleTranslation}
              checkAnswer={checkAnswer}
            />
          </GamePlayingContent>
        ) : (
          <GameCompletedContent
            score={score}
            timeElapsed={timeElapsed}
            difficulty={difficulty}
            question={exercises[0]?.sentence || "No question available"}
            userAnswer={userAnswer || "(No answer provided)"}
            isCorrect={score > 0}
            levelId={levelId}
            gameMode="fillBlanks"
            gameTitle="Fill in the Blank"
            onRestart={handleRestart}
          />
        )}
      </GameContainer>
    </KeyboardAvoidingView>
  );
};

export default FillInTheBlank;
