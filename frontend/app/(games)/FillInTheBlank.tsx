import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import useCoinsStore from "@/store/games/useCoinsStore";

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
    const [rewardInfo, setRewardInfo] = useState<any>(null);

    // NEW: Coins store for balance refresh
    const { fetchCoinsBalance } = useCoinsStore();

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

    // UPDATED: Check answer with reward notification
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

            // UPDATED: Pass difficulty to updateProgress
            const updatedProgress = await updateProgress(
              exactFinalTime,
              currentState.isCorrect,
              currentState.isCorrect,
              difficulty // NEW: Pass difficulty for reward calculation
            );

            if (updatedProgress) {
              console.log(`[FillInTheBlank] Progress updated successfully`);

              // NEW: Handle reward display and coins refresh
              if (
                updatedProgress.rewardInfo &&
                updatedProgress.rewardInfo.coins > 0
              ) {
                setRewardInfo(updatedProgress.rewardInfo);
                // Refresh coins balance to show updated amount
                setTimeout(() => {
                  fetchCoinsBalance(true);
                }, 500);
              }

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
    }, [
      userAnswer,
      timeElapsed,
      setTimerRunning,
      checkAnswer,
      updateProgress,
      difficulty, // NEW: Add difficulty dependency
      fetchCoinsBalance, // NEW: Add fetchCoinsBalance dependency
    ]);

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
      let displayTime = progressTime;

      if (gameStatus === "completed") {
        if (isBackgroundCompletion) {
          // For user exits or background completion, use the current timeElapsed
          displayTime = timeElapsed;
          console.log(
            ` User exit/background completion - using timeElapsed: ${timeElapsed}`
          );
        } else if (timeElapsed === 0) {
          // NEW: If timeElapsed is 0, this indicates a timer reset
          displayTime = 0;
          console.log(` Timer reset detected - using 0: ${timeElapsed}`);
        } else if (finalTimeRef.current > 0) {
          // For normal completion, use the captured final time
          displayTime = finalTimeRef.current;
          console.log(
            `Normal completion - using finalTimeRef: ${finalTimeRef.current}`
          );
        } else {
          // Fallback to current elapsed time
          displayTime = timeElapsed;
          console.log(`Fallback - using timeElapsed: ${timeElapsed}`);
        }
      } else if (gameStatus === "playing") {
        displayTime = timeElapsed || progressTime;
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
      timeElapsed,
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

    return (
      <GameContainer
        title="Fill in the Blank"
        timerRunning={timerRunning}
        gameStatus={gameStatus}
        difficulty={difficulty}
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
            rewardInfo={rewardInfo}
            onTimerReset={handleTimerReset}
          />
        )}
      </GameContainer>
    );
  }
);

export default FillInTheBlank;
