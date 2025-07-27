import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import useGameStore from "@/store/games/useGameStore";
import GameContainer from "@/components/games/GameContainer";
import GameCompletedContent from "@/components/games/GameCompletedContent";
import { useGameInitialization } from "@/hooks/useGameInitialization";
import FillInTheBlankPlayingContent from "@/components/games/fillInTheBlank/FillInTheBlankPlayingContent";
import GamePlayingContent from "@/components/games/GamePlayingContent";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useNextLevelData } from "@/utils/games/levelUtils";

interface FillInTheBlankProps {
  levelId: number;
  levelData: any;
  difficulty?: string;
  isStarted?: boolean;
}

const FillInTheBlank: React.FC<FillInTheBlankProps> = React.memo(
  ({ levelId, levelData, difficulty = "easy", isStarted = false }) => {
    const { progress, updateProgress, fetchProgress } = useUserProgress(
      levelData?.questionId || levelId
    );

    const isRestartingRef = useRef(false);
    // ADD: Restart lock like in MultipleChoice
    const restartLockRef = useRef(false);

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
      // CRITICAL: Don't update during restart process
      if (isRestartingRef.current) {
        console.log(`[FillInTheBlank] Skipping progress update during restart`);
        return;
      }

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
      console.log(
        `[FillInTheBlank] Timer reset received - resetting timer data only, staying on completed screen`
      );

      setTimeElapsed(0);

      const gameStore = useGameStore.getState();
      gameStore.resetTimer();
      gameStore.setTimeElapsed(0);
      console.log(
        `[FillInTheBlank] Timer reset completed - staying on completed screen`
      );
    }, [setTimeElapsed]);

    const handleRestartWithProgress = useCallback(async () => {
      // ADD: Prevent multiple simultaneous restarts
      if (restartLockRef.current) {
        console.log(`[FillInTheBlank] Restart already in progress, ignoring`);
        return;
      }

      console.log(`[FillInTheBlank] Restarting with complete cache refresh`);

      // CRITICAL: Set both restart flags
      isRestartingRef.current = true;
      restartLockRef.current = true;

      try {
        // 1. Clear local state
        setTimeElapsed(0);

        // 2. Clear game store state
        const gameStore = useGameStore.getState();
        gameStore.resetTimer();
        gameStore.setTimeElapsed(0);
        gameStore.setGameStatus("idle");

        // 3. CRITICAL: Force fetch fresh progress data BEFORE restarting
        console.log(`[FillInTheBlank] Force fetching fresh progress data`);

        try {
          const freshProgress = await fetchProgress(true); // Force refresh

          // 4. Use the fresh progress time (should be 0 after reset)
          let progressTime = 0;
          if (freshProgress && !Array.isArray(freshProgress)) {
            progressTime = freshProgress.totalTimeSpent || 0;
            console.log(
              `[FillInTheBlank] Using fresh progress time: ${progressTime}`
            );
          } else {
            console.log(`[FillInTheBlank] No fresh progress found, using 0`);
          }

          // 5. CRITICAL: Update local state synchronously
          setTimeElapsed(progressTime);

          // 6. Small delay to ensure state is applied
          await new Promise((resolve) => setTimeout(resolve, 50));

          // 7. Now restart the game
          handleRestart();

          console.log(
            `[FillInTheBlank] Restart completed with fresh time: ${progressTime}`
          );
        } catch (fetchError) {
          console.error(
            `[FillInTheBlank] Error fetching fresh progress:`,
            fetchError
          );
          // Fallback: restart with 0 time
          setTimeElapsed(0);
          handleRestart();
        }
      } catch (error) {
        console.error(`[FillInTheBlank] Error during restart:`, error);
        setTimeElapsed(0);
        handleRestart();
      } finally {
        // CRITICAL: Clear both flags after longer delay
        setTimeout(() => {
          isRestartingRef.current = false;
          restartLockRef.current = false;
          console.log(`[FillInTheBlank] Restart process completed`);
        }, 500); // Increased delay like MultipleChoice
      }
    }, [handleRestart, setTimeElapsed, fetchProgress]);

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
