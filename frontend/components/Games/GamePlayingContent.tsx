import React from "react";
import { ScrollView } from "react-native";
import * as Animatable from "react-native-animatable";
import Timer from "@/components/games/Timer";
import DifficultyBadge from "@/components/games/DifficultyBadge";
import gameSharedStyles from "@/styles/gamesSharedStyles";

interface GamePlayingContentProps {
  timerRunning: boolean;
  difficulty: string;
  children: React.ReactNode;
  isStarted?: boolean;
}

const GamePlayingContent: React.FC<GamePlayingContentProps> = ({
  timerRunning,
  difficulty,
  children,
  isStarted = true,
}) => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={gameSharedStyles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      {/* Stats Container */}
      <Animatable.View
        animation="fadeIn"
        duration={600}
        delay={100}
        style={gameSharedStyles.statsContainer}
      >
        {isStarted && <Timer isRunning={timerRunning} />}
        <DifficultyBadge difficulty={difficulty} />
      </Animatable.View>

      {children}
    </ScrollView>
  );
};

export default GamePlayingContent;
