import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft, Volume2, Check, X } from "react-native-feather";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { BASE_COLORS } from "@/constant/colors";
import useThemeStore from "@/store/useThemeStore";

// Mock data for the quiz
const mockQuestions = [
  {
    id: 1,
    question: "What is the translation of 'Hello'?",
    audio: "hello-audio-url",
    options: [
      { id: "a", text: "Bonjour", isCorrect: true },
      { id: "b", text: "Au revoir", isCorrect: false },
      { id: "c", text: "Merci", isCorrect: false },
      { id: "d", text: "S'il vous plaît", isCorrect: false },
    ],
  },
  {
    id: 2,
    question: "How do you say 'Thank you'?",
    audio: "thank-you-audio-url",
    options: [
      { id: "a", text: "Bonjour", isCorrect: false },
      { id: "b", text: "Au revoir", isCorrect: false },
      { id: "c", text: "Merci", isCorrect: true },
      { id: "d", text: "S'il vous plaît", isCorrect: false },
    ],
  },
  {
    id: 3,
    question: "What is the translation of 'Goodbye'?",
    audio: "goodbye-audio-url",
    options: [
      { id: "a", text: "Bonjour", isCorrect: false },
      { id: "b", text: "Au revoir", isCorrect: true },
      { id: "c", text: "Merci", isCorrect: false },
      { id: "d", text: "S'il vous plaît", isCorrect: false },
    ],
  },
  {
    id: 4,
    question: "How do you say 'Please'?",
    audio: "please-audio-url",
    options: [
      { id: "a", text: "Bonjour", isCorrect: false },
      { id: "b", text: "Au revoir", isCorrect: false },
      { id: "c", text: "Merci", isCorrect: false },
      { id: "d", text: "S'il vous plaît", isCorrect: true },
    ],
  },
  {
    id: 5,
    question: "What is the translation of 'Yes'?",
    audio: "yes-audio-url",
    options: [
      { id: "a", text: "Oui", isCorrect: true },
      { id: "b", text: "Non", isCorrect: false },
      { id: "c", text: "Peut-être", isCorrect: false },
      { id: "d", text: "Bien sûr", isCorrect: false },
    ],
  },
];
interface MultipleChoiceProps {
  levelId?: string;
}

