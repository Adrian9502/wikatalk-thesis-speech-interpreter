import React, { useEffect, useMemo, useState } from "react";
import { View, StatusBar } from "react-native";
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
import { isAllDataReady } from "@/store/useSplashStore";
// Components
import ErrorState from "@/components/games/levels/ErrorState";
import EmptyState from "@/components/games/levels/EmptyState";
import LevelGrid from "@/components/games/levels/LevelGrid";
import FilterBar from "@/components/games/levels/FilterBar";
import AppLoading from "@/components/AppLoading";

type FilterType = "all" | "completed" | "current" | "easy" | "medium" | "hard";

const LevelSelection = () => {
  // Component error state
  const [componentError, setComponentError] = useState<Error | null>(null);

  const params = useLocalSearchParams();
  const { gameMode, gameTitle } = params;
  const { activeTheme } = useThemeStore();

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
  const [isFilterLoading, setIsFilterLoading] = useState(false); // NEW: Filter loading state

  // Local state for modal handling
  const [selectedLevel, setSelectedLevel] = useState<LevelData | null>(null);
  const [showGameModal, setShowGameModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // PERFORMANCE: Check if all data is ready - if not, show loading
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    const checkDataReady = () => {
      if (isAllDataReady()) {
        setDataReady(true);
      } else {
        console.log("[LevelSelection] Waiting for precomputed data...");
        const timeout = setTimeout(checkDataReady, 100);
        return () => clearTimeout(timeout);
      }
    };

    checkDataReady();
  }, []);

  // PERFORMANCE FIX: Use precomputed filters with loading state
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
      router.back();
    };

    const handleStartGame = () => {
      if (!selectedLevel) return;

      router.push({
        pathname: "/(games)/Questions",
        params: {
          levelId: selectedLevel.id,
          gameMode: typeof gameMode === "string" ? gameMode : String(gameMode),
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
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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

    // ENHANCED: Filter handler with loading state
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

        // Hide loading state after a short delay to ensure smooth transition
        setTimeout(() => {
          setIsFilterLoading(false);
        }, 150); // 150ms delay for smooth transition
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
  }, [selectedLevel, gameMode, gameTitle, activeFilter]);

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
              <AppLoading />
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
    isFilterLoading, // NEW: Include in dependencies
    stableHandlers.handleLevelSelectWithCompletion,
    stableHandlers.handleErrorReset,
    stableHandlers.handleFilterChange,
    stableDifficultyColors,
    handleRetry,
  ]);

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
                levelData={
                  selectedLevel?.questionData || levels[0]?.questionData
                }
                gameMode={
                  typeof gameMode === "string" ? gameMode : String(gameMode)
                }
                isLoading={isLoading}
                difficulty={selectedLevel?.difficultyCategory || "easy"}
              />
            )}

          {/* FIXED: Only render modal when it should be visible */}
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
