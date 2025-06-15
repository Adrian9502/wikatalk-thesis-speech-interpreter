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
  const { progress, updateProgress, fetchProgress } = useUserProgress(
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
  } = useQuizStore();

  // Set initial time from progress when component mounts
  useEffect(() => {
    if (progress && progress.totalTimeSpent > 0) {
      setTimeElapsed(progress.totalTimeSpent);
    }
  }, [progress]);

  // Custom word select handler with progress tracking
  const handleWordSelectWithProgress = async (wordIndex: number) => {
    // Call the original handler
    handleWordSelect(wordIndex);

    // Get if the answer is correct
    const isCorrect =
      words[wordIndex]?.clean?.toLowerCase() ===
      sentences[currentSentenceIndex]?.answer?.toLowerCase();

    // Update progress with current time and completion status
    await updateProgress(timeElapsed, isCorrect);
  };

  // Custom restart handler that preserves time
  const handleRestartWithProgress = async () => {
    // Call original restart
    handleRestart();

    // Refetch progress to ensure we have latest data
    const latestProgress = await fetchProgress();

    // Set timer to continue from where they left off
    if (latestProgress && latestProgress.totalTimeSpent > 0) {
      setTimeElapsed(latestProgress.totalTimeSpent);
    }
  };

  // Current sentence and game mode
  const currentSentence = sentences[currentSentenceIndex];
  const gameMode = "identification";

  // Initialize game with progress time
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
    progress?.totalTimeSpent // Pass the total time spent
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
              borderRadius: 8,
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
          initialTime={progress?.totalTimeSpent}
        >
          <IdentificationPlayingContent
            difficulty={difficulty}
            levelData={levelData}
            currentSentence={currentSentence}
            words={words}
            selectedWord={selectedWord}
            showTranslation={showTranslation}
            toggleTranslation={toggleTranslation}
            handleWordSelect={handleWordSelectWithProgress} // Use new handler
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
          onRestart={handleRestartWithProgress} // Use new handler
        />
      )}
    </GameContainer>
  );
};

export default Identification;
