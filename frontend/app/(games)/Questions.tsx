import React, { useEffect, useState, useCallback, lazy } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { BASE_COLORS } from "@/constant/colors";
import useThemeStore from "@/store/useThemeStore";

// Lazy load game components
const MultipleChoice = lazy(() => import("./MultipleChoice"));
const Identification = lazy(() => import("./Identification"));
const FillInTheBlank = lazy(() => import("./FillInTheBlank"));

// Import other components
import GameInfoModal from "@/components/Games/GameInfoModal";
import useQuizStore from "@/store/Games/useQuizStore";
import AppLoading from "@/components/AppLoading";
import DotsLoader from "@/components/DotLoader";
import { SafeAreaView } from "react-native-safe-area-context";

const Questions = () => {
  const params = useLocalSearchParams();
  const gameMode = params.gameMode as string;
  const levelId = parseInt(params.levelId as string) || 1;
  const difficulty = params.difficulty as string;
  const skipModal = params.skipModal === "true";
  const { activeTheme } = useThemeStore();

  // Simplified state management
  const [showInfoModal, setShowInfoModal] = useState(!skipModal);
  const [isLoading, setIsLoading] = useState(false);
  const [showGame, setShowGame] = useState(skipModal);

  // Get quiz store methods
  const {
    fetchQuestionsByMode,
    getLevelData,
    isLoading: storeLoading,
    error,
    // Add game state access
    gameState,
  } = useQuizStore();

  // State for level data
  const [levelData, setLevelData] = useState(null);
  const [actualDifficulty, setActualDifficulty] = useState(difficulty);
  const [localLoading, setLocalLoading] = useState(true);

  // Add a loading state check to prevent Suspense loops
  const [gameComponentReady, setGameComponentReady] = useState(false);

  // Fetch questions on component mount
  useEffect(() => {
    const loadQuizData = async () => {
      setLocalLoading(true);
      try {
        const result = getLevelData(gameMode, levelId, difficulty);

        if (result) {
          if (result.foundDifficulty) {
            setLevelData(result.levelData);
            setActualDifficulty(result.foundDifficulty);
          } else {
            setLevelData(result);
          }
          setLocalLoading(false);
          setGameComponentReady(true); // Mark as ready
          return;
        }

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
        setGameComponentReady(true); // Mark as ready
      } catch (error) {
        console.error("Error loading quiz data:", error);
        setLocalLoading(false);
      }
    };

    loadQuizData();
  }, [gameMode, levelId, difficulty]);

  // FIXED: Simplified game start logic
  const handleStartGame = () => {
    setIsLoading(true);

    // Short delay for UI feedback, then immediately show game
    setTimeout(() => {
      setIsLoading(false);
      setShowInfoModal(false);
      setShowGame(true);
      // Game will auto-start via isStarted prop
    }, 500); // Reduced from complex nested timeouts
  };

  // Handle modal close (go back to levels screen)
  const handleCloseModal = () => {
    router.back();
  };

  // Add memoization for better performance
  const renderGameComponent = useCallback(() => {
    if (storeLoading || !gameComponentReady) {
      return <ActivityIndicator size="large" color={BASE_COLORS.blue} />;
    }

    if (error) {
      return (
        <View
          style={[
            styles.errorContainer,
            { backgroundColor: activeTheme.backgroundColor },
          ]}
        >
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
        <View
          style={[
            styles.errorContainer,
            { backgroundColor: activeTheme.backgroundColor },
          ]}
        >
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

    // Switch case for rendering components
    switch (gameMode) {
      case "multipleChoice":
        return (
          <MultipleChoice
            levelId={levelId}
            levelData={levelData}
            difficulty={actualDifficulty}
            isStarted={showGame}
          />
        );
      case "identification":
        return (
          <Identification
            levelId={levelId}
            levelData={levelData}
            difficulty={actualDifficulty}
            isStarted={showGame}
          />
        );
      case "fillBlanks":
        return (
          <FillInTheBlank
            levelId={levelId}
            levelData={levelData}
            difficulty={actualDifficulty}
            isStarted={showGame}
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
    showGame,
    storeLoading,
    error,
    gameComponentReady, // Add this dependency
  ]);

  const StyledSuspenseLoader = () => {
    return (
      <SafeAreaView
        style={[
          styles.fullScreenLoader,
          { backgroundColor: activeTheme.backgroundColor },
        ]}
      >
        <DotsLoader />
      </SafeAreaView>
    );
  };

  // Show loading state while fetching or initializing
  if (localLoading || storeLoading || (!showGame && !showInfoModal)) {
    return <AppLoading />;
  }

  return (
    <View style={styles.container}>
      {/* Only render the game component if showGame is true */}
      {showGame && gameComponentReady ? (
        <React.Suspense fallback={<StyledSuspenseLoader />}>
          {renderGameComponent()}
        </React.Suspense>
      ) : null}

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
  },
  fullScreenLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Questions;
