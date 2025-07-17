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

  // FIXED: Load quiz data effect
  useEffect(() => {
    const loadQuizData = async () => {
      try {
        setLocalLoading(true);
        setGameComponentReady(false);

        // If skipModal is true, start with game view
        if (skipModal) {
          setModalState({
            showInfoModal: false,
            showGame: true,
            isLoading: false,
            hasStarted: true,
          });
        }

        // Try to get level data directly first
        const result = getLevelData(gameMode, levelId, difficulty);
        if (result) {
          if (result.foundDifficulty) {
            setLevelData(result.levelData);
            setActualDifficulty(result.foundDifficulty);
          } else {
            setLevelData(result);
          }
          setLocalLoading(false);
          setGameComponentReady(true);
          return;
        }

        // If no data found, fetch questions
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
    levelId,
    difficulty,
    skipModal,
    getLevelData,
    fetchQuestionsByMode,
  ]);

  // FIXED: Game start handler with proper navigation safety
  const handleStartGame = useCallback(() => {
    if (modalState.isLoading || modalState.hasStarted) return;

    console.log("[Questions] Starting game...");

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
  }, [modalState.isLoading, modalState.hasStarted]);

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

  // FIXED: Render game component with all hooks called first
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

    // Render appropriate game component
    switch (gameMode) {
      case "multipleChoice":
        return (
          <MultipleChoice
            levelId={levelId}
            levelData={levelData}
            difficulty={actualDifficulty}
            isStarted={modalState.showGame}
          />
        );
      case "identification":
        return (
          <Identification
            levelId={levelId}
            levelData={levelData}
            difficulty={actualDifficulty}
            isStarted={modalState.showGame}
          />
        );
      case "fillBlanks":
        return (
          <FillInTheBlank
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
    difficulty,
  ]);

  // FIXED: Main render - all hooks are now called before any conditional logic
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
      {/* Only render game component when we should show the game */}
      {modalState.showGame ? renderGameComponent() : null}

      {/* FIXED: Only render modal when it should be visible AND we have data */}
      {modalState.showInfoModal && !modalState.hasStarted && levelData && (
        <LevelInfoModal
          visible={modalState.showInfoModal && !modalState.hasStarted}
          onClose={handleCloseModal}
          onStart={handleStartGame}
          levelData={levelData}
          gameMode={gameMode}
          isLoading={modalState.isLoading}
          difficulty={actualDifficulty}
        />
      )}
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
    borderRadius: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
});

export default Questions;
