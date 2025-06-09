import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Check, X } from "react-native-feather";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { BASE_COLORS } from "@/constant/colors";
import useThemeStore from "@/store/useThemeStore";
import useQuizStore from "@/store/Games/useQuizStore";
import Timer from "@/components/games/Timer";
import AnswerReview from "@/components/games/AnswerReview";
import { Header } from "@/components/Header";
import { router } from "expo-router";
import { getDifficultyColors, setupBackButtonHandler } from "@/utils/gameUtils";
import DifficultyBadge from "@/components/games/DifficultyBadge";
import DecorativeCircles from "@/components/games/DecorativeCircles";
import GameNavigation from "@/components/games/GameNavigation";
import gameSharedStyles from "@/styles/gamesSharedStyles";
import DotsLoader from "@/components/DotLoader";
import styles from "@/styles/games/identification.styles";

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};
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
  // Theme store
  const { activeTheme } = useThemeStore();
  const gameMode = "identification";

  const {
    // Common game state
    gameState: { score, gameStatus, timerRunning, timeElapsed },
    // Identification specific state
    identificationState: {
      sentences,
      currentSentenceIndex,
      words,
      selectedWord,
      showTranslation,
      feedback,
    },
    // Add error state
    error,
    // Actions
    initialize,
    startGame,
    handleRestart,
    handleWordSelect,
    toggleIdentificationTranslation: toggleTranslation,
  } = useQuizStore();

  // Current sentence
  const currentSentence = sentences[currentSentenceIndex];
  const currentItem = currentSentence;
  useEffect(() => {
    // Set up the back handler
    const cleanupBackHandler = setupBackButtonHandler(gameStatus, timerRunning);

    // Clean up when component unmounts
    return () => cleanupBackHandler();
  }, [gameStatus, timerRunning]);

  // Simplified initialization - no complex timeouts
  useEffect(() => {
    if (levelData && isStarted) {
      console.log("Initializing identification game with data:", levelData);

      // Initialize the game
      initialize(levelData, levelId, gameMode, difficulty);

      // Start immediately after initialization
      console.log("Starting identification game");
      startGame();
    }
  }, [levelData, isStarted]);

  // Add helper function for getWordStyle with proper logic
  const getWordStyle = (word: any, index: number) => {
    const baseStyle = [
      gameSharedStyles.optionCard,
      {
        height: 60, // Fixed height
        position: "relative" as const,
      },
    ];

    if (selectedWord !== null) {
      if (selectedWord === index) {
        const isCorrect =
          word.clean?.toLowerCase() === currentSentence?.answer?.toLowerCase();

        return isCorrect
          ? [...baseStyle, gameSharedStyles.correctOption]
          : [...baseStyle, gameSharedStyles.incorrectOption];
      }
    }

    return baseStyle;
  };

  return (
    <View
      style={[
        gameSharedStyles.wrapper,
        { backgroundColor: activeTheme.backgroundColor },
      ]}
    >
      <StatusBar barStyle="light-content" />

      <DecorativeCircles variant="double" />

      <SafeAreaView style={gameSharedStyles.container}>
        <Header
          title={"Word Identification"}
          disableBack={timerRunning}
          hideBack={true}
        />

        {/* Level Title */}
        <View style={gameSharedStyles.levelTitleContainer}>
          <Text style={gameSharedStyles.levelTitleText}>
            {currentItem?.level} - {currentItem?.title || "Word Identification"}
          </Text>
        </View>

        {error ? (
          // Show error state
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
        ) : gameStatus === "playing" ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={gameSharedStyles.contentContainer}
          >
            {/* Game content */}
            <Animatable.View
              animation="fadeIn"
              duration={600}
              delay={100}
              style={gameSharedStyles.statsContainer}
            >
              <Timer isRunning={timerRunning} />
              <DifficultyBadge difficulty={difficulty} />
            </Animatable.View>

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
                          <Text style={gameSharedStyles.optionText}>
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
          </ScrollView>
        ) : gameStatus === "completed" ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={gameSharedStyles.contentContainer}
          >
            {/* Results content */}
            <Animatable.View
              animation="fadeIn"
              duration={600}
              delay={100}
              style={gameSharedStyles.statsContainer}
            >
              <View style={gameSharedStyles.timeContainer}>
                <Text style={gameSharedStyles.timeValue}>
                  Time: {formatTime(timeElapsed)}
                </Text>
              </View>
              <DifficultyBadge difficulty={difficulty} />
            </Animatable.View>

            <Animatable.View
              animation="fadeInUp"
              duration={700}
              delay={200}
              style={gameSharedStyles.questionCardWrapper}
            >
              <LinearGradient
                colors={
                  score > 0
                    ? (["#4CAF50", "#2E7D32"] as const)
                    : ([BASE_COLORS.danger, "#C62828"] as const)
                }
                style={gameSharedStyles.questionGradient}
              >
                <View style={gameSharedStyles.resultIconLarge}>
                  {score > 0 ? (
                    <Check width={30} height={30} color={BASE_COLORS.white} />
                  ) : (
                    <X width={30} height={30} color={BASE_COLORS.white} />
                  )}
                </View>
                <Text style={gameSharedStyles.completionTitle}>
                  {score > 0 ? "Correct!" : "Try Again!"}
                </Text>
                <Text style={gameSharedStyles.completionMessage}>
                  {score > 0
                    ? "You identified the correct word."
                    : "You didn't identify the correct word. Keep practicing!"}
                </Text>
              </LinearGradient>
            </Animatable.View>

            {/* Answer Review */}
            <AnswerReview
              question={
                currentSentence?.sentence || currentSentence?.question || ""
              }
              userAnswer={
                selectedWord !== null && words[selectedWord]
                  ? typeof words[selectedWord]?.text === "string"
                    ? words[selectedWord]?.text
                    : typeof words[selectedWord]?.clean === "string"
                    ? words[selectedWord]?.clean
                    : "Unknown"
                  : "Unknown"
              }
              isCorrect={feedback === "correct"}
              timeElapsed={timeElapsed}
            />

            {/* Navigation */}
            <GameNavigation
              levelId={levelId}
              gameMode="identification"
              gameTitle="Word Identification"
              difficulty={difficulty}
              onRestart={handleRestart}
            />
          </ScrollView>
        ) : (
          <View style={gameSharedStyles.loaderContainer}>
            <DotsLoader />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

export default Identification;
