import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  const { levels, showLevels, isLoading, error, handleRetry } =
    useLevelData(gameMode);

  // Add level filtering
  const [activeFilter, setActiveFilter] = useState("all");

  // Local state for modal handling
  const [selectedLevel, setSelectedLevel] = useState<LevelData | null>(null);
  const [showGameModal, setShowGameModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [preloadedModal, setPreloadedModal] = useState(false);

  // PERFORMANCE FIX: Stable memoization of completion percentage
  const completionPercentage = useMemo(() => {
    if (!levels || levels.length === 0) return 0;
    const completedLevels = levels.filter(
      (level) => level.status === "completed"
    ).length;
    return Math.round((completedLevels / levels.length) * 100);
  }, [levels]);

  // PERFORMANCE FIX: Stable filtered levels with proper dependency
  const filteredLevels = useMemo(() => {
    if (!levels || levels.length === 0) return [];

    let filtered = levels;

    // Status filters
    switch (activeFilter) {
      case "completed":
        filtered = filtered.filter((level) => level.status === "completed");
        break;
      case "current":
        filtered = filtered.filter((level) => level.status === "current");
        break;
      case "easy":
        filtered = filtered.filter(
          (level) =>
            level.difficulty === "Easy" || level.difficultyCategory === "easy"
        );
        break;
      case "medium":
        filtered = filtered.filter(
          (level) =>
            level.difficulty === "Medium" ||
            level.difficultyCategory === "medium"
        );
        break;
      case "hard":
        filtered = filtered.filter(
          (level) =>
            level.difficulty === "Hard" || level.difficultyCategory === "hard"
        );
        break;
      default:
        // "all" - no filtering
        break;
    }

    return filtered;
  }, [levels, activeFilter]);

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

    return {
      handleBack,
      handleStartGame,
      handleLevelSelectWithCompletion,
      handleCloseGameModal,
      handleCloseReviewModal,
      handleErrorReset,
    };
  }, [selectedLevel, gameMode, gameTitle]);

  // PERFORMANCE FIX: Stable memoized difficulty colors
  const stableDifficultyColors = useMemo(() => difficultyColors, []);

  // Preload the modal when levels are available (only once)
  useEffect(() => {
    if (levels.length > 0 && !preloadedModal) {
      setPreloadedModal(true);
    }
  }, [levels.length > 0, preloadedModal]);

  // PERFORMANCE FIX: Memoize render content with stable dependencies
  const renderContent = useMemo(() => {
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
    if (showLevels) {
      return (
        <>
          <FilterBar
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />
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
      );
    }

    // Fallback loading state
    return <AppLoading />;
  }, [
    componentError,
    error,
    isLoading,
    levels.length,
    showLevels,
    filteredLevels,
    activeFilter,
    stableHandlers.handleLevelSelectWithCompletion,
    stableHandlers.handleErrorReset,
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

          {/* Level Info Modal - For non-completed levels */}
          <LevelInfoModal
            visible={
              showGameModal &&
              selectedLevel !== null &&
              selectedLevel.status !== "completed"
            }
            onClose={stableHandlers.handleCloseGameModal}
            onStart={stableHandlers.handleStartGame}
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
