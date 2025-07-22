import React from "react";
import { View, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DecorativeCircles from "@/components/games/DecorativeCircles";
import useThemeStore from "@/store/useThemeStore";
import gameSharedStyles from "@/styles/gamesSharedStyles";
import GameHeader from "@/components/games/GameHeader";
import DotsLoader from "../DotLoader";

interface GameContainerProps {
  title: string;
  timerRunning: boolean;
  gameStatus: "idle" | "playing" | "completed";
  children: React.ReactNode;
  variant?: "double" | "triple";

  // NEW: Stats props to pass to header
  difficulty?: string;
  focusArea?: string;
  showTimer?: boolean;
  initialTime?: number;
  isStarted?: boolean;
  finalTime?: number;
}

const GameContainer: React.FC<GameContainerProps> = ({
  title,
  timerRunning,
  gameStatus,
  children,
  variant = "triple",

  // NEW: Stats props
  difficulty,
  focusArea,
  showTimer,
  initialTime,
  isStarted,
  finalTime,
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
        />

        {gameStatus === "idle" ? (
          <View style={gameSharedStyles.loaderContainer}>
            <DotsLoader />
          </View>
        ) : (
          children
        )}
      </SafeAreaView>
    </View>
  );
};

export default GameContainer;
