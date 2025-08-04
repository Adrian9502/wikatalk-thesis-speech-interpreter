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

    // Custom hooks for shared logic
    const { updateProgress, fetchProgress, isRestartingRef, restartLockRef } =
      useGameProgress(levelData, levelId);

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
    useEffect(() => {
      if (gameStatus === "idle" || gameStatus === "playing") {
        finalTimeRef.current = 0;
        console.log(`[FillInTheBlank] Reset finalTimeRef on game restart`);
      }
    }, [gameStatus]);

    // FIXED: Game configuration with better final time logic
    const gameConfig = useMemo(() => {
      const currentExercise = exercises[currentExerciseIndex];

      const focusArea =
        currentExercise?.focusArea ||
        levelData?.focusArea ||
        exercises?.[0]?.focusArea ||
        "Vocabulary";

      // CRITICAL: Better final time logic
      let displayTime = 0;
      if (gameStatus === "completed" && finalTimeRef.current > 0) {
        displayTime = finalTimeRef.current;
      } else if (gameStatus === "playing") {
        displayTime = timeElapsed;
      }

      return {
        currentExercise,
        focusArea,
        question: exercises[0]?.sentence || "No question available",
        userAnswerDisplay: userAnswer || "(No answer provided)",
        initialTime: 0,
        finalTime: displayTime,
      };
    }, [
      exercises,
      currentExerciseIndex,
      levelData?.focusArea,
      userAnswer,
      gameStatus,
      timeElapsed, // Add timeElapsed dependency
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

    // ADDED: Debug effect to track game state changes
    useEffect(() => {
      console.log(`[FillInTheBlank] Game state changed:`, {
        gameStatus,
        timerRunning,
        timeElapsed,
        isStarted,
        hasExercises: exercises.length > 0,
      });
    }, [gameStatus, timerRunning, timeElapsed, isStarted, exercises.length]);

    // ADDED: Force start game if stuck in idle after initialization
    useEffect(() => {
      if (
        levelData &&
        gameStatus === "idle" &&
        isStarted &&
        exercises.length > 0
      ) {
        console.log(
          `[FillInTheBlank] Game seems stuck in idle, force starting...`
        );

        // Small delay then force start
        const timer = setTimeout(() => {
          console.log(`[FillInTheBlank] Force calling startGame()`);
          startGame();
        }, 500);

        return () => clearTimeout(timer);
      }
    }, [levelData, gameStatus, isStarted, exercises.length, startGame]);

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
          finalTime={gameConfig.finalTime} // Same value
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
              timeElapsed={gameConfig.finalTime} // Same value
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
