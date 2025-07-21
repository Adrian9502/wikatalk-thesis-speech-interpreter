import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { BASE_COLORS, gameModeNavigationColors } from "@/constant/colors";
import { GameMode } from "@/types/gameTypes";
import useGameStore from "@/store/games/useGameStore";
import { NAVIGATION_COLORS } from "@/constant/gameConstants";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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

  // FIXED: Safe navigation with proper stack management
  const handleBackToLevels = () => {
    console.log("[GameNavigation] Navigating back to levels with replace");

    // Clear game state before navigation
    const gameStore = useGameStore.getState();
    gameStore.setGameStatus("idle");
    gameStore.setScore(0);
    gameStore.setTimerRunning(false);
    gameStore.resetTimer();
    gameStore.handleRestart();

    // Use replace to avoid navigation stack issues
    router.replace({
      pathname: "/(games)/LevelSelection",
      params: {
        gameMode,
        gameTitle,
        difficulty,
      },
    });
  };

  // FIXED: Safe navigation to home
  const handleBackToHome = () => {
    console.log("[GameNavigation] Navigating to home with replace");

    // Clear game state
    const gameStore = useGameStore.getState();
    gameStore.setGameStatus("idle");
    gameStore.setScore(0);
    gameStore.setTimerRunning(false);
    gameStore.resetTimer();
    gameStore.handleRestart();

    // Use replace to reset navigation stack
    router.replace("/(tabs)/Games");
  };

  // FIXED: Safe navigation to next level
  const handleNextLevel = () => {
    console.log(`[GameNavigation] Navigating to level ${numericLevelId + 1}`);

    // Reset game state before navigation
    const gameStore = useGameStore.getState();
    gameStore.setGameStatus("idle");
    gameStore.setScore(0);
    gameStore.setTimerRunning(false);
    gameStore.resetTimer();
    gameStore.handleRestart();

    // Use replace to avoid stack buildup
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

  // FIXED: Safe game mode navigation
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

    // Use replace to avoid navigation issues
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
        {/* Next Level Button - Main CTA */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleNextLevel}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={NAVIGATION_COLORS.green}
            style={styles.primaryGradient}
          >
            <View style={styles.primaryButtonContent}>
              <View style={styles.primaryIconContainer}>
                <MaterialCommunityIcons
                  name="play"
                  size={24}
                  color={BASE_COLORS.white}
                />
              </View>
              <View style={styles.primaryTextContainer}>
                <Text style={styles.primaryButtonTitle}>Next Level</Text>
                <Text style={styles.primaryButtonSubtitle}>
                  Level {numericLevelId + 1} -
                </Text>
              </View>
              <MaterialCommunityIcons
                name="arrow-right"
                size={24}
                color={BASE_COLORS.white}
              />
            </View>

            {/* Button Decorations */}
            <View style={styles.primaryDecoration1} />
            <View style={styles.primaryDecoration2} />
          </LinearGradient>
        </TouchableOpacity>
      </Animatable.View>

      {/* Secondary Actions Grid */}
      <Animatable.View animation="fadeInUp" duration={700} delay={300}>
        <View style={styles.secondaryGrid}>
          {/* Try Again */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onRestart}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={NAVIGATION_COLORS.yellow}
              style={styles.secondaryGradient}
            >
              <View style={styles.secondaryIconContainer}>
                <MaterialCommunityIcons
                  name="rotate-left"
                  size={22}
                  color={BASE_COLORS.white}
                />
              </View>
              <Text style={styles.secondaryButtonText}>Try Again</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Back to Levels */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleBackToLevels}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={NAVIGATION_COLORS.blue}
              style={styles.secondaryGradient}
            >
              <View style={styles.secondaryIconContainer}>
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={22}
                  color={BASE_COLORS.white}
                />
              </View>
              <Text style={styles.secondaryButtonText}>Back to Levels</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Back to Home */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleBackToHome}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={NAVIGATION_COLORS.purple}
              style={styles.secondaryGradient}
            >
              <View style={styles.secondaryIconContainer}>
                <MaterialCommunityIcons
                  name="home"
                  size={22}
                  color={BASE_COLORS.white}
                />
              </View>
              <Text style={styles.secondaryButtonText}>Back to Home</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animatable.View>

      {/* Game Mode Navigation Section */}
      <Animatable.View
        animation="fadeIn"
        duration={600}
        delay={500}
        style={styles.gameModeSection}
      >
        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Try Other Game Modes</Text>
        <Text style={styles.sectionSubtitle}>
          Challenge yourself with different learning styles
        </Text>

        <View style={styles.gameModeGrid}>
          {gameMode !== "multipleChoice" && (
            <Animatable.View
              animation="slideInLeft"
              duration={600}
              delay={600}
              style={styles.gameModeWrapper}
            >
              <TouchableOpacity
                style={styles.gameModeButton}
                onPress={() =>
                  handleGameModeNavigation("multipleChoice", "Multiple Choice")
                }
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={gameModeNavigationColors.multipleChoice}
                  style={styles.gameModeGradient}
                >
                  <View style={styles.gameModeIconContainer}>
                    <Text style={styles.gameModeIcon}>✓</Text>
                  </View>
                  <View style={styles.gameModeContent}>
                    <Text style={styles.gameModeTitle}>Multiple Choice</Text>
                    <Text style={styles.gameModeDescription}>
                      Select the correct answer
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={16}
                    color={BASE_COLORS.white}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>
          )}

          {gameMode !== "identification" && (
            <Animatable.View
              animation="slideInUp"
              duration={600}
              delay={700}
              style={styles.gameModeWrapper}
            >
              <TouchableOpacity
                style={styles.gameModeButton}
                onPress={() =>
                  handleGameModeNavigation(
                    "identification",
                    "Word Identification"
                  )
                }
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={gameModeNavigationColors.identification}
                  style={styles.gameModeGradient}
                >
                  <View style={styles.gameModeIconContainer}>
                    <Text style={styles.gameModeIcon}>👁</Text>
                  </View>
                  <View style={styles.gameModeContent}>
                    <Text style={styles.gameModeTitle}>
                      Word Identification
                    </Text>
                    <Text style={styles.gameModeDescription}>
                      Find the correct word
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={16}
                    color={BASE_COLORS.white}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>
          )}

          {gameMode !== "fillBlanks" && (
            <Animatable.View
              animation="slideInRight"
              duration={600}
              delay={800}
              style={styles.gameModeWrapper}
            >
              <TouchableOpacity
                style={styles.gameModeButton}
                onPress={() =>
                  handleGameModeNavigation("fillBlanks", "Fill in the Blanks")
                }
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={gameModeNavigationColors.fillBlanks}
                  style={styles.gameModeGradient}
                >
                  <View style={styles.gameModeIconContainer}>
                    <Text style={styles.gameModeIcon}>📝</Text>
                  </View>
                  <View style={styles.gameModeContent}>
                    <Text style={styles.gameModeTitle}>Fill in the Blanks</Text>
                    <Text style={styles.gameModeDescription}>
                      Complete the sentence
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={16}
                    color={BASE_COLORS.white}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>
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
  primaryButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  primaryGradient: {
    padding: 16,
    position: "relative",
    overflow: "hidden",
  },
  primaryButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 2,
  },
  primaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  primaryTextContainer: {
    flex: 1,
  },
  primaryButtonTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: BASE_COLORS.white,
    marginBottom: 2,
  },
  primaryButtonSubtitle: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.8)",
  },
  primaryDecoration1: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  primaryDecoration2: {
    position: "absolute",
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },

  // Secondary Section - Updated for proper grid layout
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
  secondaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  secondaryButton: {
    flex: 1, // This makes each button take equal space
    borderRadius: 16,
    overflow: "hidden",
  },
  secondaryGradient: {
    padding: 12,
    alignItems: "center",
    minHeight: 80,
    justifyContent: "center",
  },
  secondaryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  secondaryButtonText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    textAlign: "center",
    lineHeight: 14,
  },

  // Game Mode Section
  gameModeSection: {
    paddingTop: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 20,
  },
  gameModeGrid: {
    gap: 8,
  },
  gameModeWrapper: {
    marginBottom: 12,
  },
  gameModeButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  gameModeGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  gameModeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  gameModeIcon: {
    fontSize: 18,
  },
  gameModeContent: {
    flex: 1,
  },
  gameModeTitle: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    marginBottom: 2,
  },
  gameModeDescription: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.8)",
  },
});

export default GameNavigation;
