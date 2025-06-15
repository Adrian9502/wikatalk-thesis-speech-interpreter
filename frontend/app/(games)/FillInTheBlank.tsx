import React, { useCallback, useEffect } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import useQuizStore from "@/store/games/useQuizStore";
import GameContainer from "@/components/games/GameContainer";
import GameCompletedContent from "@/components/games/GameCompletedContent";
import { useGameInitialization } from "@/hooks/useGameInitialization";
import FillInTheBlankPlayingContent from "@/components/games/fillInTheBlank/FillInTheBlankPlayingContent";
import GamePlayingContent from "@/components/games/GamePlayingContent";
import { useUserProgress } from "@/hooks/useUserProgress";

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
  // User progress hook
  const { progress, updateProgress, fetchProgress } = useUserProgress(
    levelData?.questionId || levelId
  );

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
    setTimeElapsed,
  } = useQuizStore();

  // Set initial time from progress when component mounts
  useEffect(() => {
    if (progress && progress.totalTimeSpent > 0) {
      setTimeElapsed(progress.totalTimeSpent);
    }
  }, [progress]);

  // Custom answer check handler with progress tracking
  const checkAnswerWithProgress = async () => {
    // Call the original handler
    checkAnswer();

    // Only update progress if feedback is shown (answer has been submitted)
    // We need to use a timeout because the showFeedback state updates after checkAnswer() is called
    setTimeout(async () => {
      const currentState = useQuizStore.getState().fillInTheBlankState;
      if (currentState.showFeedback) {
        await updateProgress(timeElapsed, currentState.isCorrect);
      }
    }, 100);
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

  // Current exercise
  const currentExercise = exercises[currentExerciseIndex];
  const gameMode = "fillBlanks";

  const focusArea =
    currentExercise?.focusArea || levelData?.focusArea || "Vocabulary";

  // Initialize game with progress time
  useGameInitialization(
    levelData,
    levelId,
    gameMode,
    difficulty,
    isStarted,
    initialize,
    startGame,
    gameStatus,
    timerRunning,
    progress?.totalTimeSpent // Pass the total time spent
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
            initialTime={progress?.totalTimeSpent}
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
              checkAnswer={checkAnswerWithProgress} // Use new handler
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
            onRestart={handleRestartWithProgress} // Use new handler
          />
        )}
      </GameContainer>
    </KeyboardAvoidingView>
  );
};

export default FillInTheBlank;
