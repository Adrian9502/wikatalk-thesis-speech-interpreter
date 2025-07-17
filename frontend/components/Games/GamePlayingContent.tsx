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
  initialTime?: number;
}

const GamePlayingContent: React.FC<GamePlayingContentProps> = React.memo(
  ({
    timerRunning,
    difficulty,
    focusArea = "Vocabulary",
    children,
    isStarted = true,
    initialTime = 0,
  }) => {
    // REMOVED: Excessive logging that was causing performance issues
    // Only log when timer starts or significant changes occur
    const timerStartedRef = React.useRef(false);

    if (timerRunning && !timerStartedRef.current) {
      console.log(
        `[GamePlayingContent] Timer started with initialTime: ${initialTime}`
      );
      timerStartedRef.current = true;
    } else if (!timerRunning && timerStartedRef.current) {
      console.log(`[GamePlayingContent] Timer stopped`);
      timerStartedRef.current = false;
    }

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
          {/* Timer on left */}
          {isStarted && (
            <Timer
              isRunning={timerRunning}
              initialTime={initialTime}
              key={`timer-${initialTime}`}
            />
          )}

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
