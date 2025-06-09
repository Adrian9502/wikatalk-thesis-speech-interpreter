import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Check, X } from "react-native-feather";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { BASE_COLORS } from "@/constant/colors";
import useQuizStore from "@/store/games/useQuizStore";
import gameSharedStyles from "@/styles/gamesSharedStyles";
import { getDifficultyColors } from "@/utils/gameUtils";
import styles from "@/styles/games/multipleChoice.styles";
import GameContainer from "@/components/games/GameContainer";
import GamePlayingContent from "@/components/games/GamePlayingContent";
import GameCompletedContent from "@/components/games/GameCompletedContent";
import { useGameInitialization } from "@/hooks/useGameInitialization";

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

  // Initialize the game with common hook
  useGameInitialization(
    levelData,
    levelId,
    "multipleChoice",
    difficulty,
    isStarted,
    initialize,
    startGame,
    gameStatus,
    timerRunning
  );

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

  // Calculate correct answer for review
  const selectedAnswerText =
    currentQuestion?.options?.find((o) => o.id === selectedOption)?.text || "";

  const isSelectedCorrect =
    currentQuestion?.options?.find((o) => o.id === selectedOption)?.isCorrect ||
    false;

  return (
    <GameContainer
      title="Multiple Choice"
      level={currentQuestion?.level || `Level ${levelId}`}
      levelTitle={currentQuestion?.title || "Multiple Choice Quiz"}
      timerRunning={timerRunning}
      gameStatus={gameStatus}
      variant="triple"
    >
      {gameStatus === "playing" ? (
        <GamePlayingContent
          timerRunning={timerRunning}
          difficulty={difficulty}
          isStarted={isStarted}
        >
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
                      <View
                        style={[
                          gameSharedStyles.optionIdContainer,
                          { alignSelf: "flex-start" },
                        ]}
                      >
                        <Text style={gameSharedStyles.optionId}>
                          {option.id.toUpperCase()}
                        </Text>
                      </View>
                      <Text
                        style={gameSharedStyles.optionText}
                        numberOfLines={0}
                      >
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
                          <X width={18} height={18} color={BASE_COLORS.white} />
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                </Animatable.View>
              ))}
          </View>
        </GamePlayingContent>
      ) : (
        <GameCompletedContent
          score={score}
          timeElapsed={timeElapsed}
          difficulty={difficulty}
          question={currentQuestion?.question || ""}
          userAnswer={selectedAnswerText}
          isCorrect={isSelectedCorrect}
          levelId={levelId}
          gameMode="multipleChoice"
          gameTitle="Multiple Choice"
          onRestart={handleRestart}
        />
      )}
    </GameContainer>
  );
};

export default MultipleChoice;
