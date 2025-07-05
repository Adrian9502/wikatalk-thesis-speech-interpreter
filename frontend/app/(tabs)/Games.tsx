import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";
import { BASE_COLORS } from "@/constant/colors";
import WordOfDayModal from "@/components/games/WordOfDayModal";
import DailyRewardsModal from "@/components/games/rewards/DailyRewardsModal";
import GameProgressModal from "@/components/games/GameProgressModal/GameProgressModal";
// Component imports
import BackgroundEffects from "@/components/games/dashboard/BackgroundEffects";
import DashboardHeader from "@/components/games/dashboard/DashboardHeader";
import WordOfDayCard from "@/components/games/dashboard/WordOfDayCard";
import GamesList from "@/components/games/dashboard/GamesList";
import ProgressStats from "@/components/games/dashboard/ProgressStats";
import ErrorDisplay from "@/components/games/common/ErrorDisplay";

// Custom hooks
import useGameDashboard from "@/hooks/games/useGameDashboard";
import { useComponentLoadTime } from "@/utils/performanceMonitor";
import AppLoading from "@/components/AppLoading";
import useProgressStore from "@/store/games/useProgressStore";
import useGameStore from "@/store/games/useGameStore";
import { isAllDataReady } from "@/store/useSplashStore";

const Games = () => {
  // Performance monitoring for development
  const finishLoadTracking = useComponentLoadTime("Games");

  // Theme store
  const { activeTheme } = useThemeStore();
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);

  // Track loading and error states
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasError, setHasError] = useState(false);
  // Add a data readiness tracker
  const [dataReady, setDataReady] = useState(false);

  // Get progress from centralized store
  const {
    fetchProgress,
    isLoading: progressLoading,
    progressModal,
    closeProgressModal,
    openProgressModal,
  } = useProgressStore();

  // Custom hook for dashboard logic (excluding progress)
  const {
    // Word of day state
    wordOfTheDay,
    wordOfDayModalVisible,
    isWordOfDayPlaying,
    isAudioLoading,
    setWordOfDayModalVisible,
    playWordOfDayAudio,

    // Rewards state
    isDailyRewardsModalVisible,
    hideDailyRewardsModal,
    openRewardsModal,

    // Game-related handlers
    handleGamePress,

    // Add error retry handler
    retryDataLoading,

    // Add loading state from hook
    isLoading: dashboardLoading,
  } = useGameDashboard();

  // Combined loading state
  const isLoading = progressLoading || dashboardLoading;

  // Initialize progress data - check if all data is ready
  useEffect(() => {
    if (!isAllDataReady()) {
      console.log("[Games] Data not fully precomputed, fetching now");
      fetchProgress();
    } else {
      console.log("[Games] Using fully precomputed game and progress data");
      setDataReady(true);
    }
  }, [fetchProgress]);

  // Track when data becomes available
  useEffect(() => {
    if (isAllDataReady()) {
      setDataReady(true);
      return;
    }

    const { questions } = useGameStore.getState();
    const hasQuestions = Object.values(questions).some((mode) =>
      Object.values(mode).some((diff) => Array.isArray(diff) && diff.length > 0)
    );

    if (wordOfTheDay && hasQuestions) {
      setDataReady(true);
    }
  }, [wordOfTheDay]);

  // IMPROVED: Coordinated loading state management
  useEffect(() => {
    // If data is preloaded, make initialization quicker
    if (isAllDataReady()) {
      const timer = setTimeout(() => {
        setIsInitializing(false);
        if (finishLoadTracking) finishLoadTracking();
      }, 100); // Much shorter delay if data is preloaded

      return () => clearTimeout(timer);
    }

    // Original behavior for non-preloaded data
    const timer = setTimeout(() => {
      if (!isLoading && dataReady) {
        setIsInitializing(false);
        if (finishLoadTracking) finishLoadTracking();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isLoading, dataReady, finishLoadTracking]);

  // IMPROVED: Error detection logic with delay
  useEffect(() => {
    // Only check for errors after we've stopped loading but data isn't ready after a reasonable time
    if (!isInitializing && !isLoading && !dataReady) {
      // Add a small delay before showing error to avoid flicker
      const errorTimer = setTimeout(() => {
        if (!dataReady && !isLoading) {
          setHasError(true);
        }
      }, 300); // Small delay to ensure data isn't about to arrive

      return () => clearTimeout(errorTimer);
    } else if (dataReady) {
      // If data becomes ready, make sure to clear error state
      setHasError(false);
    }
  }, [isInitializing, isLoading, dataReady]);

  // Refresh progress data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log("[Games] Screen focused, refreshing progress data");
      fetchProgress(true); // Force refresh on focus

      return () => {}; // Cleanup function
    }, [fetchProgress])
  );

  // Handle retry
  const handleRetry = () => {
    setIsInitializing(true);
    setHasError(false);

    // Call retry handler from hook and fetch progress
    Promise.all([retryDataLoading(), fetchProgress(true)]).finally(() => {
      setIsInitializing(false);
    });
  };

  // Ultra-optimized progress handler - instant response
  const handleProgressPress = useCallback(
    (gameId: string, gameTitle: string) => {
      // Open modal IMMEDIATELY without any delay or requestAnimationFrame
      openProgressModal(gameId, gameTitle);
    },
    [openProgressModal]
  );

  // Render loading state
  if (isInitializing) {
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
        <BackgroundEffects />
        <SafeAreaView style={[dynamicStyles.container, styles.container]}>
          <ErrorDisplay
            message="Unable to load game data. Please check your connection and try again."
            onRetry={handleRetry}
          />
        </SafeAreaView>
      </View>
    );
  }

  // Render main content
  return (
    <View
      style={[styles.wrapper, { backgroundColor: activeTheme.backgroundColor }]}
    >
      {/* Background elements */}
      <BackgroundEffects />

      <SafeAreaView style={[dynamicStyles.container, styles.container]}>
        {/* Dashboard header with welcome message and coins */}
        <DashboardHeader
          onCoinsPress={openRewardsModal}
          // Remove onRefresh prop since DashboardHeader doesn't use it
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Word of the Day card */}
          <WordOfDayCard
            wordOfTheDay={wordOfTheDay}
            isPlaying={isWordOfDayPlaying}
            isLoading={isAudioLoading && isWordOfDayPlaying}
            onCardPress={() => setWordOfDayModalVisible(true)}
            onPlayPress={playWordOfDayAudio}
          />

          {/* Game modes list */}
          <GamesList
            onGamePress={handleGamePress}
            onProgressPress={handleProgressPress}
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
            onPlayPress={playWordOfDayAudio}
            isPlaying={isWordOfDayPlaying}
            isLoading={isAudioLoading && isWordOfDayPlaying}
          />
        )}

        <DailyRewardsModal
          visible={isDailyRewardsModalVisible}
          onClose={hideDailyRewardsModal}
        />

        <GameProgressModal
          visible={progressModal.visible}
          onClose={closeProgressModal}
          gameMode={progressModal.gameMode}
          gameTitle={progressModal.gameTitle}
        />
      </SafeAreaView>
    </View>
  );
};

// Keep styles as they were
const { height } = Dimensions.get("window");
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
