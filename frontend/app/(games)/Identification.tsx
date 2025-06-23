import React, { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BASE_COLORS } from "@/constant/colors";
import useQuizStore from "@/store/games/useQuizStore";
import gameSharedStyles from "@/styles/gamesSharedStyles";
import GameContainer from "@/components/games/GameContainer";
import GamePlayingContent from "@/components/games/GamePlayingContent";
import GameCompletedContent from "@/components/games/GameCompletedContent";
import { useGameInitialization } from "@/hooks/useGameInitialization";
import { router } from "expo-router";
import IdentificationPlayingContent from "@/components/games/identification/IdentificationPlayingContent";
import { useUserProgress } from "@/hooks/useUserProgress";

interface IdentificationProps {
  levelId: number;
  levelData: any;
  difficulty?: string;
  isStarted?: boolean;
}

const Identification: React.FC<IdentificationProps> = ({
  levelId,
  levelData,
  difficulty = "easy",
  isStarted = false,
}) => {
  // user progress hook
  const { progress, updateProgress, refreshProgress } = useUserProgress(
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
  } = useQuizStore();

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

  // ENHANCED: Word selection handler with progress tracking and completion
  const handleWordSelectWithProgress = async (wordIndex: number) => {
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

      // 4. CRITICAL FIX: Update progress with completion status
      const updatedProgress = await updateProgress(
        currentTime,
        isCorrect,
        isCorrect
      );

      // 5. If level was completed, force refresh global progress
      if (isCorrect && updatedProgress) {
        console.log(
          `[Identification] Level ${levelId} completed successfully!`,
          updatedProgress
        );

        setTimeout(async () => {
          await refreshProgress();
          console.log(
            `[Identification] Global progress refreshed after completion`
          );
        }, 200);
      }
    } catch (error) {
      console.error("[Identification] Error in word selection:", error);
    }
  };

  // Restart handler with progress sync
  const handleRestartWithProgress = async () => {
    handleRestart();

    // Reset timer to continue from where they left off if they have progress
    if (progress && !Array.isArray(progress) && progress.totalTimeSpent > 0) {
      setTimeElapsed(progress.totalTimeSpent);
    } else {
      setTimeElapsed(0);
    }

    console.log(`[Identification] Restarting game`);
  };

  // Current sentence and game mode
  const currentSentence = sentences[currentSentenceIndex];
  const gameMode = "identification";

  // Initialize game
  useGameInitialization(
    levelData,
    levelId,
    gameMode,
    difficulty,
    isStarted,
    initialize,
    startGame,
    gameStatus,
    timerRunning,
    progress && !Array.isArray(progress) ? progress.totalTimeSpent : 0
  );

  const focusArea =
    currentSentence?.focusArea || levelData?.focusArea || "Vocabulary";

  // Calculate selected answer for review
  const selectedAnswerText =
    selectedWord !== null && words[selectedWord]
      ? typeof words[selectedWord]?.text === "string"
        ? words[selectedWord]?.text
        : typeof words[selectedWord]?.clean === "string"
        ? words[selectedWord]?.clean
        : "Unknown"
      : "Unknown";

  // Error state handling
  if (error) {
    return (
      <GameContainer
        title="Word Identification"
        level={currentSentence?.level || `Level ${levelId}`}
        levelTitle={currentSentence?.title || "Word Identification"}
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
      level={currentSentence?.level || `Level ${levelId}`}
      levelTitle={currentSentence?.title || "Word Identification"}
      timerRunning={timerRunning}
      gameStatus={gameStatus}
    >
      {gameStatus === "playing" ? (
        <GamePlayingContent
          timerRunning={timerRunning}
          difficulty={difficulty}
          focusArea={focusArea}
          isStarted={isStarted}
          gameStatus={gameStatus}
          initialTime={
            progress && !Array.isArray(progress) ? progress.totalTimeSpent : 0
          }
        >
          <IdentificationPlayingContent
            difficulty={difficulty}
            levelData={levelData}
            currentSentence={currentSentence}
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
          question={
            currentSentence?.sentence || currentSentence?.question || ""
          }
          userAnswer={selectedAnswerText}
          isCorrect={feedback === "correct"}
          levelId={levelId}
          gameMode="identification"
          gameTitle="Word Identification"
          onRestart={handleRestartWithProgress}
          focusArea={focusArea}
        />
      )}
    </GameContainer>
  );
};

export default Identification;