const MultipleChoice: React.FC<MultipleChoiceProps> = ({ levelId }) => {
  // Theme store
  const { activeTheme } = useThemeStore();
  // Use levelId to potentially fetch level-specific questions
  useEffect(() => {
    // In a real app, you'd fetch questions for this specific level
    console.log(`Loading questions for level ${levelId}`);

    // For now we're using mock data, but in a real app you could:
    // fetchQuestions(levelId).then(data => setQuestions(data));
  }, [levelId]);

  // Game state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [gameStatus, setGameStatus] = useState("playing"); // playing, completed
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  const currentQuestion = mockQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / mockQuestions.length) * 100;

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

  // Handle option selection
  const handleOptionSelect = (optionId) => {
    if (selectedOption) return; // Prevent multiple selections

    setSelectedOption(optionId);

    const selectedOptionObj = currentQuestion.options.find(
      (option) => option.id === optionId
    );

    if (selectedOptionObj.isCorrect) {
      setScore(score + 1);
    }

    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestionIndex < mockQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption(null);
      } else {
        setGameStatus("completed");
      }
    }, 1500);
  };

  // Handle game restart
  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setGameStatus("playing");
  };

  // Go back to games screen
  const handleBackPress = () => {
    router.back();
  };

  // Get option style based on state
  const getOptionStyle = (optionId, isCorrect) => {
    if (selectedOption === null) return styles.optionCard;

    if (selectedOption === optionId) {
      return isCorrect
        ? [styles.optionCard, styles.correctOption]
        : [styles.optionCard, styles.incorrectOption];
    }

    if (selectedOption && isCorrect) {
      return [styles.optionCard, styles.correctOption];
    }

    return styles.optionCard;
  };

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
          <Text style={styles.headerTitle}>Multiple Choice Quiz</Text>
          <View style={styles.placeholder} />
        </View>

        {gameStatus === "playing" ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              Question {currentQuestionIndex + 1} of {mockQuestions.length}
            </Text>

            {/* Score Display */}
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>Score: {score}</Text>
            </View>

            {/* Question Card */}
            <Animatable.View
              animation="fadeIn"
              duration={500}
              style={styles.questionCard}
            >
              <LinearGradient
                colors={["#2563EB", "#1E40AF"]}
                style={styles.questionGradient}
              >
                <Text style={styles.questionText}>
                  {currentQuestion.question}
                </Text>

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

            {/* Options */}
            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option) => (
                <Animatable.View
                  key={option.id}
                  animation="fadeInUp"
                  duration={600}
                  delay={parseInt(option.id.charCodeAt(0) - 97) * 100}
                >
                  <TouchableOpacity
                    style={getOptionStyle(option.id, option.isCorrect)}
                    onPress={() => handleOptionSelect(option.id)}
                    disabled={selectedOption !== null}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.optionId}>
                      {option.id.toUpperCase()}
                    </Text>
                    <Text style={styles.optionText}>{option.text}</Text>

                    {selectedOption === option.id && (
                      <View style={styles.resultIconContainer}>
                        {option.isCorrect ? (
                          <Check
                            width={24}
                            height={24}
                            color={BASE_COLORS.white}
                          />
                        ) : (
                          <X width={24} height={24} color={BASE_COLORS.white} />
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                </Animatable.View>
              ))}
            </View>
          </ScrollView>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.resultContainer}
          >
            <Animatable.View animation="fadeIn" duration={800}>
              <LinearGradient
                colors={["#2563EB", "#1E40AF"]}
                style={styles.resultCard}
              >
                <Text style={styles.resultTitle}>Quiz Completed!</Text>
                <Text style={styles.resultScore}>
                  Your Score: {score}/{mockQuestions.length}
                </Text>
                <Text style={styles.resultPercentage}>
                  {Math.round((score / mockQuestions.length) * 100)}% Correct
                </Text>

                {score === mockQuestions.length ? (
                  <Animatable.View animation="pulse" iterationCount="infinite">
                    <Image
                      source={{ uri: "https://via.placeholder.com/150" }}
                      style={{ width: 150, height: 150, marginVertical: 20 }}
                    />
                  </Animatable.View>
                ) : (
                  <View style={styles.resultFeedback}>
                    <Text style={styles.feedbackText}>
                      {score > mockQuestions.length / 2
                        ? "Great job! Keep practicing to improve."
                        : "Keep practicing! You'll get better with time."}
                    </Text>
                  </View>
                )}

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
    backgroundColor: `${BASE_COLORS.blue}20`,
  },
  decorativeCircle2: {
    position: "absolute",
    bottom: -80,
    left: -60,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: `${BASE_COLORS.orange}15`,
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
    backgroundColor: BASE_COLORS.blue,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    opacity: 0.8,
    marginBottom: 16,
  },
  scoreContainer: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  questionCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  questionGradient: {
    padding: 20,
    borderRadius: 16,
    position: "relative",
  },
  questionText: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    marginBottom: 10,
    marginRight: 40, // Space for audio button
  },
  audioButton: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  correctOption: {
    backgroundColor: "rgba(34, 197, 94, 0.5)",
    borderWidth: 1,
    borderColor: BASE_COLORS.success,
  },
  incorrectOption: {
    backgroundColor: "rgba(239, 68, 68, 0.5)",
    borderWidth: 1,
    borderColor: BASE_COLORS.danger,
  },
  optionId: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    flex: 1,
  },
  resultIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
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
  feedbackText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    textAlign: "center",
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
    color: BASE_COLORS.blue,
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

export default MultipleChoice;
