import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
} from "react-native";
import React, { useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import gameSharedStyles from "@/styles/gamesSharedStyles";
import { Check, X } from "react-native-feather";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { BASE_COLORS } from "@/constant/colors";
import useThemeStore from "@/store/useThemeStore";
import Timer from "@/components/Games/Timer";
import AnswerReview from "@/components/Games/AnswerReview";
import { Header } from "@/components/Header";
import { getDifficultyColors, formatTime } from "@/utils/gameUtils";
import DifficultyBadge from "@/components/Games/DifficultyBadge";
import { setupBackButtonHandler } from "@/utils/gameUtils";
import DecorativeCircles from "@/components/Games/DecorativeCircles";
import GameNavigation from "@/components/Games/GameNavigation";
import useFillInTheBlankStore from "@/store/Games/useFillInTheBlankStore";

interface FillInTheBlankProps {
  levelId: number;
  levelData: any;
  difficulty?: string;
  isStarted?: boolean;
}

// Type the quiz questions data structure
interface QuestionItem {
  id: number;
  dialect: string;
  sentence: string;
  answer: string;
  title: string;
  translation: string;
  hint: string;
}

interface QuizQuestions {
  fillBlanks: {
    easy: QuestionItem[];
    medium: QuestionItem[];
    hard: QuestionItem[];
    [key: string]: QuestionItem[];
  };
  multipleChoice: {
    [key: string]: any[];
  };
  identification: {
    [key: string]: any[];
  };
}

const FillInTheBlank: React.FC<FillInTheBlankProps> = ({
  levelId,
  levelData,
  difficulty = "easy",
  isStarted = false,
}) => {
  // Theme store
  const { activeTheme } = useThemeStore();

  // Input ref
  const inputRef = useRef<TextInput>(null);

  // Game state from store
  const {
    currentExerciseIndex,
    userAnswer,
    score,
    gameStatus,
    showHint,
    showTranslation,
    showFeedback,
    isCorrect,
    attemptsLeft,
    timerRunning,
    timeElapsed,
    exercises,
    setUserAnswer,
    toggleHint,
    toggleTranslation,
    checkAnswer,
    handleRestart,
    initialize,
    startGame,
    formatSentence,
  } = useFillInTheBlankStore();

  // Current exercise
  const currentExercise = exercises[currentExerciseIndex];

  useEffect(() => {
    // Set up the back handler
    const cleanupBackHandler = setupBackButtonHandler(gameStatus, timerRunning);

    // Clean up when component unmounts
    return () => cleanupBackHandler();
  }, [gameStatus, timerRunning]);

  // Initialize with quiz data
  useEffect(() => {
    // We need to pass the quizQuestions to the initialize function
    // since they're imported in the component, not in the store
    initialize(levelData, levelId, difficulty);

    // Add a short delay to ensure initialization completes before starting the game
    if (isStarted) {
      const timer = setTimeout(() => {
        startGame();

        // Focus input after a delay
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [levelData, levelId, isStarted]);

  // Stop timer when answer is checked
  useEffect(() => {
    if (showFeedback) {
      setTimerRunning(false);
      // Track elapsed time for results
      setTimeElapsed((prev) => prev + 1); // This is a placeholder, needs actual timer integration
    }
  }, [showFeedback]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View
        style={[
          styles.wrapper,
          { backgroundColor: activeTheme.backgroundColor },
        ]}
      >
        <StatusBar barStyle="light-content" />

        <DecorativeCircles variant="triple" />
        <SafeAreaView style={styles.container}>
          <Header
            title="Fill in the Blanks"
            disableBack={timerRunning || showFeedback}
            hideBack={true}
          />

          {/* Level Title  */}
          <View style={styles.levelTitleContainer}>
            <Text style={styles.levelTitleText}>
              Level {levelId} :{" "}
              {currentExercise?.title || "- Fill in the Blanks"}
            </Text>
          </View>

          {gameStatus === "playing" ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[styles.contentContainer, { flexGrow: 1 }]}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              {/* Stats Container with Timer and Difficulty */}
              <Animatable.View
                animation="fadeIn"
                duration={600}
                delay={100}
                style={styles.statsContainer}
              >
                {isStarted && <Timer isRunning={timerRunning} />}
                <DifficultyBadge difficulty={difficulty} />
              </Animatable.View>

              {/* Attempts Display */}
              <View style={styles.attemptsContainer}>
                <Text style={styles.attemptsText}>
                  Attempts: {Array(attemptsLeft).fill("●").join(" ")}
                </Text>
              </View>

              {/* Sentence Card */}
              <Animatable.View
                animation="fadeInUp"
                duration={500}
                style={styles.sentenceCard}
              >
                <LinearGradient
                  colors={
                    getDifficultyColors(difficulty, levelData) as readonly [
                      string,
                      string
                    ]
                  }
                  style={styles.sentenceGradient}
                >
                  <Text style={styles.sentenceText}>{formatSentence()}</Text>
                </LinearGradient>
              </Animatable.View>

              {/* Input Section */}
              <Animatable.View
                animation="fadeInUp"
                duration={500}
                delay={200}
                style={styles.inputSection}
              >
                <View style={styles.inputContainer}>
                  <TextInput
                    ref={inputRef}
                    style={styles.input}
                    value={userAnswer}
                    onChangeText={setUserAnswer}
                    placeholder="Type your answer..."
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    onSubmitEditing={checkAnswer}
                    returnKeyType="done"
                  />

                  {/* Clear button - only show when text exists and feedback isn't shown */}
                  {userAnswer.trim() !== "" && !showFeedback && (
                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={() => setUserAnswer("")}
                      activeOpacity={0.7}
                    >
                      <X
                        width={16}
                        height={16}
                        color="rgba(255, 255, 255, 0.6)"
                      />
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      !userAnswer.trim() ? { opacity: 0.7 } : null,
                      showFeedback && isCorrect ? styles.correctButton : null,
                      showFeedback && !isCorrect
                        ? styles.incorrectButton
                        : null,
                    ]}
                    onPress={checkAnswer}
                    disabled={!userAnswer.trim() || showFeedback}
                  >
                    {showFeedback ? (
                      isCorrect ? (
                        <Check
                          width={24}
                          height={24}
                          color={BASE_COLORS.white}
                        />
                      ) : (
                        <X width={24} height={24} color={BASE_COLORS.white} />
                      )
                    ) : (
                      <Text style={styles.submitButtonText}>Check</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </Animatable.View>

              {/* Hint and Translation Buttons */}
              <View style={styles.helpButtonsContainer}>
                <TouchableOpacity
                  style={styles.hintButton}
                  onPress={toggleHint}
                >
                  <Text style={styles.hintButtonText}>
                    {showHint ? "Hide Hint" : "Show Hint"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.hintButton}
                  onPress={toggleTranslation}
                >
                  <Text style={styles.hintButtonText}>
                    {showTranslation ? "Hide Translation" : "Show Translation"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Show hint if enabled */}
              {showHint && currentExercise?.hint && (
                <Animatable.View
                  animation="fadeIn"
                  duration={300}
                  style={styles.hintCard}
                >
                  <Text style={styles.hintLabel}>Hint:</Text>
                  <Text style={styles.hintText}>{currentExercise.hint}</Text>
                </Animatable.View>
              )}

              {/* Show translation if enabled */}
              {showTranslation && currentExercise?.translation && (
                <Animatable.View
                  animation="fadeIn"
                  duration={300}
                  style={styles.translationCard}
                >
                  <Text style={styles.hintLabel}>Translation:</Text>
                  <Text style={styles.translationText}>
                    {currentExercise.translation}
                  </Text>
                </Animatable.View>
              )}
            </ScrollView>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.contentContainer}
            >
              {/* Stats Container with Time Taken */}
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

              {/* Completion Message with score */}
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
                question={exercises[0]?.sentence || "No question available"}
                userAnswer={userAnswer || "(No answer provided)"}
                isCorrect={score > 0}
              />

              {/* Navigation buttons */}
              <GameNavigation
                levelId={levelId}
                gameMode="fillBlanks"
                gameTitle="Fill in the Blank"
                difficulty={difficulty}
                onRestart={handleRestart}
              />
            </ScrollView>
          )}
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  // Import all shared styles
  ...gameSharedStyles,

  // Override or add component-specific styles
  sentenceCard: {
    ...gameSharedStyles.questionCardWrapper,
    marginBottom: 20,
  },
  sentenceGradient: {
    ...gameSharedStyles.questionGradient,
  },
  sentenceText: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    textAlign: "center",
    lineHeight: 26,
  },
  inputSection: {
    marginTop: 24,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 16,
  },
  input: {
    flex: 1,
    height: 54,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
  },
  submitButton: {
    height: 54,
    paddingHorizontal: 20,
    backgroundColor: BASE_COLORS.success,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  correctButton: {
    backgroundColor: BASE_COLORS.success,
  },
  incorrectButton: {
    backgroundColor: BASE_COLORS.danger,
  },
  attemptsContainer: {
    marginBottom: 12,
    alignItems: "center",
  },
  attemptsText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    opacity: 0.9,
  },
  helpButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 10,
  },
  clearButton: {
    height: 40,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: 90,
    opacity: 0.7,
  },
  hintButton: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  hintButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
  },
  hintCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  hintLabel: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    marginBottom: 4,
  },
  hintText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    fontStyle: "italic",
  },
});

export default FillInTheBlank;
