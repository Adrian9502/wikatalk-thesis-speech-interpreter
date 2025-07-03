import { useState, useEffect, useMemo, useCallback } from "react";
import { router } from "expo-router";
import { usePronunciationStore } from "@/store/usePronunciationStore";
import useCoinsStore from "@/store/games/useCoinsStore";
import useGameStore from "@/store/games/useGameStore";
import { useUserProgress } from "@/hooks/useUserProgress";
import {
  getTotalQuizCount,
  getQuizCountByMode,
  getAllQuizCounts,
  areAnyQuestionsLoaded,
} from "@/utils/quizCountUtils";
import { detectGameModeFromQuizId } from "@/utils/gameProgressUtils";
import { GameModeProgress } from "@/types/gameTypes";

// Define a type for the progress entries
interface ProgressEntry {
  quizId: string | number;
  completed: boolean;
  totalTimeSpent?: number;
  attempts?: any[];
  [key: string]: any;
}

// Define a type for game progress mapping
interface GameProgressMap {
  multipleChoice: ProgressEntry[];
  identification: ProgressEntry[];
  fillBlanks: ProgressEntry[];
  [key: string]: ProgressEntry[];
}

// Define a type for game results
interface GameResults {
  multipleChoice: GameModeProgress;
  identification: GameModeProgress;
  fillBlanks: GameModeProgress;
  [key: string]: GameModeProgress;
}

/**
 * Custom hook to manage the Games dashboard state and logic
 */
