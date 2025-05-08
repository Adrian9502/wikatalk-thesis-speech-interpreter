import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
  TextInput,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ChevronLeft,
  Volume2,
  Check,
  AlertTriangle,
  XCircle,
} from "react-native-feather";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { BASE_COLORS } from "@/constant/colors";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";

// Mock data for the fill in the blank game
const mockExercises = [
  {
    id: 1,
    sentence: "Je vais acheter du ___ au marché.",
    answer: "pain",
    audio: "sentence-1-audio-url",
    translation: "I am going to buy bread at the market.",
    hint: "This is something you eat that's made from flour.",
  },
  {
    id: 2,
    sentence: "Elle ___ de la musique tous les jours.",
    answer: "écoute",
    audio: "sentence-2-audio-url",
    translation: "She listens to music every day.",
    hint: "This verb means to pay attention with your ears.",
  },
  {
    id: 3,
    sentence: "Nous allons ___ au restaurant ce soir.",
    answer: "manger",
    audio: "sentence-3-audio-url",
    translation: "We are going to eat at the restaurant tonight.",
    hint: "This is what you do with food.",
  },
  {
    id: 4,
    sentence: "Le ___ est très beau aujourd'hui.",
    answer: "temps",
    audio: "sentence-4-audio-url",
    translation: "The weather is very nice today.",
    hint: "This refers to atmospheric conditions.",
  },
  {
    id: 5,
    sentence: "Il faut ___ tes devoirs avant de sortir.",
    answer: "finir",
    audio: "sentence-5-audio-url",
    translation: "You must finish your homework before going out.",
    hint: "This verb means to complete something.",
  },
];
interface FillInTheBlankProps {
  levelId?: string;
}

