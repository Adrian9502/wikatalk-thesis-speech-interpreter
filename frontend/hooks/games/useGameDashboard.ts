import { useState, useEffect, useCallback } from "react";
import { router } from "expo-router";
import { usePronunciationStore } from "@/store/usePronunciationStore";
import useCoinsStore from "@/store/games/useCoinsStore";
import useGameStore from "@/store/games/useGameStore";
import { areAnyQuestionsLoaded } from "@/utils/quizCountUtils";
import { isGameDataPreloaded } from "@/store/useSplashStore";

/**
 * Custom hook to manage the Games dashboard state and logic
 * Note: All progress logic has been moved to useProgressStore
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

  // Initial data loading - check if data already preloaded
  useEffect(() => {
    const loadData = async () => {
      // Skip loading if data was preloaded during startup
      if (isGameDataPreloaded()) {
        console.log("[useGameDashboard] Using preloaded data");
        setIsLoading(false);
        return;
      }

      // Otherwise load normally
      if (pronunciationData.length === 0) {
        await fetchPronunciations();
      }

      if (!wordOfTheDay) {
        getWordOfTheDay();
      }

      await fetchCoinsBalance();
      await checkDailyReward();
    };

    loadData();
  }, []);

  // Ensure questions are loaded - check if already preloaded
  useEffect(() => {
    const loadInitialData = async () => {
      // Skip if data was preloaded during app startup
      if (isGameDataPreloaded()) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const hasQuestions = areAnyQuestionsLoaded();
        if (!hasQuestions) {
          console.log("[Games] No questions found, loading...");
          const { ensureQuestionsLoaded } = useGameStore.getState();
          await ensureQuestionsLoaded();
        }
      } catch (error) {
        console.error("[Games] Error loading questions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []); // Empty dependency array

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

  // Update the openRewardsModal function to be more immediate
  const openRewardsModal = useCallback(() => {
    // STEP 1: Show modal FIRST - highest priority
    requestAnimationFrame(() => {
      useCoinsStore.getState().showDailyRewardsModal();
    });

    // STEP 2: Background data loading - lower priority
    setTimeout(() => {
      const startTime = Date.now();

      // Only use this loading state for UI elements outside the modal
      setIsLoading(true);

      // Load data in background AFTER showing modal
      Promise.all([
        useCoinsStore.getState().fetchRewardsHistory(),
        useCoinsStore.getState().checkDailyReward(),
      ])
        .then(() => {
          console.log(
            `[RewardsModal] Data loaded in background in ${Date.now() - startTime}ms`
          );
        })
        .catch((error) => {
          console.error("[RewardsModal] Background load error:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 100);
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

    // Game-related handlers
    handleGamePress,

    // Retry function
    retryDataLoading,

    // Add error state
    pronunciationError,

    // Loading state
    isLoading,
  };
}
