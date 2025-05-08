import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ChevronLeft,
  Volume2,
  CheckCircle,
  XCircle,
} from "react-native-feather";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { BASE_COLORS } from "@/constant/colors";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";

// Mock data for the identification game
const mockSentences = [
  {
    id: 1,
    sentence: "Je vais au marché pour acheter des fruits.",
    targetWord: "marché",
    audio: "sentence-1-audio-url",
    translation: "I am going to the market to buy fruits.",
  },
  {
    id: 2,
    sentence: "Mon frère aime jouer au football avec ses amis.",
    targetWord: "football",
    audio: "sentence-2-audio-url",
    translation: "My brother likes to play football with his friends.",
  },
  {
    id: 3,
    sentence: "La voiture rouge est garée devant la maison.",
    targetWord: "voiture",
    audio: "sentence-3-audio-url",
    translation: "The red car is parked in front of the house.",
  },
  {
    id: 4,
    sentence: "Elle aime lire des livres pendant son temps libre.",
    targetWord: "livres",
    audio: "sentence-4-audio-url",
    translation: "She likes to read books during her free time.",
  },
  {
    id: 5,
    sentence: "Nous avons mangé au restaurant hier soir.",
    targetWord: "restaurant",
    audio: "sentence-5-audio-url",
    translation: "We ate at the restaurant last night.",
  },
];

interface IdentificationProps {
  levelId?: string;
}

interface WordItem {
  display: string;
  clean: string;
  isPunctuation: boolean; // Make this a simple boolean instead of union type
}

// Define type for feedback state
type FeedbackType = "correct" | "incorrect" | null;

