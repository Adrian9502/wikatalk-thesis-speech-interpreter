import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import useGameStore from "@/store/games/useGameStore";
import useThemeStore from "@/store/useThemeStore";
import { BASE_COLORS } from "@/constant/colors";
import AppLoading from "@/components/AppLoading";
import LevelInfoModal from "@/components/games/levels/LevelInfoModal";
import MultipleChoice from "./MultipleChoice";
import Identification from "./Identification";
import FillInTheBlank from "./FillInTheBlank";

const Questions = () => {
  // IMPORTANT: ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  const params = useLocalSearchParams();
  const { activeTheme } = useThemeStore();

  const {
    getLevelData,
    fetchQuestionsByMode,
    isLoading: storeLoading,
    error,
    // NEW: Add clear game state method
    clearGameState,
  } = useGameStore();

  // Local state - ALL hooks declared first
  const [localLoading, setLocalLoading] = useState(true);
  const [gameComponentReady, setGameComponentReady] = useState(false);
  const [levelData, setLevelData] = useState<any>(null);
  const [actualDifficulty, setActualDifficulty] = useState<string>("easy");
  const [modalState, setModalState] = useState({
    showInfoModal: true,
    showGame: false,
    isLoading: false,
    hasStarted: false,
  });

  // Extract params with proper type handling
  const gameMode =
    typeof params.gameMode === "string" ? params.gameMode : "multipleChoice";
  const levelId = Number(params.levelId) || 1;
  const difficulty =
    typeof params.difficulty === "string" ? params.difficulty : "easy";
  const skipModal = params.skipModal === "true";

  // NEW: Add key to force re-render when levelId changes
  const gameKey = `${gameMode}-${levelId}-${difficulty}`;

  // Update the loadQuizData effect to handle different navigation sources
  useEffect(() => {
    const loadQuizData = async () => {
      try {
        console.log(`[Questions] Loading data for level ${levelId}`);

        setLocalLoading(true);
        setGameComponentReady(false);

        // NEW: Always clear game state when loading new level
        const gameStore = useGameStore.getState();
        gameStore.setGameStatus("idle");
        gameStore.setScore(0);
        gameStore.setTimerRunning(false);
        gameStore.resetTimer();
        gameStore.handleRestart();

        // Clear any existing game state to prevent level mixing
        if (gameStore.clearGameState) {
          gameStore.clearGameState();
        }

        // FIXED: Properly check for navigation source
        const fromGameNavigation = params.fromGameNavigation === "true";
        const skipModalFromLevelSelection = skipModal === true;

        console.log(
          `[Questions] Navigation source - fromGameNavigation: ${fromGameNavigation}, skipModal: ${skipModalFromLevelSelection}`
        );

        if (skipModalFromLevelSelection && !fromGameNavigation) {
          // Coming from LevelSelection with skipModal
          console.log(
            "[Questions] skipModal from LevelSelection, ensuring clean state"
          );
          setModalState({
            showInfoModal: false,
            showGame: true,
            isLoading: false,
            hasStarted: true,
          });
        } else if (fromGameNavigation) {
          // FIXED: Coming from GameNavigation - skip modal and go directly to game
          console.log(
            "[Questions] Coming from GameNavigation, skipping modal and starting game directly"
          );
          setModalState({
            showInfoModal: false,
            showGame: true,
            isLoading: false,
            hasStarted: true,
          });
        } else {
          // Default case - show modal
          console.log("[Questions] Showing modal for level transition");
          setModalState({
            showInfoModal: true,
            showGame: false,
            isLoading: false,
            hasStarted: false,
          });
        }

        // FIXED: Try to get level data with more specific logging
        console.log(
          `[Questions] Getting level data for: ${gameMode}, level ${levelId}, difficulty ${difficulty}`
        );

        const result = getLevelData(gameMode, levelId, difficulty);
        if (result) {
          console.log(`[Questions] Found level data:`, {
            id: result.id || result.questionId,
            title: result.title,
            difficulty: result.difficulty || result.difficultyCategory,
          });

          if (result.foundDifficulty) {
            setLevelData(result.levelData);
            setActualDifficulty(result.foundDifficulty);
          } else {
            setLevelData(result);
            const extractedDifficulty =
              result.difficulty || result.difficultyCategory || "easy";
            setActualDifficulty(extractedDifficulty);
          }
          setLocalLoading(false);
          setGameComponentReady(true);
          return;
        }

        // If no data found, fetch questions
        console.log(
          `[Questions] No cached data found, fetching questions for ${gameMode}`
        );
        await fetchQuestionsByMode(gameMode);

        const updatedResult = getLevelData(gameMode, levelId, difficulty);
        if (updatedResult) {
          console.log(`[Questions] Found level data after fetch:`, {
            id: updatedResult.id || updatedResult.questionId,
            title: updatedResult.title,
            difficulty:
              updatedResult.difficulty || updatedResult.difficultyCategory,
          });

          if (updatedResult.foundDifficulty) {
            setLevelData(updatedResult.levelData);
            setActualDifficulty(updatedResult.foundDifficulty);
          } else {
            setLevelData(updatedResult);
            const extractedDifficulty =
              updatedResult.difficulty ||
              updatedResult.difficultyCategory ||
              "easy";
            setActualDifficulty(extractedDifficulty);
          }
        } else {
          console.error(`[Questions] No level data found for level ${levelId}`);
        }

        setLocalLoading(false);
        setGameComponentReady(true);
      } catch (error) {
        console.error("Error loading quiz data:", error);
        setLocalLoading(false);
        setGameComponentReady(false);
      }
    };

    loadQuizData();
  }, [
    gameMode,
    levelId, // This will trigger reload when levelId changes
    difficulty,
    skipModal,
    params.fromGameNavigation, // Keep this dependency
    getLevelData,
    fetchQuestionsByMode,
  ]);

  // FIXED: Game start handler - handle immediate start from GameNavigation
  const handleStartGame = useCallback(() => {
    if (modalState.isLoading || modalState.hasStarted) return;

    console.log(`[Questions] Starting game for level ${levelId}...`);

    setModalState((prev) => ({
      ...prev,
      isLoading: true,
    }));

    // Use a longer delay to ensure proper cleanup
    setTimeout(() => {
      try {
        setModalState({
          showInfoModal: false,
          showGame: true,
          isLoading: false,
          hasStarted: true,
        });
      } catch (error) {
        console.error("[Questions] Error starting game:", error);
        // Reset state on error
        setModalState((prev) => ({
          ...prev,
          isLoading: false,
        }));
      }
    }, 300); // Increased delay
  }, [modalState.isLoading, modalState.hasStarted, levelId]);

  // NEW: Auto-start game when coming from GameNavigation
  useEffect(() => {
    const fromGameNavigation = params.fromGameNavigation === "true";

    if (
      fromGameNavigation &&
      levelData &&
      !modalState.hasStarted &&
      !modalState.isLoading
    ) {
      console.log("[Questions] Auto-starting game from GameNavigation");

      // Small delay to ensure everything is loaded
      setTimeout(() => {
        // Initialize the game components properly
        const gameStore = useGameStore.getState();
        if (levelData) {
          gameStore.initialize(levelData, levelId, gameMode, difficulty);
          gameStore.startGame();
        }
      }, 100);
    }
  }, [
    params.fromGameNavigation,
    levelData,
    modalState.hasStarted,
    modalState.isLoading,
    levelId,
    gameMode,
    difficulty,
  ]);

  // FIXED: Modal close handler with navigation safety
  const handleCloseModal = useCallback(() => {
    try {
      console.log("[Questions] Closing modal and navigating back");

      // Add a small delay to ensure modal closes properly
      setTimeout(() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/(tabs)/Games");
        }
      }, 100);
    } catch (error) {
      console.error("[Questions] Navigation error:", error);
      // Fallback navigation
      setTimeout(() => {
        router.replace("/(tabs)/Games");
      }, 200);
    }
  }, []);

  // FIXED: Render game component with stable dependencies and proper key
  const renderGameComponent = useCallback(() => {
    // Don't render if still loading
    if (storeLoading || !gameComponentReady || localLoading) {
      return <ActivityIndicator size="large" color={BASE_COLORS.blue} />;
    }

    // Handle error state
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

    // Handle missing level data
    if (!levelData) {
      return (
        <View
          style={[
            styles.errorContainer,
            { backgroundColor: activeTheme.backgroundColor },
          ]}
        >
          <Text style={styles.errorText}>
            Level {levelId} not found in {actualDifficulty} difficulty.
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

    switch (gameMode) {
      case "multipleChoice":
        return (
          <MultipleChoice
            key={gameKey}
            levelId={levelId}
            levelData={levelData}
            difficulty={actualDifficulty}
            isStarted={modalState.showGame}
          />
        );
      case "identification":
        return (
          <Identification
            key={gameKey}
            levelId={levelId}
            levelData={levelData}
            difficulty={actualDifficulty}
            isStarted={modalState.showGame}
          />
        );
      case "fillBlanks":
        return (
          <FillInTheBlank
            key={gameKey}
            levelId={levelId}
            levelData={levelData}
            difficulty={actualDifficulty}
            isStarted={modalState.showGame}
          />
        );
      default:
        // Safe fallback navigation
        setTimeout(() => {
          router.replace("/(tabs)/Games");
        }, 0);
        return <ActivityIndicator size="large" color={BASE_COLORS.blue} />;
    }
  }, [
    levelData,
    gameMode,
    levelId,
    actualDifficulty,
    modalState.showGame,
    storeLoading,
    error,
    gameComponentReady,
    localLoading,
    activeTheme.backgroundColor,
    gameKey, // Include key in dependencies
  ]);

  // Show loading state while data is being prepared
  if (
    localLoading ||
    storeLoading ||
    (!modalState.showGame && !modalState.showInfoModal)
  ) {
    return <AppLoading />;
  }

  return (
    <View style={styles.container}>
      {/* FIXED: Only render game component when modal is not showing */}
      {modalState.showGame && !modalState.showInfoModal
        ? renderGameComponent()
        : null}

      {/* FIXED: Render modal with higher z-index and full overlay */}
      {modalState.showInfoModal && !modalState.hasStarted && levelData && (
        <View
          style={[
            styles.modalOverlay,
            { backgroundColor: activeTheme.backgroundColor },
          ]}
        >
          <LevelInfoModal
            visible={modalState.showInfoModal && !modalState.hasStarted}
            onClose={handleCloseModal}
            onStart={handleStartGame}
            levelData={levelData}
            gameMode={gameMode}
            isLoading={modalState.isLoading}
            difficulty={actualDifficulty}
          />
        </View>
      )}
    </View>
  );
};

// Add modal overlay style
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    zIndex: 1000,
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
    borderRadius: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
});

export default Questions;
