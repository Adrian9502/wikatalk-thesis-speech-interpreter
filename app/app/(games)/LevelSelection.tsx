import React, { useEffect, useMemo, useState } from "react";
import { View, StatusBar, BackHandler } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";
import useThemeStore from "@/store/useThemeStore";
import LevelInfoModal from "@/components/games/levels/LevelInfoModal";
import LevelReviewModal from "@/components/games/levels/LevelReviewModal";
// Utils & types
import { LevelData } from "@/types/gameTypes";
import LevelHeader from "@/components/games/levels/LevelHeader";
import LevelProgressBar from "@/components/games/levels/LevelProgressBar";
import { levelStyles as styles } from "@/styles/games/levels.styles";
import { useLevelData } from "@/hooks/useLevelData";
import { DIFFICULTY_COLORS } from "@/constants/colors";
import { useSplashStore } from "@/store/useSplashStore";
import { useAnimationTracker } from "@/hooks/useAnimationTracker";

// Components
import ErrorState from "@/components/games/levels/ErrorState";
import EmptyState from "@/components/games/levels/EmptyState";
import LevelGrid from "@/components/games/levels/LevelGrid";
import FilterBar from "@/components/games/levels/FilterBar";
import AppLoading from "@/components/AppLoading";
import DotsLoader from "@/components/DotLoader";
import useProgressStore from "@/store/games/useProgressStore";
import { useCompletionPercentage } from "@/utils/gameStatsUtils";

type FilterType = "all" | "completed" | "current" | "easy" | "medium" | "hard";

