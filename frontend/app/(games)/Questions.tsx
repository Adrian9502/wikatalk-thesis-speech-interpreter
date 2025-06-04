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
  const { activeTheme } = useThemeStore();

  // App state reference
  const appState = useRef(AppState.currentState);

  // Modal state with ref for AppState handler
  const modalStateRef = useRef({
    showInfoModal: !skipModal,
    showGame: skipModal,
    isLoading: false,
    hasStarted: skipModal,
  });

  // State for the component
  const [modalState, setModalState] = useState(() => modalStateRef.current);
  const [levelData, setLevelData] = useState(null);
  const [actualDifficulty, setActualDifficulty] = useState(difficulty);
  const [localLoading, setLocalLoading] = useState(true);
  const [gameComponentReady, setGameComponentReady] = useState(false);

  // Get quiz store methods
  const {
    fetchQuestionsByMode,
    getLevelData,
    isLoading: storeLoading,
    error,
  } = useQuizStore();

  // Update ref whenever modalState changes
  useEffect(() => {
    modalStateRef.current = modalState;
    // Log state changes - this is now safely inside a hook
    if (__DEV__) {
      console.log("Modal state updated:", modalState);
    }
  }, [modalState]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        if (modalStateRef.current.hasStarted) {
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
  }, []);

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
  }, [gameMode, levelId, difficulty, getLevelData, fetchQuestionsByMode]);

  // Game start handler
  const handleStartGame = useCallback(() => {
    if (modalState.isLoading || modalState.hasStarted) return;

    setModalState((prev) => ({
      ...prev,
      isLoading: true,
    }));

    setTimeout(() => {
      setModalState({
        showInfoModal: false,
        showGame: true,
        isLoading: false,
        hasStarted: true,
      });
    }, 500);
  }, [modalState.isLoading, modalState.hasStarted]);

  // Modal close handler
  const handleCloseModal = useCallback(() => {
    router.back();
  }, []);

  // Render game component based on mode
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
    activeTheme.backgroundColor,
    difficulty,
  ]);

  // Loading state check - AFTER all hooks are defined
  if (
    localLoading ||
    storeLoading ||
    (!modalState.showGame && !modalState.showInfoModal)
  ) {
    return <AppLoading />;
  }

  // Main render - No more hooks after this point
  return (
    <View style={styles.container}>
      {modalState.showGame ? renderGameComponent() : null}

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
