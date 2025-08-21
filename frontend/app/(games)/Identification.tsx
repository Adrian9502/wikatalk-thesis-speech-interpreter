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
import useHintStore from "@/store/games/useHintStore"; // NEW: Add hint store
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

    // Coins store for balance refresh
    const { fetchCoinsBalance } = useCoinsStore();

    // NEW: Hint store for reset functionality
    const { resetQuestionHints } = useHintStore();

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

    // App state monitoring for auto-save
    const { resetAutoSaveFlag, handleUserExit } = useAppStateProgress({
      levelData,
      levelId,
      gameMode: "identification",
    });
    const [rewardInfo, setRewardInfo] = useState<any>(null);

    // Add finalTimeRef at the top of the component
    const finalTimeRef = useRef<number>(0);

    // Reset finalTimeRef when game restarts
    const hasResetForSessionRef = useRef(false);

    // Reset flags once per game restart
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

        if (isBackgroundCompletion) {
          setBackgroundCompletion(false);
        }
      }

      if (gameStatus === "completed") {
        hasResetForSessionRef.current = false;
      }
    }, [
      gameStatus,
      resetAutoSaveFlag,
      setBackgroundCompletion,
      isBackgroundCompletion,
    ]);

    // Handle word selection with reward notification
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

          const updatedProgress = await updateProgress(
            exactFinalTime,
            isCorrect,
            isCorrect,
            difficulty
          );

          if (updatedProgress) {
            console.log(`[Identification] Progress updated successfully`);

            if (
              updatedProgress.rewardInfo &&
              updatedProgress.rewardInfo.coins > 0
            ) {
              setRewardInfo(updatedProgress.rewardInfo);
              setTimeout(() => {
                fetchCoinsBalance(true);
              }, 500);
            }

            const progressStore = useProgressStore.getState();
            progressStore.enhancedProgress["identification"] = null;
            progressStore.lastUpdated = Date.now();

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
        difficulty,
        fetchCoinsBalance,
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

    // NEW: Enhanced restart with hint reset
    const handleRestartWithHints = useCallback(async () => {
      resetQuestionHints();
      await handleRestartWithProgress();
    }, [resetQuestionHints, handleRestartWithProgress]);

    // NEW: Generate questionId for hint system
    const questionId = useMemo(() => {
      const currentSentence = sentences[currentSentenceIndex];
      return `${currentSentence?.id || levelId}_${difficulty}`;
    }, [sentences, currentSentenceIndex, levelId, difficulty]);

    // Game configuration to handle background completion
    const gameConfig = useMemo(() => {
      const currentSentence = sentences[currentSentenceIndex];

      const focusArea =
        currentSentence?.focusArea ||
        levelData?.focusArea ||
        sentences?.[0]?.focusArea ||
        "Vocabulary";

      const progressTime =
        progress && !Array.isArray(progress) ? progress.totalTimeSpent || 0 : 0;

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
          displayTime = timeElapsed;
          console.log(
            `User exit/background completion - using timeElapsed: ${timeElapsed}`
          );
        } else if (timeElapsed === 0) {
          displayTime = 0;
          console.log(`Timer reset detected - using 0: ${timeElapsed}`);
        } else if (finalTimeRef.current > 0) {
          displayTime = finalTimeRef.current;
          console.log(
            `Normal completion - using finalTimeRef: ${finalTimeRef.current}`
          );
        } else {
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
          currentRewardInfo={rewardInfo}
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
                questionId={questionId}
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
              onRestart={handleRestartWithHints}
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
