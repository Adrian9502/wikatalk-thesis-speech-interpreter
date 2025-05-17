import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  StatusBar,
} from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import DifficultyBadge from "@/components/Games/DifficultyBadge";
import { Check, X } from "react-native-feather";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { BASE_COLORS } from "@/constant/colors";
import useThemeStore from "@/store/useThemeStore";
import Timer from "@/components/Games/Timer";
import useMultipleChoiceStore from "@/store/Games/useMultipleChoiceStore";
import { Header } from "@/components/Header";
import AnswerReview from "@/components/Games/AnswerReview";
import gameSharedStyles from "@/styles/gamesSharedStyles";
import { formatTime, getDifficultyColors } from "@/utils/gameUtils";
import { setupBackButtonHandler } from "@/utils/gameUtils";
import DecorativeCircles from "@/components/Games/DecorativeCircles";
import GameNavigation from "@/components/Games/GameNavigation";

interface MultipleChoiceProps {
  levelId: number;
  levelData: any;
  difficulty?: string;
  isStarted?: boolean;
}

const MultipleChoice: React.FC<MultipleChoiceProps> = ({
  levelId,
  levelData,
  difficulty = "easy", // Default to easy
  isStarted = false,
}) => {
  // Theme store
  const { activeTheme } = useThemeStore();

  // Game state from store
  const {
    score,
    selectedOption,
    gameStatus,
    timerRunning,
    timeElapsed,
    currentQuestion,
    progress,
    handleOptionSelect,
    initialize,
    startGame,
    handleRestart,
  } = useMultipleChoiceStore();

  // Add this function to determine option styling
  const getOptionStyle = (id: string, isCorrect: boolean) => {
    const baseStyle = styles.optionCard;

    if (selectedOption === id) {
      // This option was selected
      return isCorrect
        ? [baseStyle, styles.correctOption]
        : [baseStyle, styles.incorrectOption];
    }
    return baseStyle;
  };

  useEffect(() => {
    // Set up the back handler
    const cleanupBackHandler = setupBackButtonHandler(gameStatus, timerRunning);

    // Clean up when component unmounts
    return () => cleanupBackHandler();
  }, [gameStatus, timerRunning]);

  // Initialize the game with level data
  useEffect(() => {
    initialize(levelData, levelId);

    // Add a short delay to ensure initialization completes before starting the game
    if (isStarted) {
      // Small delay to ensure initialization is complete
      const timer = setTimeout(() => {
        startGame();
        console.log("Game started for level:", levelId);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [levelData, levelId, isStarted]);

  return (
    <View
      style={[styles.wrapper, { backgroundColor: activeTheme.backgroundColor }]}
    >
      <StatusBar barStyle="light-content" />

      {/* Decorative Elements */}
      <DecorativeCircles variant="triple" />

      <SafeAreaView style={styles.container}>
        <Header
          title={"Multiple Choice"}
          disableBack={timerRunning}
          hideBack={true}
        />

        {/* Level Title - outside game status condition */}
        <View style={styles.levelTitleContainer}>
          <Text style={styles.levelTitleText}>
            Level {levelId} :{" "}
            {currentQuestion?.title || "- Multiple Choice Quiz"}
          </Text>
        </View>

        {gameStatus === "playing" ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            {/* Stats Container with Score and Timer */}
            <Animatable.View
              animation="fadeIn"
              duration={600}
              delay={100}
              style={styles.statsContainer}
            >
              {isStarted && <Timer isRunning={timerRunning} />}
              <DifficultyBadge difficulty={difficulty} />
            </Animatable.View>

            {/* Question Card */}
            <Animatable.View
              animation="fadeInUp"
              duration={700}
              delay={200}
              style={styles.questionCardWrapper}
            >
              <LinearGradient
                colors={
                  getDifficultyColors(difficulty, levelData) as readonly [
                    string,
                    string
                  ]
                }
                style={styles.questionGradient}
              >
                <Text style={styles.questionText}>
                  {currentQuestion?.question}
                </Text>
              </LinearGradient>
            </Animatable.View>

            {/* Options */}
            <View style={styles.optionsContainer}>
              {currentQuestion?.options &&
                currentQuestion.options.map((option, index) => (
                  <Animatable.View
                    key={option.id}
                    animation="fadeInUp"
                    duration={600}
                    delay={300 + index * 100}
                  >
                    <TouchableOpacity
                      style={getOptionStyle(option.id, option.isCorrect)}
                      onPress={() => handleOptionSelect(option.id)}
                      disabled={selectedOption !== null || !isStarted}
                      activeOpacity={0.9}
                    >
                      <View style={styles.optionContent}>
                        <View style={styles.optionIdContainer}>
                          <Text style={styles.optionId}>
                            {option.id.toUpperCase()}
                          </Text>
                        </View>
                        <Text style={styles.optionText}>{option.text}</Text>
                      </View>

                      {selectedOption === option.id && (
                        <View style={styles.resultIconContainer}>
                          {option.isCorrect ? (
                            <Check
                              width={24}
                              height={24}
                              color={BASE_COLORS.white}
                            />
                          ) : (
                            <X
                              width={24}
                              height={24}
                              color={BASE_COLORS.white}
                            />
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

            {/* Completion Message with conditional color */}
            <Animatable.View
              animation="fadeInUp"
              duration={700}
              delay={200}
              style={styles.questionCardWrapper}
            >
              <LinearGradient
                colors={
                  score === 1
                    ? (["#4CAF50", "#2E7D32"] as const)
                    : ([BASE_COLORS.danger, "#C62828"] as const)
                }
                style={styles.questionGradient}
              >
                <View style={styles.resultIconLarge}>
                  {score === 1 ? (
                    <Check width={30} height={30} color={BASE_COLORS.white} />
                  ) : (
                    <X width={30} height={30} color={BASE_COLORS.white} />
                  )}
                </View>
                <Text style={styles.completionTitle}>
                  {score === 1 ? "Level Completed!" : "Try Again!"}
                </Text>
                {score === 1 ? (
                  <Text style={styles.completionMessage}>
                    Great job! You answered correctly.
                  </Text>
                ) : (
                  <Text style={styles.completionMessage}>
                    Your answer was incorrect. Keep practicing to improve.
                  </Text>
                )}
              </LinearGradient>
            </Animatable.View>

            {/* Answer Review Section */}
            <AnswerReview
              question={currentQuestion.question}
              userAnswer={
                currentQuestion.options.find((o) => o.id === selectedOption)
                  ?.text || ""
              }
              isCorrect={
                currentQuestion.options.find((o) => o.id === selectedOption)
                  ?.isCorrect || false
              }
            />

            {/* Navigation buttons */}
            <GameNavigation
              levelId={levelId}
              gameMode="multipleChoice"
              gameTitle="Multiple Choice"
              difficulty={difficulty}
              onRestart={handleRestart}
            />
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
};
const styles = StyleSheet.create({
  ...gameSharedStyles, // Include all shared styles

  // Component-specific styles
  optionsContainer: {
    gap: 14,
    marginBottom: 20,
  },
  optionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionIdContainer: {
    width: 36,
    height: 36,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  optionId: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  optionText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    flex: 1,
    lineHeight: 22,
  },
  correctOption: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderColor: BASE_COLORS.success,
  },
  incorrectOption: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderColor: BASE_COLORS.danger,
  },
  resultIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
});

export default MultipleChoice;
