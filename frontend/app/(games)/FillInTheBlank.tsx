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
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import DifficultyBadge from "@/components/Games/DifficultyBadge";
import { Check, X } from "react-native-feather";
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

// Add interface for HintButton props
interface HintButtonProps {
  showHint: boolean;
  onToggle: () => void;
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
    // Add error access
    error,
  } = useQuizStore();

  // Current exercise
  const currentExercise = exercises[currentExerciseIndex];
  const gameMode = "fillBlanks";

  useEffect(() => {
    // Set up the back handler
    const cleanupBackHandler = setupBackButtonHandler(gameStatus, timerRunning);

    // Clean up when component unmounts
    return () => cleanupBackHandler();
  }, [gameStatus, timerRunning]);

  // SIMPLIFIED INITIALIZATION EFFECT
  useEffect(() => {
    if (levelData && isStarted) {
      console.log("Initializing fillBlanks game with data:", levelData);

      // Initialize the game
      initialize(levelData, levelId, gameMode, difficulty);

      // Start immediately after initialization
      console.log("Starting fillBlanks game");
      startGame();
    }
  }, [levelData, isStarted]); // SIMPLIFIED DEPENDENCIES - remove initialize, startGame, etc.

  // Stop timer when answer is checked
  useEffect(() => {
    if (showFeedback) {
      setTimerRunning(false);
      // Track elapsed time for results
      setTimeElapsed(timeElapsed + 1); // This is a placeholder, needs actual timer integration
    }
  }, [showFeedback]);

  // Memoize the sentence formatting
  const memoizedSentence = useMemo(() => {
    return formatSentence();
  }, [formatSentence, currentExerciseIndex]);

  // Memoize toggle functions
  const memoizedToggleHint = useCallback(() => {
    toggleHint();
  }, [toggleHint]);

  const memoizedToggleTranslation = useCallback(() => {
    toggleTranslation();
  }, [toggleTranslation]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
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
            title={"Fill in the Blank"}
            disableBack={timerRunning}
            hideBack={true}
          />

          {/* Level Title */}
          <View style={gameSharedStyles.levelTitleContainer}>
            <Text style={gameSharedStyles.levelTitleText}>
              Level {levelId} - {currentExercise?.title || "Fill in the Blank"}
            </Text>
          </View>

          {gameStatus === "playing" ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[styles.contentContainer, { flexGrow: 1 }]}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              {/* Stats Container */}
              <Animatable.View
                animation="fadeIn"
                duration={600}
                delay={100}
                style={gameSharedStyles.statsContainer}
              >
                <Timer isRunning={timerRunning} />
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
                  <Text style={styles.sentenceText}>
                    {currentExercise?.sentence?.replace(
                      new RegExp(currentExercise?.answer || "", "gi"),
                      "_".repeat(currentExercise?.answer?.length || 5)
                    )}
                  </Text>
                </LinearGradient>
              </Animatable.View>

              {/* Input Section */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Fill in the blank:</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    ref={inputRef}
                    style={styles.input}
                    placeholder="Type your answer here..."
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={userAnswer}
                    onChangeText={setUserAnswer}
                    autoCapitalize="none"
                    selectionColor={BASE_COLORS.white}
                  />

                  {userAnswer.length > 0 && (
                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={() => setUserAnswer("")}
                    >
                      <X width={20} height={20} color={BASE_COLORS.white} />
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      !userAnswer.trim() && { opacity: 0.7 },
                    ]}
                    onPress={checkAnswer}
                    disabled={!userAnswer.trim() || showFeedback}
                  >
                    <Text style={styles.submitButtonText}>Check</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Help Buttons */}
              <View style={styles.helpButtonsContainer}>
                <TouchableOpacity
                  style={styles.hintButton}
                  onPress={memoizedToggleHint}
                >
                  <Text style={styles.hintButtonText}>
                    {showHint ? "Hide Hint" : "Show Hint"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.hintButton}
                  onPress={memoizedToggleTranslation}
                >
                  <Text style={styles.hintButtonText}>
                    {showTranslation ? "Hide Translation" : "Show Translation"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Hint Card */}
              {showHint && currentExercise?.hint && (
                <View style={styles.hintCard}>
                  <Text style={styles.hintLabel}>Hint:</Text>
                  <Text style={styles.hintText}>{currentExercise.hint}</Text>
                </View>
              )}

              {/* Translation Card */}
              {showTranslation && currentExercise?.translation && (
                <View style={styles.hintCard}>
                  <Text style={styles.hintLabel}>Translation:</Text>
                  <Text style={styles.hintText}>
                    {currentExercise.translation}
                  </Text>
                </View>
              )}

              {/* Feedback Card */}
              {showFeedback && (
                <View
                  style={[
                    styles.feedbackCard,
                    isCorrect
                      ? styles.correctFeedback
                      : styles.incorrectFeedback,
                  ]}
                >
                  <View style={styles.feedbackIconContainer}>
                    {isCorrect ? (
                      <Check width={20} height={20} color={BASE_COLORS.white} />
                    ) : (
                      <X width={20} height={20} color={BASE_COLORS.white} />
                    )}
                  </View>
                  <Text style={styles.feedbackText}>
                    {isCorrect ? "Correct!" : "Incorrect. Try again!"}
                  </Text>
                </View>
              )}
            </ScrollView>
          ) : gameStatus === "completed" ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={gameSharedStyles.contentContainer}
            >
              {/* Stats Container with Time Taken */}
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

              {/* Completion Message with score */}
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
          ) : (
            // Default loading state when idle
            <View style={gameSharedStyles.loaderContainer}>
              <ActivityIndicator size="large" color={BASE_COLORS.blue} />
              <Text style={styles.loadingText}>Loading exercise...</Text>
            </View>
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
  inputLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    marginBottom: 8,
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
  // Add the missing loadingText style
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    textAlign: "center",
  },
});

// Wrap child components with React.memo and proper typing
const HintButton = React.memo<HintButtonProps>(({ showHint, onToggle }) => (
  <TouchableOpacity
    style={styles.hintButton}
    onPress={onToggle}
    activeOpacity={0.8}
  >
    <Text style={styles.hintButtonText}>
      {showHint ? "Hide Hint" : "Show Hint"}
    </Text>
  </TouchableOpacity>
));

export default FillInTheBlank;
