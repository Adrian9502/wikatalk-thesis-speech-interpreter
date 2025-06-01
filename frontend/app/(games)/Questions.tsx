import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  AppState,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { BASE_COLORS } from "@/constant/colors";
import useThemeStore from "@/store/useThemeStore";

// Direct imports instead of lazy loading
import MultipleChoice from "./MultipleChoice";
import Identification from "./Identification";
import FillInTheBlank from "./FillInTheBlank";

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

  // Add ref to track if component is mounting for the first time
  const isInitialMount = useRef(true);
  const appState = useRef(AppState.currentState);

  // FIXED: Use ref to track current modal state for AppState handler
  const modalStateRef = useRef({
    showInfoModal: !skipModal,
    showGame: skipModal,
    isLoading: false,
    hasStarted: skipModal,
  });

  // FIXED: Better state management to prevent duplicate modals
  const [modalState, setModalState] = useState(() => {
    return modalStateRef.current;
  });

  // Update ref whenever modalState changes
  useEffect(() => {
    modalStateRef.current = modalState;
  }, [modalState]);

  // Get quiz store methods
  const {
    fetchQuestionsByMode,
    getLevelData,
    isLoading: storeLoading,
    error,
    gameState,
  } = useQuizStore();

  // State for level data
  const [levelData, setLevelData] = useState(null);
  const [actualDifficulty, setActualDifficulty] = useState(difficulty);
  const [localLoading, setLocalLoading] = useState(true);
  const [gameComponentReady, setGameComponentReady] = useState(false);

  // FIXED: Handle app state changes to prevent duplicate modals
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      console.log("App state changed:", appState.current, "->", nextAppState);

      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // App came back to foreground
        console.log("App returned to foreground");
        console.log(
          "Current modal state when returning:",
          modalStateRef.current
        );

        // If game has already started, ensure modal is hidden and game is shown
        if (modalStateRef.current.hasStarted) {
          console.log("Game already started, hiding modal and showing game");
          setModalState({
            showInfoModal: false,
            showGame: true,
            isLoading: false,
            hasStarted: true,
          });
        }
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => subscription?.remove();
  }, []); // Remove dependency on modalState.hasStarted

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
          setGameComponentReady(true);
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
        setGameComponentReady(true);
      } catch (error) {
        console.error("Error loading quiz data:", error);
        setLocalLoading(false);
      }
    };

    loadQuizData();
  }, [gameMode, levelId, difficulty]);

  // FIXED: Improved game start logic with proper state management
  const handleStartGame = useCallback(() => {
    console.log("Starting game - current modal state:", modalState);

    // Prevent multiple calls
    if (modalState.isLoading || modalState.hasStarted) {
      console.log("Game start prevented - already loading or started");
      return;
    }

    setModalState((prev) => ({
      ...prev,
      isLoading: true,
    }));

    // Short delay for UI feedback
    setTimeout(() => {
      const newState = {
        showInfoModal: false,
        showGame: true,
        isLoading: false,
        hasStarted: true, // Mark as started
      };
      setModalState(newState);
      console.log("Game started successfully with state:", newState);
    }, 500);
  }, [modalState]);

  // Handle modal close (go back to levels screen)
  const handleCloseModal = useCallback(() => {
    console.log("Closing modal");
    router.back();
  }, []);

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
        router.replace("/(tabs)/Games");
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
  ]);

  // Show loading state while fetching or initializing
  if (
    localLoading ||
    storeLoading ||
    (!modalState.showGame && !modalState.showInfoModal)
  ) {
    return <AppLoading />;
  }

  console.log("Rendering Questions with modal state:", modalState);

  return (
    <View style={styles.container}>
      {/* Only render the game component if showGame is true */}
      {modalState.showGame ? renderGameComponent() : null}

      {/* FIXED: Better modal visibility control - only show if game hasn't started */}
      <GameInfoModal
        visible={modalState.showInfoModal && !modalState.hasStarted}
        onClose={handleCloseModal}
        onStart={handleStartGame}
        levelData={levelData}
        gameMode={gameMode}
        isLoading={modalState.isLoading}
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
