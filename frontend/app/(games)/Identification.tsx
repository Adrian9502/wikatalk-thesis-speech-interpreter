import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Check, X } from "react-native-feather";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { BASE_COLORS } from "@/constant/colors";
import useQuizStore from "@/store/games/useQuizStore";
import { getDifficultyColors } from "@/utils/gameUtils";
import gameSharedStyles from "@/styles/gamesSharedStyles";
import styles from "@/styles/games/identification.styles";
import GameContainer from "@/components/games/GameContainer";
import GamePlayingContent from "@/components/games/GamePlayingContent";
import GameCompletedContent from "@/components/games/GameCompletedContent";
import { useGameInitialization } from "@/hooks/useGameInitialization";
import { router } from "expo-router";

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
  } = useQuizStore();

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
    timerRunning
  );

  // Word styling helper
  const getWordStyle = (word: any, index: number) => {
    const baseStyle = [
      gameSharedStyles.optionCard,
      {
        minHeight: 60,
        position: "relative" as const,
      },
    ];

    if (selectedWord !== null && selectedWord === index) {
      const isCorrect =
        word.clean?.toLowerCase() === currentSentence?.answer?.toLowerCase();

      return isCorrect
        ? [...baseStyle, gameSharedStyles.correctOption]
        : [...baseStyle, gameSharedStyles.incorrectOption];
    }

    return baseStyle;
  };

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
        <GamePlayingContent timerRunning={timerRunning} difficulty={difficulty}>
          <Animatable.View
            animation="fadeInUp"
            duration={500}
            style={gameSharedStyles.questionCardWrapper}
          >
            <LinearGradient
              colors={
                getDifficultyColors(difficulty, levelData) as readonly [
                  string,
                  string
                ]
              }
              style={gameSharedStyles.questionGradient}
            >
              <Text style={gameSharedStyles.questionText}>
                {currentSentence?.sentence || currentSentence?.question}
              </Text>
            </LinearGradient>
          </Animatable.View>

          {/* Words Container - Two per row */}
          <Animatable.View
            animation="fadeInUp"
            duration={500}
            delay={200}
            style={gameSharedStyles.optionsContainer}
          >
            <View style={styles.twoColumnContainer}>
              {words && words.length > 0 ? (
                words.map((word, index) => (
                  <Animatable.View
                    key={`choice-${index}-${word.text || word.clean}`}
                    animation="fadeInUp"
                    duration={600}
                    delay={300 + index * 100}
                    style={styles.optionWrapper}
                  >
                    <TouchableOpacity
                      style={getWordStyle(word, index)}
                      onPress={() => handleWordSelect(index)}
                      disabled={selectedWord !== null}
                      activeOpacity={0.9}
                    >
                      <View style={gameSharedStyles.optionContent}>
                        <View style={gameSharedStyles.optionIdContainer}>
                          <Text style={gameSharedStyles.optionId}>
                            {index + 1}
                          </Text>
                        </View>
                        <Text
                          style={gameSharedStyles.optionText}
                          numberOfLines={0}
                        >
                          {typeof word.text === "string"
                            ? word.text
                            : typeof word.clean === "string"
                            ? word.clean
                            : String(word.text || word.clean || "")}
                        </Text>
                      </View>

                      {/* Show check/x icon if selected */}
                      {selectedWord === index && (
                        <View style={gameSharedStyles.resultIconContainer}>
                          {word.clean?.toLowerCase() ===
                          currentSentence?.answer?.toLowerCase() ? (
                            <Check
                              width={18}
                              height={18}
                              color={BASE_COLORS.white}
                            />
                          ) : (
                            <X
                              width={18}
                              height={18}
                              color={BASE_COLORS.white}
                            />
                          )}
                        </View>
                      )}
                    </TouchableOpacity>
                  </Animatable.View>
                ))
              ) : (
                <Text style={{ color: "white", textAlign: "center" }}>
                  No options available
                </Text>
              )}
            </View>
          </Animatable.View>

          {/* Translation Button */}
          <TouchableOpacity
            style={gameSharedStyles.translationButton}
            onPress={toggleTranslation}
          >
            <Text style={gameSharedStyles.translationButtonText}>
              {showTranslation ? "Hide Translation" : "Show Translation"}
            </Text>
          </TouchableOpacity>

          {/* Translation Card */}
          {showTranslation && (
            <View style={gameSharedStyles.translationCard}>
              <Text style={gameSharedStyles.translationText}>
                {currentSentence?.translation || "Translation not available"}
              </Text>
            </View>
          )}
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
          onRestart={handleRestart}
          successTitle="Correct!"
          failTitle="Try Again!"
          completedMessage="You identified the correct word."
          failedMessage="You didn't identify the correct word. Keep practicing!"
        />
      )}
    </GameContainer>
  );
};

export default Identification;
