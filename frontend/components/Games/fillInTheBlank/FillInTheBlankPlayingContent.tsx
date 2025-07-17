import React, { useRef, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { Check, X } from "react-native-feather";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { BASE_COLORS } from "@/constant/colors";
import { getDifficultyColors } from "@/utils/gameUtils";
import styles from "@/styles/games/fillInTheBlank.styles";
import gameSharedStyles from "@/styles/gamesSharedStyles";

interface RenderPlayingContentProps {
  difficulty: string;
  levelData: any;
  timerRunning: boolean;
  userAnswer: string;
  showHint: boolean;
  showTranslation: boolean;
  showFeedback: boolean;
  isCorrect: boolean;
  attemptsLeft: number;
  currentExercise: any;
  setUserAnswer: (value: string) => void;
  toggleHint: () => void;
  toggleTranslation: () => void;
  checkAnswer: () => void;
}

const FillInTheBlankPlayingContent: React.FC<RenderPlayingContentProps> =
  React.memo(
    ({
      difficulty,
      levelData,
      userAnswer,
      showHint,
      showTranslation,
      showFeedback,
      isCorrect,
      attemptsLeft,
      currentExercise,
      setUserAnswer,
      toggleHint,
      toggleTranslation,
      checkAnswer,
    }) => {
      // Input ref
      const inputRef = useRef<TextInput>(null);

      // PERFORMANCE: Memoize gradient colors
      const gradientColors = useMemo(
        () =>
          getDifficultyColors(difficulty, levelData) as readonly [
            string,
            string
          ],
        [difficulty, levelData]
      );

      // PERFORMANCE: Memoize formatted sentence
      const formattedSentence = useMemo(() => {
        if (!currentExercise?.sentence || !currentExercise?.answer) {
          return "Loading...";
        }
        return currentExercise.sentence.replace(
          new RegExp(currentExercise.answer, "gi"),
          "_".repeat(currentExercise.answer.length)
        );
      }, [currentExercise?.sentence, currentExercise?.answer]);

      // PERFORMANCE: Memoize attempts display
      const attemptsDisplay = useMemo(
        () =>
          attemptsLeft > 0 ? Array(attemptsLeft).fill("●").join(" ") : "0",
        [attemptsLeft]
      );

      // PERFORMANCE: Memoize clear handler
      const handleClear = useCallback(() => {
        setUserAnswer("");
      }, [setUserAnswer]);

      // PERFORMANCE: Memoize button states
      const canSubmit = useMemo(
        () => userAnswer.trim().length > 0 && !showFeedback,
        [userAnswer, showFeedback]
      );

      return (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            gameSharedStyles.contentContainer,
            { flexGrow: 1 },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Attempts Display */}
          <View style={styles.attemptsContainer}>
            <Text style={styles.attemptsText}>Attempts: {attemptsDisplay}</Text>
          </View>

          {/* Sentence Card */}
          <Animatable.View
            animation="fadeInUp"
            duration={500}
            style={styles.sentenceCard}
          >
            <LinearGradient
              colors={gradientColors}
              style={styles.sentenceGradient}
            >
              <Text style={styles.sentenceText}>{formattedSentence}</Text>
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
                  onPress={handleClear}
                >
                  <X width={20} height={20} color={BASE_COLORS.white} />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.submitButton, !canSubmit && { opacity: 0.7 }]}
                onPress={checkAnswer}
                disabled={!canSubmit}
              >
                <Text style={styles.submitButtonText}>Check</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Help Buttons */}
          <View style={styles.helpButtonsContainer}>
            <TouchableOpacity style={styles.hintButton} onPress={toggleHint}>
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
                {isCorrect ? "Level Completed!" : "Incorrect. Try again!"}
              </Text>
            </View>
          )}
        </ScrollView>
      );
    },
    (prevProps, nextProps) => {
      // PERFORMANCE: Custom comparison for better memoization
      return (
        prevProps.userAnswer === nextProps.userAnswer &&
        prevProps.showHint === nextProps.showHint &&
        prevProps.showTranslation === nextProps.showTranslation &&
        prevProps.showFeedback === nextProps.showFeedback &&
        prevProps.isCorrect === nextProps.isCorrect &&
        prevProps.attemptsLeft === nextProps.attemptsLeft &&
        prevProps.currentExercise?.sentence ===
          nextProps.currentExercise?.sentence &&
        prevProps.currentExercise?.answer ===
          nextProps.currentExercise?.answer &&
        prevProps.difficulty === nextProps.difficulty
      );
    }
  );

export default FillInTheBlankPlayingContent;
