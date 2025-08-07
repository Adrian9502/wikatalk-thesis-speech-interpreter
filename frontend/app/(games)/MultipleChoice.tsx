import React, {
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useState,
} from "react";
import useGameStore from "@/store/games/useGameStore";
import GameContainer from "@/components/games/GameContainer";
import GamePlayingContent from "@/components/games/GamePlayingContent";
import GameCompletedContent from "@/components/games/GameCompletedContent";
import { useGameInitialization } from "@/hooks/useGameInitialization";
import MultipleChoicePlayingContent from "@/components/games/multipleChoice/MultipleChoicePlayingContent";
import { useNextLevelData } from "@/utils/games/levelUtils";
import { useGameProgress } from "@/hooks/games/useGameProgress";
import { useGameRestart } from "@/hooks/games/useGameRestart";
import { useTimerReset } from "@/hooks/games/useTimerReset";
import { useAppStateProgress } from "@/hooks/games/useAppStateProgress";
import useProgressStore from "@/store/games/useProgressStore";
import useCoinsStore from "@/store/games/useCoinsStore"; // NEW: Import coins store
import RewardNotification from "@/components/games/RewardNotification"; // NEW: Import reward component

interface MultipleChoiceProps {
  levelId: number;
  levelData: any;
  difficulty?: string;
  isStarted?: boolean;
}

