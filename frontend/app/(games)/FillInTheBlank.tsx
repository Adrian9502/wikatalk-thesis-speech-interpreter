import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import useGameStore from "@/store/games/useGameStore";
import GameContainer from "@/components/games/GameContainer";
import GameCompletedContent from "@/components/games/GameCompletedContent";
import { useGameInitialization } from "@/hooks/useGameInitialization";
import FillInTheBlankPlayingContent from "@/components/games/fillInTheBlank/FillInTheBlankPlayingContent";
import GamePlayingContent from "@/components/games/GamePlayingContent";
import { useNextLevelData } from "@/utils/games/levelUtils";
import { useGameProgress } from "@/hooks/games/useGameProgress";
import { useGameRestart } from "@/hooks/games/useGameRestart";
import { useTimerReset } from "@/hooks/games/useTimerReset";
import useProgressStore from "@/store/games/useProgressStore";
import { useAppStateProgress } from "@/hooks/games/useAppStateProgress";

interface FillInTheBlankProps {
  levelId: number;
  levelData: any;
  difficulty?: string;
  isStarted?: boolean;
}

const FillInTheBlank: React.FC<FillInTheBlankProps> = React.memo(
  ({ levelId, levelData, difficulty = "easy", isStarted = false }) => {
    // Game state and actions
    const {
      gameState: {
        score,
        gameStatus,
        timerRunning,
        timeElapsed,
        isBackgroundCompletion,
      },
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
      setBackgroundCompletion,
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
      "fillBlanks",
      levelId,
      difficulty
    );

    const handleRestartWithProgress = useGameRestart(
      isRestartingRef,
      restartLockRef,
      fetchProgress,
      handleRestart,
      setTimeElapsed,
      "FillInTheBlank"
    );

    // ADD: App state monitoring for auto-save
    const { resetAutoSaveFlag, handleUserExit } = useAppStateProgress({
      levelData,
      levelId,
      gameMode: "fillBlanks",
    });

    const checkAnswerWithProgress = useCallback(async () => {
      try {
        console.log(`[FillInTheBlank] Checking answer: ${userAnswer}`);

        const preciseTime = timeElapsed;
        const exactFinalTime = Math.round(preciseTime * 100) / 100;
        finalTimeRef.current = exactFinalTime;

        console.log(
          `[FillInTheBlank] Final time captured: ${exactFinalTime}s (will be used everywhere)`
        );

        setTimerRunning(false);
        checkAnswer();

        setTimeout(async () => {
          const currentState = useGameStore.getState().fillInTheBlankState;
          if (currentState.showFeedback) {
            console.log(
              `[FillInTheBlank] Updating progress - Time: ${exactFinalTime}, Correct: ${currentState.isCorrect}, Completed: ${currentState.isCorrect}`
            );

            const updatedProgress = await updateProgress(
              exactFinalTime,
              currentState.isCorrect,
              currentState.isCorrect
            );

            if (updatedProgress) {
              console.log(`[FillInTheBlank] Progress updated successfully`);

              // ADDED: Force refresh enhanced progress cache for ALL answers
              const progressStore = useProgressStore.getState();
              progressStore.enhancedProgress["fillBlanks"] = null; // Clear cache
              progressStore.lastUpdated = Date.now(); // Trigger UI updates

              console.log(
                `[FillInTheBlank] Enhanced progress cache cleared for immediate refresh`
              );
            }
          }
        }, 100);
      } catch (error) {
        console.error("[FillInTheBlank] Error in answer check:", error);
      }
    }, [userAnswer, timeElapsed, setTimerRunning, checkAnswer, updateProgress]);

    const handleTimerReset = useTimerReset(setTimeElapsed, "FillInTheBlank");

    // Add finalTimeRef at the top
    const finalTimeRef = useRef<number>(0);

    // ADDED: Reset finalTimeRef when game restarts
    const hasResetForSessionRef = useRef(false);

    useEffect(() => {
      if (
        (gameStatus === "idle" || gameStatus === "playing") &&
        !hasResetForSessionRef.current
      ) {
        finalTimeRef.current = 0;
        resetAutoSaveFlag();
        hasResetForSessionRef.current = true;

        console.log(
          `[FillInTheBlank] Reset finalTimeRef and auto-save flag on game restart`
        );

        // Reset background completion flag separately
        if (isBackgroundCompletion) {
          setBackgroundCompletion(false);
        }
      }

      // Reset the session flag when game completes
      if (gameStatus === "completed") {
        hasResetForSessionRef.current = false;
      }
    }, [
      gameStatus,
      resetAutoSaveFlag,
      setBackgroundCompletion,
      isBackgroundCompletion,
    ]);
    const handleUserExitWithSave = useCallback(async () => {
      console.log("[FillInBlank] User exit triggered");

      try {
        const success = await handleUserExit();
        if (success) {
          console.log("[FillInBlank] User exit processed successfully");
        } else {
          console.error("[FillInBlank] User exit processing failed");
        }
      } catch (error) {
        console.error("[FillInBlank] Error during user exit:", error);
      }
    }, [handleUserExit]);

    // UPDATED: Game configuration to handle background completion
    const gameConfig = useMemo(() => {
      const currentExercise = exercises[currentExerciseIndex];
      let isUserExit = false;

      const focusArea =
        currentExercise?.focusArea ||
        levelData?.focusArea ||
        exercises?.[0]?.focusArea ||
        "Vocabulary";

      // FIXED: Get progress time like MultipleChoice does
      const progressTime =
        progress && !Array.isArray(progress) ? progress.totalTimeSpent || 0 : 0;

      // CRITICAL: Better final time logic - FIXED for user exit
      let displayTime = progressTime; // FIXED: Start with progressTime

      if (gameStatus === "completed") {
        if (isBackgroundCompletion) {
          // CRITICAL: For user exits or background completion, use the current timeElapsed
          displayTime = timeElapsed;
          console.log(
            `[FillInTheBlank] User exit/background completion - using timeElapsed: ${timeElapsed}`
          );
        } else if (finalTimeRef.current > 0) {
          // For normal completion, use the captured final time
          displayTime = finalTimeRef.current;
          console.log(
            `[FillInTheBlank] Normal completion - using finalTimeRef: ${finalTimeRef.current}`
          );
        } else {
          // Fallback to current elapsed time
          displayTime = timeElapsed;
          console.log(
            `[FillInTheBlank] Fallback - using timeElapsed: ${timeElapsed}`
          );
        }
      } else if (gameStatus === "playing") {
        displayTime = timeElapsed || progressTime; // FIXED: Fallback to progressTime
      }

      // NEW: Handle background completion case
      let userAnswerDisplay = "";

      if (isBackgroundCompletion) {
        userAnswerDisplay = "No answer provided";
      } else {
        userAnswerDisplay = userAnswer || "(No answer provided)";
      }

      return {
        currentExercise,
        focusArea,
        question: exercises[0]?.sentence || "No question available",
        userAnswerDisplay,
        initialTime: progressTime,
        finalTime: displayTime,
        isBackgroundCompletion,
        isUserExit,
      };
    }, [
      exercises,
      currentExerciseIndex,
      levelData?.focusArea,
      userAnswer,
      gameStatus,
      timeElapsed, // CRITICAL: Make sure timeElapsed is in dependencies
      isBackgroundCompletion,
      progress,
    ]);

    // Memoized toggle functions
    const memoizedToggleHint = useCallback(() => toggleHint(), [toggleHint]);
    const memoizedToggleTranslation = useCallback(
      () => toggleTranslation(),
      [toggleTranslation]
    );

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

    // ADDED: Force start game if stuck in idle after initialization
    useEffect(() => {
      if (
        levelData &&
        gameStatus === "idle" &&
        isStarted &&
        exercises.length > 0 &&
        !isRestartingRef.current &&
        !restartLockRef.current
      ) {
        console.log(
          `[FillInTheBlank] Game seems stuck in idle, force starting...`
        );

        // CRITICAL: Add delay to prevent conflict with retry process
        const timer = setTimeout(() => {
          // ENHANCED: Double-check multiple conditions before force starting
          const currentGameStore = useGameStore.getState();
          const currentProgressStore = useProgressStore.getState();

          // CRITICAL: Don't force start if:
          // 1. Game status changed
          // 2. Still in restart process
          // 3. Progress store is loading (indicates retry in progress)
          if (
            currentGameStore.gameState.gameStatus === "idle" &&
            !isRestartingRef.current &&
            !restartLockRef.current &&
            !currentProgressStore.isLoading // NEW: Check if progress store is loading
          ) {
            console.log(`[FillInTheBlank] Force calling startGame()`);
            startGame();
          } else {
            console.log(
              `[FillInTheBlank] Skipping force start - conditions not met:`,
              {
                gameStatus: currentGameStore.gameState.gameStatus,
                isRestarting: isRestartingRef.current,
                restartLock: restartLockRef.current,
                progressLoading: currentProgressStore.isLoading,
              }
            );
          }
        }, 1200); // INCREASED: Longer delay to allow retry process to complete

        return () => clearTimeout(timer);
      }
    }, [
      levelData,
      gameStatus,
      isStarted,
      exercises.length,
      startGame,
      isRestartingRef,
      restartLockRef,
    ]);

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
          finalTime={gameConfig.finalTime}
          levelId={levelId}
          onTimerReset={handleTimerReset}
          isCorrectAnswer={score > 0}
          onUserExit={handleUserExitWithSave}
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
              timeElapsed={gameConfig.finalTime}
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
              isBackgroundCompletion={gameConfig.isBackgroundCompletion}
              isUserExit={gameConfig.isUserExit}
            />
          )}
        </GameContainer>
      </KeyboardAvoidingView>
    );
  }
);

export default FillInTheBlank;
