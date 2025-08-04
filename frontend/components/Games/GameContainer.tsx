import React from "react";
import { View, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DecorativeCircles from "@/components/games/DecorativeCircles";
import useThemeStore from "@/store/useThemeStore";
import gameSharedStyles from "@/styles/gamesSharedStyles";
import GameHeader from "@/components/games/GameHeader";
import DotsLoader from "../DotLoader";
import NavigationWarning from "@/components/games/NavigationWarning"; // Add import

interface GameContainerProps {
  title: string;
  timerRunning: boolean;
  gameStatus: "idle" | "playing" | "completed";
  children: React.ReactNode;
  variant?: "double" | "triple";

  // Stats props to pass to header
  difficulty?: string;
  focusArea?: string;
  showTimer?: boolean;
  initialTime?: number;
  isStarted?: boolean;
  finalTime?: number;
  levelId?: number | string;
  onTimerReset?: () => void;
  // NEW: Add isCorrectAnswer prop
  isCorrectAnswer?: boolean;
}

const GameContainer: React.FC<GameContainerProps> = ({
  title,
  timerRunning,
  gameStatus,
  children,
  variant = "triple",

  // Stats props
  difficulty,
  focusArea,
  showTimer,
  initialTime,
  isStarted,
  finalTime,
  levelId,
  onTimerReset,
  isCorrectAnswer,
}) => {
  const { activeTheme } = useThemeStore();

  // Determine if we should show stats in header
  const showStats = gameStatus !== "idle" && difficulty;

  // Determine variant for stats
  const statsVariant = gameStatus === "completed" ? "completed" : "playing";

  return (
    <View
      style={[
        gameSharedStyles.wrapper,
        { backgroundColor: activeTheme.backgroundColor },
      ]}
    >
      <StatusBar barStyle="light-content" />
      <DecorativeCircles variant={variant} />

      <SafeAreaView style={gameSharedStyles.container}>
        <GameHeader
          title={title}
          disableBack={timerRunning}
          hideBack={true}
          showStats={showStats as boolean}
          difficulty={difficulty}
          focusArea={focusArea}
          showTimer={showTimer}
          timerRunning={timerRunning}
          initialTime={initialTime}
          isStarted={isStarted}
          variant={statsVariant}
          finalTime={finalTime}
          levelId={levelId}
          onTimerReset={onTimerReset}
          isCorrectAnswer={isCorrectAnswer}
        />

        {gameStatus === "idle" ? (
          <View style={gameSharedStyles.loaderContainer}>
            <DotsLoader />
          </View>
        ) : (
          children
        )}

        {/* NEW: Add Navigation Warning */}
        <NavigationWarning
          gameStatus={gameStatus}
          timerRunning={timerRunning}
        />
      </SafeAreaView>
    </View>
  );
};

export default GameContainer;
