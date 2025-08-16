import React, {
  useCallback,
  useRef,
  useMemo,
  useEffect,
  useState,
} from "react";
import { View, Text, TouchableOpacity } from "react-native";
import useGameStore from "@/store/games/useGameStore";
import GameContainer from "@/components/games/GameContainer";
import GamePlayingContent from "@/components/games/GamePlayingContent";
import GameCompletedContent from "@/components/games/GameCompletedContent";
import { useGameInitialization } from "@/hooks/useGameInitialization";
import IdentificationPlayingContent from "@/components/games/identification/IdentificationPlayingContent";
import { useNextLevelData } from "@/utils/games/levelUtils";
import { useGameProgress } from "@/hooks/games/useGameProgress";
import { useGameRestart } from "@/hooks/games/useGameRestart";
import { useTimerReset } from "@/hooks/games/useTimerReset";
import { useAppStateProgress } from "@/hooks/games/useAppStateProgress";
import useProgressStore from "@/store/games/useProgressStore";
import useCoinsStore from "@/store/games/useCoinsStore";
import { router } from "expo-router";
import { BASE_COLORS } from "@/constant/colors";
import gameSharedStyles from "@/styles/gamesSharedStyles";

interface IdentificationProps {
  levelId: number;
  levelData: any;
  difficulty?: string;
  isStarted?: boolean;
}

