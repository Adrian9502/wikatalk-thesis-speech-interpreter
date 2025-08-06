import React, {
  useRef,
  useMemo,
  useCallback,
  useState,
  useEffect,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { Check, X, Eye, EyeOff } from "react-native-feather";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { BASE_COLORS } from "@/constant/colors";
import { getGameModeGradient } from "@/utils/gameUtils";
import styles from "@/styles/games/fillInTheBlank.styles";
import gamesSharedStyles from "@/styles/gamesSharedStyles";
import LevelTitleHeader from "@/components/games/LevelTitleHeader";
import Icon from "react-native-vector-icons/Feather";

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
      const inputRef = useRef<TextInput>(null);

      // NEW: Simplified animation state
      const [isAnimating, setIsAnimating] = useState(true);

      // Get game mode gradient
      const gameGradientColors = useMemo(
        () => getGameModeGradient("fillBlanks"),
        []
      );

      // NEW: Simplified animation - single duration
      useEffect(() => {
        const timer = setTimeout(() => {
          setIsAnimating(false);
        }, 800); // Single 800ms duration

        return () => clearTimeout(timer);
      }, []);

      // Memoize formatted sentence
      const formattedSentence = useMemo(() => {
        if (!currentExercise?.sentence || !currentExercise?.answer) {
          return "Loading...";
        }

        const sentence = currentExercise.sentence;
        const answer = currentExercise.answer;
        const blank = "_".repeat(Math.max(answer.length, 8));

        return sentence.replace(new RegExp(answer, "gi"), blank);
      }, [currentExercise?.sentence, currentExercise?.answer]);

      // Memoize attempts display
      const attemptsDisplay = useMemo(() => {
        const hearts = Array(2)
          .fill(0)
          .map((_, index) => (
            <Text
              key={index}
              style={[
                styles.heartIcon,
                index < attemptsLeft
                  ? styles.heartActive
                  : styles.heartInactive,
              ]}
            >
              ♥
            </Text>
          ));
        return hearts;
      }, [attemptsLeft]);

      const handleClear = useCallback(() => {
        if (isAnimating) return;
        setUserAnswer("");
      }, [setUserAnswer, isAnimating]);

      const canSubmit = useMemo(
        () => userAnswer.trim().length > 0 && !showFeedback && !isAnimating,
        [userAnswer, showFeedback, isAnimating]
      );

      const handleCheckAnswer = useCallback(() => {
        if (isAnimating || !canSubmit) return;
        checkAnswer();
      }, [checkAnswer, isAnimating, canSubmit]);

      const handleToggleHint = useCallback(() => {
        if (isAnimating) return;
        toggleHint();
      }, [toggleHint, isAnimating]);

      const handleToggleTranslation = useCallback(() => {
        if (isAnimating) return;
        toggleTranslation();
      }, [toggleTranslation, isAnimating]);

      return (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={gamesSharedStyles.gameContainer}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={gamesSharedStyles.questionCardContainer}>
            <LinearGradient
              colors={gameGradientColors}
              style={gamesSharedStyles.questionCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <LevelTitleHeader
                levelString={currentExercise?.level}
                actualTitle={currentExercise?.title}
                animationDelay={0}
              />
              {/* Sentence Text */}
              <View style={gamesSharedStyles.questionContainer}>
                {/* Question Text */}
                <Text style={gamesSharedStyles.questionText}>
                  {formattedSentence}
                </Text>
              </View>
              {/* Decorative Elements */}
              <View style={gamesSharedStyles.cardDecoration1} />
              <View style={gamesSharedStyles.cardDecoration2} />
            </LinearGradient>
          </View>

          {/* Attempts Display */}
          <View style={styles.attemptsContainer}>
            <Text style={styles.attemptsLabel}>Attempts left:</Text>
            <View style={styles.heartsContainer}>{attemptsDisplay}</View>
          </View>

          <View style={styles.inputSection}>
            <View style={styles.inputHeader}>
              <Text style={styles.inputLabel}>Your Answer:</Text>
            </View>

            <View style={styles.inputWrapper}>
              <LinearGradient
                colors={[
                  "rgba(255, 255, 255, 0.05)",
                  "rgba(255, 255, 255, 0.09)",
                ]}
                style={styles.inputContainer}
              >
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  placeholder="Type your answer here..."
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={userAnswer}
                  onChangeText={isAnimating ? undefined : setUserAnswer}
                  autoCapitalize="none"
                  selectionColor={BASE_COLORS.white}
                  multiline={false}
                  editable={!isAnimating}
                />

                {userAnswer.length > 0 && !isAnimating && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={handleClear}
                  >
                    <X
                      width={18}
                      height={18}
                      color="rgba(255, 255, 255, 0.7)"
                    />
                  </TouchableOpacity>
                )}
              </LinearGradient>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !canSubmit && styles.submitButtonDisabled,
                ]}
                onPress={handleCheckAnswer}
                disabled={!canSubmit}
              >
                <LinearGradient
                  colors={
                    canSubmit
                      ? ["#4CAF50", "#2E7D32"]
                      : ["rgba(255, 255, 255, 0.3)", "rgba(255, 255, 255, 0.2)"]
                  }
                  style={styles.submitGradient}
                >
                  <Text
                    style={[
                      styles.submitButtonText,
                      !canSubmit && styles.submitButtonTextDisabled,
                    ]}
                  >
                    CHECK
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Simplified Help Buttons - Single fadeIn */}
          <Animatable.View
            animation="fadeIn"
            duration={400}
            style={styles.helpSection}
          >
            <Text style={styles.helpTitle}>Need help?</Text>
            <View style={styles.helpButtons}>
              <TouchableOpacity
                style={[styles.helpButton, showHint && styles.helpButtonActive]}
                onPress={handleToggleHint}
                disabled={isAnimating}
              >
                <Icon
                  name="activity"
                  size={16}
                  color={
                    showHint ? BASE_COLORS.white : "rgba(255, 255, 255, 0.7)"
                  }
                />
                <Text
                  style={[
                    styles.helpButtonText,
                    showHint && styles.helpButtonTextActive,
                  ]}
                >
                  {showHint ? "Hide Hint" : "Show Hint"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.helpButton,
                  showTranslation && styles.helpButtonActive,
                ]}
                onPress={handleToggleTranslation}
                disabled={isAnimating}
              >
                {showTranslation ? (
                  <EyeOff width={16} height={16} color={BASE_COLORS.white} />
                ) : (
                  <Eye
                    width={16}
                    height={16}
                    color="rgba(255, 255, 255, 0.7)"
                  />
                )}
                <Text
                  style={[
                    styles.helpButtonText,
                    showTranslation && styles.helpButtonTextActive,
                  ]}
                >
                  {showTranslation ? "Hide Translation" : "Show Translation"}
                </Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>

          {/* Simplified Help Cards - Quick fadeIn when shown */}
          {showHint && currentExercise?.hint && (
            <Animatable.View
              animation="fadeIn"
              duration={400}
              style={styles.helpCard}
            >
              <LinearGradient
                colors={["rgba(255, 193, 7, 0.2)", "rgba(255, 193, 7, 0.1)"]}
                style={styles.helpCardGradient}
              >
                <View style={styles.helpCardHeader}>
                  <Icon name="activity" size={18} color="#FFC107" />
                  <Text style={styles.helpCardTitle}>Hint</Text>
                </View>
                <Text style={styles.helpCardText}>{currentExercise.hint}</Text>
              </LinearGradient>
            </Animatable.View>
          )}

          {showTranslation && currentExercise?.translation && (
            <Animatable.View
              animation="fadeIn"
              duration={400}
              style={styles.helpCard}
            >
              <LinearGradient
                colors={["rgba(33, 150, 243, 0.2)", "rgba(33, 150, 243, 0.1)"]}
                style={styles.helpCardGradient}
              >
                <View style={styles.helpCardHeader}>
                  <Eye width={18} height={18} color="#2196F3" />
                  <Text style={styles.helpCardTitle}>Translation</Text>
                </View>
                <Text style={styles.helpCardText}>
                  {currentExercise.translation}
                </Text>
              </LinearGradient>
            </Animatable.View>
          )}

          {/* Simplified Feedback Card - Quick bounceIn when shown */}
          {showFeedback && (
            <Animatable.View
              animation="bounceIn"
              duration={400}
              style={styles.feedbackContainer}
            >
              <LinearGradient
                colors={
                  isCorrect ? ["#4CAF50", "#2E7D32"] : ["#F44336", "#C62828"]
                }
                style={styles.feedbackCard}
              >
                <View style={styles.feedbackIcon}>
                  {isCorrect ? (
                    <Check width={24} height={24} color={BASE_COLORS.white} />
                  ) : (
                    <X width={24} height={24} color={BASE_COLORS.white} />
                  )}
                </View>
                <View style={styles.feedbackContent}>
                  <Text style={styles.feedbackTitle}>
                    {isCorrect ? "Perfect!" : "Not quite right"}
                  </Text>
                  <Text style={styles.feedbackText}>
                    {isCorrect
                      ? "You got it! Well done."
                      : `Try again! You have ${attemptsLeft} attempts left.`}
                  </Text>
                </View>
              </LinearGradient>
            </Animatable.View>
          )}
        </ScrollView>
      );
    }
  );

export default FillInTheBlankPlayingContent;
