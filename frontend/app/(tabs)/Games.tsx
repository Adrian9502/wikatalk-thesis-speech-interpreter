import React, { useEffect, useState, useCallback, useRef } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";
import WordOfDayModal from "@/components/games/WordOfDayModal";
import DailyRewardsModal from "@/components/games/rewards/DailyRewardsModal";

// Component imports
import WordOfTheDayCard from "@/components/games/dashboard/WordOfTheDayCard";
import GamesList from "@/components/games/dashboard/GamesList";
import ProgressStats from "@/components/games/dashboard/ProgressStats";
import ErrorDisplay from "@/components/games/common/ErrorDisplay";
import { useProgressModal } from "@/components/games/ProgressModalProvider";
import { useRankingsModal } from "@/components/games/RankingsModalProvider";
import { globalSpeechManager } from "@/utils/globalSpeechManager";
import { usePronunciationStore } from "@/store/usePronunciationStore";

// Custom hooks
import useGameDashboard from "@/hooks/games/useGameDashboard";
import { useComponentLoadTime } from "@/utils/performanceMonitor";
import AppLoading from "@/components/AppLoading";
import useProgressStore from "@/store/games/useProgressStore";
import useGameStore from "@/store/games/useGameStore";
import { isAllDataReady } from "@/store/useSplashStore";

// GLOBAL state to persist across component remounts
let GAMES_INITIALIZED = false;
let INITIALIZATION_PROMISE: Promise<void> | null = null;