const Identification: React.FC<IdentificationProps> = React.memo(
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
      identificationState: {
        sentences,
        currentSentenceIndex,
        words,
        selectedWord,
        showTranslation,
        feedback,
      },
      error,
      initialize,
      startGame,
      handleRestart,
      handleWordSelect,
      toggleIdentificationTranslation: toggleTranslation,
      setTimeElapsed,
      setTimerRunning,
      setBackgroundCompletion,
    } = useGameStore();

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
      "identification",
      levelId,
      difficulty
    );

    const handleRestartWithProgress = useGameRestart(
      isRestartingRef,
      restartLockRef,
      fetchProgress,
      handleRestart,
      setTimeElapsed,
      "Identification"
    );

    const handleTimerReset = useTimerReset(setTimeElapsed, "Identification");

    // ADD: App state monitoring for auto-save
    const { resetAutoSaveFlag, handleUserExit } = useAppStateProgress({
      levelData,
      levelId,
      gameMode: "identification",
    });
    const [rewardInfo, setRewardInfo] = useState<any>(null);

    // Add finalTimeRef at the top of the component
    const finalTimeRef = useRef<number>(0);

    // UPDATED: Reset finalTimeRef when game restarts
    const hasResetForSessionRef = useRef(false);

    // FIXED: Only reset flags once per game restart, not on every status change
    useEffect(() => {
      if (
        (gameStatus === "idle" || gameStatus === "playing") &&
        !hasResetForSessionRef.current
      ) {
        finalTimeRef.current = 0;
        resetAutoSaveFlag();
        hasResetForSessionRef.current = true;

        console.log(
          `[Identification] Reset finalTimeRef and auto-save flag on game restart`
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

    // UPDATED: Handle word selection with reward notification
    const handleWordSelectWithProgress = useCallback(
      async (wordIndex: number) => {
        try {
          const preciseTime = timeElapsed;
          const exactFinalTime = Math.round(preciseTime * 100) / 100;
          finalTimeRef.current = exactFinalTime;

          console.log(
            `[Identification] Final time captured: ${exactFinalTime}s (will be used everywhere)`
          );

          setTimerRunning(false);

          const isCorrect =
            words[wordIndex]?.clean?.toLowerCase() ===
            sentences[currentSentenceIndex]?.answer?.toLowerCase();

          handleWordSelect(wordIndex);

          console.log(
            `[Identification] Updating progress - Time: ${exactFinalTime}, Correct: ${isCorrect}, Completed: ${isCorrect}`
          );

          // UPDATED: Pass difficulty to updateProgress
          const updatedProgress = await updateProgress(
            exactFinalTime,
            isCorrect,
            isCorrect,
            difficulty // NEW: Pass difficulty for reward calculation
          );

          if (updatedProgress) {
            console.log(`[Identification] Progress updated successfully`);

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

            // ADDED: Force refresh enhanced progress cache for ALL answers (correct AND incorrect)
            const progressStore = useProgressStore.getState();
            progressStore.enhancedProgress["identification"] = null; // Clear cache
            progressStore.lastUpdated = Date.now(); // Trigger UI updates

            console.log(
              `[Identification] Enhanced progress cache cleared for immediate refresh`
            );
          }
        } catch (error) {
          console.error("[Identification] Error in word selection:", error);
        }
      },
      [
        words,
        sentences,
        currentSentenceIndex,
        timeElapsed,
        setTimerRunning,
        handleWordSelect,
        updateProgress,
        difficulty, // NEW: Add difficulty dependency
        fetchCoinsBalance, // NEW: Add fetchCoinsBalance dependency
      ]
    );
    const handleUserExitWithSave = useCallback(async () => {
      console.log("[identification] User exit triggered");

      try {
        const success = await handleUserExit();
        if (success) {
          console.log("[identification] User exit processed successfully");
        } else {
          console.error("[identification] User exit processing failed");
        }
      } catch (error) {
        console.error("[identification] Error during user exit:", error);
      }
    }, [handleUserExit]);
    // UPDATED: Game configuration to handle background completion
    const gameConfig = useMemo(() => {
      const currentSentence = sentences[currentSentenceIndex];

      const focusArea =
        currentSentence?.focusArea ||
        levelData?.focusArea ||
        sentences?.[0]?.focusArea ||
        "Vocabulary";

      // FIXED: Get progress time like MultipleChoice does
      const progressTime =
        progress && !Array.isArray(progress) ? progress.totalTimeSpent || 0 : 0;

      // NEW: Handle background completion case
      let selectedAnswerText = "";
      let isCorrect = false;
      let isUserExit = false;

      if (isBackgroundCompletion) {
        selectedAnswerText = "No answer selected";
        isCorrect = false;
      } else {
        selectedAnswerText =
          selectedWord !== null && words[selectedWord]
            ? typeof words[selectedWord]?.text === "string"
              ? words[selectedWord]?.text
              : typeof words[selectedWord]?.clean === "string"
              ? words[selectedWord]?.clean
              : "Unknown"
            : "Unknown";
        isCorrect = feedback === "correct";
      }

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

      return {
        currentSentence,
        focusArea,
        selectedAnswerText,
        isCorrect,
        question: currentSentence?.sentence || currentSentence?.question || "",
        initialTime: progressTime,
        finalTime: displayTime,
        isBackgroundCompletion,
        isUserExit,
      };
    }, [
      sentences,
      currentSentenceIndex,
      selectedWord,
      words,
      levelData?.focusArea,
      feedback,
      gameStatus,
      timeElapsed,
      isBackgroundCompletion,
      progress,
    ]);

    useGameInitialization(
      levelData,
      levelId,
      "identification",
      difficulty,
      isStarted,
      initialize,
      startGame,
      gameStatus,
      timerRunning,
      gameConfig.initialTime
    );

    // Error state handling
    if (error) {
      return (
        <GameContainer
          title="Word Identification"
          timerRunning={timerRunning}
          gameStatus={gameStatus}
        >
          <View style={gameSharedStyles.loaderContainer}>
            <Text
              style={{
                color: BASE_COLORS.white,
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              {error}
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: BASE_COLORS.blue,
                padding: 12,
                borderRadius: 20,
              }}
              onPress={() => router.back()}
            >
              <Text style={{ color: BASE_COLORS.white }}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </GameContainer>
      );
    }

    return (
      <>
        <GameContainer
          title="Word Identification"
          timerRunning={timerRunning}
          gameStatus={gameStatus}
          variant="triple"
          difficulty={difficulty}
          showTimer={true}
          initialTime={gameConfig.initialTime}
          isStarted={isStarted}
          finalTime={gameConfig.finalTime}
          levelId={levelId}
          onTimerReset={handleTimerReset}
          isCorrectAnswer={gameConfig.isCorrect}
          onUserExit={handleUserExitWithSave}
        >
          {gameStatus === "playing" ? (
            <GamePlayingContent
              timerRunning={timerRunning}
              difficulty={difficulty}
              isStarted={isStarted}
              gameStatus={gameStatus}
              initialTime={gameConfig.initialTime}
              levelString={sentences[currentSentenceIndex]?.level}
              actualTitle={sentences[currentSentenceIndex]?.title}
            >
              <IdentificationPlayingContent
                difficulty={difficulty}
                levelData={levelData}
                currentSentence={sentences[currentSentenceIndex]}
                words={words}
                selectedWord={selectedWord}
                showTranslation={showTranslation}
                toggleTranslation={toggleTranslation}
                handleWordSelect={handleWordSelectWithProgress}
              />
            </GamePlayingContent>
          ) : (
            <GameCompletedContent
              score={score}
              timeElapsed={gameConfig.finalTime}
              difficulty={difficulty}
              question={gameConfig.question}
              userAnswer={gameConfig.selectedAnswerText}
              isCorrect={gameConfig.isCorrect}
              levelId={levelId}
              gameMode="identification"
              gameTitle="Word Identification"
              onRestart={handleRestartWithProgress}
              focusArea={gameConfig.focusArea}
              levelString={sentences[currentSentenceIndex]?.level}
              actualTitle={sentences[currentSentenceIndex]?.title}
              nextLevelTitle={getNextLevelTitle()}
              isCurrentLevelCompleted={gameConfig.isCorrect}
              isCorrectAnswer={gameConfig.isCorrect}
              isBackgroundCompletion={gameConfig.isBackgroundCompletion}
              isUserExit={gameConfig.isUserExit}
              rewardInfo={rewardInfo}
              onTimerReset={handleTimerReset}
            />
          )}
        </GameContainer>
      </>
    );
  }
);

export default Identification;