const MultipleChoice: React.FC<MultipleChoiceProps> = React.memo(
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
      multipleChoiceState: { selectedOption, currentQuestion },
      initialize,
      startGame,
      handleRestart,
      handleOptionSelect,
      setTimeElapsed,
      setTimerRunning,
      setBackgroundCompletion,
    } = useGameStore();

    // NEW: Reward state
    const [showReward, setShowReward] = useState(false);
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
      "multipleChoice",
      levelId,
      difficulty
    );

    const handleRestartWithProgress = useGameRestart(
      isRestartingRef,
      restartLockRef,
      fetchProgress,
      handleRestart,
      setTimeElapsed,
      "MultipleChoice"
    );

    const handleTimerReset = useTimerReset(setTimeElapsed, "MultipleChoice");

    // ADD: App state monitoring for auto-save
    const { resetAutoSaveFlag, handleUserExit } = useAppStateProgress({
      levelData,
      levelId,
      gameMode: "multipleChoice",
    });

    // Track initial setup
    const initialSetupComplete = useRef(false);
    const lastProgressTimeRef = useRef<number>(0);
    const gameStartedRef = useRef(false);
    const finalTimeRef = useRef<number>(0);
    // NEW: Add ref to track if we've already reset for this game session
    const hasResetForSessionRef = useRef(false);

    // FIXED: Only reset flags once per game restart, not on every status change
    useEffect(() => {
      if (
        (gameStatus === "idle" || gameStatus === "playing") &&
        !hasResetForSessionRef.current
      ) {
        // Reset final time when starting new game session
        finalTimeRef.current = 0;
        resetAutoSaveFlag(); // Reset auto-save flag
        hasResetForSessionRef.current = true; // Mark as reset for this session

        console.log(
          `[MultipleChoice] Reset finalTimeRef and auto-save flag on game restart`
        );

        // Reset background completion flag separately to avoid infinite loop
        if (isBackgroundCompletion) {
          setBackgroundCompletion(false);
        }
      }

      // Reset the session flag when game completes to allow next reset
      if (gameStatus === "completed") {
        hasResetForSessionRef.current = false;
      }
    }, [
      gameStatus,
      resetAutoSaveFlag,
      setBackgroundCompletion,
      isBackgroundCompletion,
    ]);

    // Set initial time from progress with deduplication prevention
    useEffect(() => {
      if (isRestartingRef.current || restartLockRef.current) return;

      // ADDED: Don't update progress time after game completion
      if (gameStatus === "completed") {
        console.log(
          `[MultipleChoice] Game completed, skipping progress time update`
        );
        return;
      }

      if (progress && !Array.isArray(progress)) {
        const progressTime = progress.totalTimeSpent || 0;

        if (
          progressTime !== lastProgressTimeRef.current ||
          !initialSetupComplete.current
        ) {
          console.log(
            `[MultipleChoice] Setting initial time from progress: ${progressTime} (was: ${lastProgressTimeRef.current})`
          );

          lastProgressTimeRef.current = progressTime;
          setTimeElapsed(progressTime);
          initialSetupComplete.current = true;
        }
      } else if (!initialSetupComplete.current) {
        console.log(`[MultipleChoice] No previous progress, starting from 0`);
        setTimeElapsed(0);
        lastProgressTimeRef.current = 0;
        initialSetupComplete.current = true;
      }
    }, [progress, setTimeElapsed, isRestartingRef, restartLockRef, gameStatus]); // ADD gameStatus dependency

    // UPDATED: Handle option selection with reward notification
    const handleOptionSelectWithProgress = useCallback(
      async (optionId: string) => {
        try {
          console.log(`[MultipleChoice] Option selected: ${optionId}`);

          if (selectedOption) {
            console.log(`[MultipleChoice] Option already selected, ignoring`);
            return;
          }

          const gameStore = useGameStore.getState();
          const preciseTime = gameStore.gameState.timeElapsed;

          // FIXED: Use higher precision rounding for final time
          const exactFinalTime = Math.round(preciseTime * 100) / 100;
          finalTimeRef.current = exactFinalTime;

          console.log(
            `[MultipleChoice] Exact final time captured: ${exactFinalTime}s (precise: ${preciseTime})`
          );

          setTimerRunning(false);

          const isCorrect = !!currentQuestion?.options.find(
            (option) => option.id === optionId && option.isCorrect
          );

          handleOptionSelect(optionId);

          console.log(
            `[MultipleChoice] Updating progress - Time: ${exactFinalTime}, Correct: ${isCorrect}, Completed: ${isCorrect}`
          );

          // UPDATED: Pass difficulty to updateProgress
          const updatedProgress = await updateProgress(
            exactFinalTime,
            isCorrect,
            isCorrect,
            difficulty // NEW: Pass difficulty for reward calculation
          );

          if (updatedProgress) {
            console.log(`[MultipleChoice] Progress updated successfully`);

            // NEW: Handle reward display and coins refresh
            if (
              updatedProgress.rewardInfo &&
              updatedProgress.rewardInfo.coins > 0
            ) {
              setRewardInfo(updatedProgress.rewardInfo);
              setShowReward(true);

              // Refresh coins balance to show updated amount
              setTimeout(() => {
                fetchCoinsBalance(true);
              }, 500);
            }

            const progressStore = useProgressStore.getState();
            progressStore.enhancedProgress["multipleChoice"] = null;
            progressStore.lastUpdated = Date.now();

            console.log(
              `[MultipleChoice] Enhanced progress cache cleared for immediate refresh`
            );
          }
        } catch (error) {
          console.error("[MultipleChoice] Error in option selection:", error);
        }
      },
      [
        currentQuestion?.options,
        selectedOption,
        setTimerRunning,
        handleOptionSelect,
        updateProgress,
        difficulty, // NEW: Add difficulty dependency
        fetchCoinsBalance, // NEW: Add fetchCoinsBalance dependency
      ]
    );

    // NEW: Handle reward notification completion
    const handleRewardComplete = useCallback(() => {
      setShowReward(false);
      setRewardInfo(null);
    }, []);

    const gameConfig = useMemo(() => {
      const progressTime =
        progress && !Array.isArray(progress) ? progress.totalTimeSpent || 0 : 0;

      const focusArea =
        currentQuestion?.focusArea ||
        levelData?.focusArea ||
        levelData?.questions?.[0]?.focusArea ||
        "Vocabulary";

      let displayTime = progressTime;

      if (gameStatus === "completed") {
        if (isBackgroundCompletion) {
          // For user exits or background completion, use the current timeElapsed
          displayTime = timeElapsed;
          console.log(
            `User exit/background completion - using timeElapsed: ${timeElapsed}`
          );
        } else if (timeElapsed === 0) {
          // NEW: If timeElapsed is 0, this indicates a timer reset
          displayTime = 0;
          console.log(`Timer reset detected - using 0: ${timeElapsed}`);
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

      // Handle different exit scenarios
      let selectedAnswerText = "";
      let isSelectedCorrect = false;
      let isUserExit = false; // NEW

      if (isBackgroundCompletion) {
        // Check if this was a user-initiated exit vs background
        // For now, we'll assume background completion from app state changes
        selectedAnswerText = "No answer provided";
        isSelectedCorrect = false;
        // You could add logic here to distinguish user exit vs background
      } else {
        selectedAnswerText =
          currentQuestion?.options?.find((o) => o.id === selectedOption)
            ?.text || "";
        isSelectedCorrect =
          currentQuestion?.options?.find((o) => o.id === selectedOption)
            ?.isCorrect || false;
      }

      return {
        focusArea,
        selectedAnswerText,
        isSelectedCorrect,
        initialTime: progressTime,
        finalTime: displayTime,
        isBackgroundCompletion,
        isUserExit, // NEW
      };
    }, [
      currentQuestion,
      levelData,
      selectedOption,
      progress,
      gameStatus,
      timeElapsed,
      isBackgroundCompletion,
    ]);

    // Initialize game
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
      gameConfig.initialTime
    );

    // Track game start
    useEffect(() => {
      if (gameStatus === "playing" && !gameStartedRef.current) {
        console.log(
          `[MultipleChoice] Game started with initialTime: ${gameConfig.initialTime}`
        );
        gameStartedRef.current = true;
      }
    }, [gameStatus, gameConfig.initialTime]);

    // NEW: Handle user exit
    const handleUserExitWithSave = useCallback(async () => {
      console.log("[MultipleChoice] User exit triggered");

      try {
        const success = await handleUserExit();
        if (success) {
          console.log("[MultipleChoice] User exit processed successfully");
        } else {
          console.error("[MultipleChoice] User exit processing failed");
        }
      } catch (error) {
        console.error("[MultipleChoice] Error during user exit:", error);
      }
    }, [handleUserExit]);

    return (
      <>
        <GameContainer
          title="Multiple Choice"
          timerRunning={timerRunning}
          gameStatus={gameStatus}
          variant="triple"
          difficulty={difficulty}
          focusArea={gameConfig.focusArea}
          showTimer={true}
          initialTime={gameConfig.initialTime}
          isStarted={isStarted}
          finalTime={gameConfig.finalTime}
          levelId={levelId}
          onTimerReset={handleTimerReset}
          isCorrectAnswer={gameConfig.isSelectedCorrect}
          onUserExit={handleUserExitWithSave}
        >
          {gameStatus === "playing" ? (
            <GamePlayingContent
              timerRunning={timerRunning}
              difficulty={difficulty}
              isStarted={isStarted}
              focusArea={gameConfig.focusArea}
              gameStatus={gameStatus}
              initialTime={gameConfig.initialTime}
              levelString={currentQuestion?.level}
              actualTitle={currentQuestion?.title}
            >
              <MultipleChoicePlayingContent
                difficulty={difficulty}
                levelData={levelData}
                currentQuestion={currentQuestion}
                selectedOption={selectedOption}
                handleOptionSelect={handleOptionSelectWithProgress}
                isStarted={isStarted}
              />
            </GamePlayingContent>
          ) : (
            <GameCompletedContent
              score={score}
              timeElapsed={gameConfig.finalTime}
              difficulty={difficulty}
              question={currentQuestion?.question || ""}
              userAnswer={gameConfig.selectedAnswerText}
              isCorrect={gameConfig.isSelectedCorrect}
              levelId={levelId}
              gameMode="multipleChoice"
              gameTitle="Multiple Choice"
              onRestart={handleRestartWithProgress}
              focusArea={gameConfig.focusArea}
              levelString={currentQuestion?.level}
              actualTitle={currentQuestion?.title}
              nextLevelTitle={getNextLevelTitle()}
              isCurrentLevelCompleted={gameConfig.isSelectedCorrect}
              isCorrectAnswer={gameConfig.isSelectedCorrect}
              isBackgroundCompletion={gameConfig.isBackgroundCompletion}
              isUserExit={gameConfig.isUserExit}
            />
          )}
        </GameContainer>

        {/* NEW: Reward Notification */}
        <RewardNotification
          visible={showReward}
          rewardInfo={rewardInfo}
          onComplete={handleRewardComplete}
        />
      </>
    );
  }
);

export default MultipleChoice;
