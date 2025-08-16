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
  Animated,
  Platform,
  Keyboard,
  Dimensions,
} from "react-native";
import { Check, X, Eye, EyeOff } from "react-native-feather";
import { LinearGradient } from "expo-linear-gradient";
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
      const scrollViewRef = useRef<ScrollView>(null);

      // Simplified animation state
      const [isAnimating, setIsAnimating] = useState(true);
      const [keyboardHeight, setKeyboardHeight] = useState(0);
      const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

      // NEW: Animation refs for hint and translation
      const hintOpacity = useRef(new Animated.Value(0)).current;
      const translationOpacity = useRef(new Animated.Value(0)).current;

      // NEW: Animation for smooth keyboard transitions
      const keyboardAnim = useRef(new Animated.Value(0)).current;
      const containerTranslateY = useRef(new Animated.Value(0)).current;

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

      // NEW: Keyboard event listeners
      useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
          "keyboardDidShow",
          (e) => {
            const { height } = e.endCoordinates;
            setKeyboardHeight(height);
            setIsKeyboardVisible(true);

            // Smooth animation when keyboard appears
            Animated.parallel([
              Animated.timing(keyboardAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: false,
              }),
              Animated.timing(containerTranslateY, {
                toValue: -50, // Slight upward movement
                duration: 300,
                useNativeDriver: true,
              }),
            ]).start();

            // Auto-scroll to input section when keyboard appears
            setTimeout(() => {
              scrollViewRef.current?.scrollTo({
                y: 200,
                animated: true,
              });
            }, 350);
          }
        );

        const keyboardDidHideListener = Keyboard.addListener(
          "keyboardDidHide",
          () => {
            setKeyboardHeight(0);
            setIsKeyboardVisible(false);

            // Smooth animation when keyboard disappears
            Animated.parallel([
              Animated.timing(keyboardAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: false,
              }),
              Animated.timing(containerTranslateY, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
              }),
            ]).start();
          }
        );

        return () => {
          keyboardDidShowListener.remove();
          keyboardDidHideListener.remove();
        };
      }, [keyboardAnim, containerTranslateY]);

      // Animation effects for hint and translation
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

      // NEW: Focus handler for input
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
            },
          ]}
        >
          <ScrollView
            ref={scrollViewRef}
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
                    editable={!isAnimating}
                    returnKeyType="done"
                    onSubmitEditing={handleCheckAnswer}
                    onFocus={handleInputFocus}
                  />

                  {userAnswer.length > 0 && !isAnimating && (
                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={handleClear}
                      activeOpacity={0.7}
                    >
                      <X
                        width={14}
                        height={14}
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
                    >
                      CHECK
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

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
                  activeOpacity={0.7}
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
                    <Icon name="activity" size={18} color="#FFC107" />
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
                    <Eye width={18} height={18} color="#2196F3" />
                    <Text style={styles.helpCardTitle}>Translation</Text>
                  </View>
                  <Text style={styles.helpCardText}>
                    {currentExercise.translation}
                  </Text>
                </LinearGradient>
              </Animated.View>
            )}

            {/* Feedback Card */}
            {showFeedback && (
              <View style={styles.feedbackContainer}>
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
              </View>
            )}
          </ScrollView>
        </Animated.View>
      );
    }
  );

export default FillInTheBlankPlayingContent;