const Games = () => {
  // stop speech
  useFocusEffect(
    React.useCallback(() => {
      console.log("[Games] Tab focused, stopping all speech");
      globalSpeechManager.stopAllSpeech();

      return () => {
        console.log("[Games] Tab losing focus");
        globalSpeechManager.stopAllSpeech();
      };
    }, [])
  );
  // Performance monitoring for development
  const finishLoadTracking = useComponentLoadTime("Games");

  // Get the progress modal functions
  const { showProgressModal } = useProgressModal();

  // Theme store
  const { activeTheme } = useThemeStore();
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);

  // FIXED: Use global state + local state
  const [hasInitialized, setHasInitialized] = useState(GAMES_INITIALIZED);
  const [hasError, setHasError] = useState(false);

  // FIXED: Persistent refs that don't reset
  const lastClickRef = useRef<number>(0);
  const focusRefreshInProgress = useRef(false);

  // Get the rankings modal functions
  const { showRankingsModal } = useRankingsModal();

  // Get progress from centralized store
  const { fetchProgress } = useProgressStore();

  // Get the correct Word of Day functions from pronunciation store
  const {
    wordOfTheDay,
    isWordOfDayPlaying,
    getWordOfTheDay,
    playWordOfDay, // This is the correct function name
  } = usePronunciationStore();

  // Custom hook for dashboard logic (excluding Word of Day which we handle here)
  const {
    // Remove wordOfTheDay from here since we're getting it from pronunciation store
    wordOfDayModalVisible,
    // Remove isWordOfDayPlaying from here
    isAudioLoading,
    setWordOfDayModalVisible,
    // Remove playWordOfDayAudio since we'll use playWordOfDay
    isDailyRewardsModalVisible,
    hideDailyRewardsModal,
    openRewardsModal,
    handleGamePress,
  } = useGameDashboard();

  // Initialize Word of the Day when component mounts
  useEffect(() => {
    if (hasInitialized && !wordOfTheDay) {
      console.log("[Games] Loading Word of the Day");
      getWordOfTheDay();
    }
  }, [hasInitialized, wordOfTheDay, getWordOfTheDay]);

  // Update the rankings handlers
  const handleShowRankings = useCallback(() => {
    console.log("[Games] Opening rankings modal");
    showRankingsModal();
  }, [showRankingsModal]);

  // FIXED: Global initialization that persists across remounts
  useEffect(() => {
    // If already globally initialized, just sync local state
    if (GAMES_INITIALIZED) {
      console.log("[Games] Already globally initialized, syncing local state");
      setHasInitialized(true);
      if (finishLoadTracking) finishLoadTracking();
      return;
    }

    // If initialization is in progress, wait for it
    if (INITIALIZATION_PROMISE) {
      console.log("[Games] Initialization in progress, waiting...");
      INITIALIZATION_PROMISE.then(() => {
        setHasInitialized(true);
        if (finishLoadTracking) finishLoadTracking();
      });
      return;
    }

    // Start initialization
    const initializeOnce = async () => {
      console.log("[Games] Starting one-time global initialization...");

      try {
        if (isAllDataReady()) {
          console.log("[Games] Using fully precomputed game and progress data");
        } else {
          console.log("[Games] Loading required data");

          // Ensure questions are loaded
          const gameStore = useGameStore.getState();
          if (
            !gameStore.questions ||
            Object.keys(gameStore.questions).length === 0
          ) {
            await gameStore.fetchQuestions();
          }

          // Refresh quiz counts
          const progressStore = useProgressStore.getState();
          if (progressStore.refreshQuizCounts) {
            progressStore.refreshQuizCounts();
          }

          // Single progress fetch if needed
          if (!progressStore.progress || progressStore.progress.length === 0) {
            await fetchProgress(true);
          }
        }

        // Mark as globally initialized
        GAMES_INITIALIZED = true;
        setHasInitialized(true);
        if (finishLoadTracking) finishLoadTracking();
      } catch (error) {
        console.error("[Games] Initialization error:", error);
        setHasError(true);
      } finally {
        INITIALIZATION_PROMISE = null;
      }
    };

    INITIALIZATION_PROMISE = initializeOnce();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (!hasInitialized || focusRefreshInProgress.current) {
        console.log(
          "[Games] Skipping focus refresh - not ready or in progress"
        );
        return;
      }

      // Check if we need to refresh progress data
      const progressStore = useProgressStore.getState();
      const lastFetched = progressStore.lastFetched || 0;
      const now = Date.now();
      const timeSinceLastFetch = now - lastFetched;

      // Only refresh if more than 2 minutes since last fetch
      const shouldRefresh = timeSinceLastFetch > 2 * 60 * 1000;

      if (shouldRefresh) {
        console.log(
          `[Games] Screen focused, refreshing progress data (${timeSinceLastFetch}ms since last fetch)`
        );
        focusRefreshInProgress.current = true;

        fetchProgress(true).finally(() => {
          setTimeout(() => {
            focusRefreshInProgress.current = false;
          }, 1000);
        });
      } else {
        console.log(
          `[Games] Screen focused, data is fresh (${timeSinceLastFetch}ms old)`
        );
      }

      return () => {}; // Cleanup function
    }, [fetchProgress, hasInitialized])
  );

  // Handle retry
  const handleRetry = () => {
    setHasError(false);
    // Reset global state on manual retry
    GAMES_INITIALIZED = false;
    INITIALIZATION_PROMISE = null;
    setHasInitialized(false);
  };

  const handleProgressPress = useCallback(
    (gameId: string, gameTitle: string) => {
      const now = Date.now();

      if (now - lastClickRef.current < 500) {
        console.log(`[Games] Ignoring duplicate progress button press`);
        return;
      }
      lastClickRef.current = now;

      showProgressModal(gameId, gameTitle);
    },
    [showProgressModal]
  );

  if (!hasInitialized && !hasError) {
    return <AppLoading />;
  }

  // Render error state
  if (hasError) {
    return (
      <View
        style={[
          styles.wrapper,
          { backgroundColor: activeTheme.backgroundColor },
        ]}
      >
        <SafeAreaView style={[dynamicStyles.container, styles.container]}>
          <ErrorDisplay
            message="Unable to load game data. Please check your connection and try again."
            onRetry={handleRetry}
          />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View
      style={[styles.wrapper, { backgroundColor: activeTheme.backgroundColor }]}
    >
      <SafeAreaView style={[dynamicStyles.container, styles.container]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Word of the Day card with coin display component */}
          <WordOfTheDayCard
            wordOfTheDay={wordOfTheDay}
            isPlaying={isWordOfDayPlaying}
            isLoading={isAudioLoading && isWordOfDayPlaying}
            onCardPress={() => setWordOfDayModalVisible(true)}
            onPlayPress={playWordOfDay}
            onCoinsPress={openRewardsModal}
          />

          {/* Game modes list */}
          <GamesList
            key="games-list-persistent"
            onGamePress={handleGamePress}
            onProgressPress={handleProgressPress}
            onRankingsPress={handleShowRankings}
          />

          {/* Progress Summary section */}
          <ProgressStats />
        </ScrollView>

        {/* Modals */}
        {wordOfTheDay && (
          <WordOfDayModal
            visible={wordOfDayModalVisible}
            onClose={() => setWordOfDayModalVisible(false)}
            word={wordOfTheDay}
            onPlayPress={playWordOfDay}
            isPlaying={isWordOfDayPlaying}
            isLoading={isAudioLoading && isWordOfDayPlaying}
          />
        )}

        <DailyRewardsModal
          visible={isDailyRewardsModalVisible}
          onClose={hideDailyRewardsModal}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: "relative",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
});

export default Games;