export default function useGameDashboard() {
  // Add state for pronunciation error
  const [pronunciationError, setPronunciationError] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Pronunciation store for Word of the Day
  const {
    wordOfTheDay,
    isWordOfDayPlaying,
    isAudioLoading,
    getWordOfTheDay,
    playWordOfDayAudio,
    fetchPronunciations,
    pronunciationData,
  } = usePronunciationStore();

  // Coins store for daily rewards
  const {
    fetchCoinsBalance,
    isDailyRewardsModalVisible,
    showDailyRewardsModal,
    hideDailyRewardsModal,
    checkDailyReward,
  } = useCoinsStore();

  // Modal visibility states
  const [wordOfDayModalVisible, setWordOfDayModalVisible] = useState(false);
  const [progressModal, setProgressModal] = useState({
    visible: false,
    gameMode: "",
    gameTitle: "",
  });

  // Global progress from user progress hook
  const { progress: globalProgress } = useUserProgress("global");

  // Initial data loading
  useEffect(() => {
    const loadData = async () => {
      // Load pronunciation data if needed
      if (pronunciationData.length === 0) {
        await fetchPronunciations();
      }

      // Get word of the day if needed
      if (!wordOfTheDay) {
        getWordOfTheDay();
      }

      // Load coins and check daily rewards
      await fetchCoinsBalance();
      await checkDailyReward();
    };

    loadData();
  }, []);

  // Ensure questions are loaded on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const { ensureQuestionsLoaded, questions } = useGameStore.getState();

        // Check if questions are already loaded
        const hasQuestions = Object.values(questions).some((gameMode) =>
          Object.values(gameMode).some(
            (difficulty) => Array.isArray(difficulty) && difficulty.length > 0
          )
        );

        if (!hasQuestions) {
          console.log("[Games] No questions found, forcing load...");
          await ensureQuestionsLoaded();
        } else {
          console.log("[Games] Questions already loaded");
        }
      } catch (error) {
        console.error("[Games] Error loading questions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // MEMOIZED: Game mode progress calculation
  const gameProgress = useMemo(() => {
    if (!Array.isArray(globalProgress)) {
      return {
        multipleChoice: {
          completed: 0,
          total: getQuizCountByMode("multipleChoice"),
        },
        identification: {
          completed: 0,
          total: getQuizCountByMode("identification"),
        },
        fillBlanks: {
          completed: 0,
          total: getQuizCountByMode("fillBlanks"),
        },
      } as GameResults;
    }

    // Get quiz counts from utility functions
    const totals = getAllQuizCounts();

    const results: GameResults = {
      multipleChoice: {
        completed: 0,
        total: totals.multipleChoice,
      },
      identification: {
        completed: 0,
        total: totals.identification,
      },
      fillBlanks: {
        completed: 0,
        total: totals.fillBlanks,
      },
    };

    // Group progress entries by game mode
    const progressByMode: GameProgressMap = {
      multipleChoice: [],
      identification: [],
      fillBlanks: [],
    };

    (globalProgress as ProgressEntry[]).forEach((entry) => {
      const detectedMode = detectGameModeFromQuizId(entry.quizId);
      if (detectedMode && progressByMode[detectedMode]) {
        progressByMode[detectedMode].push(entry);
      }
    });

    // Calculate completed count for each mode
    Object.keys(results).forEach((mode) => {
      const modeEntries = progressByMode[mode] || [];
      results[mode].completed = modeEntries.filter(
        (entry) => entry.completed
      ).length;
    });

    // If all totals are 0, questions might not be loaded - try to trigger loading
    if (!areAnyQuestionsLoaded()) {
      const { ensureQuestionsLoaded } = useGameStore.getState();
      ensureQuestionsLoaded();
    }

    return results;
  }, [globalProgress]);

  // OPTIMIZED: Get progress for specific game mode
  const getGameModeProgress = useCallback(
    (gameMode: string): GameModeProgress => {
      return (
        gameProgress[gameMode as keyof GameResults] || {
          completed: 0,
          total: 50,
        }
      );
    },
    [gameProgress]
  );

  // MEMOIZED: Total completed count across all modes
  const totalCompletedCount = useMemo(() => {
    return Object.values(gameProgress).reduce(
      (sum, mode) => sum + mode.completed,
      0
    );
  }, [gameProgress]);

  // Get questions directly from store for dependency tracking
  const { questions } = useGameStore();

  // MEMOIZED: Total quiz count
  const totalQuizCount = useMemo(() => {
    return getTotalQuizCount();
  }, [questions]); // <-- Add questions as dependency

  // Game event handlers
  const handleGamePress = useCallback((gameId: string, gameTitle: string) => {
    router.push({
      pathname: "/(games)/LevelSelection",
      params: {
        gameMode: gameId,
        gameTitle: gameTitle,
        levelId: "1",
      },
    });
  }, []);

  const openRewardsModal = useCallback(() => {
    showDailyRewardsModal();
  }, [showDailyRewardsModal]);

  const handleProgressPress = useCallback(
    async (gameMode: string, gameTitle: string) => {
      try {
        const { ensureQuestionsLoaded } = useGameStore.getState();
        await ensureQuestionsLoaded();

        setProgressModal({
          visible: true,
          gameMode,
          gameTitle,
        });
      } catch (error) {
        console.error(
          "[Games] Error loading questions for progress modal:",
          error
        );
        // Show modal anyway even if there's an error
        setProgressModal({
          visible: true,
          gameMode,
          gameTitle,
        });
      }
    },
    []
  );

  const closeProgressModal = useCallback(() => {
    setProgressModal({
      visible: false,
      gameMode: "",
      gameTitle: "",
    });
  }, []);

  // Add retry function
  const retryDataLoading = useCallback(async () => {
    try {
      // Reset states first
      setPronunciationError(null);

      // Load pronunciation data if needed
      if (!wordOfTheDay || pronunciationData.length === 0) {
        await fetchPronunciations();
        getWordOfTheDay();
      }

      // Load coins and check daily rewards
      await fetchCoinsBalance();
      await checkDailyReward();

      // Ensure questions are loaded
      const { ensureQuestionsLoaded } = useGameStore.getState();
      await ensureQuestionsLoaded();

      return true;
    } catch (error: unknown) {
      console.error("[Games] Retry failed:", error);
      setPronunciationError(
        error instanceof Error ? error.message : "Failed to load data"
      );
      return false;
    }
  }, [
    fetchPronunciations,
    getWordOfTheDay,
    fetchCoinsBalance,
    checkDailyReward,
  ]);

  // Modify your initialization code
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        // Track all promises to ensure they all complete before marking loading as done
        const promises = [];

        // Add each operation to our promise array
        if (pronunciationData.length === 0) {
          promises.push(fetchPronunciations());
        }

        if (!wordOfTheDay) {
          promises.push(getWordOfTheDay());
        }

        promises.push(fetchCoinsBalance());
        promises.push(checkDailyReward());

        // Ensure questions are loaded
        const { ensureQuestionsLoaded } = useGameStore.getState();
        promises.push(ensureQuestionsLoaded());

        // Wait for ALL promises to complete
        await Promise.all(promises);
      } catch (error) {
        console.error("[Games] Error initializing data:", error);
        setPronunciationError(
          error instanceof Error ? error.message : "Failed to load data"
        );
      } finally {
        // Add slight delay to ensure state updates are processed
        setTimeout(() => {
          setIsLoading(false);
        }, 100);
      }
    };

    initializeData();
  }, [
    fetchPronunciations,
    getWordOfTheDay,
    fetchCoinsBalance,
    checkDailyReward,
    pronunciationData,
    wordOfTheDay,
  ]);

  return {
    // Word of day state
    wordOfTheDay,
    wordOfDayModalVisible,
    isWordOfDayPlaying,
    isAudioLoading,
    setWordOfDayModalVisible,
    playWordOfDayAudio,

    // Rewards state
    isDailyRewardsModalVisible,
    showDailyRewardsModal,
    hideDailyRewardsModal,
    openRewardsModal,

    // Progress state
    progressModal,
    closeProgressModal,

    // Game-related handlers
    handleGamePress,
    handleProgressPress,

    // Progress data
    totalCompletedCount,
    totalQuizCount,
    getGameModeProgress,

    // Retry function
    retryDataLoading,

    // Add error state
    pronunciationError,

    // Loading state
    isLoading,
  };
}
