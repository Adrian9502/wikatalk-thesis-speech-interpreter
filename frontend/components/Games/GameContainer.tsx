import React from "react";
import { View, StatusBar, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import DecorativeCircles from "@/components/games/DecorativeCircles";
import useThemeStore from "@/store/useThemeStore";
import gameSharedStyles from "@/styles/gamesSharedStyles";
import DotsLoader from "@/components/DotLoader";

interface GameContainerProps {
  title: string;
  level: string;
  levelTitle: string;
  timerRunning: boolean;
  gameStatus: "idle" | "playing" | "completed";
  children: React.ReactNode;
  variant?: "double" | "triple"; // Decorative circles variant
}

const GameContainer: React.FC<GameContainerProps> = ({
  title,
  level,
  levelTitle,
  timerRunning,
  gameStatus,
  children,
  variant = "double",
}) => {
  const { activeTheme } = useThemeStore();

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
        <Header title={title} disableBack={timerRunning} hideBack={true} />

        {/* Level Title - outside game status condition */}
        <View style={gameSharedStyles.levelTitleContainer}>
          <Text style={gameSharedStyles.levelTitleText}>
            {level} - {levelTitle}
          </Text>
        </View>

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
