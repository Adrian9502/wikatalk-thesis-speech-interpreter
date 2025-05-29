import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import DifficultyBadge from "@/components/Games/DifficultyBadge";
import { Check, X, AlertCircle, X as XIcon } from "react-native-feather";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { BASE_COLORS } from "@/constant/colors";
import useThemeStore from "@/store/useThemeStore";
import Timer from "@/components/Games/Timer";
import useQuizStore from "@/store/Games/useQuizStore";
import { Header } from "@/components/Header";
import AnswerReview from "@/components/Games/AnswerReview";
import gameSharedStyles from "@/styles/gamesSharedStyles";
import { formatTime, getDifficultyColors } from "@/utils/gameUtils";
import { setupBackButtonHandler } from "@/utils/gameUtils";
import DecorativeCircles from "@/components/Games/DecorativeCircles";
import GameNavigation from "@/components/Games/GameNavigation";

interface FillInTheBlankProps {
  levelId: number;
  levelData: any;
  difficulty?: string;
  isStarted?: boolean;
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

  // Get state and actions from the centralized store
  const {
    // Common game state
    gameState: { score, gameStatus, timerRunning, timeElapsed },
    // FillInTheBlank specific state
    fillInTheBlankState: {
      exercises,
      currentExerciseIndex,
      userAnswer,
      showHint,
      showTranslation,
      showFeedback,
      isCorrect,
      attemptsLeft,
    },
    // Actions
    initialize,
    startGame,
    handleRestart,
    setUserAnswer,
    toggleHint,
    toggleTranslation,
    checkAnswer,
    formatSentence,
    setTimerRunning,
    setTimeElapsed,
  } = useQuizStore();

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
    // Pass the gameMode parameter "fillBlanks"
    initialize(levelData, levelId, "fillBlanks", difficulty);

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
      setTimeElapsed(timeElapsed + 1); // This is a placeholder, needs actual timer integration
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
                  Attempts:{" "}
                  {attemptsLeft > 0
                    ? Array(attemptsLeft).fill("●").join(" ")
                    : "0"}
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

              {/* Feedback Message */}
              {showFeedback && (
                <Animatable.View
                  animation="fadeIn"
                  duration={300}
                  style={[
                    styles.feedbackCard,
                    isCorrect
                      ? styles.correctFeedback
                      : styles.incorrectFeedback,
                  ]}
                >
                  <View style={styles.feedbackIconContainer}>
                    {isCorrect ? (
                      <Check width={24} height={24} color={BASE_COLORS.white} />
                    ) : (
                      <AlertCircle
                        width={24}
                        height={24}
                        color={BASE_COLORS.white}
                      />
                    )}
                  </View>
                  <Text style={styles.feedbackText}>
                    {isCorrect
                      ? "Correct! Well done."
                      : attemptsLeft > 0
                      ? `Incorrect! ${attemptsLeft} attempt${
                          attemptsLeft === 1 ? "" : "s"
                        } left.`
                      : "Incorrect! No attempts left."}
                  </Text>
                </Animatable.View>
              )}

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
  attemptsDots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 4,
    gap: 6,
  },
  attemptDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BASE_COLORS.white,
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
  feedbackCard: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  correctFeedback: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderWidth: 1,
    borderColor: BASE_COLORS.success,
  },
  incorrectFeedback: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderWidth: 1,
    borderColor: BASE_COLORS.danger,
  },
  feedbackIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  feedbackText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    flex: 1,
  },
});

export default FillInTheBlank;
