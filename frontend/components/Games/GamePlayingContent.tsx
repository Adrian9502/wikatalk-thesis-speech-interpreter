import React from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";
import Timer from "@/components/games/Timer";
import DifficultyBadge from "@/components/games/DifficultyBadge";
import FocusAreaBadge from "@/components/games/FocusAreaBadge";
import gameSharedStyles from "@/styles/gamesSharedStyles";

interface GamePlayingContentProps {
  timerRunning: boolean;
  difficulty: string;
  focusArea?: string;
  children: React.ReactNode;
  isStarted?: boolean;
  gameStatus?: "idle" | "ready" | "playing" | "completed";
  initialTime?: number; // Add this prop
}

const GamePlayingContent: React.FC<GamePlayingContentProps> = React.memo(
  ({
    timerRunning,
    difficulty,
    focusArea = "Vocabulary",
    children,
    isStarted = true,
    initialTime = 0, // Default to 0
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
          {/* Timer on left - pass initialTime */}
          {isStarted && <Timer isRunning={timerRunning} initialTime={initialTime} />}

          {/* Badges on right */}
          <View style={gameSharedStyles.badgesContainer}>
            <DifficultyBadge difficulty={difficulty} />
            <FocusAreaBadge focusArea={focusArea} />
          </View>
        </Animatable.View>

        {children}
      </ScrollView>
    );
  }
);

export default GamePlayingContent;
