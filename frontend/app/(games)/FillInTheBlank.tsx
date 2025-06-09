import React, { useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Check, X } from "react-native-feather";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { BASE_COLORS } from "@/constant/colors";
import useQuizStore from "@/store/Games/useQuizStore";
import useThemeStore from "@/store/useThemeStore";
import { getDifficultyColors } from "@/utils/gameUtils";
import styles from "@/styles/games/fillInTheBlank.styles";
import GameContainer from "@/components/games/GameContainer";
import GameCompletedContent from "@/components/games/GameCompletedContent";
import { useGameInitialization } from "@/hooks/useGameInitialization";
import Timer from "@/components/games/Timer";
import DifficultyBadge from "@/components/games/DifficultyBadge";
import gameSharedStyles from "@/styles/gamesSharedStyles";

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
  // Input ref
  const inputRef = useRef<TextInput>(null);

  // Get state and actions from the centralized store
  const {
    gameState: { score, gameStatus, timerRunning, timeElapsed },
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
    initialize,
    startGame,
    handleRestart,
    setUserAnswer,
    toggleHint,
    toggleTranslation,
    checkAnswer,
    setTimerRunning,
  } = useQuizStore();

  // Current exercise
  const currentExercise = exercises[currentExerciseIndex];
  const gameMode = "fillBlanks";

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

  // Stop timer when answer is checked
  useEffect(() => {
    if (showFeedback) {
      setTimerRunning(false);
    }
  }, [showFeedback, setTimerRunning]);

  // Memoize toggle functions
  const memoizedToggleHint = useCallback(() => {
    toggleHint();
  }, [toggleHint]);

  const memoizedToggleTranslation = useCallback(() => {
    toggleTranslation();
  }, [toggleTranslation]);

  // Custom playing content for fill in the blank
  const renderPlayingContent = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        gameSharedStyles.contentContainer,
        { flexGrow: 1 },
      ]}
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
          {attemptsLeft > 0 ? Array(attemptsLeft).fill("●").join(" ") : "0"}
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
          <Text style={styles.hintText}>{currentExercise.translation}</Text>
        </View>
      )}

      {/* Feedback Card */}
      {showFeedback && (
        <View
          style={[
            styles.feedbackCard,
            isCorrect ? styles.correctFeedback : styles.incorrectFeedback,
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
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <GameContainer
        title="Fill in the Blank"
        level={currentExercise?.level || `Level ${levelId}`}
        levelTitle={currentExercise?.title || "Fill in the Blank"}
        timerRunning={timerRunning}
        gameStatus={gameStatus}
      >
        {gameStatus === "playing" ? (
          renderPlayingContent()
        ) : (
          <GameCompletedContent
            score={score}
            timeElapsed={timeElapsed}
            difficulty={difficulty}
            question={exercises[0]?.sentence || "No question available"}
            userAnswer={userAnswer || "(No answer provided)"}
            isCorrect={score > 0}
            levelId={levelId}
            gameMode="fillBlanks"
            gameTitle="Fill in the Blank"
            onRestart={handleRestart}
          />
        )}
      </GameContainer>
    </KeyboardAvoidingView>
  );
};

export default FillInTheBlank;
