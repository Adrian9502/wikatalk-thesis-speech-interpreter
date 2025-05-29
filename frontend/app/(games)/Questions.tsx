import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { BASE_COLORS } from "@/constant/colors";

// Import game components
import MultipleChoice from "./MultipleChoice";
import Identification from "./Identification";
import FillInTheBlank from "./FillInTheBlank";
import GameInfoModal from "@/components/Games/GameInfoModal";
import useQuizStore from "@/store/Games/useQuizStore";
import AppLoading from "@/components/AppLoading";

const Questions = () => {
  const params = useLocalSearchParams();
  const gameMode = params.gameMode as string;
  const levelId = parseInt(params.levelId as string) || 1;
  const difficulty = params.difficulty as string;
  const skipModal = params.skipModal === "true";

  // Initialize modal as hidden if skipModal is true
  const [showInfoModal, setShowInfoModal] = useState(!skipModal);
  const [gameStarted, setGameStarted] = useState(skipModal);
  const [isLoading, setIsLoading] = useState(false);
  const [showGame, setShowGame] = useState(skipModal);

  // Get quiz store methods
  const {
    fetchQuestionsByMode,
    getLevelData,
    isLoading: storeLoading,
    error,
  } = useQuizStore();

  // State for level data
  const [levelData, setLevelData] = useState(null);
  const [actualDifficulty, setActualDifficulty] = useState(difficulty);

  // Add local loading state
  const [localLoading, setLocalLoading] = useState(true);

  // Fetch questions on component mount
  useEffect(() => {
    const loadQuizData = async () => {
      setLocalLoading(true);
      try {
        // Start with shorter timeouts
        const result = getLevelData(gameMode, levelId, difficulty);

        if (result) {
          // If we have the data already, use it immediately
          if (result.foundDifficulty) {
            setLevelData(result.levelData);
            setActualDifficulty(result.foundDifficulty);
          } else {
            setLevelData(result);
          }
          // Small delay to prevent flicker
          setTimeout(() => setLocalLoading(false), 100);
          return; // Exit early if we have data
        }

        // Only fetch from API if we don't have the data cached
        await fetchQuestionsByMode(gameMode);

        const updatedResult = getLevelData(gameMode, levelId, difficulty);
        if (updatedResult) {
          if (updatedResult.foundDifficulty) {
            setLevelData(updatedResult.levelData);
            setActualDifficulty(updatedResult.foundDifficulty);
          } else {
            setLevelData(updatedResult);
          }
        }
        setLocalLoading(false);
      } catch (error) {
        console.error("Error loading quiz data:", error);
        setLocalLoading(false);
      }
    };

    loadQuizData();
  }, [gameMode, levelId, difficulty]);

  // Handle game start
  const handleStartGame = () => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setShowInfoModal(false);

      // Show the game component after modal closes
      setTimeout(() => {
        setShowGame(true);

        // Start the game timer/logic after a short delay to ensure smooth transition
        setTimeout(() => {
          setGameStarted(true);
        }, 300);
      }, 300);
    }, 1000);
  };

  // Handle modal close (go back to levels screen)
  const handleCloseModal = () => {
    router.back();
  };

  // Add memoization for better performance
  const renderGameComponent = useCallback(() => {
    if (storeLoading) {
      return <ActivityIndicator size="large" color={BASE_COLORS.blue} />;
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/(tabs)/Games")}
          >
            <Text style={styles.backButtonText}>Back to Games</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!levelData) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Level {levelId} not found in {difficulty} difficulty.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/(tabs)/Games")}
          >
            <Text style={styles.backButtonText}>Back to Games</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // If the game hasn't started yet, show a loading indicator
    if (!gameStarted) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={BASE_COLORS.blue} />
          <Text style={styles.loadingText}>Preparing your game...</Text>
        </View>
      );
    }

    // Use a switch-case for better performance than multiple if-else
    switch (gameMode) {
      case "multipleChoice":
        return (
          <MultipleChoice
            levelId={levelId}
            levelData={levelData}
            difficulty={actualDifficulty}
            isStarted={gameStarted}
          />
        );
      case "identification":
        return (
          <Identification
            levelId={levelId}
            levelData={levelData}
            difficulty={actualDifficulty}
            isStarted={gameStarted}
          />
        );
      case "fillBlanks":
        return (
          <FillInTheBlank
            levelId={levelId}
            levelData={levelData}
            difficulty={actualDifficulty}
            isStarted={gameStarted}
          />
        );
      default:
        // Redirect back to games if invalid mode
        router.replace("/(tabs)/Games");
        return <ActivityIndicator size="large" color={BASE_COLORS.blue} />;
    }
  }, [
    levelData,
    gameMode,
    levelId,
    actualDifficulty,
    gameStarted,
    storeLoading,
    error,
  ]);

  // Log when the game state changes
  useEffect(() => {
    if (gameStarted) {
      console.log("Game has started:", gameMode, levelId);
    }
  }, [gameStarted]);

  // Show loading state while fetching or initializing
  if (localLoading || storeLoading || (!showGame && !showInfoModal)) {
    return <AppLoading />;
  }

  return (
    <View style={styles.container}>
      {/* Only render the game component if showGame is true */}
      {showGame ? renderGameComponent() : null}

      <GameInfoModal
        visible={showInfoModal}
        onClose={handleCloseModal}
        onStart={handleStartGame}
        levelData={levelData}
        gameMode={gameMode}
        isLoading={isLoading}
        difficulty={actualDifficulty}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#111B21",
  },
  errorText: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: BASE_COLORS.blue,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111B21",
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    marginTop: 10,
  },
});

export default Questions;
