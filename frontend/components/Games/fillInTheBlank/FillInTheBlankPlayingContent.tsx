import React, {
  useRef,
  useMemo,
  useCallback,
  useState,
  useEffect,
  useLayoutEffect,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Keyboard,
} from "react-native";
import { Check, X, Eye, EyeOff } from "react-native-feather";
import { LinearGradient } from "expo-linear-gradient";
import { BASE_COLORS } from "@/constant/colors";
import { getGameModeGradient } from "@/utils/gameUtils";
import styles from "@/styles/games/fillInTheBlank.styles";
import gamesSharedStyles from "@/styles/gamesSharedStyles";
import LevelTitleHeader from "@/components/games/LevelTitleHeader";
import HintButton from "@/components/games/hints/HintButton";
import useHintStore from "@/store/games/useHintStore";
import Icon from "react-native-vector-icons/Feather";
import { useNavigation } from "expo-router";

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
      const navigation = useNavigation();

      useLayoutEffect(() => {
        navigation.setOptions({
          windowSoftInputMode: "adjustNothing",
        });
      }, [navigation]);

      const inputRef = useRef<TextInput>(null);
      const scrollViewRef = useRef<ScrollView>(null);

      // Simplified animation state
      const [isAnimating, setIsAnimating] = useState(true);

      // Animation refs for hint and translation
      const hintOpacity = useRef(new Animated.Value(0)).current;
      const translationOpacity = useRef(new Animated.Value(0)).current;
      const feedbackScale = useRef(new Animated.Value(0)).current;
      const keyboardAnim = useRef(new Animated.Value(0)).current;
      const containerTranslateY = useRef(new Animated.Value(0)).current;

      // NEW: Hint store integration
      const {
        currentQuestionHints,
        hintsUsedCount,
        setCurrentQuestion,
        resetQuestionHints,
      } = useHintStore();

      // NEW: Generate questionId for hint system
      const questionId = useMemo(() => {
        return `${currentExercise?.id || levelData?.id}_${difficulty}`;
      }, [currentExercise?.id, levelData?.id, difficulty]);

      // NEW: Set current question for hint system
      useEffect(() => {
        if (questionId) {
          setCurrentQuestion(questionId);
        }
      }, [questionId, setCurrentQuestion]);

      // Memoized values
      const gameGradientColors = useMemo(
        () => getGameModeGradient("fillBlanks"),
        []
      );

      // Simplified animation timing
      useEffect(() => {
        const timer = setTimeout(() => {
          setIsAnimating(false);
        }, 700);

        return () => clearTimeout(timer);
      }, []);

      useEffect(() => {
        if (showFeedback) {
          feedbackScale.setValue(0);
          Animated.spring(feedbackScale, {
            toValue: 1,
            tension: 80,
            friction: 15,
            useNativeDriver: true,
          }).start();
        } else {
          feedbackScale.setValue(0);
        }
      }, [showFeedback, feedbackScale]);

      useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
          "keyboardDidShow",
          (e) => {
            Animated.parallel([
              Animated.timing(keyboardAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: false,
              }),
              Animated.timing(containerTranslateY, {
                toValue: -e.endCoordinates.height / 4,
                duration: 300,
                useNativeDriver: true,
              }),
            ]).start();
          }
        );

        const keyboardDidHideListener = Keyboard.addListener(
          "keyboardDidHide",
          () => {
            Animated.parallel([
              Animated.timing(keyboardAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
              }),
              Animated.timing(containerTranslateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }),
            ]).start();
          }
        );

        return () => {
          keyboardDidShowListener?.remove();
          keyboardDidHideListener?.remove();
        };
      }, [keyboardAnim, containerTranslateY]);

      useEffect(() => {
        if (showHint) {
          Animated.timing(hintOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }).start();
        } else {
          hintOpacity.setValue(0);
        }
      }, [showHint, hintOpacity]);

      useEffect(() => {
        if (showTranslation) {
          Animated.timing(translationOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }).start();
        } else {
          translationOpacity.setValue(0);
        }
      }, [showTranslation, translationOpacity]);

      // NEW: Memoized letter hint display
      const letterHintDisplay = useMemo(() => {
        if (!currentExercise?.answer) {
          return "_".repeat(8); // Default placeholder
        }

        const answer = currentExercise.answer;
        let displayAnswer = "_".repeat(answer.length);

        // Replace underscores with revealed letters from hints
        currentQuestionHints.forEach((letterIndex) => {
          const index = parseInt(letterIndex.replace("letter_", ""));
          if (index >= 0 && index < answer.length) {
            displayAnswer =
              displayAnswer.substring(0, index) +
              answer[index] +
              displayAnswer.substring(index + 1);
          }
        });

        return displayAnswer;
      }, [currentExercise?.answer, currentQuestionHints]);

      // Memoized formatted sentence
      const formattedSentence = useMemo(() => {
        if (!currentExercise?.sentence || !currentExercise?.answer) {
          return "Loading...";
        }

        const sentence = currentExercise.sentence;
        const answer = currentExercise.answer;
        const blank = "_".repeat(Math.max(answer.length, 8));

        return sentence.replace(new RegExp(answer, "gi"), blank);
      }, [currentExercise?.sentence, currentExercise?.answer]);

      // Memoized attempts display
      const attemptsDisplay = useMemo(() => {
        return Array(2)
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
      }, [attemptsLeft]);

      // Memoized handlers
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
        Keyboard.dismiss();
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

      const handleInputFocus = useCallback(() => {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: 150,
            animated: true,
          });
        }, 300);
      }, []);

      return (
        <Animated.View
          style={[
            gamesSharedStyles.gameContainer,
            {
              transform: [{ translateY: containerTranslateY }],
              minHeight: "100%",
            },
          ]}
        >
          <ScrollView
            ref={scrollViewRef}
            bounces={false}
            overScrollMode="never"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            removeClippedSubviews={false}
            contentContainerStyle={[styles.scrollContainer]}
            style={{ flex: 1 }}
          >
            {/* Sentence Card */}
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
                <View style={gamesSharedStyles.questionContainer}>
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

            {/* Hint Section with Letter Display and Hint Button */}
            <View style={styles.hintSection}>
              {/* Left side: Letter hint display */}
              <View style={styles.letterHintContainer}>
                <Text style={styles.letterHintLabel}>Hint:</Text>
                <View style={styles.letterHintDisplay}>
                  <Text style={styles.letterHintText}>
                    {hintsUsedCount > 0
                      ? letterHintDisplay
                      : "_".repeat(currentExercise?.answer?.length || 5)}
                  </Text>
                </View>
              </View>

              {/* Right side: Hint button */}
              <View style={styles.hintButtonContainer}>
                <HintButton
                  questionId={questionId}
                  gameMode="fillBlanks"
                  options={
                    currentExercise?.answer
                      ? currentExercise.answer
                          .split("")
                          .map((letter: string, index: number) => ({
                            id: `letter_${index}`,
                            text: letter,
                            isCorrect: true, // All letters are "correct" for fill in the blank
                          }))
                      : []
                  }
                  disabled={showFeedback || isAnimating}
                />
              </View>
            </View>

            {/* Input Section */}
            <View style={styles.inputSection}>
              <View style={styles.inputHeader}>
                <Text style={styles.inputLabel}>Your Answer:</Text>
              </View>

              <View style={styles.inputWrapper}>
                <View style={styles.inputContainer}>
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
                    numberOfLines={1}
                    editable={!isAnimating}
                    onSubmitEditing={handleCheckAnswer}
                    onFocus={handleInputFocus}
                  />

                  {userAnswer.length > 0 && !isAnimating && (
                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={handleClear}
                      activeOpacity={0.8}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <X
                        width={12}
                        height={12}
                        color="rgba(255, 255, 255, 0.7)"
                      />
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    !canSubmit && styles.submitButtonDisabled,
                  ]}
                  onPress={handleCheckAnswer}
                  disabled={!canSubmit}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      canSubmit
                        ? ["#4CAF50", "#2E7D32"]
                        : [
                            "rgba(255, 255, 255, 0.3)",
                            "rgba(255, 255, 255, 0.2)",
                          ]
                    }
                    style={styles.submitGradient}
                  >
                    <Text
                      style={[
                        styles.submitButtonText,
                        !canSubmit && styles.submitButtonTextDisabled,
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit={true}
                      minimumFontScale={0.8}
                    >
                      Submit
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {/* Feedback Card with Bounce Animation */}
            {showFeedback && (
              <Animated.View
                style={[
                  styles.feedbackContainer,
                  {
                    transform: [
                      {
                        scale: feedbackScale.interpolate({
                          inputRange: [0, 1, 1.5],
                          outputRange: [0, 1, 1.05],
                          extrapolate: "clamp",
                        }),
                      },
                    ],
                  },
                ]}
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
                      {isCorrect ? "Perfect!" : "Oops, try again!"}
                    </Text>
                    <Text style={styles.feedbackText}>
                      {isCorrect
                        ? "You got it! Well done."
                        : `Try again! You have ${attemptsLeft} attempts left.`}
                    </Text>
                  </View>
                </LinearGradient>
              </Animated.View>
            )}

            {/* Help Buttons */}
            <View style={styles.helpSection}>
              <Text style={styles.helpTitle}>Need help?</Text>
              <View style={styles.helpButtons}>
                <TouchableOpacity
                  style={[
                    styles.helpButton,
                    showHint && styles.helpButtonActive,
                  ]}
                  onPress={handleToggleHint}
                  disabled={isAnimating}
                  activeOpacity={0.7}
                >
                  <Icon
                    name="activity"
                    size={13}
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
                  activeOpacity={0.7}
                >
                  {showTranslation ? (
                    <EyeOff width={13} height={13} color={BASE_COLORS.white} />
                  ) : (
                    <Eye
                      width={13}
                      height={13}
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
            </View>

            {/* Help Cards */}
            {showHint && currentExercise?.hint && (
              <Animated.View
                style={[
                  styles.helpCard,
                  {
                    opacity: hintOpacity,
                  },
                ]}
              >
                <LinearGradient
                  colors={["rgba(255, 193, 7, 0.2)", "rgba(255, 193, 7, 0.1)"]}
                  style={styles.helpCardGradient}
                >
                  <View style={styles.helpCardHeader}>
                    <Icon name="activity" size={13} color="#FFC107" />
                    <Text style={styles.helpCardTitle}>Hint</Text>
                  </View>
                  <Text style={styles.helpCardText}>
                    {currentExercise.hint}
                  </Text>
                </LinearGradient>
              </Animated.View>
            )}

            {showTranslation && currentExercise?.translation && (
              <Animated.View
                style={[
                  styles.helpCard,
                  {
                    opacity: translationOpacity,
                  },
                ]}
              >
                <LinearGradient
                  colors={[
                    "rgba(33, 150, 243, 0.2)",
                    "rgba(33, 150, 243, 0.1)",
                  ]}
                  style={styles.helpCardGradient}
                >
                  <View style={styles.helpCardHeader}>
                    <Eye width={13} height={13} color="#2196F3" />
                    <Text style={styles.helpCardTitle}>Translation</Text>
                  </View>
                  <Text style={styles.helpCardText}>
                    {currentExercise.translation}
                  </Text>
                </LinearGradient>
              </Animated.View>
            )}
          </ScrollView>
        </Animated.View>
      );
    }
  );

export default FillInTheBlankPlayingContent;
