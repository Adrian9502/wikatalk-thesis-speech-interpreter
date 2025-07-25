import React, { useMemo } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import { BASE_COLORS, iconColors } from "@/constant/colors";
import AnswerReview from "@/components/games/AnswerReview";
import GameNavigation from "@/components/games/GameNavigation";
import gameSharedStyles from "@/styles/gamesSharedStyles";
import { GameMode } from "@/types/gameTypes";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NAVIGATION_COLORS } from "@/constant/gameConstants";
import { renderFocusIcon } from "@/utils/games/renderFocusIcon";

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
  focusArea?: string;
  successTitle?: string;
  failTitle?: string;
  levelString?: string;
  actualTitle?: string;
  nextLevelTitle?: string;
}

const GameCompletedContent: React.FC<GameCompletedContentProps> = ({
  timeElapsed,
  difficulty,
  question,
  userAnswer,
  isCorrect,
  levelId,
  gameMode,
  gameTitle,
  onRestart,
  focusArea = "Vocabulary",
  levelString,
  actualTitle,
  nextLevelTitle,
}) => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={gameSharedStyles.contentContainer}
    >
      {/* Answer Review Section */}
      <AnswerReview
        question={question}
        userAnswer={userAnswer}
        isCorrect={isCorrect}
        timeElapsed={timeElapsed}
        difficulty={difficulty}
        levelString={levelString}
        actualTitle={actualTitle}
        focusArea={focusArea}
        gameMode={gameMode}
        levelId={levelId}
        animation="fadeInUp"
        duration={800}
        delay={0} // Reduced delay since no stats container
      />

      {/* Navigation Section */}
      <GameNavigation
        levelId={levelId}
        gameMode={gameMode}
        gameTitle={gameTitle}
        onRestart={onRestart}
        difficulty={difficulty}
        nextLevelTitle={nextLevelTitle}
      />
    </ScrollView>
  );
};

export default GameCompletedContent;