const FillInTheBlank: React.FC<FillInTheBlankProps> = ({ levelId }) => {
  // Theme store
  const { activeTheme } = useThemeStore();
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);

  // Refs
  const inputRef = useRef(null);

  // Game state
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [gameStatus, setGameStatus] = useState("playing"); // playing, completed
  const [showHint, setShowHint] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(2); // 2 attempts per question

  const currentExercise = mockExercises[currentExerciseIndex];
  const progress = ((currentExerciseIndex + 1) / mockExercises.length) * 100;

  // Format sentence with blank
  const formatSentence = () => {
    return currentExercise.sentence.replace("___", "______");
  };

  // Play audio function (mock)
  const playAudio = () => {
    setIsAudioLoading(true);
    setIsPlaying(true);

    // Simulate audio loading and playing
    setTimeout(() => {
      setIsAudioLoading(false);

      // Simulate audio playback duration
      setTimeout(() => {
        setIsPlaying(false);
      }, 2000);
    }, 1000);
  };

  // Check answer
  const checkAnswer = () => {
    Keyboard.dismiss();

    // Simple normalization for comparison
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const normalizedCorrectAnswer = currentExercise.answer.toLowerCase();

    const correct = normalizedUserAnswer === normalizedCorrectAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setScore(score + 1);

      // Move to next exercise after delay
      setTimeout(() => {
        if (currentExerciseIndex < mockExercises.length - 1) {
          moveToNext();
        } else {
          setGameStatus("completed");
        }
      }, 1500);
    } else {
      // Decrease attempts
      const newAttemptsLeft = attemptsLeft - 1;
      setAttemptsLeft(newAttemptsLeft);

      // If no attempts left, show correct answer and move on after delay
      if (newAttemptsLeft <= 0) {
        setTimeout(() => {
          if (currentExerciseIndex < mockExercises.length - 1) {
            moveToNext();
          } else {
            setGameStatus("completed");
          }
        }, 2500);
      } else {
        // Hide feedback after a delay to allow another attempt
        setTimeout(() => {
          setShowFeedback(false);
        }, 1500);
      }
    }
  };

  // Move to next exercise
  const moveToNext = () => {
    setCurrentExerciseIndex(currentExerciseIndex + 1);
    setUserAnswer("");
    setShowFeedback(false);
    setShowHint(false);
    setShowTranslation(false);
    setAttemptsLeft(2);

    // Focus on input after a delay
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Handle game restart
  const handleRestart = () => {
    setCurrentExerciseIndex(0);
    setUserAnswer("");
    setScore(0);
    setShowFeedback(false);
    setShowHint(false);
    setShowTranslation(false);
    setAttemptsLeft(2);
    setGameStatus("playing");

    // Focus on input after a delay
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Toggle hint visibility
  const toggleHint = () => {
    setShowHint(!showHint);
  };

  // Toggle translation visibility
  const toggleTranslation = () => {
    setShowTranslation(!showTranslation);
  };

  // Go back to games screen
  const handleBackPress = () => {
    router.back();
  };

  // Focus input on initial render
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
  }, []);

  return (
    <View
      style={[styles.wrapper, { backgroundColor: activeTheme.backgroundColor }]}
    >
      {/* Decorative Background Elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      <SafeAreaView style={[styles.container]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <ChevronLeft width={24} height={24} color={BASE_COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Fill in the Blanks</Text>
          <View style={styles.placeholder} />
        </View>

        {gameStatus === "playing" ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
          >
            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${progress}%`,
                    backgroundColor: BASE_COLORS.success,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              Exercise {currentExerciseIndex + 1} of {mockExercises.length}
            </Text>

            {/* Score and Attempts Display */}
            <View style={styles.statsContainer}>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>Score: {score}</Text>
              </View>
              <View style={styles.attemptsContainer}>
                <Text style={styles.attemptsText}>
                  Attempts: {Array(attemptsLeft).fill("●").join(" ")}
                </Text>
              </View>
            </View>

            {/* Sentence Card */}
            <Animatable.View
              animation="fadeIn"
              duration={500}
              style={styles.sentenceCard}
            >
              <LinearGradient
                colors={[BASE_COLORS.success, "#059669"]}
                style={styles.sentenceGradient}
              >
                <Text style={styles.sentenceText}>{formatSentence()}</Text>

                <TouchableOpacity
                  style={styles.audioButton}
                  onPress={playAudio}
                  disabled={isPlaying || isAudioLoading}
                >
                  {isAudioLoading ? (
                    <ActivityIndicator size="small" color={BASE_COLORS.white} />
                  ) : (
                    <Volume2 width={20} height={20} color={BASE_COLORS.white} />
                  )}
                </TouchableOpacity>
              </LinearGradient>
            </Animatable.View>

            {/* Input Section */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Fill in the blank:</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  value={userAnswer}
                  onChangeText={setUserAnswer}
                  placeholder="Type your answer here"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  returnKeyType="done"
                  onSubmitEditing={checkAnswer}
                  editable={
                    !showFeedback ||
                    (showFeedback && !isCorrect && attemptsLeft > 0)
                  }
                />
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    userAnswer.trim() === "" && styles.disabledButton,
                    showFeedback && isCorrect && styles.correctButton,
                    showFeedback && !isCorrect && styles.incorrectButton,
                  ]}
                  onPress={checkAnswer}
                  disabled={
                    userAnswer.trim() === "" ||
                    (showFeedback && (isCorrect || attemptsLeft <= 0))
                  }
                >
                  <Text style={styles.submitButtonText}>Check</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Feedback Section */}
            {showFeedback && (
              <Animatable.View
                animation="fadeIn"
                duration={300}
                style={styles.feedbackContainer}
              >
                {isCorrect ? (
                  <View style={styles.correctFeedback}>
                    <Check width={24} height={24} color={BASE_COLORS.white} />
                    <Text style={styles.feedbackText}>Correct!</Text>
                  </View>
                ) : (
                  <View style={styles.incorrectFeedback}>
                    {attemptsLeft > 0 ? (
                      <>
                        <AlertTriangle
                          width={24}
                          height={24}
                          color={BASE_COLORS.white}
                        />
                        <Text style={styles.feedbackText}>
                          Try again! {attemptsLeft}{" "}
                          {attemptsLeft === 1 ? "attempt" : "attempts"} left.
                        </Text>
                      </>
                    ) : (
                      <>
                        <XCircle
                          width={24}
                          height={24}
                          color={BASE_COLORS.white}
                        />
                        <Text style={styles.feedbackText}>
                          The correct answer is: {currentExercise.answer}
                        </Text>
                      </>
                    )}
                  </View>
                )}
              </Animatable.View>
            )}

            {/* Help Buttons */}
            <View style={styles.helpButtonsContainer}>
              <TouchableOpacity style={styles.hintButton} onPress={toggleHint}>
                <Text style={styles.hintButtonText}>
                  {showHint ? "Hide Hint" : "Show Hint"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.translationButton}
                onPress={toggleTranslation}
              >
                <Text style={styles.translationButtonText}>
                  {showTranslation ? "Hide Translation" : "Show Translation"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Hint Card */}
            {showHint && (
              <Animatable.View
                animation="fadeIn"
                duration={300}
                style={styles.hintCard}
              >
                <Text style={styles.hintLabel}>Hint:</Text>
                <Text style={styles.hintText}>{currentExercise.hint}</Text>
              </Animatable.View>
            )}

            {/* Translation Card */}
            {showTranslation && (
              <Animatable.View
                animation="fadeIn"
                duration={300}
                style={styles.translationCard}
              >
                <Text style={styles.translationLabel}>Translation:</Text>
                <Text style={styles.translationText}>
                  {currentExercise.translation}
                </Text>
              </Animatable.View>
            )}
          </ScrollView>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.resultContainer}
          >
            <Animatable.View animation="fadeIn" duration={800}>
              <LinearGradient
                colors={[BASE_COLORS.success, "#059669"]}
                style={styles.resultCard}
              >
                <Text style={styles.resultTitle}>Exercise Complete!</Text>
                <Text style={styles.resultScore}>
                  Your Score: {score}/{mockExercises.length}
                </Text>
                <Text style={styles.resultPercentage}>
                  {Math.round((score / mockExercises.length) * 100)}% Correct
                </Text>

                <View style={styles.resultFeedback}>
                  <Text style={styles.feedbackText}>
                    {score === mockExercises.length
                      ? "Perfect! You've mastered these exercises!"
                      : score > mockExercises.length / 2
                      ? "Good job! Keep practicing to improve."
                      : "Practice makes perfect! Try again to improve your skills."}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.restartButton}
                  onPress={handleRestart}
                >
                  <Text style={styles.restartButtonText}>Play Again</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backToGamesButton}
                  onPress={handleBackPress}
                >
                  <Text style={styles.backToGamesText}>Back to Games</Text>
                </TouchableOpacity>
              </LinearGradient>
            </Animatable.View>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: "relative",
  },
  decorativeCircle1: {
    position: "absolute",
    top: -100,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: `${BASE_COLORS.success}20`,
  },
  decorativeCircle2: {
    position: "absolute",
    bottom: -80,
    left: -60,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: `${BASE_COLORS.blue}15`,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  placeholder: {
    width: 40,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    opacity: 0.8,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  scoreContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  attemptsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  attemptsText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  sentenceCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  sentenceGradient: {
    padding: 20,
    borderRadius: 16,
    position: "relative",
  },
  sentenceText: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    textAlign: "center",
    marginBottom: 10,
  },
  audioButton: {
    alignSelf: "center",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 12,
    overflow: "hidden",
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
  disabledButton: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  correctButton: {
    backgroundColor: "rgba(34, 197, 94, 0.8)",
  },
  incorrectButton: {
    backgroundColor: "rgba(239, 68, 68, 0.8)",
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  feedbackContainer: {
    marginVertical: 16,
    alignItems: "center",
  },
  correctFeedback: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  incorrectFeedback: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  feedbackText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    marginLeft: 8,
  },
  helpButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  hintButton: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 10,
    alignItems: "center",
  },
  hintButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
  },
  translationButton: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginLeft: 10,
    alignItems: "center",
  },
  translationButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
  },
  hintCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
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
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    fontStyle: "italic",
  },
  translationCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  translationLabel: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    marginBottom: 4,
  },
  translationText: {
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    fontStyle: "italic",
  },
  resultContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 40,
  },
  resultCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  resultTitle: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: BASE_COLORS.white,
    marginBottom: 16,
  },
  resultScore: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    marginBottom: 8,
  },
  resultPercentage: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    opacity: 0.9,
    marginBottom: 20,
  },
  resultFeedback: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 16,
    borderRadius: 12,
    marginVertical: 20,
    width: "100%",
  },
  restartButton: {
    backgroundColor: BASE_COLORS.white,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginVertical: 8,
    width: "100%",
    alignItems: "center",
  },
  restartButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: BASE_COLORS.success,
  },
  backToGamesButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  backToGamesText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
  },
});

export default FillInTheBlank;
