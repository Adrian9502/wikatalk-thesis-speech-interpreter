import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { Text, View, StatusBar, RefreshControl } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { AlertTriangle, RefreshCw } from "react-native-feather";
import * as Animatable from "react-native-animatable";
import { TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import ErrorBoundary from "react-native-error-boundary";
import useThemeStore from "@/store/useThemeStore";
import { BASE_COLORS } from "@/constant/colors";
import GameInfoModal from "@/components/games/GameInfoModal";
import LevelReviewModal from "@/components/games/LevelReviewModal";
import DotsLoader from "@/components/DotLoader";
import { LevelData } from "@/types/gameTypes";
import LevelCard from "@/components/games/levels/LevelCard";
import LevelHeader from "@/components/games/levels/LevelHeader";
import LevelProgressBar from "@/components/games/levels/LevelProgressBar";
import { levelStyles as styles } from "@/styles/games/levels.styles";
import { useLevelData } from "@/hooks/useLevelData";

// Error fallback component
const ErrorFallback = ({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) => (
  <View style={styles.errorContainer}>
    <AlertTriangle width={48} height={48} color={BASE_COLORS.error} />
    <Text style={styles.errorTitle}>Something went wrong</Text>
    <Text style={styles.errorMessage}>{error.message}</Text>
    <TouchableOpacity onPress={resetError} style={styles.retryButton}>
      <RefreshCw width={20} height={20} color={BASE_COLORS.white} />
      <Text style={styles.retryButtonText}>Try Again</Text>
    </TouchableOpacity>
  </View>
);

// Empty state component
const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyTitle}>No Levels Available</Text>
    <Text style={styles.emptyMessage}>Check back later for new content</Text>
  </View>
);

const LevelSelection = () => {
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
    if (activeFilter === "all") return levels;
    if (activeFilter === "completed")
      return levels.filter((level) => level.status === "completed");
    if (activeFilter === "current")
      return levels.filter((level) => level.status === "current");
    if (activeFilter === "locked")
      return levels.filter((level) => level.status === "locked");
    return levels;
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

  // Stable difficulty colors
  const difficultyColors = useMemo(
    () => ({
      Easy: ["#4CAF50", "#2E7D32"] as const,
      Medium: ["#FF9800", "#EF6C00"] as const,
      Hard: ["#F44336", "#C62828"] as const,
    }),
    []
  );

  // Memoized level status hash for stable comparison
  const levelStatusHash = useMemo(() => {
    return filteredLevels.map((l) => `${l.id}-${l.status}`).join(",");
  }, [filteredLevels]);

  // Memoized renderItem with stable comparison
  const renderItem = useCallback(
    ({ item: level, index }: { item: LevelData; index: number }) => {
      const levelDifficulty =
        typeof level.difficulty === "string" ? level.difficulty : "Easy";

      const colorsArray =
        difficultyColors[levelDifficulty as keyof typeof difficultyColors] ||
        difficultyColors.Easy;

      const isEvenIndex = index % 2 === 0;

      const itemStyle = {
        marginRight: isEvenIndex ? 8 : 0,
        marginLeft: isEvenIndex ? 0 : 8,
      };

      const safeGradientColors: readonly [string, string] = [
        colorsArray[0] || "#4CAF50",
        colorsArray[1] || "#2E7D32",
      ];

      return (
        <View style={itemStyle}>
          <LevelCard
            level={level}
            onSelect={handleLevelSelectWithCompletion}
            gradientColors={safeGradientColors}
            accessible={true}
            accessibilityLabel={`Level ${level.number}: ${level.title}`}
            accessibilityHint={
              level.status === "locked"
                ? "This level is locked"
                : "Tap to view level details"
            }
          />
        </View>
      );
    },
    [difficultyColors, handleLevelSelectWithCompletion]
  );

  // PERFORMANCE FIX: Stable keyExtractor
  const keyExtractor = useCallback((item: LevelData) => `level-${item.id}`, []);

  // PERFORMANCE FIX: Memoized FlatList getItemLayout
  const getItemLayout = useCallback(
    (data: any, index: number) => ({
      length: 180, // Approximate item height
      offset: 180 * Math.floor(index / 2), // For 2 columns
      index,
    }),
    []
  );

  // Filter bar component
  const FilterBar = useCallback(
    () => (
      <Animatable.View
        animation="fadeIn"
        duration={500}
        style={styles.filterContainer}
      >
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === "all" && styles.activeFilter,
          ]}
          onPress={() => setActiveFilter("all")}
          accessible={true}
          accessibilityLabel="Show all levels"
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === "all" && styles.activeFilterText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === "completed" && styles.activeFilter,
          ]}
          onPress={() => setActiveFilter("completed")}
          accessible={true}
          accessibilityLabel="Show completed levels"
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === "completed" && styles.activeFilterText,
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === "current" && styles.activeFilter,
          ]}
          onPress={() => setActiveFilter("current")}
          accessible={true}
          accessibilityLabel="Show current levels"
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === "current" && styles.activeFilterText,
            ]}
          >
            Current
          </Text>
        </TouchableOpacity>
      </Animatable.View>
    ),
    [activeFilter]
  );

  // Content rendering
  const renderContent = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.loaderContainer}>
          <DotsLoader />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <AlertTriangle width={48} height={48} color={BASE_COLORS.error} />
          <Text style={styles.errorTitle}>Unable to Load Levels</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
            <RefreshCw width={20} height={20} color={BASE_COLORS.white} />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (levels.length > 0 && !showLevels) {
      return (
        <View style={styles.loaderContainer}>
          <DotsLoader />
        </View>
      );
    }

    if (showLevels) {
      return (
        <>
          <FilterBar />
          {filteredLevels.length === 0 ? (
            <EmptyState />
          ) : (
            <FlashList
              data={filteredLevels}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              numColumns={2}
              contentContainerStyle={styles.gridScrollContent}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={true}
              extraData={levelStatusHash}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={throttledRefreshLevels}
                  colors={[BASE_COLORS.blue, BASE_COLORS.orange]}
                  tintColor={BASE_COLORS.blue}
                />
              }
              estimatedItemSize={180}
            />
          )}
        </>
      );
    }

    return (
      <View style={styles.loaderContainer}>
        <DotsLoader />
      </View>
    );
  }, [
    isLoading,
    error,
    levels,
    showLevels,
    filteredLevels,
    handleRetry,
    keyExtractor,
    renderItem,
    levelStatusHash,
    getItemLayout,
    isRefreshing,
    throttledRefreshLevels,
    FilterBar,
  ]);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error) => console.log("[LevelSelection] Error caught:", error)}
    >
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
    </ErrorBoundary>
  );
};

export default LevelSelection;
