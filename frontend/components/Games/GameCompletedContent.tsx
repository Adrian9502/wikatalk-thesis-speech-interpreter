import React, { useMemo } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import { BASE_COLORS, iconColors } from "@/constant/colors";
import AnswerReview from "@/components/games/AnswerReview";
import GameNavigation from "@/components/games/GameNavigation";
import { formatTime } from "@/utils/gameUtils";
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
  focusArea = "Vocabulary",
}) => {
  // Render difficulty stars
  const renderDifficultyStars = useMemo(() => {
    const stars = [];
    const starCount =
      difficulty === "hard" ? 3 : difficulty === "medium" ? 2 : 1;

    for (let i = 0; i < starCount; i++) {
      stars.push(
        <MaterialCommunityIcons
          key={i}
          name="star"
          size={16}
          color={iconColors.brightYellow}
        />
      );
    }
    return stars;
  }, [difficulty]);
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={gameSharedStyles.contentContainer}
    >
      {/* Stats Row */}
      <Animatable.View
        animation="slideInUp"
        duration={600}
        style={styles.statsRow}
      >
        {/* Time Stat */}
        {timeElapsed !== undefined && (
          <View style={styles.statCard}>
            <LinearGradient
              colors={NAVIGATION_COLORS.blue}
              style={styles.statCardGradient}
            >
              <MaterialCommunityIcons size={16} name="clock" color="#fff" />
              <Text style={styles.statValue}>{formatTime(timeElapsed)}</Text>
            </LinearGradient>
          </View>
        )}

        {/* Difficulty Stat - Replaces Score Stat */}
        <View style={styles.statCard}>
          <LinearGradient
            colors={NAVIGATION_COLORS.purple}
            style={styles.statCardGradient}
          >
            <View style={styles.difficultyStarsContainer}>
              {renderDifficultyStars}
            </View>
            <Text style={styles.statValue}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </Text>
          </LinearGradient>
        </View>

        {/* Focus Area Stat - Replaces Result Stat */}
        <View style={styles.statCard}>
          <LinearGradient
            colors={NAVIGATION_COLORS.yellow}
            style={styles.statCardGradient}
          >
            {renderFocusIcon(focusArea)}
            <Text style={styles.statValue}>
              {focusArea.charAt(0).toUpperCase() + focusArea.slice(1)}
            </Text>
          </LinearGradient>
        </View>
      </Animatable.View>

      {/* Enhanced Answer Review Section */}
      <AnswerReview
        question={question}
        userAnswer={userAnswer}
        isCorrect={isCorrect}
        timeElapsed={timeElapsed}
        difficulty={difficulty}
        focusArea={focusArea}
        gameMode={gameMode}
        animation="fadeInUp"
        duration={800}
        delay={200}
      />

      {/* Navigation Section */}
      <GameNavigation
        levelId={levelId}
        gameMode={gameMode}
        gameTitle={gameTitle}
        onRestart={onRestart}
        difficulty={difficulty}
      />
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  // Stats Row
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
  },
  statCardGradient: {
    borderRadius: 16,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  statValue: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
  },
  difficultyStarsContainer: {
    flexDirection: "row",
    gap: 2,
  },
});
export default GameCompletedContent;
