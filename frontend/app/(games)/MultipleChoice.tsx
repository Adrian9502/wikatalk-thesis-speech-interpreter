import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  StatusBar,
} from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import DifficultyBadge from "@/components/games/DifficultyBadge";
import { Check, X } from "react-native-feather";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { BASE_COLORS } from "@/constant/colors";
import useThemeStore from "@/store/useThemeStore";
import Timer from "@/components/games/Timer";
import useQuizStore from "@/store/Games/useQuizStore";
import { Header } from "@/components/Header";
import AnswerReview from "@/components/games/AnswerReview";
import gameSharedStyles from "@/styles/gamesSharedStyles";
import { formatTime, getDifficultyColors } from "@/utils/gameUtils";
import { setupBackButtonHandler } from "@/utils/gameUtils";
import DecorativeCircles from "@/components/games/DecorativeCircles";
import GameNavigation from "@/components/games/GameNavigation";
import DotsLoader from "@/components/DotLoader";
import styles from "@/styles/games/multipleChoice.styles";
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

  // Get state and actions from the centralized store
  const {
    // Common game state
    gameState: { score, gameStatus, timerRunning, timeElapsed },
    // MultipleChoice specific state
    multipleChoiceState: { selectedOption, currentQuestion },
    // Actions
    initialize,
    startGame,
    handleRestart,
    handleOptionSelect,
  } = useQuizStore();

  // Add this function to determine option styling
  const getOptionStyle = (id: string, isCorrect: boolean) => {
    const baseStyle = gameSharedStyles.optionCard;

    if (selectedOption === id) {
      // This option was selected
      return isCorrect
        ? [baseStyle, gameSharedStyles.correctOption]
        : [baseStyle, gameSharedStyles.incorrectOption];
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
    // Pass the gameMode parameter "multipleChoice"
    console.log("Initializing MultipleChoice with data:", levelData);
    initialize(levelData, levelId, "multipleChoice", difficulty);

    // Add a short delay to ensure initialization completes before starting the game
    if (isStarted) {
      // Small delay to ensure initialization is complete
      const timer = setTimeout(() => {
        console.log("Starting MultipleChoice game");
        startGame();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [levelData, levelId, isStarted]);

  return (
    <View
      style={[
        gameSharedStyles.wrapper,
        { backgroundColor: activeTheme.backgroundColor },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Decorative Elements */}
      <DecorativeCircles variant="triple" />

      <SafeAreaView style={gameSharedStyles.container}>
        <Header
          title={"Multiple Choice"}
          disableBack={timerRunning}
          hideBack={true}
        />

        {/* Level Title - outside game status condition */}
        <View style={gameSharedStyles.levelTitleContainer}>
          <Text style={gameSharedStyles.levelTitleText}>
            {currentQuestion?.level} -{" "}
            {currentQuestion?.title || "Multiple Choice Quiz"}
          </Text>
        </View>

        {gameStatus === "playing" ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={gameSharedStyles.contentContainer}
          >
            {/* Stats Container with Score and Timer */}
            <Animatable.View
              animation="fadeIn"
              duration={600}
              delay={100}
              style={gameSharedStyles.statsContainer}
            >
              {isStarted && <Timer isRunning={timerRunning} />}
              <DifficultyBadge difficulty={difficulty} />
            </Animatable.View>

            {/* Question Card */}
            <Animatable.View
              animation="fadeInUp"
              duration={700}
              delay={200}
              style={gameSharedStyles.questionCardWrapper}
            >
              <LinearGradient
                colors={
                  getDifficultyColors(difficulty, levelData) as readonly [
                    string,
                    string
                  ]
                }
                style={gameSharedStyles.questionGradient}
              >
                <Text style={gameSharedStyles.questionText}>
                  {currentQuestion?.question}
                </Text>
              </LinearGradient>
            </Animatable.View>

            {/* Options */}
            <View
              style={[
                gameSharedStyles.optionsContainer,
                styles.multipleChoiceOptions,
              ]}
            >
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
                      <View style={gameSharedStyles.optionContent}>
                        <View style={gameSharedStyles.optionIdContainer}>
                          <Text style={gameSharedStyles.optionId}>
                            {option.id.toUpperCase()}
                          </Text>
                        </View>
                        <Text style={gameSharedStyles.optionText}>
                          {option.text}
                        </Text>
                      </View>

                      {selectedOption === option.id && (
                        <View style={gameSharedStyles.resultIconContainer}>
                          {option.isCorrect ? (
                            <Check
                              width={18}
                              height={18}
                              color={BASE_COLORS.white}
                            />
                          ) : (
                            <X
                              width={18}
                              height={18}
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

            {/* Completion Message with conditional color */}
            <Animatable.View
              animation="fadeInUp"
              duration={700}
              delay={200}
              style={gameSharedStyles.questionCardWrapper}
            >
              <LinearGradient
                colors={
                  score === 1
                    ? (["#4CAF50", "#2E7D32"] as const)
                    : ([BASE_COLORS.danger, "#C62828"] as const)
                }
                style={gameSharedStyles.questionGradient}
              >
                <View style={gameSharedStyles.resultIconLarge}>
                  {score === 1 ? (
                    <Check width={30} height={30} color={BASE_COLORS.white} />
                  ) : (
                    <X width={30} height={30} color={BASE_COLORS.white} />
                  )}
                </View>
                <Text style={gameSharedStyles.completionTitle}>
                  {score === 1 ? "Level Completed!" : "Try Again!"}
                </Text>
                {score === 1 ? (
                  <Text style={gameSharedStyles.completionMessage}>
                    Great job! You answered correctly.
                  </Text>
                ) : (
                  <Text style={gameSharedStyles.completionMessage}>
                    Your answer was incorrect. Keep practicing to improve.
                  </Text>
                )}
              </LinearGradient>
            </Animatable.View>

            {/* Answer Review Section */}
            <AnswerReview
              question={currentQuestion?.question || ""}
              userAnswer={
                currentQuestion?.options?.find((o) => o.id === selectedOption)
                  ?.text || ""
              }
              isCorrect={
                currentQuestion?.options?.find((o) => o.id === selectedOption)
                  ?.isCorrect || false
              }
              timeElapsed={timeElapsed}
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
        ) : (
          // Default loading state when idle
          <View style={gameSharedStyles.loaderContainer}>
            <DotsLoader />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

export default MultipleChoice;
