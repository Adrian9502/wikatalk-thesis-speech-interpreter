import React, { useEffect, useState, useCallback, useRef } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
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
import { isAllDataReady, useSplashStore } from "@/store/useSplashStore";

let GAMES_INITIALIZED = false;
let INITIALIZATION_PROMISE: Promise<void> | null = null;
let INITIALIZATION_COMPLETED = false;

const Games = () => {
  // Theme and utility hooks first
  const { activeTheme } = useThemeStore();
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);
  const insets = useSafeAreaInsets();
  const finishLoadTracking = useComponentLoadTime("Games");

  // Modal hooks
  const { showProgressModal } = useProgressModal();
  const { showRankingsModal } = useRankingsModal();

  // Store hooks
  const { fetchProgress } = useProgressStore();
  const { wordOfTheDay, isWordOfDayPlaying, getWordOfTheDay, playWordOfDay } =
    usePronunciationStore();

  // Custom hook for dashboard logic
  const {
    wordOfDayModalVisible,
    isAudioLoading,
    setWordOfDayModalVisible,
    isDailyRewardsModalVisible,
    hideDailyRewardsModal,
    openRewardsModal,
    handleGamePress,
  } = useGameDashboard();

  // State hooks - always in same order
  const [hasInitialized, setHasInitialized] = useState(GAMES_INITIALIZED);
  const [hasError, setHasError] = useState(false);

  // Ref hooks - always in same order
  const lastClickRef = useRef<number>(0);
  const focusRefreshInProgress = useRef(false);

  // Focus effect for speech management
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

  // Enhanced global initialization with better state management
  useEffect(() => {
    // If already globally initialized and completed, just sync local state
    if (GAMES_INITIALIZED && INITIALIZATION_COMPLETED) {
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
      }).catch((error) => {
        console.error("[Games] Initialization promise failed:", error);
        setHasError(true);
      });
      return;
    }

    // Start initialization only once
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

        // Mark as globally initialized and completed
        GAMES_INITIALIZED = true;
        INITIALIZATION_COMPLETED = true;
        setHasInitialized(true);
        if (finishLoadTracking) finishLoadTracking();

        console.log("[Games] ✅ Global initialization completed successfully");
      } catch (error) {
        console.error("[Games] Initialization error:", error);
        setHasError(true);
        // Reset flags on error to allow retry
        GAMES_INITIALIZED = false;
        INITIALIZATION_COMPLETED = false;
      } finally {
        // FIXED: Only clear promise after a delay to ensure all components have mounted
        setTimeout(() => {
          INITIALIZATION_PROMISE = null;
        }, 1000); // Give components time to mount and sync
      }
    };

    INITIALIZATION_PROMISE = initializeOnce();
  }, [fetchProgress, finishLoadTracking]);

  // FIXED: Optimized focus effect to reduce background refresh frequency
  useFocusEffect(
    React.useCallback(() => {
      console.log("[Games] Tab focused, stopping all speech");
      globalSpeechManager.stopAllSpeech();

      // ENHANCED: Less aggressive refresh logic
      if (hasInitialized && !focusRefreshInProgress.current) {
        const progressStore = useProgressStore.getState();
        const lastFetched = progressStore.lastFetched || 0;
        const now = Date.now();
        const timeSinceLastFetch = now - lastFetched;

        // FIXED: Increase refresh interval to reduce unnecessary updates
        const shouldRefresh = timeSinceLastFetch > 5 * 60 * 1000; // Increased to 5 minutes

        if (shouldRefresh) {
          console.log(
            `[Games] Screen focused, refreshing progress data (${Math.round(
              timeSinceLastFetch / 1000
            )}s since last fetch)`
          );
          focusRefreshInProgress.current = true;

          // FIXED: Debounce the refresh to prevent rapid successive calls
          setTimeout(() => {
            fetchProgress(true).finally(() => {
              setTimeout(() => {
                focusRefreshInProgress.current = false;

                // FIXED: Only refresh precomputed data if initialization is complete
                if (INITIALIZATION_COMPLETED) {
                  const splashStore = useSplashStore.getState();
                  Promise.allSettled([
                    splashStore.precomputeSpecificGameMode("multipleChoice"),
                    splashStore.precomputeSpecificGameMode("identification"),
                    splashStore.precomputeSpecificGameMode("fillBlanks"),
                  ]).then(() => {
                    console.log("[Games] GameCard data refreshed");
                  });
                }
              }, 1500); // Increased delay to allow state to settle
            });
          }, 300); // Add small delay before starting refresh
        }
      }

      return () => {
        console.log("[Games] Tab losing focus");
        globalSpeechManager.stopAllSpeech();
      };
    }, [fetchProgress, hasInitialized])
  );

  // Handle retry - FIXED: Reset all flags
  const handleRetry = useCallback(() => {
    setHasError(false);
    // Reset all global state on manual retry
    GAMES_INITIALIZED = false;
    INITIALIZATION_COMPLETED = false;
    INITIALIZATION_PROMISE = null;
    setHasInitialized(false);
  }, []);

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

  // FIXED: Early returns after all hooks are called
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
        <SafeAreaView
          edges={["left", "right"]}
          style={[dynamicStyles.container, { paddingTop: insets.top }]}
        >
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
      <SafeAreaView
        edges={["left", "right"]}
        style={[dynamicStyles.container, { paddingTop: insets.top }]}
      >
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
  scrollContent: {
    paddingBottom: 15,
  },
});

export default Games;
