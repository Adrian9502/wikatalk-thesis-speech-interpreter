import React, { useEffect, useMemo, useCallback } from "react";
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
import { useUserProgress } from "@/hooks/useUserProgress";
// NEW: Import the utility function
import { useNextLevelData } from "@/utils/games/levelUtils";

interface IdentificationProps {
  levelId: number;
  levelData: any;
  difficulty?: string;
  isStarted?: boolean;
}

const Identification: React.FC<IdentificationProps> = React.memo(
  ({ levelId, levelData, difficulty = "easy", isStarted = false }) => {
    // user progress hook
    const { progress, updateProgress } = useUserProgress(
      levelData?.questionId || levelId
    );

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

    // NEW: Use the utility hook for next level data
    const { getNextLevelTitle } = useNextLevelData(
      "identification",
      levelId,
      difficulty
    );

    // Set initial time from progress when component mounts
    useEffect(() => {
      if (progress && !Array.isArray(progress) && progress.totalTimeSpent > 0) {
        console.log(
          `[Identification] Setting initial time from progress: ${progress.totalTimeSpent}`
        );
        setTimeElapsed(progress.totalTimeSpent);
      } else {
        console.log(`[Identification] Resetting timer to 0`);
        setTimeElapsed(0);
      }
    }, [progress, setTimeElapsed]);

    // PERFORMANCE: Memoize word selection handler
    const handleWordSelectWithProgress = useCallback(
      async (wordIndex: number) => {
        try {
          console.log(`[Identification] Word selected at index: ${wordIndex}`);

          // 1. Stop the timer and capture current time
          setTimerRunning(false);
          const currentTime = timeElapsed;
          console.log(`[Identification] Time captured: ${currentTime}`);

          // 2. Get if the answer is correct
          const isCorrect =
            words[wordIndex]?.clean?.toLowerCase() ===
            sentences[currentSentenceIndex]?.answer?.toLowerCase();

          // 3. Call the word select handler in quiz store
          handleWordSelect(wordIndex);

          // 4. Update progress with completion status
          console.log(
            `[Identification] Updating progress - Time: ${currentTime}, Correct: ${isCorrect}, Completed: ${isCorrect}`
          );

          const updatedProgress = await updateProgress(
            currentTime,
            isCorrect,
            isCorrect
          );

          if (updatedProgress) {
            console.log(`[Identification] Progress updated successfully`);
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

    const handleTimerReset = useCallback(() => {
      // UPDATED: Don't restart immediately, just reset the timer state
      setTimeElapsed(0);
      console.log(
        `[Identification] Timer reset completed, user can restart manually`
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

      console.log(`[Identification] Restarting game`);
    }, [handleRestart, progress, setTimeElapsed]);

    // PERFORMANCE: Memoize game configuration
    const gameConfig = useMemo(() => {
      const currentSentence = sentences[currentSentenceIndex];

      // FIXED: Better focus area extraction
      const focusArea =
        currentSentence?.focusArea ||
        levelData?.focusArea ||
        sentences?.[0]?.focusArea ||
        "Vocabulary";

      // Calculate selected answer for review
      const selectedAnswerText =
        selectedWord !== null && words[selectedWord]
          ? typeof words[selectedWord]?.text === "string"
            ? words[selectedWord]?.text
            : typeof words[selectedWord]?.clean === "string"
            ? words[selectedWord]?.clean
            : "Unknown"
          : "Unknown";

      return {
        currentSentence,
        focusArea,
        selectedAnswerText,
        isCorrect: feedback === "correct",
        question: currentSentence?.sentence || currentSentence?.question || "",
        initialTime:
          progress && !Array.isArray(progress) ? progress.totalTimeSpent : 0,
      };
    }, [
      sentences,
      currentSentenceIndex,
      selectedWord,
      words,
      levelData?.focusArea,
      feedback,
      progress,
    ]);

    // Initialize game
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
        finalTime={timeElapsed}
        levelId={levelId}
        onTimerReset={handleTimerReset}
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
            timeElapsed={timeElapsed}
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
