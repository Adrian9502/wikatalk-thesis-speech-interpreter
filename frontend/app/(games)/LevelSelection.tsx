import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, StatusBar, BackHandler } from "react-native"; // Add BackHandler
import { useLocalSearchParams, router } from "expo-router";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";
import useThemeStore from "@/store/useThemeStore";
import LevelInfoModal from "@/components/games/levels/LevelInfoModal";
import LevelReviewModal from "@/components/games/levels/LevelReviewModal";
import { LevelData } from "@/types/gameTypes";
import LevelHeader from "@/components/games/levels/LevelHeader";
import LevelProgressBar from "@/components/games/levels/LevelProgressBar";
import { levelStyles as styles } from "@/styles/games/levels.styles";
import { useLevelData } from "@/hooks/useLevelData";
import { difficultyColors } from "@/constant/colors";
import { isAllDataReady, useSplashStore } from "@/store/useSplashStore";
import { useAnimationTracker } from "@/hooks/useAnimationTracker";
import { safeNavigate } from "@/utils/navigationUtils";

// Components
import ErrorState from "@/components/games/levels/ErrorState";
import EmptyState from "@/components/games/levels/EmptyState";
import LevelGrid from "@/components/games/levels/LevelGrid";
import FilterBar from "@/components/games/levels/FilterBar";
import AppLoading from "@/components/AppLoading";
import DotsLoader from "@/components/DotLoader";
import useProgressStore from "@/store/games/useProgressStore";

type FilterType = "all" | "completed" | "current" | "easy" | "medium" | "hard";