const LevelSelection = () => {
  // Component error state
  const [componentError, setComponentError] = useState<Error | null>(null);

  const params = useLocalSearchParams();
  const { activeTheme } = useThemeStore();

  // Properly extract string values from params
  const gameMode = Array.isArray(params.gameMode)
    ? params.gameMode[0]
    : params.gameMode || "multipleChoice";
  const gameTitle = Array.isArray(params.gameTitle)
    ? params.gameTitle[0]
    : params.gameTitle || "Game";

  const { shouldPlayAnimation } = useAnimationTracker();

  // NEW: Use centralized completion percentage instead of useLevelData's completionPercentage
  const completionPercentage = useCompletionPercentage(gameMode);

  // Use the enhanced hook that includes precomputed filters (but exclude completionPercentage)
  const {
    levels,
    showLevels,
    isLoading,
    error,
    // completionPercentage, // REMOVED: We get this from gameStatsUtils now
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

  // NEW: Add loading state for progress updates
  const [isProgressUpdating, setIsProgressUpdating] = useState(false);

  const [animationKey, setAnimationKey] = useState("initial");
  const [shouldAnimateCards, setShouldAnimateCards] = useState(false);

  // FIXED: Add timeout ref to prevent infinite loops
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const checkAttemptCountRef = React.useRef(0);

  // NEW: Track progress store updates to show loading during refresh
  const progressStore = useProgressStore();
  const progressLastUpdated = progressStore.lastUpdated;
  const progressIsLoading = progressStore.isLoading;

  useEffect(() => {
    const checkDataReady = async () => {
      try {
        // CRITICAL: Prevent infinite loops with attempt counter
        checkAttemptCountRef.current += 1;

        if (checkAttemptCountRef.current > 10) {
          console.warn(
            `[LevelSelection] Too many check attempts, forcing data ready`
          );
          setDataReady(true);
          setIsProgressUpdating(false);
          setInitialLoad(false);
          return;
        }

        // FIXED: Better stale data detection with null checks
        const progressStore = useProgressStore.getState();
        const splashStore = useSplashStore.getState();

        // CRITICAL: Add null checks to prevent "Cannot convert undefined value to object" error
        if (!progressStore || !splashStore) {
          console.log(
            `[LevelSelection] Store not ready, retrying... (attempt ${checkAttemptCountRef.current})`
          );

          // FIXED: Use timeout with cleanup to prevent memory leaks
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          timeoutRef.current = setTimeout(checkDataReady, 100);
          return;
        }

        // FIXED: Safely check for precomputed data with proper null checks
        const precomputedLevelsData = splashStore.precomputedLevels || {};
        const enhancedProgressData = splashStore.enhancedProgress || {};

        const hasPrecomputedLevels = precomputedLevelsData[gameMode]?.levels;
        const hasPrecomputedProgress = enhancedProgressData[gameMode];

        console.log(`[LevelSelection] Data availability check:`, {
          gameMode,
          hasPrecomputedLevels: !!hasPrecomputedLevels,
          hasPrecomputedProgress: !!hasPrecomputedProgress,
          levelsCount: hasPrecomputedLevels?.length || 0,
          precomputedLevelsKeys: Object.keys(precomputedLevelsData),
          enhancedProgressKeys: Object.keys(enhancedProgressData),
          progressIsLoading,
          checkAttempts: checkAttemptCountRef.current,
        });

        if (!hasPrecomputedLevels) {
          console.log(
            `[LevelSelection] Missing precomputed levels for ${gameMode}, waiting for splash store...`
          );

          // Check if splash store is still loading
          if (!splashStore.levelsPrecomputed) {
            console.log(
              `[LevelSelection] Splash store still precomputing, waiting...`
            );

            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(checkDataReady, 200);
            return;
          } else {
            console.log(
              `[LevelSelection] Splash store completed but no levels found, triggering manual preload`
            );
            // Force manual preload
            try {
              const success = await splashStore.preloadGameData();
              if (success) {
                if (timeoutRef.current) {
                  clearTimeout(timeoutRef.current);
                }

                timeoutRef.current = setTimeout(checkDataReady, 100);
                return;
              } else {
                console.warn(
                  `[LevelSelection] Manual preload failed, proceeding with available data`
                );
              }
            } catch (preloadError) {
              console.error(
                `[LevelSelection] Error during manual preload:`,
                preloadError
              );
              // Continue with available data instead of blocking
            }
          }
        }

        // ENHANCED: Better stale detection with progress update consideration
        const lastProgressUpdate = progressStore.lastUpdated || 0;
        const lastSplashUpdate =
          precomputedLevelsData[gameMode]?.lastUpdated || 0;

        // NEW: Consider data stale if progress is significantly newer than precomputed data
        const timeDifference = lastProgressUpdate - lastSplashUpdate;
        const isSignificantlyStale = timeDifference > 5000; // 5 seconds

        console.log(`[LevelSelection] Data freshness check:`, {
          lastProgressUpdate: new Date(lastProgressUpdate).toISOString(),
          lastSplashUpdate: new Date(lastSplashUpdate).toISOString(),
          timeDifference: `${timeDifference}ms`,
          isSignificantlyStale,
          progressIsLoading,
        });

        // CRITICAL FIX: Only show loading if progress is actually updating AND we haven't waited too long
        if (progressIsLoading && checkAttemptCountRef.current <= 5) {
          console.log(
            `[LevelSelection] Progress is updating, showing loading state (attempt ${checkAttemptCountRef.current})`
          );
          setIsProgressUpdating(true);
          setDataReady(false);

          // FIXED: Set a maximum wait time for progress loading
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          timeoutRef.current = setTimeout(checkDataReady, 300);
          return;
        }

        // FIXED: Only trigger refresh if data is actually stale AND we're not already loading
        if (
          isSignificantlyStale &&
          !progressIsLoading &&
          checkAttemptCountRef.current <= 3
        ) {
          console.log(
            `[LevelSelection] Refreshing stale data (${timeDifference}ms difference)`
          );

          setIsProgressUpdating(true);
          setDataReady(false);

          try {
            // FIXED: Add timeout to prevent hanging
            const refreshPromise = Promise.race([
              progressStore.fetchProgress(true),
              new Promise((_, reject) =>
                setTimeout(
                  () => reject(new Error("Progress fetch timeout")),
                  5000
                )
              ),
            ]);

            await refreshPromise;
            console.log(`[LevelSelection] Progress refresh completed`);

            // Trigger precomputation refresh
            await splashStore.precomputeSpecificGameMode(gameMode);
            console.log(`[LevelSelection] Precomputation refresh completed`);

            setIsProgressUpdating(false);

            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(checkDataReady, 100);
            return;
          } catch (error) {
            console.error(`[LevelSelection] Error refreshing data:`, error);
            setIsProgressUpdating(false);
            // Continue with existing data
          }
        }

        // CRITICAL FIX: Set data as ready when everything is fresh OR we've tried enough times
        console.log(`[LevelSelection] Setting data as ready`);
        setDataReady(true);
        setIsProgressUpdating(false);

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

        // Reset attempt counter on success
        checkAttemptCountRef.current = 0;
      } catch (error) {
        console.error(`[LevelSelection] Error in checkDataReady:`, error);

        // CRITICAL: Always set data as ready to prevent infinite loading, even on error
        setDataReady(true);
        setIsProgressUpdating(false);

        if (initialLoad) {
          setInitialLoad(false);
        }

        // Reset attempt counter
        checkAttemptCountRef.current = 0;

        // Log more details about the error for debugging
        if (error instanceof Error) {
          console.error(`[LevelSelection] Error details:`, {
            message: error.message,
            stack: error.stack,
            gameMode,
          });
        }
      }
    };

    checkDataReady();

    // CRITICAL: Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    shouldPlayAnimation,
    gameMode,
    initialLoad,
    progressLastUpdated,
    progressIsLoading,
  ]);

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

      // FIXED: Only use skipModal when starting from level selection modal
      // This ensures the modal is shown when navigating between levels
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

        const difficulty = level.difficultyCategory?.toLowerCase();
        let lockMessage = "This level is locked.";

        if (difficulty === "medium") {
          lockMessage = "Complete all Easy levels to unlock Medium difficulty.";
        } else if (difficulty === "hard") {
          lockMessage = "Complete all Medium levels to unlock Hard difficulty.";
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      console.log(
        `[LevelSelection] Level ${level.id} selected, status: ${level.status}`
      );
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // OPTIMIZED: Set selected level and show modal immediately
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

        // CRITICAL: Show modal immediately without any delays
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

  const stableDifficultyColors = useMemo(() => DIFFICULTY_COLORS, []);

  const renderContent = useMemo(() => {
    if (isProgressUpdating) {
      return (
        <View style={styles.loadingContainer}>
          <AppLoading />
        </View>
      );
    }

    // Wait for data to be ready
    if (!dataReady) {
      return (
        <View style={styles.loadingContainer}>
          <AppLoading />
        </View>
      );
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
      return (
        <View style={styles.loadingContainer}>
          <AppLoading />
        </View>
      );
    }

    // Render content when loaded
    if (showLevels && levels.length > 0) {
      return (
        <>
          {/* <LevelProgressBar percentage={completionPercentage} /> */}

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
    return (
      <View style={styles.loadingContainer}>
        <AppLoading />
      </View>
    );
  }, [
    isProgressUpdating,
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
    completionPercentage,
    stableHandlers.handleLevelSelectWithCompletion,
    stableHandlers.handleErrorReset,
    stableHandlers.handleFilterChange,
    stableDifficultyColors,
    handleRetry,
  ]);

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

          {showGameModal &&
            selectedLevel &&
            selectedLevel.status !== "completed" && (
              <LevelInfoModal
                visible={showGameModal}
                onClose={stableHandlers.handleCloseGameModal}
                onStart={stableHandlers.handleStartGame}
                levelData={{
                  ...selectedLevel.questionData,
                  ...selectedLevel,
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
