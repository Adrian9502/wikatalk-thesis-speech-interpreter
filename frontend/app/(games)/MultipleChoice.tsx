import React, { useEffect, useMemo, useCallback, useRef } from "react";
import useGameStore from "@/store/games/useGameStore";
import GameContainer from "@/components/games/GameContainer";
import GamePlayingContent from "@/components/games/GamePlayingContent";
import GameCompletedContent from "@/components/games/GameCompletedContent";
import { useGameInitialization } from "@/hooks/useGameInitialization";
import MultipleChoicePlayingContent from "@/components/games/multipleChoice/MultipleChoicePlayingContent";
import { useUserProgress } from "@/hooks/useUserProgress";

interface MultipleChoiceProps {
  levelId: number;
  levelData: any;
  difficulty?: string;
  isStarted?: boolean;
}

const MultipleChoice: React.FC<MultipleChoiceProps> = React.memo(
  ({ levelId, levelData, difficulty = "easy", isStarted = false }) => {
    // NEW: Track if initial setup is complete
    const initialSetupComplete = useRef(false);
    const lastProgressTimeRef = useRef<number>(0);
    const gameStartedRef = useRef(false);

    // Get user progress
    const { progress, updateProgress } = useUserProgress(
      levelData?.questionId || levelId
    );

    // Get quiz store state and actions
    const {
      gameState: { score, gameStatus, timerRunning, timeElapsed },
      multipleChoiceState: { selectedOption, currentQuestion },
      initialize,
      startGame,
      handleRestart,
      handleOptionSelect,
      setTimeElapsed,
      setTimerRunning,
    } = useGameStore();

    // FIXED: Set initial time from progress when component mounts - prevent multiple calls
    useEffect(() => {
      if (progress && !Array.isArray(progress)) {
        const progressTime = progress.totalTimeSpent || 0;

        // Only update if time has actually changed and we haven't done initial setup
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
    }, [progress, setTimeElapsed]);

    // FIXED: Better option selection handler with proper time capture
    const handleOptionSelectWithProgress = useCallback(
      async (optionId: string) => {
        try {
          console.log(`[MultipleChoice] Option selected: ${optionId}`);

          // FIXED: Get current time from store first, then stop timer
          const currentTime = useGameStore.getState().gameState.timeElapsed;
          console.log(`[MultipleChoice] Time captured: ${currentTime}`);

          // Stop the timer
          setTimerRunning(false);

          // Get if the answer is correct
          const isCorrect = !!currentQuestion?.options.find(
            (option) => option.id === optionId && option.isCorrect
          );

          // Call the option select handler in quiz store
          handleOptionSelect(optionId);

          // Update progress with completion status immediately
          console.log(
            `[MultipleChoice] Updating progress - Time: ${currentTime}, Correct: ${isCorrect}, Completed: ${isCorrect}`
          );

          const updatedProgress = await updateProgress(
            currentTime,
            isCorrect,
            isCorrect
          );

          if (updatedProgress) {
            console.log(`[MultipleChoice] Progress updated successfully`);
          }
        } catch (error) {
          console.error("[MultipleChoice] Error in option selection:", error);
        }
      },
      [
        currentQuestion?.options,
        setTimerRunning,
        handleOptionSelect,
        updateProgress,
      ]
    );

    // PERFORMANCE: Memoize restart handler
    const handleRestartWithProgress = useCallback(async () => {
      handleRestart();

      // Reset timer to continue from where they left off if they have progress
      const progressTime =
        progress && !Array.isArray(progress) ? progress.totalTimeSpent || 0 : 0;
      setTimeElapsed(progressTime);
      lastProgressTimeRef.current = progressTime;
      gameStartedRef.current = false;

      console.log(
        `[MultipleChoice] Restarting game with time: ${progressTime}`
      );
    }, [handleRestart, progress, setTimeElapsed]);

    // FIXED: Stable game config that doesn't change on every render
    const gameConfig = useMemo(() => {
      const progressTime =
        progress && !Array.isArray(progress) ? progress.totalTimeSpent || 0 : 0;

      // FIXED: Better focus area extraction with fallbacks
      const focusArea =
        currentQuestion?.focusArea ||
        levelData?.focusArea ||
        levelData?.questions?.[0]?.focusArea ||
        "Vocabulary";

      return {
        focusArea,
        selectedAnswerText:
          currentQuestion?.options?.find((o) => o.id === selectedOption)
            ?.text || "",
        isSelectedCorrect:
          currentQuestion?.options?.find((o) => o.id === selectedOption)
            ?.isCorrect || false,
        initialTime: progressTime,
      };
    }, [
      currentQuestion?.focusArea,
      currentQuestion?.options,
      levelData?.focusArea,
      levelData?.questions,
      selectedOption,
      progress,
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

    // REMOVED: Excessive logging that was causing performance issues
    // Only log when game starts for the first time
    if (gameStatus === "playing" && !gameStartedRef.current) {
      console.log(
        `[MultipleChoice] Game started with initialTime: ${gameConfig.initialTime}`
      );
      gameStartedRef.current = true;
    }

    // Get next level data for navigation
    const { getLevelData } = useGameStore();

    const nextLevelData = useMemo(() => {
      const nextLevelId = levelId + 1;
      const nextLevel = getLevelData("multipleChoice", nextLevelId, difficulty);

      if (nextLevel && nextLevel.levelData) {
        return {
          title: nextLevel.levelData.title,
          level: nextLevel.levelData.level,
        };
      } else if (nextLevel) {
        return {
          title: nextLevel.title,
          level: nextLevel.level,
        };
      }

      return null;
    }, [levelId, difficulty, getLevelData]);

    // Helper function to get next level title
    const getNextLevelTitle = () => {
      if (nextLevelData?.level && nextLevelData?.title) {
        return `${nextLevelData.level} - ${nextLevelData.title}`;
      } else if (nextLevelData?.level) {
        return nextLevelData.level;
      } else if (nextLevelData?.title) {
        return `Level ${levelId + 1} - ${nextLevelData.title}`;
      }
      return `Level ${levelId + 1}`;
    };

    // UPDATED: Handle timer reset callback - don't restart immediately
    const handleTimerReset = useCallback(() => {
      // REMOVED: Don't call handleRestart() immediately
      // The user will restart manually after seeing the success message

      // Reset the initial time to 0 for future restarts
      if (progress && !Array.isArray(progress)) {
        // Force progress to be cleared locally so timer starts from 0
        setTimeElapsed(0);
        lastProgressTimeRef.current = 0;
        initialSetupComplete.current = true;
      }

      console.log(
        `[MultipleChoice] Timer reset completed, user can restart manually`
      );
    }, [setTimeElapsed, progress]);

    return (
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
        finalTime={timeElapsed}
        levelId={levelId} // Pass levelId
        onTimerReset={handleTimerReset} // Pass callback
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
          // GameCompletedContent remains unchanged
          <GameCompletedContent
            score={score}
            timeElapsed={timeElapsed}
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
          />
        )}
      </GameContainer>
    );
  }
);

export default MultipleChoice;