const LevelSelection = () => {
  // Component error state
  const [componentError, setComponentError] = useState<Error | null>(null);

  const params = useLocalSearchParams();
  const { activeTheme } = useThemeStore();

  // FIXED: Properly extract string values from params
  const gameMode = Array.isArray(params.gameMode)
    ? params.gameMode[0]
    : params.gameMode || "multipleChoice";
  const gameTitle = Array.isArray(params.gameTitle)
    ? params.gameTitle[0]
    : params.gameTitle || "Game";

  const { shouldPlayAnimation } = useAnimationTracker();

  // Use the enhanced hook that includes precomputed filters
  const {
    levels,
    showLevels,
    isLoading,
    error,
    completionPercentage,
    handleRetry,
    getFilteredLevels,
  } = useLevelData(gameMode);

  // Filter state
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  // Local state for modal handling
  const [selectedLevel, setSelectedLevel] = useState<LevelData | null>(null);
  const [showGameModal, setShowGameModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const [dataReady, setDataReady] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const [animationKey, setAnimationKey] = useState("initial");
  const [shouldAnimateCards, setShouldAnimateCards] = useState(false);

  // NEW: Enhanced data ready check with fallback
  useEffect(() => {
    const checkDataReady = async () => {
      // FIXED: Always check if we need to refresh data when component mounts
      // This handles the case where user completes a level and navigates back
      const progressStore = useProgressStore.getState();
      const splashStore = useSplashStore.getState();

      // Check if we have stale data by comparing timestamps
      const lastProgressUpdate = progressStore.lastUpdated || 0;
      const lastSplashUpdate =
        splashStore.precomputedLevels[gameMode]?.lastUpdated || 0;

      const isDataStale = lastProgressUpdate > lastSplashUpdate;

      if (isDataStale) {
        console.log(
          `[LevelSelection] Detected stale precomputed data, forcing refresh`
        );
        splashStore.reset();
      }

      if (isAllDataReady() && !isDataStale) {
        setDataReady(true);

        // Trigger initial animation when data is ready
        if (initialLoad) {
          console.log(
            "[LevelSelection] Initial data ready - triggering animation"
          );
          const gameKey =
            typeof gameMode === "string" ? gameMode : String(gameMode);
          const animationKey = `${gameKey}-initial`;

          if (shouldPlayAnimation(animationKey)) {
            setShouldAnimateCards(true);
            setAnimationKey(animationKey);
          }

          setInitialLoad(false);
        }
      } else {
        console.log("[LevelSelection] Waiting for pre-computed data...");

        // NEW: Check if we've been waiting too long (fallback mechanism)
        const startTime = Date.now();
        const maxWaitTime = 10000; // 10 seconds

        if (startTime > maxWaitTime) {
          console.warn(
            "[LevelSelection] Data pre-computation taking too long, triggering manual preload"
          );

          // Manually trigger data pre-computation
          const splashStore = useSplashStore.getState();
          try {
            await splashStore.preloadGameData();
          } catch (error) {
            console.error("[LevelSelection] Manual preload failed:", error);
          }
        }

        const timeout = setTimeout(checkDataReady, 100);
        return () => clearTimeout(timeout);
      }
    };

    checkDataReady();
  }, [shouldPlayAnimation, gameMode, initialLoad]);

  // PERFORMANCE FIX: Use pre-computed filters with loading state
  const filteredLevels = useMemo(() => {
    if (!showLevels || !getFilteredLevels) {
      return [];
    }

    console.log(`[LevelSelection] Switching to filter: ${activeFilter}`);
    const startTime = performance.now();

    const filtered = getFilteredLevels(activeFilter);

    const duration = performance.now() - startTime;
    console.log(
      `[LevelSelection] Filter applied in ${duration.toFixed(2)}ms - ${
        filtered.length
      } levels`
    );

    return filtered;
  }, [activeFilter, showLevels, getFilteredLevels]);

  // PERFORMANCE FIX: Stable memoized handlers
  const stableHandlers = useMemo(() => {
    const handleBack = () => {
      console.log("[LevelSelection] Back button pressed - navigating to Games");
      // FIXED: Use replace instead of back to avoid navigation stack issues
      router.replace("/(tabs)/Games");
    };

    // Update LevelSelection.tsx to use safe navigation
    const handleStartGame = () => {
      if (!selectedLevel) return;

      console.log(
        "[LevelSelection] Starting game with level:",
        selectedLevel.id
      );

      // Close modal first
      setShowGameModal(false);

      // FIXED: Use replace to avoid navigation stack buildup
      router.replace({
        pathname: "/(games)/Questions",
        params: {
          levelId: selectedLevel.id,
          gameMode,
          gameTitle,
          difficulty:
            typeof selectedLevel.difficultyCategory === "string"
              ? selectedLevel.difficultyCategory
              : "easy",
          skipModal: "true",
        },
      });
    };

    const handleLevelSelectWithCompletion = (level: LevelData) => {
      if (level.status === "locked") {
        console.log(`[LevelSelection] Level ${level.id} is locked`);

        // NEW: Show specific lock reason
        const difficulty = level.difficultyCategory?.toLowerCase();
        let lockMessage = "This level is locked.";

        if (difficulty === "medium") {
          lockMessage = "Complete all Easy levels to unlock Medium difficulty.";
        } else if (difficulty === "hard") {
          lockMessage = "Complete all Medium levels to unlock Hard difficulty.";
        }

        // You can show a toast or alert here instead of just haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

        // Optional: Show an alert with the lock reason
        // Alert.alert("Level Locked", lockMessage);

        return;
      }

      console.log(
        `[LevelSelection] Level ${level.id} selected, status: ${level.status}`
      );
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSelectedLevel(level);

      if (level.status === "completed") {
        console.log(
          `[LevelSelection] Opening review modal for completed level ${level.id}`
        );
        setShowReviewModal(true);
        setShowGameModal(false);
      } else {
        console.log(
          `[LevelSelection] Opening game modal for level ${level.id}`
        );

        // NEW: Show modal immediately, don't wait for data
        setShowGameModal(true);
        setShowReviewModal(false);
      }
    };

    const handleCloseGameModal = () => {
      console.log(`[LevelSelection] Closing game modal`);
      setShowGameModal(false);
      setSelectedLevel(null);
    };

    const handleCloseReviewModal = () => {
      console.log(`[LevelSelection] Closing review modal`);
      setShowReviewModal(false);
      setSelectedLevel(null);
    };

    const handleErrorReset = () => {
      setComponentError(null);
    };

    // ENHANCED: Filter handler with animation support
    const handleFilterChange = (filter: FilterType) => {
      if (filter === activeFilter) return; // Don't change if same filter

      console.log(
        `[LevelSelection] Switching filter from ${activeFilter} to ${filter}`
      );

      // Show loading state
      setIsFilterLoading(true);

      // Use requestAnimationFrame to ensure UI updates
      requestAnimationFrame(() => {
        setActiveFilter(filter);

        // NEW: Check if animation should play for this filter
        const gameKey =
          typeof gameMode === "string" ? gameMode : String(gameMode);
        const filterAnimationKey = `${gameKey}-${filter}`;

        if (shouldPlayAnimation(filterAnimationKey)) {
          console.log(
            `[LevelSelection] Playing animation for filter: ${filter}`
          );
          setShouldAnimateCards(true);
          setAnimationKey(filterAnimationKey);
        } else {
          console.log(
            `[LevelSelection] Skipping animation for filter: ${filter} (already played)`
          );
          setShouldAnimateCards(false);
        }

        // Hide loading state after animation setup
        setTimeout(() => {
          setIsFilterLoading(false);
        }, 150);
      });
    };

    return {
      handleBack,
      handleStartGame,
      handleLevelSelectWithCompletion,
      handleCloseGameModal,
      handleCloseReviewModal,
      handleErrorReset,
      handleFilterChange,
    };
  }, [selectedLevel, gameMode, gameTitle, activeFilter, shouldPlayAnimation]);

  // PERFORMANCE FIX: Stable memoized difficulty colors
  const stableDifficultyColors = useMemo(() => difficultyColors, []);

  // PERFORMANCE FIX: Memoize render content with stable dependencies
  const renderContent = useMemo(() => {
    // Wait for data to be ready
    if (!dataReady) {
      return <AppLoading />;
    }

    // First check for component error
    if (componentError) {
      return (
        <ErrorState
          error={componentError}
          onRetry={stableHandlers.handleErrorReset}
        />
      );
    }

    // Then check for API error
    if (error) {
      return <ErrorState error={new Error(error)} onRetry={handleRetry} />;
    }

    // Check for loading states
    if (isLoading || (levels.length > 0 && !showLevels)) {
      return <AppLoading />;
    }

    // Render content when loaded
    if (showLevels && levels.length > 0) {
      return (
        <>
          <FilterBar
            activeFilter={activeFilter}
            setActiveFilter={stableHandlers.handleFilterChange}
            isFilterLoading={isFilterLoading}
          />

          {/* Show loading overlay during filter transition */}
          {isFilterLoading ? (
            <View style={styles.filterLoadingOverlay}>
              <DotsLoader />
            </View>
          ) : (
            <>
              {filteredLevels.length === 0 ? (
                <EmptyState activeFilter={activeFilter} />
              ) : (
                <LevelGrid
                  levels={filteredLevels}
                  onSelectLevel={stableHandlers.handleLevelSelectWithCompletion}
                  difficultyColors={stableDifficultyColors}
                  shouldAnimateCards={shouldAnimateCards}
                  animationKey={animationKey}
                />
              )}
            </>
          )}
        </>
      );
    }

    // Fallback loading state
    return <AppLoading />;
  }, [
    dataReady,
    componentError,
    error,
    isLoading,
    levels.length,
    showLevels,
    filteredLevels,
    activeFilter,
    isFilterLoading,
    shouldAnimateCards,
    animationKey,
    stableHandlers.handleLevelSelectWithCompletion,
    stableHandlers.handleErrorReset,
    stableHandlers.handleFilterChange,
    stableDifficultyColors,
    handleRetry,
  ]);

  // FIXED: Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        console.log("[LevelSelection] Hardware back button pressed");

        // If any modal is open, close it first
        if (showGameModal || showReviewModal) {
          setShowGameModal(false);
          setShowReviewModal(false);
          setSelectedLevel(null);
          return true; // Prevent default back action
        }

        // Otherwise, navigate to Games tab
        router.replace("/(tabs)/Games");
        return true; // Prevent default back action
      }
    );

    return () => backHandler.remove();
  }, [showGameModal, showReviewModal]);

  // Main render with try/catch for error handling
  try {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: activeTheme.backgroundColor },
        ]}
      >
        <StatusBar barStyle="light-content" />

        {/* Decorative elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        <View style={styles.decorativeCircle3} />

        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <LevelHeader title={gameTitle} onBack={stableHandlers.handleBack} />

          {/* Progress bar */}
          <LevelProgressBar percentage={completionPercentage} />

          {/* Content Area */}
          <View style={styles.contentArea}>{renderContent}</View>

          {/* FIXED: Only render modal when it should be visible */}
          {showGameModal &&
            selectedLevel &&
            selectedLevel.status !== "completed" && (
              <LevelInfoModal
                visible={showGameModal}
                onClose={stableHandlers.handleCloseGameModal}
                onStart={stableHandlers.handleStartGame}
                levelData={{
                  ...selectedLevel.questionData,
                  ...selectedLevel, // Include all level data
                  levelString: selectedLevel.levelString,
                }}
                gameMode={gameMode}
                isLoading={isLoading}
                difficulty={selectedLevel?.difficultyCategory || "easy"}
              />
            )}

          {showReviewModal &&
            selectedLevel &&
            selectedLevel.status === "completed" && (
              <LevelReviewModal
                visible={showReviewModal}
                onClose={stableHandlers.handleCloseReviewModal}
                level={selectedLevel}
                gradientColors={
                  selectedLevel
                    ? stableDifficultyColors[
                        selectedLevel.difficulty as keyof typeof stableDifficultyColors
                      ] || stableDifficultyColors.Easy
                    : stableDifficultyColors.Easy
                }
              />
            )}
        </SafeAreaView>
      </View>
    );
  } catch (err) {
    // Set the error and render a simplified error view
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("[LevelSelection] Caught error:", error);

    if (!componentError) {
      setComponentError(error);
    }

    return (
      <View
        style={[
          styles.container,
          { backgroundColor: activeTheme.backgroundColor },
        ]}
      >
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.safeArea}>
          <LevelHeader title={gameTitle} onBack={stableHandlers.handleBack} />
          <View style={styles.contentArea}>
            <ErrorState
              error={error}
              onRetry={stableHandlers.handleErrorReset}
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }
};

export default LevelSelection;