const Identification: React.FC<IdentificationProps> = ({ levelId }) => {
  // Theme store
  const { activeTheme } = useThemeStore();
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);

  // Game state with proper types
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedWord, setSelectedWord] = useState<number | null>(null);
  const [gameStatus, setGameStatus] = useState<"playing" | "completed">(
    "playing"
  );
  const [showTranslation, setShowTranslation] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackType>(null);

  const currentSentence = mockSentences[currentSentenceIndex];
  const progress = ((currentSentenceIndex + 1) / mockSentences.length) * 100;

  // Split sentence into words for selection
  const words = currentSentence.sentence.split(/\s+/).map((word) => {
    const cleanWord = word.replace(/[.,!?;:]/g, "");
    return {
      display: word,
      clean: cleanWord,
      isPunctuation: Boolean(word.match(/[.,!?;:]/)), // Convert to a true boolean
    };
  });

  useEffect(() => {
    console.log("Identification game loaded with level ID:", levelId);
  }, [levelId]);

  // Play audio function (mock)
  const playAudio = () => {
    setIsAudioLoading(true);
    setIsPlaying(true);

    setTimeout(() => {
      setIsAudioLoading(false);

      setTimeout(() => {
        setIsPlaying(false);
      }, 2000);
    }, 1000);
  };

  // Handle word selection
  const handleWordSelect = (word: WordItem, index: number) => {
    if (selectedWord !== null || word.isPunctuation) return;

    setSelectedWord(index);

    const isCorrect =
      word.clean.toLowerCase() === currentSentence.targetWord.toLowerCase();

    if (isCorrect) {
      setScore(score + 1);
      setFeedback("correct");
    } else {
      setFeedback("incorrect");
    }

    setTimeout(() => {
      if (currentSentenceIndex < mockSentences.length - 1) {
        setCurrentSentenceIndex(currentSentenceIndex + 1);
        setSelectedWord(null);
        setFeedback(null);
        setShowTranslation(false);
      } else {
        setGameStatus("completed");
      }
    }, 2000);
  };

  // Handle game restart
  const handleRestart = () => {
    setCurrentSentenceIndex(0);
    setScore(0);
    setSelectedWord(null);
    setFeedback(null);
    setShowTranslation(false);
    setGameStatus("playing");
  };

  // Toggle translation visibility
  const toggleTranslation = () => {
    setShowTranslation(!showTranslation);
  };

  // Go back to games screen
  const handleBackPress = () => {
    router.back();
  };

  // Get word style based on state
  const getWordStyle = (word: WordItem, index: number) => {
    if (selectedWord === null) return styles.word;

    if (selectedWord === index) {
      return feedback === "correct"
        ? [styles.word, styles.correctWord]
        : [styles.word, styles.incorrectWord];
    }

    if (
      selectedWord !== null &&
      word.clean.toLowerCase() === currentSentence.targetWord.toLowerCase()
    ) {
      return [styles.word, styles.correctWord];
    }

    return styles.word;
  };

  return (
    <View
      style={[styles.wrapper, { backgroundColor: activeTheme.backgroundColor }]}
    >
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      <SafeAreaView style={[styles.container]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <ChevronLeft width={24} height={24} color={BASE_COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Word Identification</Text>
          <View style={styles.placeholder} />
        </View>

        {gameStatus === "playing" ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${progress}%`,
                    backgroundColor: BASE_COLORS.orange,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              Sentence {currentSentenceIndex + 1} of {mockSentences.length}
            </Text>

            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>Score: {score}</Text>
            </View>

            <Animatable.View
              animation="fadeIn"
              duration={500}
              style={styles.instructionCard}
            >
              <Text style={styles.instructionText}>
                Tap the word that means "{currentSentence.targetWord}" in this
                sentence:
              </Text>
            </Animatable.View>

            <Animatable.View
              animation="fadeIn"
              duration={500}
              delay={200}
              style={styles.sentenceCard}
            >
              <LinearGradient
                colors={[BASE_COLORS.orange, "#D97706"]}
                style={styles.sentenceGradient}
              >
                <View style={styles.sentenceContainer}>
                  {words.map((word, index) => (
                    <TouchableOpacity
                      key={index}
                      style={getWordStyle(word, index)}
                      onPress={() => handleWordSelect(word, index)}
                      disabled={selectedWord !== null || word.isPunctuation}
                      activeOpacity={word.isPunctuation ? 1 : 0.7}
                    >
                      <Text style={styles.wordText}>{word.display}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

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

            {feedback && (
              <Animatable.View
                animation="fadeIn"
                duration={300}
                style={styles.feedbackContainer}
              >
                {feedback === "correct" ? (
                  <View style={styles.correctFeedback}>
                    <CheckCircle
                      width={24}
                      height={24}
                      color={BASE_COLORS.success}
                    />
                    <Text style={styles.feedbackText}>Correct!</Text>
                  </View>
                ) : (
                  <View style={styles.incorrectFeedback}>
                    <XCircle
                      width={24}
                      height={24}
                      color={BASE_COLORS.danger}
                    />
                    <Text style={styles.feedbackText}>Incorrect!</Text>
                  </View>
                )}
              </Animatable.View>
            )}

            <TouchableOpacity
              style={styles.translationButton}
              onPress={toggleTranslation}
            >
              <Text style={styles.translationButtonText}>
                {showTranslation ? "Hide Translation" : "Show Translation"}
              </Text>
            </TouchableOpacity>

            {showTranslation && (
              <Animatable.View
                animation="fadeIn"
                duration={300}
                style={styles.translationCard}
              >
                <Text style={styles.translationText}>
                  {currentSentence.translation}
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
                colors={[BASE_COLORS.orange, "#D97706"]}
                style={styles.resultCard}
              >
                <Text style={styles.resultTitle}>Challenge Complete!</Text>
                <Text style={styles.resultScore}>
                  Your Score: {score}/{mockSentences.length}
                </Text>
                <Text style={styles.resultPercentage}>
                  {Math.round((score / mockSentences.length) * 100)}% Correct
                </Text>

                <View style={styles.resultFeedback}>
                  <Text style={styles.feedbackText}>
                    {score === mockSentences.length
                      ? "Perfect! You're a natural at identifying words!"
                      : score > mockSentences.length / 2
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
    backgroundColor: `${BASE_COLORS.orange}20`,
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
  instructionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    textAlign: "center",
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
  sentenceContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 10,
  },
  word: {
    marginHorizontal: 4,
    marginVertical: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  correctWord: {
    backgroundColor: "rgba(34, 197, 94, 0.6)",
  },
  incorrectWord: {
    backgroundColor: "rgba(239, 68, 68, 0.6)",
  },
  wordText: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
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
  translationButton: {
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 16,
  },
  translationButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
  },
  translationCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  translationText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    fontStyle: "italic",
    textAlign: "center",
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
    color: BASE_COLORS.orange,
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

export default Identification;
