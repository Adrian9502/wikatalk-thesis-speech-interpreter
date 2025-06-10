import React from "react";
import { ScrollView, View, Text } from "react-native";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import { Check, X } from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";
import DifficultyBadge from "@/components/games/DifficultyBadge";
import AnswerReview from "@/components/games/AnswerReview";
import GameNavigation from "@/components/games/GameNavigation";
import { formatTime } from "@/utils/gameUtils";
import gameSharedStyles from "@/styles/gamesSharedStyles";
import { GameMode } from "@/types/gameTypes";

interface GameCompletedContentProps {
  score: number;
  timeElapsed: number;
  difficulty: string;
  question: string;
  userAnswer: string;
  isCorrect: boolean;
  levelId: number;
  gameMode: GameMode | string;
  gameTitle: string;
  onRestart: () => void;
  successTitle?: string;
  failTitle?: string;
}

const GameCompletedContent: React.FC<GameCompletedContentProps> = ({
  score,
  timeElapsed,
  difficulty,
  question,
  userAnswer,
  isCorrect,
  levelId,
  gameMode,
  gameTitle,
  onRestart,
}) => {
  return (
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
            score > 0
              ? (["#4CAF50", "#2E7D32"] as const)
              : ([BASE_COLORS.danger, "#C62828"] as const)
          }
          style={gameSharedStyles.questionGradient}
        >
          <View style={gameSharedStyles.resultIconLarge}>
            {score > 0 ? (
              <Check width={30} height={30} color={BASE_COLORS.white} />
            ) : (
              <X width={30} height={30} color={BASE_COLORS.white} />
            )}
          </View>
          <Text style={gameSharedStyles.completionTitle}>
            {score > 0 ? "Level Completed!" : "Try Again!"}
          </Text>
          <Text style={gameSharedStyles.completionMessage}>
            {score > 0
              ? "Great job! You answered correctly."
              : "Your answer was incorrect. Keep practicing to improve."}
          </Text>
        </LinearGradient>
      </Animatable.View>

      {/* Answer Review Section */}
      <AnswerReview
        question={question}
        userAnswer={userAnswer}
        isCorrect={isCorrect}
        timeElapsed={timeElapsed}
      />

      {/* Navigation buttons */}
      <GameNavigation
        levelId={levelId}
        gameMode={gameMode}
        gameTitle={gameTitle}
        difficulty={difficulty}
        onRestart={onRestart}
      />
    </ScrollView>
  );
};

export default GameCompletedContent;
