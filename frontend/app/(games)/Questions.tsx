import React, { useEffect, useState } from "react";
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

// Import quiz data
import quizData from "@/utils/Games/quizQuestions.json";

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

  // Get level-specific data based on game mode, difficulty, and level ID
  const getLevelData = () => {
    if (!gameMode || !quizData[gameMode]) {
      return null;
    }

    // First try the specified difficulty
    if (quizData[gameMode][difficulty]) {
      const levelInCurrentDifficulty = quizData[gameMode][difficulty].find(
        (item) => item.id === levelId
      );

      if (levelInCurrentDifficulty) {
        return levelInCurrentDifficulty;
      }
    }

    // If not found, try to find the level in any difficulty
    const difficulties = Object.keys(quizData[gameMode]);
    for (const diff of difficulties) {
      const levelInDifficulty = quizData[gameMode][diff].find(
        (item) => item.id === levelId
      );
      if (levelInDifficulty) {
        // Return the level and the found difficulty - but DON'T update params here
        return {
          levelData: levelInDifficulty,
          foundDifficulty: diff,
        };
      }
    }

    // If still not found, return the first level of the current difficulty as fallback
    if (
      quizData[gameMode][difficulty] &&
      quizData[gameMode][difficulty].length > 0
    ) {
      return quizData[gameMode][difficulty][0];
    }

    return null;
  };

  const levelDataResult = getLevelData();
  const [levelData, setLevelData] = useState(null);
  const [actualDifficulty, setActualDifficulty] = useState(difficulty);

  // Use an effect to handle router updates instead of during render
  useEffect(() => {
    if (levelDataResult) {
      if (levelDataResult.foundDifficulty) {
        // We found the level in a different difficulty
        setLevelData(levelDataResult.levelData);
        setActualDifficulty(levelDataResult.foundDifficulty);
        // Update URL params safely outside render
        router.setParams({ difficulty: levelDataResult.foundDifficulty });
      } else {
        // Normal case - level is in expected difficulty
        setLevelData(levelDataResult);
      }
    }
  }, [levelDataResult]);

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

  // Render the appropriate game component based on the mode
  const renderGameComponent = () => {
    if (!levelData) {
      // Show a more informative message instead of redirecting immediately
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

    // Add isStarted prop to game components
    switch (gameMode) {
      case "multipleChoice":
        return (
          <MultipleChoice
            levelId={levelId}
            levelData={levelData}
            difficulty={difficulty}
            isStarted={gameStarted}
          />
        );
      case "identification":
        return (
          <Identification
            levelId={levelId}
            levelData={levelData}
            difficulty={difficulty}
            isStarted={gameStarted}
          />
        );
      case "fillBlanks":
        return (
          <FillInTheBlank
            levelId={levelId}
            levelData={levelData}
            difficulty={difficulty}
            isStarted={gameStarted}
          />
        );
      default:
        // Redirect back to games if invalid mode
        setTimeout(() => router.replace("/(tabs)/Games"), 1000);
        return <ActivityIndicator size="large" color={BASE_COLORS.blue} />;
    }
  };

  // Log when the game state changes
  useEffect(() => {
    if (gameStarted) {
      console.log("Game has started:", gameMode, levelId);
    }
  }, [gameStarted]);

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
        difficulty={difficulty}
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
});

export default Questions;
