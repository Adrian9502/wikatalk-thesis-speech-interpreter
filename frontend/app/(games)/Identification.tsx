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
import Timer from "@/components/Games/Timer";
import AnswerReview from "@/components/Games/AnswerReview";
import { Header } from "@/components/Header";
import {
  formatTime,
  getDifficultyColors,
  setupBackButtonHandler,
} from "@/utils/gameUtils";
import DifficultyBadge from "@/components/Games/DifficultyBadge";
import DecorativeCircles from "@/components/Games/DecorativeCircles";
import GameNavigation from "@/components/Games/GameNavigation";
import gameSharedStyles from "@/styles/gamesSharedStyles";

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

  // Get state and actions from the centralized store - UPDATED for useQuizStore
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
    // Actions
    initialize,
    startGame,
    handleRestart,
    handleWordSelect,
    toggleIdentificationTranslation: toggleTranslation,
  } = useQuizStore();

  // Current sentence
  const currentSentence = sentences[currentSentenceIndex];

  useEffect(() => {
    // Set up the back handler
    const cleanupBackHandler = setupBackButtonHandler(gameStatus, timerRunning);

    // Clean up when component unmounts
    return () => cleanupBackHandler();
  }, [gameStatus, timerRunning]);

  // Initialize with level data
  useEffect(() => {
    console.log("Initializing Identification with data:", levelData);
    // Pass the gameMode parameter "identification"
    initialize(levelData, levelId, "identification", difficulty);

    // Add a short delay to ensure initialization completes before starting the game
    if (isStarted) {
      const timer = setTimeout(() => {
        console.log("Starting identification game");
        startGame();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [levelData, levelId, isStarted]);

  // Get word style based on state
  const getWordStyle = (word, index) => {
    const baseStyle = [
      gameSharedStyles.optionCard,
      {
        height: 60, // Fixed height, not minHeight
        position: "relative", // Add this to ensure absolute positioning works correctly
      },
    ];

    if (selectedWord === index) {
      const isCorrect =
        word.clean?.toLowerCase() ===
        currentSentence?.targetWord?.toLowerCase();
      return isCorrect
        ? [...baseStyle, gameSharedStyles.correctOption]
        : [...baseStyle, gameSharedStyles.incorrectOption];
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
            Level {levelId} :{" "}
            {currentSentence?.title ||
              currentSentence?.dialect ||
              "- Word Identification"}
          </Text>
        </View>

        {gameStatus === "playing" ? (
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
              {isStarted && <Timer isRunning={timerRunning} />}
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
                              {(word.id || "").toUpperCase()}
                            </Text>
                          </View>
                          <Text style={gameSharedStyles.optionText}>
                            {word.text || word.clean || word.original}
                          </Text>
                        </View>

                        {/* Show check/x icon if selected - FIXED to use absolute positioning */}
                        {selectedWord === index && (
                          <View style={gameSharedStyles.resultIconContainer}>
                            {word.clean?.toLowerCase() ===
                            currentSentence?.targetWord?.toLowerCase() ? (
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
              <Animatable.View
                animation="fadeIn"
                duration={300}
                style={gameSharedStyles.translationCard}
              >
                <Text style={gameSharedStyles.translationText}>
                  {currentSentence?.translation}
                </Text>
              </Animatable.View>
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

            {/* Completion Card */}
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
                  {score > 0 ? "Level Completed!" : "Try Again!"}
                </Text>
                <Text style={gameSharedStyles.completionMessage}>
                  {score > 0
                    ? `Great job! You answered correctly.`
                    : `Your answer was incorrect. Keep practicing to improve.`}
                </Text>
              </LinearGradient>
            </Animatable.View>

            {/* Answer Review */}
            <AnswerReview
              question={
                currentSentence?.sentence || currentSentence?.question || ""
              }
              userAnswer={
                words[selectedWord]?.text ||
                words[selectedWord]?.clean ||
                "Unknown"
              }
              isCorrect={feedback === "correct"}
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
          // Default loading state when idle
          <View style={gameSharedStyles.loaderContainer}>
            <ActivityIndicator size="large" color={BASE_COLORS.blue} />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

// Only component-specific styles that differ from shared styles
const styles = StyleSheet.create({
  // Identification specific: two-column layout for word options
  twoColumnContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  optionWrapper: {
    width: "48%",
    marginBottom: 10,
  },
});

export default Identification;
