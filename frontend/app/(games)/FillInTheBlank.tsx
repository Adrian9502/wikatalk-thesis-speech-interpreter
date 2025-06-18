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
  const { progress, updateProgress, refreshProgress } = useUserProgress(
    levelData?.questionId || levelId
  );

  // Get quiz store state and actions
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
    if (progress && !Array.isArray(progress) && progress.totalTimeSpent > 0) {
      console.log(
        `[FillInTheBlank] Setting initial time from progress: ${progress.totalTimeSpent}`
      );
      setTimeElapsed(progress.totalTimeSpent);
    } else {
      console.log(`[FillInTheBlank] Resetting timer to 0`);
      setTimeElapsed(0);
    }
  }, [progress, setTimeElapsed]);

  // ENHANCED: Check answer handler with progress tracking and completion
  const checkAnswerWithProgress = async () => {
    try {
      console.log(`[FillInTheBlank] Checking answer: ${userAnswer}`);

      // 1. Stop the timer and capture current time
      setTimerRunning(false);
      const currentTime = timeElapsed;
      console.log(`[FillInTheBlank] Time captured: ${currentTime}`);

      // 2. Call the check answer handler in quiz store
      checkAnswer();

      // 3. Update the user progress in backend
      // We need to use setTimeout because isCorrect state updates after checkAnswer
      setTimeout(async () => {
        const currentState = useQuizStore.getState().fillInTheBlankState;
        if (currentState.showFeedback) {
          const updatedProgress = await updateProgress(
            currentTime,
            currentState.isCorrect,
            currentState.isCorrect
          );

          // If level was completed, refresh global progress
          if (currentState.isCorrect && updatedProgress) {
            console.log(
              `[FillInTheBlank] Level ${levelId} completed successfully!`,
              updatedProgress
            );

            setTimeout(async () => {
              await refreshProgress();
              console.log(
                `[FillInTheBlank] Global progress refreshed after completion`
              );
            }, 200);
          }
        }
      }, 100);
    } catch (error) {
      console.error("[FillInTheBlank] Error in answer check:", error);
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

    console.log(`[FillInTheBlank] Restarting game`);
  };

  // Current exercise and game mode
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
    timerRunning,
    progress && !Array.isArray(progress) ? progress.totalTimeSpent : 0
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
            initialTime={
              progress && !Array.isArray(progress) ? progress.totalTimeSpent : 0
            }
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
              checkAnswer={checkAnswerWithProgress}
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
            onRestart={handleRestartWithProgress}
            focusArea={focusArea}
          />
        )}
      </GameContainer>
    </KeyboardAvoidingView>
  );
};

export default FillInTheBlank;
