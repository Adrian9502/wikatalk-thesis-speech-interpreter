import React, { useMemo, useCallback, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BASE_COLORS } from "@/constant/colors";
import useGameStore from "@/store/games/useGameStore";
import gameSharedStyles from "@/styles/gamesSharedStyles";
import GameContainer from "@/components/games/GameContainer";
import GamePlayingContent from "@/components/games/GamePlayingContent";
import GameCompletedContent from "@/components/games/GameCompletedContent";
import { useGameInitialization } from "@/hooks/useGameInitialization";
import { router } from "expo-router";
import IdentificationPlayingContent from "@/components/games/identification/IdentificationPlayingContent";
import { useNextLevelData } from "@/utils/games/levelUtils";
import { useGameProgress } from "@/hooks/games/useGameProgress";
import { useGameRestart } from "@/hooks/games/useGameRestart";
import { useTimerReset } from "@/hooks/games/useTimerReset";
import useProgressStore from "@/store/games/useProgressStore";

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
      gameState: { score, gameStatus, timerRunning, timeElapsed },
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
    } = useGameStore();

    // Custom hooks for shared logic
    const { updateProgress, fetchProgress, isRestartingRef, restartLockRef } =
      useGameProgress(levelData, levelId);

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

    // Add finalTimeRef at the top of the component
    const finalTimeRef = useRef<number>(0);

    // ADDED: Reset finalTimeRef when game restarts
    useEffect(() => {
      if (gameStatus === "idle" || gameStatus === "playing") {
        finalTimeRef.current = 0;
        console.log(`[Identification] Reset finalTimeRef on game restart`);
      }
    }, [gameStatus]);

    // Handle word selection with progress update
    const handleWordSelectWithProgress = useCallback(
      async (wordIndex: number) => {
        try {
          console.log(`[Identification] Word selected at index: ${wordIndex}`);

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
            isCorrect
          );

          if (updatedProgress) {
            console.log(`[Identification] Progress updated successfully`);

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
      ]
    );

    // FIXED: Game configuration with better final time logic
    const gameConfig = useMemo(() => {
      const currentSentence = sentences[currentSentenceIndex];

      const focusArea =
        currentSentence?.focusArea ||
        levelData?.focusArea ||
        sentences?.[0]?.focusArea ||
        "Vocabulary";

      const selectedAnswerText =
        selectedWord !== null && words[selectedWord]
          ? typeof words[selectedWord]?.text === "string"
            ? words[selectedWord]?.text
            : typeof words[selectedWord]?.clean === "string"
            ? words[selectedWord]?.clean
            : "Unknown"
          : "Unknown";

      // CRITICAL: Better final time logic
      let displayTime = 0;
      if (gameStatus === "completed" && finalTimeRef.current > 0) {
        displayTime = finalTimeRef.current; // This exact value will be used everywhere
      } else if (gameStatus === "playing") {
        displayTime = timeElapsed;
      }

      console.log(
        `[Identification] Using EXACT final time: ${displayTime} (finalTimeRef: ${finalTimeRef.current})`
      );

      return {
        currentSentence,
        focusArea,
        selectedAnswerText,
        isCorrect: feedback === "correct",
        question: currentSentence?.sentence || currentSentence?.question || "",
        initialTime: 0,
        finalTime: displayTime,
      };
    }, [
      sentences,
      currentSentenceIndex,
      selectedWord,
      words,
      levelData?.focusArea,
      feedback,
      gameStatus,
      timeElapsed, // Add timeElapsed dependency
    ]);

    // CRITICAL: Initialize game with proper logging
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

    // ADDED: Force start game if stuck in idle after initialization
    useEffect(() => {
      if (
        levelData &&
        gameStatus === "idle" &&
        isStarted &&
        sentences.length > 0 &&
        words.length > 0
      ) {
        console.log(
          `[Identification] Game seems stuck in idle, force starting...`
        );

        // Small delay then force start
        const timer = setTimeout(() => {
          console.log(`[Identification] Force calling startGame()`);
          startGame();
        }, 500);

        return () => clearTimeout(timer);
      }
    }, [
      levelData,
      gameStatus,
      isStarted,
      sentences.length,
      words.length,
      startGame,
    ]);

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
                borderRadius: 16,
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
      <GameContainer
        title="Word Identification"
        timerRunning={timerRunning}
        gameStatus={gameStatus}
        difficulty={difficulty}
        focusArea={gameConfig.focusArea}
        showTimer={true}
        initialTime={gameConfig.initialTime}
        isStarted={isStarted}
        finalTime={gameConfig.finalTime} // Use consistent final time
        levelId={levelId}
        onTimerReset={handleTimerReset}
        isCorrectAnswer={gameConfig.isCorrect}
      >
        {gameStatus === "playing" ? (
          <GamePlayingContent
            timerRunning={timerRunning}
            difficulty={difficulty}
            focusArea={gameConfig.focusArea}
            isStarted={isStarted}
            gameStatus={gameStatus}
            initialTime={gameConfig.initialTime}
            levelString={gameConfig.currentSentence?.level}
            actualTitle={gameConfig.currentSentence?.title}
          >
            <IdentificationPlayingContent
              difficulty={difficulty}
              levelData={levelData}
              currentSentence={gameConfig.currentSentence}
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
            timeElapsed={gameConfig.finalTime} // Use consistent final time
            difficulty={difficulty}
            question={gameConfig.question}
            userAnswer={gameConfig.selectedAnswerText}
            isCorrect={gameConfig.isCorrect}
            levelId={levelId}
            gameMode="identification"
            gameTitle="Word Identification"
            onRestart={handleRestartWithProgress}
            focusArea={gameConfig.focusArea}
            levelString={gameConfig.currentSentence?.level}
            actualTitle={gameConfig.currentSentence?.title}
            nextLevelTitle={getNextLevelTitle()}
            isCurrentLevelCompleted={gameConfig.isCorrect}
            isCorrectAnswer={gameConfig.isCorrect}
          />
        )}
      </GameContainer>
    );
  }
);

export default Identification;
