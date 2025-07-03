import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";
import { BASE_COLORS } from "@/constant/colors";
import WordOfDayModal from "@/components/games/WordOfDayModal";
import DailyRewardsModal from "@/components/games/rewards/DailyRewardsModal";
import GameProgressModal from "@/components/games/GameProgressModal/index";
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

  // Custom hook for all dashboard logic
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

    // Add error retry handler
    retryDataLoading,

    // Add loading state from hook
    isLoading,
  } = useGameDashboard();

  // Track when data becomes available
  useEffect(() => {
    if (wordOfTheDay) {
      setDataReady(true);
    }
  }, [wordOfTheDay]);

  // IMPROVED: Coordinated loading state management
  useEffect(() => {
    // Only mark initialization complete when:
    // 1. We've waited at least 500ms (for visual consistency)
    // 2. The data loading process has completed
    // 3. AND our data is actually ready
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

  // Handle retry
  const handleRetry = () => {
    setIsInitializing(true);
    setHasError(false);

    // Call retry handler from hook
    retryDataLoading().finally(() => {
      setIsInitializing(false);
    });
  };

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

  // Render main content (unchanged)
  return (
    <View
      style={[styles.wrapper, { backgroundColor: activeTheme.backgroundColor }]}
    >
      {/* Background elements */}
      <BackgroundEffects />

      <SafeAreaView style={[dynamicStyles.container, styles.container]}>
        {/* Dashboard header with welcome message and coins */}
        <DashboardHeader onCoinsPress={openRewardsModal} />

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
            getGameModeProgress={getGameModeProgress}
            onGamePress={handleGamePress}
            onProgressPress={handleProgressPress}
          />

          {/* Progress Summary section */}
          <ProgressStats
            totalCompletedCount={totalCompletedCount}
            totalQuizCount={totalQuizCount}
          />
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

// Keeping all styles exactly as they were
const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: "relative",
  },

  // Enhanced Background Layers
  backgroundLayer1: {
    position: "absolute",
    top: -150,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: `${BASE_COLORS.blue}15`,
  },
  backgroundLayer2: {
    position: "absolute",
    top: height * 0.2,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: `${BASE_COLORS.success}10`,
  },
  backgroundLayer3: {
    position: "absolute",
    bottom: -100,
    right: -60,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: `${BASE_COLORS.orange}12`,
  },
  backgroundLayer4: {
    position: "absolute",
    top: height * 0.6,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${BASE_COLORS.blue}08`,
  },

  // Floating Particles
  floatingParticle1: {
    position: "absolute",
    top: height * 0.15,
    right: 50,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFD700",
  },
  floatingParticle2: {
    position: "absolute",
    top: height * 0.4,
    left: 30,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4CAF50",
  },
  floatingParticle3: {
    position: "absolute",
    bottom: height * 0.3,
    right: 80,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF6B6B",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Enhanced Header Section
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 10,
    marginBottom: 30,
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    opacity: 0.8,
    marginBottom: 2,
  },
  mainTitle: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: BASE_COLORS.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    opacity: 0.7,
    lineHeight: 20,
  },

  scrollContent: {
    paddingBottom: 40,
  },

  // Section Headers
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  sectionMainTitle: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: BASE_COLORS.white,
    marginLeft: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    opacity: 0.7,
    lineHeight: 20,
  },

  // Featured Section (Word of Day)
  featuredSection: {
    marginBottom: 40,
  },
  wordOfTheDayCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  wordCardGradient: {
    padding: 20,
    minHeight: 160,
    position: "relative",
  },

  // Enhanced Word Card Decorations
  wordDecoPattern1: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  wordDecoPattern2: {
    position: "absolute",
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  wordDecoPattern3: {
    position: "absolute",
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  wordCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  wordBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  wordBadgeText: {
    fontSize: 11,
    fontFamily: "Poppins-Bold",
    color: "#667eea",
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  wordContent: {
    flex: 1,
    justifyContent: "center",
  },
  wordMainText: {
    fontSize: 26,
    fontFamily: "Poppins-Bold",
    color: "#fff",
    marginBottom: 8,
  },
  wordTranslation: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 22,
  },

  wordCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  exploreText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.8)",
  },
  arrowContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  arrow: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Poppins-Bold",
  },

  // Games Section
  gamesSection: {
    marginBottom: 40,
  },
  gamesGrid: {
    gap: 16,
  },
  gameCardWrapper: {
    marginBottom: 4,
  },
  gameCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  gameCardGradient: {
    padding: 20,
    position: "relative",
    minHeight: 160, // Reduced height since content is more compact
  },

  // New Game Header Layout
  gameHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  gameIconContainer: {
    marginRight: 12,
  },
  gameIconBg: {
    width: 50, // Slightly smaller icon
    height: 50,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#fff",
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 16,
  },

  // Updated Game Actions
  gameActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  progressBtnText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
  },
  playBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  playBtnText: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: "#fff",
  },

  // Updated Difficulty Badge Position
  difficultyBadge: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  difficultyText: {
    fontSize: 10,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Quick Stats Section
  quickStatsSection: {
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  quickStatCard: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  statCardGradient: {
    padding: 20,
    alignItems: "center",
    minHeight: 120,
    justifyContent: "center",
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: "#fff",
    marginBottom: 4,
  },
  statText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },

  // Progress Summary Text
  progressSummaryContainer: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  progressSummaryText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },

  // Enhanced Stats Row (for game cards)
  gameStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#FFF",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 16,
  },

  // Game Decorative Shapes
  gameDecoShape1: {
    position: "absolute",
    top: -15,
    right: -15,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  gameDecoShape2: {
    position: "absolute",
    bottom: -10,
    left: -10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
});

export default Games;
