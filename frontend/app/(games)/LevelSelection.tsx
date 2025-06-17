import { Text, View, FlatList, StatusBar } from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { AlertTriangle, RefreshCw } from "react-native-feather";
import * as Animatable from "react-native-animatable";
import { TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

const LevelSelection = () => {
  const params = useLocalSearchParams();
  const { gameMode, gameTitle } = params;
  const { activeTheme } = useThemeStore();

  // Use the custom hook to handle level data
  const {
    levels,
    showLevels,
    isLoading,
    error,
    completionPercentage,
    handleRetry,
    refreshLevels, // Add this new function
  } = useLevelData(gameMode);

  // Local state for modal handling
  const [selectedLevel, setSelectedLevel] = useState<LevelData | null>(null);
  const [showGameModal, setShowGameModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [preloadedModal, setPreloadedModal] = useState(false);

  // CRITICAL FIX: Refresh levels when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('[LevelSelection] Screen focused, refreshing levels...');
      
      // Small delay to ensure any pending progress updates have completed
      const refreshTimeout = setTimeout(() => {
        refreshLevels();
      }, 300);

      return () => clearTimeout(refreshTimeout);
    }, [refreshLevels])
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

  // FIXED: Level select handler to check completion status
  const handleLevelSelectWithCompletion = useCallback((level: LevelData) => {
    if (level.status === "locked") {
      console.log(`[LevelSelection] Level ${level.id} is locked`);
      return;
    }

    console.log(`[LevelSelection] Level ${level.id} selected, status: ${level.status}`);
    setSelectedLevel(level);

    if (level.status === "completed") {
      console.log(`[LevelSelection] Opening review modal for completed level ${level.id}`);
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

  // Memoize difficulty colors
  const difficultyColors = useMemo(
    () => ({
      Easy: ["#4CAF50", "#2E7D32"],
      Medium: ["#FF9800", "#EF6C00"],
      Hard: ["#F44336", "#C62828"],
    }),
    []
  );

  // Memoize renderItem function
  const renderItem = useCallback(
    ({ item: level }: { item: LevelData }) => {
      const levelDifficulty =
        typeof level.difficulty === "string" ? level.difficulty : "Easy";

      const colorsArray =
        difficultyColors[levelDifficulty as keyof typeof difficultyColors] ||
        difficultyColors.Easy;

      const safeGradientColors: readonly [string, string] = [
        colorsArray[0] || "#4CAF50",
        colorsArray[1] || "#2E7D32",
      ];

      return (
        <Animatable.View
          animation="fadeIn"
          duration={300}
          delay={Math.min(level.id * 10, 300)}
          key={level.id}
          useNativeDriver
        >
          <LevelCard
            level={level}
            onSelect={handleLevelSelectWithCompletion}
            gradientColors={safeGradientColors}
          />
        </Animatable.View>
      );
    },
    [difficultyColors, handleLevelSelectWithCompletion]
  );

  const keyExtractor = useCallback((item: LevelData) => item.id.toString(), []);

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
        <FlatList
          data={levels}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={[
            styles.gridScrollContent,
            { paddingBottom: 5 },
          ]}
          showsVerticalScrollIndicator={false}
          windowSize={7}
          maxToRenderPerBatch={5}
          removeClippedSubviews={true}
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
          initialNumToRender={8}
          updateCellsBatchingPeriod={16}
          shouldItemUpdate={(prev, next) => prev.item.id !== next.item.id}
        />
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
    levels.length,
    showLevels,
    handleRetry,
    keyExtractor,
    renderItem,
  ]);

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
          visible={showGameModal && selectedLevel !== null && selectedLevel.status !== "completed"}
          onClose={handleCloseGameModal}
          onStart={handleStartGame}
          levelData={selectedLevel?.questionData || levels[0]?.questionData}
          gameMode={typeof gameMode === "string" ? gameMode : String(gameMode)}
          isLoading={isLoading}
          difficulty={selectedLevel?.difficultyCategory || "easy"}
        />

        {/* Level Review Modal - For completed levels */}
        <LevelReviewModal
          visible={showReviewModal && selectedLevel !== null && selectedLevel.status === "completed"}
          onClose={handleCloseReviewModal}
          level={selectedLevel}
          gradientColors={
            selectedLevel
              ? (difficultyColors[selectedLevel.difficulty as keyof typeof difficultyColors] || difficultyColors.Easy)
              : difficultyColors.Easy
          }
        />
      </SafeAreaView>
    </View>
  );
};

export default LevelSelection;
