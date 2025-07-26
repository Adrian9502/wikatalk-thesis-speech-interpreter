import React, { useCallback, useEffect, useMemo } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import useGameStore from "@/store/games/useGameStore";
import GameContainer from "@/components/games/GameContainer";
import GameCompletedContent from "@/components/games/GameCompletedContent";
import { useGameInitialization } from "@/hooks/useGameInitialization";
import FillInTheBlankPlayingContent from "@/components/games/fillInTheBlank/FillInTheBlankPlayingContent";
import GamePlayingContent from "@/components/games/GamePlayingContent";
import { useUserProgress } from "@/hooks/useUserProgress";
// NEW: Import the utility function
import { useNextLevelData } from "@/utils/games/levelUtils";

interface FillInTheBlankProps {
  levelId: number;
  levelData: any;
  difficulty?: string;
  isStarted?: boolean;
}

const FillInTheBlank: React.FC<FillInTheBlankProps> = React.memo(
  ({ levelId, levelData, difficulty = "easy", isStarted = false }) => {
    // User progress hook
    const { progress, updateProgress } = useUserProgress(
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
    } = useGameStore();

    // NEW: Use the utility hook for next level data
    const { getNextLevelTitle } = useNextLevelData(
      "fillBlanks",
      levelId,
      difficulty
    );

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

    // PERFORMANCE: Memoize check answer handler
    const checkAnswerWithProgress = useCallback(async () => {
      try {
        console.log(`[FillInTheBlank] Checking answer: ${userAnswer}`);

        // 1. Stop the timer and capture current time
        setTimerRunning(false);
        const currentTime = timeElapsed;
        console.log(`[FillInTheBlank] Time captured: ${currentTime}`);

        // 2. Call the check answer handler in quiz store
        checkAnswer();

        // 3. Update the user progress in backend
        setTimeout(async () => {
          const currentState = useGameStore.getState().fillInTheBlankState;
          if (currentState.showFeedback) {
            console.log(
              `[FillInTheBlank] Updating progress - Time: ${currentTime}, Correct: ${currentState.isCorrect}, Completed: ${currentState.isCorrect}`
            );

            const updatedProgress = await updateProgress(
              currentTime,
              currentState.isCorrect,
              currentState.isCorrect
            );

            if (updatedProgress) {
              console.log(`[FillInTheBlank] Progress updated successfully`);
            }
          }
        }, 100);
      } catch (error) {
        console.error("[FillInTheBlank] Error in answer check:", error);
      }
    }, [userAnswer, timeElapsed, setTimerRunning, checkAnswer, updateProgress]);

    const handleTimerReset = useCallback(() => {
      // UPDATED: Don't restart immediately, just reset the timer state
      setTimeElapsed(0);
      console.log(
        `[FillInTheBlank] Timer reset completed, user can restart manually`
      );
    }, [setTimeElapsed]);

    // PERFORMANCE: Memoize restart handler
    const handleRestartWithProgress = useCallback(async () => {
      handleRestart();

      // Reset timer to continue from where they left off if they have progress
      if (progress && !Array.isArray(progress) && progress.totalTimeSpent > 0) {
        setTimeElapsed(progress.totalTimeSpent);
      } else {
        setTimeElapsed(0);
      }

      console.log(`[FillInTheBlank] Restarting game`);
    }, [handleRestart, progress, setTimeElapsed]);

    // PERFORMANCE: Memoize current exercise and game config
    const gameConfig = useMemo(() => {
      const currentExercise = exercises[currentExerciseIndex];

      // FIXED: Better focus area extraction
      const focusArea =
        currentExercise?.focusArea ||
        levelData?.focusArea ||
        exercises?.[0]?.focusArea ||
        "Vocabulary";

      return {
        currentExercise,
        focusArea,
        question: exercises[0]?.sentence || "No question available",
        userAnswerDisplay: userAnswer || "(No answer provided)",
        initialTime:
          progress && !Array.isArray(progress) ? progress.totalTimeSpent : 0,
      };
    }, [
      exercises,
      currentExerciseIndex,
      levelData?.focusArea,
      userAnswer,
      progress,
    ]);

    // PERFORMANCE: Memoize toggle functions
    const memoizedToggleHint = useCallback(() => {
      toggleHint();
    }, [toggleHint]);

    const memoizedToggleTranslation = useCallback(() => {
      toggleTranslation();
    }, [toggleTranslation]);

    // Initialize game
    useGameInitialization(
      levelData,
      levelId,
      "fillBlanks",
      difficulty,
      isStarted,
      initialize,
      startGame,
      gameStatus,
      timerRunning,
      gameConfig.initialTime
    );

    // Stop timer when answer is checked
    useEffect(() => {
      if (showFeedback) {
        setTimerRunning(false);
      }
    }, [showFeedback, setTimerRunning]);

    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <GameContainer
          title="Fill in the Blank"
          timerRunning={timerRunning}
          gameStatus={gameStatus}
          difficulty={difficulty}
          focusArea={gameConfig.focusArea}
          showTimer={true}
          initialTime={gameConfig.initialTime}
          isStarted={isStarted}
          finalTime={timeElapsed}
          levelId={levelId}
          onTimerReset={handleTimerReset}
          isCorrectAnswer={score > 0}
        >
          {gameStatus === "playing" ? (
            <GamePlayingContent
              timerRunning={timerRunning}
              difficulty={difficulty}
              focusArea={gameConfig.focusArea}
              isStarted={isStarted}
              gameStatus={gameStatus}
              initialTime={gameConfig.initialTime}
              levelString={gameConfig.currentExercise?.level}
              actualTitle={gameConfig.currentExercise?.title}
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
                currentExercise={gameConfig.currentExercise}
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
              question={gameConfig.question}
              userAnswer={gameConfig.userAnswerDisplay}
              isCorrect={score > 0}
              levelId={levelId}
              gameMode="fillBlanks"
              gameTitle="Fill in the Blank"
              onRestart={handleRestartWithProgress}
              focusArea={gameConfig.focusArea}
              levelString={gameConfig.currentExercise?.level}
              actualTitle={gameConfig.currentExercise?.title}
              nextLevelTitle={getNextLevelTitle()}
              isCurrentLevelCompleted={score > 0}
              isCorrectAnswer={score > 0}
            />
          )}
        </GameContainer>
      </KeyboardAvoidingView>
    );
  }
);

export default FillInTheBlank;
