import React from "react";
import { ScrollView } from "react-native";
import AnswerReview from "@/components/games/AnswerReview";
import GameNavigation from "@/components/games/GameNavigation";
import gameSharedStyles from "@/styles/gamesSharedStyles";
import { GameMode } from "@/types/gameTypes";

interface RewardInfo {
  coins: number;
  label: string;
  difficulty: string;
  timeSpent: number;
  tier?: any;
}

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
  isCurrentLevelCompleted?: boolean;
  isCorrectAnswer?: boolean;
  isBackgroundCompletion?: boolean;
  isUserExit?: boolean;
  rewardInfo?: RewardInfo | null;
  onTimerReset?: () => void; // NEW: Add onTimerReset prop
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
  levelString,
  actualTitle,
  nextLevelTitle,
  isCurrentLevelCompleted = false,
  isCorrectAnswer = false,
  isBackgroundCompletion = false,
  isUserExit = false,
  rewardInfo = null,
  onTimerReset, // NEW: Add onTimerReset
}) => {
  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={gameSharedStyles.contentContainer}
      >
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
          delay={0}
          isBackgroundCompletion={isBackgroundCompletion}
          isUserExit={isUserExit}
          rewardInfo={rewardInfo}
          onTimerReset={onTimerReset}
        />

        {/* Navigation Section */}
        <GameNavigation
          levelId={levelId}
          gameMode={gameMode}
          gameTitle={gameTitle}
          onRestart={onRestart}
          difficulty={difficulty}
          nextLevelTitle={nextLevelTitle}
          isCurrentLevelCompleted={isCurrentLevelCompleted || isCorrect}
          isCorrectAnswer={isCorrectAnswer || isCorrect}
        />
      </ScrollView>
    </>
  );
};

export default GameCompletedContent;
