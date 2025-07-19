import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { ArrowRight } from "react-native-feather";
import { LinearGradient } from "expo-linear-gradient";
import { BASE_COLORS, gameModeNavigationColors } from "@/constant/colors";
import gameSharedStyles from "@/styles/gamesSharedStyles";
import { GameMode } from "@/types/gameTypes";
import useGameStore from "@/store/games/useGameStore";

interface GameNavigationProps {
  levelId: number;
  gameMode: GameMode | string;
  gameTitle: string;
  difficulty: string;
  onRestart: () => void;
}

const GameNavigation: React.FC<GameNavigationProps> = ({
  levelId,
  gameMode,
  gameTitle,
  difficulty,
  onRestart,
}) => {
  // Ensure levelId is parsed as a number
  const numericLevelId = Number(levelId);

  const handleBackToLevels = () => {
    router.replace({
      pathname: "/(games)/LevelSelection",
      params: {
        gameMode,
        gameTitle,
        difficulty,
      },
    });
  };

  const handleBackToHome = () => {
    router.replace("/(tabs)/Games");
  };

  // Update the handleNextLevel function to use direct navigation
  const handleNextLevel = () => {
    console.log(`Navigating to level ${numericLevelId + 1} for ${gameMode}`);
    // Reset game state before navigation
    const gameStore = useGameStore.getState();
    console.log(`[GameNavigation] Resetting game state before navigation`);
    // Reset common game state
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

  // Game mode navigation handler
  const handleGameModeNavigation = (
    newGameMode: string,
    newGameTitle: string
  ) => {
    const gameStore = useGameStore.getState();
    console.log(`[GameNavigation] Resetting game state before mode switch`);
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
    <View>
      {/* Primary Navigation Section */}
      <View style={gameSharedStyles.navigationContainer}>
        {/* Primary Button - Next Level */}
        <TouchableOpacity
          style={[gameSharedStyles.navButton, gameSharedStyles.nextLevelButton]}
          onPress={handleNextLevel}
          activeOpacity={0.8}
        >
          <Text style={gameSharedStyles.navButtonText}>Next Level</Text>
          <ArrowRight width={16} height={16} color={BASE_COLORS.white} />
        </TouchableOpacity>

        {/* Secondary Buttons Row */}
        <View style={gameSharedStyles.secondaryButtonsRow}>
          <TouchableOpacity
            style={gameSharedStyles.secondaryButton}
            onPress={onRestart}
          >
            <Text style={gameSharedStyles.secondaryButtonText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={gameSharedStyles.secondaryButton}
            onPress={handleBackToLevels}
          >
            <Text style={gameSharedStyles.secondaryButtonText}>
              Back to Levels
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={gameSharedStyles.secondaryButton}
            onPress={handleBackToHome}
          >
            <Text style={gameSharedStyles.secondaryButtonText}>
              Back to Home
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Divider + Game Mode Navigation Section */}
      <View style={styles.gameModeContainer}>
        <Text style={styles.title}>Try Another Game Mode</Text>
        <View style={styles.buttonContainer}>
          {gameMode !== "multipleChoice" && (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.navButton}
              onPress={() =>
                handleGameModeNavigation("multipleChoice", "Multiple Choice")
              }
            >
              <LinearGradient
                colors={
                  gameModeNavigationColors.multipleChoice as readonly [
                    string,
                    string
                  ]
                }
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.navButtonText}>Multiple Choice</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {gameMode !== "identification" && (
            <TouchableOpacity
              style={styles.navButton}
              onPress={() =>
                handleGameModeNavigation(
                  "identification",
                  "Word Identification"
                )
              }
            >
              <LinearGradient
                colors={
                  gameModeNavigationColors.identification as readonly [
                    string,
                    string
                  ]
                }
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.navButtonText}>Word Identification</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {gameMode !== "fillBlanks" && (
            <TouchableOpacity
              style={styles.navButton}
              onPress={() =>
                handleGameModeNavigation("fillBlanks", "Fill in the Blanks")
              }
            >
              <LinearGradient
                colors={
                  gameModeNavigationColors.fillBlanks as readonly [
                    string,
                    string
                  ]
                }
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.navButtonText}>Fill in the Blanks</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gameModeContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
    paddingTop: 20,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  title: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    marginBottom: 12,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  navButton: {
    marginBottom: 10,
    minWidth: 150,
    borderRadius: 16,
    overflow: "hidden",
  },
  gradientButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
  },
  navButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
  },
});

export default GameNavigation;
