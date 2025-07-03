import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { View, StatusBar } from "react-native";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";
import useThemeStore from "@/store/useThemeStore";
import GameInfoModal from "@/components/games/GameInfoModal";
import LevelReviewModal from "@/components/games/LevelReviewModal";
import { LevelData } from "@/types/gameTypes";
import LevelHeader from "@/components/games/levels/LevelHeader";
import LevelProgressBar from "@/components/games/levels/LevelProgressBar";
import { levelStyles as styles } from "@/styles/games/levels.styles";
import { useLevelData } from "@/hooks/useLevelData";
import { difficultyColors } from "@/constant/colors";
// Components
import ErrorState from "@/components/games/levels/ErrorState";
import EmptyState from "@/components/games/levels/EmptyState";
import LevelGrid from "@/components/games/levels/LevelGrid";
import FilterBar from "@/components/games/levels/FilterBar";
import AppLoading from "@/components/AppLoading";

const LevelSelection = () => {
  // Component error state
  const [componentError, setComponentError] = useState<Error | null>(null);

  const params = useLocalSearchParams();
  const { gameMode, gameTitle } = params;
  const { activeTheme } = useThemeStore();

  // Use the custom hook to handle level data
  const { levels, showLevels, isLoading, error, handleRetry, refreshLevels } =
    useLevelData(gameMode);

  // Add level filtering
  const [activeFilter, setActiveFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Local state for modal handling
  const [selectedLevel, setSelectedLevel] = useState<LevelData | null>(null);
  const [showGameModal, setShowGameModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [preloadedModal, setPreloadedModal] = useState(false);

  // PERFORMANCE FIX: Use refs to prevent unnecessary refreshes
  const lastRefreshTimeRef = useRef(0);
  const isRefreshingRef = useRef(false);

  // Memoize the completion percentage calculation
  const completionPercentage = useMemo(() => {
    if (!levels || levels.length === 0) return 0;
    const completedLevels = levels.filter(
      (level) => level.status === "completed"
    ).length;
    return Math.round((completedLevels / levels.length) * 100);
  }, [levels]);

  // Filtered levels based on active filter
  const filteredLevels = useMemo(() => {
    let filtered = levels;

    // Status filters
    if (activeFilter === "completed") {
      filtered = filtered.filter((level) => level.status === "completed");
    } else if (activeFilter === "current") {
      filtered = filtered.filter((level) => level.status === "current");
    } else if (activeFilter === "easy") {
      filtered = filtered.filter(
        (level) =>
          level.difficulty === "Easy" || level.difficultyCategory === "easy"
      );
    } else if (activeFilter === "medium") {
      filtered = filtered.filter(
        (level) =>
          level.difficulty === "Medium" || level.difficultyCategory === "medium"
      );
    } else if (activeFilter === "hard") {
      filtered = filtered.filter(
        (level) =>
          level.difficulty === "Hard" || level.difficultyCategory === "hard"
      );
    }

    return filtered;
  }, [levels, activeFilter]);

  // PERFORMANCE FIX: Throttled refresh function
  const throttledRefreshLevels = useCallback(async () => {
    const now = Date.now();

    // Only refresh if it's been at least 2 seconds since last refresh
    if (now - lastRefreshTimeRef.current < 2000 || isRefreshingRef.current) {
      console.log(
        "[LevelSelection] Skipping refresh - too recent or already in progress"
      );
      return;
    }

    isRefreshingRef.current = true;
    lastRefreshTimeRef.current = now;
    setIsRefreshing(true);

    try {
      await refreshLevels();
    } finally {
      isRefreshingRef.current = false;
      setIsRefreshing(false);
    }
  }, [refreshLevels]);

  // Optimized focus effect with throttling
  useFocusEffect(
    useCallback(() => {
      console.log("[LevelSelection] Screen focused, throttled refresh...");
      throttledRefreshLevels();
    }, [throttledRefreshLevels])
  );

  // Preload the modal when levels are available (only once)
  useEffect(() => {
    if (levels.length > 0 && !preloadedModal) {
      setPreloadedModal(true);
    }
  }, [levels.length > 0, preloadedModal]);

  // Navigation handlers
  const handleBack = useCallback(() => {
    router.back();
  }, []);

  const handleStartGame = useCallback(() => {
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
  }, [selectedLevel, gameMode, gameTitle]);

  // PERFORMANCE FIX: Level select handler with haptic feedback
  const handleLevelSelectWithCompletion = useCallback((level: LevelData) => {
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
      console.log(`[LevelSelection] Opening game modal for level ${level.id}`);
      setShowGameModal(true);
      setShowReviewModal(false);
    }
  }, []);

  // Close handlers for both modals
  const handleCloseGameModal = useCallback(() => {
    console.log(`[LevelSelection] Closing game modal`);
    setShowGameModal(false);
    setSelectedLevel(null);
  }, []);

  const handleCloseReviewModal = useCallback(() => {
    console.log(`[LevelSelection] Closing review modal`);
    setShowReviewModal(false);
    setSelectedLevel(null);
  }, []);

  // Try to reset error when retrying
  const handleErrorReset = useCallback(() => {
    setComponentError(null);
  }, []);

  // Render content with proper components
  const renderContent = useCallback(() => {
    // First check for component error
    if (componentError) {
      return <ErrorState error={componentError} onRetry={handleErrorReset} />;
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
    if (showLevels) {
      return (
        <>
          <FilterBar
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />
          {filteredLevels.length === 0 ? (
            <EmptyState />
          ) : (
            <LevelGrid
              levels={filteredLevels}
              isRefreshing={isRefreshing}
              onRefresh={throttledRefreshLevels}
              onSelectLevel={handleLevelSelectWithCompletion}
              difficultyColors={difficultyColors}
            />
          )}
        </>
      );
    }

    // Fallback loading state
    return <AppLoading />;
  }, [
    componentError,
    error,
    isLoading,
    levels,
    showLevels,
    filteredLevels,
    activeFilter,
    isRefreshing,
    throttledRefreshLevels,
    handleLevelSelectWithCompletion,
    difficultyColors,
    handleRetry,
    handleErrorReset,
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
          <LevelHeader title={gameTitle} onBack={handleBack} />

          {/* Progress bar */}
          <LevelProgressBar percentage={completionPercentage} />

          {/* Content Area */}
          <View style={styles.contentArea}>{renderContent()}</View>

          {/* Game Info Modal - For non-completed levels */}
          <GameInfoModal
            visible={
              showGameModal &&
              selectedLevel !== null &&
              selectedLevel.status !== "completed"
            }
            onClose={handleCloseGameModal}
            onStart={handleStartGame}
            levelData={selectedLevel?.questionData || levels[0]?.questionData}
            gameMode={
              typeof gameMode === "string" ? gameMode : String(gameMode)
            }
            isLoading={isLoading}
            difficulty={selectedLevel?.difficultyCategory || "easy"}
          />

          {/* Level Review Modal - For completed levels */}
          <LevelReviewModal
            visible={
              showReviewModal &&
              selectedLevel !== null &&
              selectedLevel.status === "completed"
            }
            onClose={handleCloseReviewModal}
            level={selectedLevel}
            gradientColors={
              selectedLevel
                ? difficultyColors[
                    selectedLevel.difficulty as keyof typeof difficultyColors
                  ] || difficultyColors.Easy
                : difficultyColors.Easy
            }
          />
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
          <LevelHeader title={gameTitle} onBack={handleBack} />
          <View style={styles.contentArea}>
            <ErrorState error={error} onRetry={handleErrorReset} />
          </View>
        </SafeAreaView>
      </View>
    );
  }
};

export default LevelSelection;
