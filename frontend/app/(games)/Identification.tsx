import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  StatusBar,
} from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Check, X } from "react-native-feather";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { BASE_COLORS } from "@/constant/colors";
import useThemeStore from "@/store/useThemeStore";
import useIdentificationStore from "@/store/Games/useIdentificationStore";
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

  // Game state from store
  const {
    currentSentenceIndex,
    score,
    selectedWord,
    gameStatus,
    showTranslation,
    feedback,
    timerRunning,
    timeElapsed,
    sentences,
    words,
    handleWordSelect,
    toggleTranslation,
    handleRestart,
    initialize,
    startGame,
  } = useIdentificationStore();

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
    initialize(levelData, levelId);

    // Add a short delay to ensure initialization completes before starting the game
    if (isStarted) {
      const timer = setTimeout(() => {
        startGame();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [levelData, levelId, isStarted]);

  // Get word style based on state
  const getWordStyle = (word, index) => {
    const baseStyle = styles.word;

    // If this is the selected word
    if (selectedWord === index) {
      const isCorrect =
        word.clean.toLowerCase() === currentSentence.targetWord.toLowerCase();
      return isCorrect
        ? [baseStyle, styles.correctWord]
        : [baseStyle, styles.incorrectWord];
    }

    // Otherwise just return the base style
    return baseStyle;
  };

  return (
    <View
      style={[styles.wrapper, { backgroundColor: activeTheme.backgroundColor }]}
    >
      <StatusBar barStyle="light-content" />

      <DecorativeCircles variant="double" />

      <SafeAreaView style={styles.container}>
        <Header
          title={"Word Identification"}
          disableBack={timerRunning}
          hideBack={true}
        />

        {/* Level Title */}
        <View style={styles.levelTitleContainer}>
          <Text style={styles.levelTitleText}>
            Level {levelId} :{" "}
            {currentSentence?.title ||
              currentSentence?.dialect ||
              "- Word Identification"}
          </Text>
        </View>

        {gameStatus === "playing" ? (
          <ScrollView>
            {/* Game content */}
            <Animatable.View
              animation="fadeIn"
              duration={600}
              delay={100}
              style={styles.statsContainer}
            >
              {isStarted && <Timer isRunning={timerRunning} />}
              <DifficultyBadge difficulty={difficulty} />
            </Animatable.View>

            {/* Instruction Card */}
            <Animatable.View
              animation="fadeInUp"
              duration={500}
              style={styles.instructionCardWrapper}
            >
              <LinearGradient
                colors={
                  getDifficultyColors(difficulty, levelData) as readonly [
                    string,
                    string
                  ]
                }
                style={styles.instructionGradient}
              >
                <Text style={styles.questionText}>
                  {currentSentence?.sentence}
                </Text>
              </LinearGradient>
            </Animatable.View>

            {/* Words Container */}
            <Animatable.View
              animation="fadeInUp"
              duration={500}
              delay={200}
              style={styles.sentenceCard}
            >
              <View style={styles.sentenceContainer}>
                {words.map((word, index) => (
                  <TouchableOpacity
                    key={`choice-${index}-${word.clean}`}
                    style={getWordStyle(word, index)}
                    onPress={() => handleWordSelect(word, index)}
                    disabled={selectedWord !== null}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionLetter}>
                      <Text style={styles.optionLetterText}>
                        {String.fromCharCode(65 + index)}
                      </Text>
                    </View>
                    <Text style={styles.wordText}>{word.display}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animatable.View>

            {/* Translation Button */}
            <TouchableOpacity
              style={styles.translationButton}
              onPress={toggleTranslation}
            >
              <Text style={styles.translationButtonText}>
                {showTranslation ? "Hide Translation" : "Show Translation"}
              </Text>
            </TouchableOpacity>

            {/* Translation Card */}
            {showTranslation && (
              <Animatable.View
                animation="fadeIn"
                duration={300}
                style={styles.translationCard}
              >
                <Text style={styles.translationText}>
                  {currentSentence?.translation}
                </Text>
              </Animatable.View>
            )}
          </ScrollView>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            {/* Results content */}
            <Animatable.View
              animation="fadeIn"
              duration={600}
              delay={100}
              style={styles.statsContainer}
            >
              <View style={styles.timeContainer}>
                <Text style={styles.timeValue}>
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
              style={styles.questionCardWrapper}
            >
              <LinearGradient
                colors={
                  score > 0
                    ? (["#4CAF50", "#2E7D32"] as const)
                    : ([BASE_COLORS.danger, "#C62828"] as const)
                }
                style={styles.questionGradient}
              >
                <View style={styles.resultIconLarge}>
                  {score > 0 ? (
                    <Check width={30} height={30} color={BASE_COLORS.white} />
                  ) : (
                    <X width={30} height={30} color={BASE_COLORS.white} />
                  )}
                </View>
                <Text style={styles.completionTitle}>
                  {score > 0 ? "Level Completed!" : "Try Again!"}
                </Text>
                <Text style={styles.completionMessage}>
                  {score > 0
                    ? `Great job! You answered correctly.`
                    : `Your answer was incorrect. Keep practicing to improve.`}
                </Text>
              </LinearGradient>
            </Animatable.View>

            {/* Answer Review */}
            <AnswerReview
              question={currentSentence?.sentence || ""}
              userAnswer={words[selectedWord]?.clean || "Unknown"}
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
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  ...gameSharedStyles,
  // Component-specific styles remain the same
});

export default Identification;
