import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  StatusBar,
} from "react-native";
import React, { useEffect, useState, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Check, X } from "react-native-feather";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { BASE_COLORS } from "@/constant/colors";
import useThemeStore from "@/store/useThemeStore";
import Timer from "@/components/Games/Timer";
import AnswerReview from "@/components/Games/AnswerReview";
import { Header } from "@/components/Header";
import gameSharedStyles from "@/styles/gamesSharedStyles";
import {
  handleNextLevel,
  formatTime,
  getDifficultyColors,
  setupBackButtonHandler,
} from "@/utils/gameUtils";
import DifficultyBadge from "@/components/Games/DifficultyBadge";
import DecorativeCircles from "@/components/Games/DecorativeCircles";
import GameNavigation from "@/components/Games/GameNavigation";

interface IdentificationProps {
  levelId: number;
  levelData: any;
  difficulty?: string;
  isStarted?: boolean;
}

interface WordItem {
  display: string;
  clean: string;
  isPunctuation: boolean;
}

// Define type for feedback state
type FeedbackType = "correct" | "incorrect" | null;

const Identification: React.FC<IdentificationProps> = ({
  levelId,
  levelData,
  difficulty = "easy",
  isStarted = false,
}) => {
  // Theme store
  const { activeTheme } = useThemeStore();

  // Game state with proper types
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedWord, setSelectedWord] = useState<number | null>(null);
  const [gameStatus, setGameStatus] = useState<"playing" | "completed">(
    "playing"
  );
  const [showTranslation, setShowTranslation] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackType>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Convert levelData to the format expected by the component
  const createSentencesFromData = (data) => {
    // Create a sentence object in the format the component expects
    return [
      {
        id: data.id,
        sentence: data.sentence,
        targetWord: data.targetWord,
        translation: data.translation,
        choices: data.choices || [],
        description: data.description || "",
        title: data.title || "",
        dialect: data.dialect || "",
      },
    ];
  };

  // Use the converted data
  const sentences = createSentencesFromData(levelData);
  const currentSentence = sentences[currentSentenceIndex];

  // Split sentence into words for selection
  const words = useMemo(() => {
    if (!currentSentence) return [];

    if (currentSentence.choices && currentSentence.choices.length > 0) {
      // Filter out duplicate choices
      const uniqueChoices = [...new Set(currentSentence.choices)];

      return uniqueChoices.map((choice) => ({
        display: choice,
        clean: choice,
        isPunctuation: false,
      }));
    } else {
      // Fall back to splitting sentence
      return currentSentence.sentence.split(/\s+/).map((word) => {
        const cleanWord = word.replace(/[.,!?;:]/g, "");
        return {
          display: word,
          clean: cleanWord,
          isPunctuation: Boolean(word.match(/[.,!?;:]/)),
        };
      });
    }
  }, [currentSentence]);

  useEffect(() => {
    if (isStarted) {
      setTimerRunning(true);
      console.log("Identification game started for level:", levelId);
    }
  }, [isStarted, levelId]);

  useEffect(() => {
    if (selectedWord !== null) {
      setTimerRunning(false);
      setTimeElapsed((prev) => prev + 1); // Placeholder for actual timer integration
    }
  }, [selectedWord]);

  // Handle word selection
  const handleWordSelect = (word: WordItem, index: number) => {
    if (selectedWord !== null || word.isPunctuation) return;

    setSelectedWord(index);

    const isCorrect =
      word.clean.toLowerCase() === currentSentence.targetWord.toLowerCase();

    if (isCorrect) {
      setScore(score + 1);
      setFeedback("correct");
    } else {
      setFeedback("incorrect");
    }

    // Still use timeout to move to next question
    setTimeout(() => {
      if (currentSentenceIndex < sentences.length - 1) {
        setCurrentSentenceIndex(currentSentenceIndex + 1);
        setSelectedWord(null);
        setFeedback(null);
        setShowTranslation(false);
      } else {
        setGameStatus("completed");
      }
    }, 2000);
  };

  // Handle game restart
  const handleRestart = () => {
    setCurrentSentenceIndex(0);
    setScore(0);
    setSelectedWord(null);
    setFeedback(null);
    setShowTranslation(false);
    setGameStatus("playing");
    setTimerRunning(false);
    setTimeElapsed(0);
  };

  // Toggle translation visibility
  const toggleTranslation = () => {
    setShowTranslation(!showTranslation);
  };

  // Next level handler - now using utility
  const handleNextLevelLocal = () => {
    handleNextLevel(
      levelId,
      "identification",
      "Word Identification",
      difficulty
    );
  };

  // Get word style based on state - keep this component-specific
  const getWordStyle = (word: WordItem, index: number) => {
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

  useEffect(() => {
    // Set up the back handler
    const cleanupBackHandler = setupBackButtonHandler(gameStatus, timerRunning);

    // Clean up when component unmounts
    return () => cleanupBackHandler();
  }, [gameStatus, timerRunning]);

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

        {/* Level Title - outside game status condition */}
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
            <Animatable.View
              animation="fadeIn"
              duration={600}
              delay={100}
              style={styles.statsContainer}
            >
              {isStarted && <Timer isRunning={timerRunning} />}
              <DifficultyBadge difficulty={difficulty} />
            </Animatable.View>

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
                {/* display the sentence */}
                <Text style={styles.questionText}>
                  {currentSentence.sentence}
                </Text>
              </LinearGradient>
            </Animatable.View>

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
            <TouchableOpacity
              style={styles.translationButton}
              onPress={toggleTranslation}
            >
              <Text style={styles.translationButtonText}>
                {showTranslation ? "Hide Translation" : "Show Translation"}
              </Text>
            </TouchableOpacity>

            {showTranslation && (
              <Animatable.View
                animation="fadeIn"
                duration={300}
                style={styles.translationCard}
              >
                <Text style={styles.translationText}>
                  {currentSentence.translation}
                </Text>
              </Animatable.View>
            )}
          </ScrollView>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
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

            {/* Answer Review Section */}
            <AnswerReview
              question={currentSentence.sentence}
              userAnswer={words[selectedWord]?.clean || "Unknown"}
              isCorrect={feedback === "correct"}
            />

            {/* Navigation buttons */}
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
  ...gameSharedStyles, // Include all shared styles

  // Component-specific styles for Identification
  sentenceCard: {
    marginBottom: 20,
  },
  sentenceContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  instructionCardWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  sentenceText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    textAlign: "center",
    lineHeight: 24,
  },
  word: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: 10,
  },
  correctWord: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderColor: BASE_COLORS.success,
    borderWidth: 1,
  },
  incorrectWord: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderColor: BASE_COLORS.danger,
    borderWidth: 1,
  },
  wordText: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    flex: 1,
  },
  instructionGradient: {
    padding: 20,
    paddingVertical: 24,
    borderRadius: 16,
    position: "relative",
  },
  instructionText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    textAlign: "center",
    marginBottom: 16,
  },
});

export default Identification;
