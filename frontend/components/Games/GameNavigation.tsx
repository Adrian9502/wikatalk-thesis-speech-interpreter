import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import * as Animatable from "react-native-animatable";
import { BASE_COLORS, gameModeNavigationColors } from "@/constant/colors";
import { GameMode } from "@/types/gameTypes";
import useGameStore from "@/store/games/useGameStore";
import { NAVIGATION_COLORS } from "@/constant/gameConstants";
import GameButton from "@/components/games/GameButton";

interface GameNavigationProps {
  levelId: number;
  gameMode: GameMode | string;
  gameTitle: string;
  difficulty: string;
  onRestart: () => void;
  nextLevelTitle?: string;
}

const GameNavigation: React.FC<GameNavigationProps> = ({
  levelId,
  gameMode,
  gameTitle,
  difficulty,
  onRestart,
  nextLevelTitle,
}) => {
  // Ensure levelId is parsed as a number
  const numericLevelId = Number(levelId);

  // Helper function to get next level display text
  const getNextLevelDisplayText = () => {
    if (nextLevelTitle) {
      return nextLevelTitle;
    }
    return `Level ${numericLevelId + 1}`;
  };

  const handleBackToLevels = () => {
    console.log("[GameNavigation] Navigating back to levels with replace");

    const gameStore = useGameStore.getState();
    gameStore.setGameStatus("idle");
    gameStore.setScore(0);
    gameStore.setTimerRunning(false);
    gameStore.resetTimer();
    gameStore.handleRestart();

    router.replace({
      pathname: "/(games)/LevelSelection",
      params: { gameMode, gameTitle, difficulty },
    });
  };

  const handleBackToHome = () => {
    console.log("[GameNavigation] Navigating to home with replace");

    const gameStore = useGameStore.getState();
    gameStore.setGameStatus("idle");
    gameStore.setScore(0);
    gameStore.setTimerRunning(false);
    gameStore.resetTimer();
    gameStore.handleRestart();

    router.replace("/(tabs)/Games");
  };

  const handleNextLevel = () => {
    console.log(`[GameNavigation] Navigating to level ${numericLevelId + 1}`);

    const gameStore = useGameStore.getState();
    gameStore.setGameStatus("idle");
    gameStore.setScore(0);
    gameStore.setTimerRunning(false);
    gameStore.resetTimer();
    gameStore.handleRestart();

    router.replace({
      pathname: "/(games)/Questions",
      params: {
        levelId: numericLevelId + 1,
        gameMode,
        gameTitle,
        difficulty,
        skipModal: "true",
      },
    });
  };

  const handleGameModeNavigation = (
    newGameMode: string,
    newGameTitle: string
  ) => {
    console.log(`[GameNavigation] Switching to ${newGameMode}`);

    const gameStore = useGameStore.getState();
    gameStore.setGameStatus("idle");
    gameStore.setScore(0);
    gameStore.setTimerRunning(false);
    gameStore.resetTimer();
    gameStore.handleRestart();

    router.replace({
      pathname: "/(games)/LevelSelection",
      params: {
        gameMode: newGameMode,
        gameTitle: newGameTitle,
        difficulty,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Floating Decorative Elements */}
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        duration={4000}
        style={[styles.floatingElement, styles.element1]}
      />
      <Animatable.View
        animation="rotate"
        iterationCount="infinite"
        duration={8000}
        style={[styles.floatingElement, styles.element2]}
      />

      {/* Primary Action Section */}
      <Animatable.View
        animation="slideInUp"
        duration={800}
        delay={100}
        style={styles.primarySection}
      >
        <GameButton
          variant="primary"
          title="Next Level"
          subtitle={getNextLevelDisplayText()}
          iconName="play"
          colors={NAVIGATION_COLORS.green}
          onPress={handleNextLevel}
        />
      </Animatable.View>

      {/* Secondary Actions Grid */}
      <Animatable.View animation="fadeInUp" duration={700} delay={300}>
        <View style={styles.secondaryGrid}>
          <GameButton
            variant="secondary"
            title="Retry"
            iconName="rotate-left"
            colors={NAVIGATION_COLORS.yellow}
            onPress={onRestart}
            flex={1}
          />

          <GameButton
            variant="secondary"
            title="Levels"
            iconName="view-grid"
            colors={NAVIGATION_COLORS.blue}
            onPress={handleBackToLevels}
            flex={1}
          />

          <GameButton
            variant="secondary"
            title="Home"
            iconName="home"
            colors={NAVIGATION_COLORS.purple}
            onPress={handleBackToHome}
            flex={1}
          />
        </View>
      </Animatable.View>

      {/* Game Mode Navigation Section */}
      <Animatable.View animation="fadeIn" duration={600} delay={500}>
        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Try Other Game Modes</Text>
        <Text style={styles.sectionSubtitle}>
          Challenge yourself with different learning styles
        </Text>

        <View style={styles.gameModeGrid}>
          {gameMode !== "multipleChoice" && (
            <GameButton
              variant="gameMode"
              title="Multiple Choice"
              subtitle="Select the correct answer"
              iconName="⚡"
              colors={gameModeNavigationColors.multipleChoice}
              onPress={() =>
                handleGameModeNavigation("multipleChoice", "Multiple Choice")
              }
              animation="slideInLeft"
              delay={600}
            />
          )}

          {gameMode !== "identification" && (
            <GameButton
              variant="gameMode"
              title="Word Identification"
              subtitle="Find the correct word"
              iconName="👁"
              colors={gameModeNavigationColors.identification}
              onPress={() =>
                handleGameModeNavigation(
                  "identification",
                  "Word Identification"
                )
              }
              animation="slideInUp"
              delay={700}
            />
          )}

          {gameMode !== "fillBlanks" && (
            <GameButton
              variant="gameMode"
              title="Fill in the Blanks"
              subtitle="Complete the sentence"
              iconName="📝"
              colors={gameModeNavigationColors.fillBlanks}
              onPress={() =>
                handleGameModeNavigation("fillBlanks", "Fill in the Blanks")
              }
              animation="slideInRight"
              delay={800}
            />
          )}
        </View>
      </Animatable.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },

  // Floating Elements
  floatingElement: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 50,
    zIndex: 1,
  },
  element1: {
    width: 60,
    height: 60,
    top: -10,
    right: -20,
  },
  element2: {
    width: 40,
    height: 40,
    bottom: 20,
    left: -15,
  },

  // Primary Section
  primarySection: {
    marginBottom: 16,
    zIndex: 2,
  },

  // Secondary Section
  secondaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    margin: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    textAlign: "center",
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 16,
  },
  gameModeGrid: {
    gap: 8,
  },
});

export default GameNavigation;
