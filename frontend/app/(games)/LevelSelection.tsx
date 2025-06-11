import { Text, View, FlatList, StatusBar } from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { AlertTriangle, RefreshCw } from "react-native-feather";
import * as Animatable from "react-native-animatable";
import { TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useThemeStore from "@/store/useThemeStore";
import { BASE_COLORS } from "@/constant/colors";
import GameInfoModal from "@/components/games/GameInfoModal";
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
    selectedLevel,
    showModal,
    handleLevelSelect,
    handleCloseModal,
    handleRetry,
  } = useLevelData(gameMode);

  const [preloadedModal, setPreloadedModal] = useState(false);

  // Preload the modal when levels are available
  useEffect(() => {
    if (levels.length > 0 && !preloadedModal) {
      setPreloadedModal(true);
    }
  }, [levels, preloadedModal]);

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

  // Pre-calculate difficulty colors mapping
  const difficultyColors = useMemo(
    () => ({
      Easy: ["#4CAF50", "#2E7D32"],
      Medium: ["#FF9800", "#EF6C00"],
      Hard: ["#F44336", "#C62828"],
    }),
    []
  );

  // Memoize renderItem function for FlatList
  const renderItem = useCallback(
    ({ item: level }: { item: LevelData }) => {
      // Ensure difficulty is a string, not an array
      const levelDifficulty =
        typeof level.difficulty === "string" ? level.difficulty : "Easy";

      // Safely get gradient colors and ensure it's a tuple with 2 elements
      const colorsArray =
        difficultyColors[levelDifficulty as keyof typeof difficultyColors] ||
        difficultyColors.Easy;

      // Create a safe tuple that's guaranteed to have 2 elements
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
            onSelect={handleLevelSelect}
            gradientColors={safeGradientColors}
          />
        </Animatable.View>
      );
    },
    [difficultyColors, handleLevelSelect]
  );

  // Preload game content for faster response
  const preloadGameModal = useMemo(() => {
    if (levels.length > 0) {
      // Create an invisible prerendered modal
      return (
        <View style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}>
          <GameInfoModal
            visible={false}
            onClose={() => {}}
            onStart={() => {}}
            levelData={levels[0]?.questionData || {}}
            gameMode={
              typeof gameMode === "string" ? gameMode : String(gameMode)
            }
            isLoading={false}
            difficulty="easy"
          />
        </View>
      );
    }

    return null;
  }, [levels.length > 0]);

  // Update FlatList state and key extractor
  const keyExtractor = useCallback((item: LevelData) => item.id.toString(), []);

  // Content rendering based on state
  const renderContent = useCallback(() => {
    // Show loading state
    if (isLoading) {
      return (
        <View style={styles.loaderContainer}>
          <DotsLoader />
        </View>
      );
    }

    // Show error state
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

    // Show loading state while preparing animations
    if (levels.length > 0 && !showLevels) {
      return (
        <View style={styles.loaderContainer}>
          <DotsLoader />
        </View>
      );
    }

    // Show levels grid with animations
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
          updateCellsBatchingPeriod={16} // For 60fps updates
          shouldItemUpdate={(prev, next) => prev.item.id !== next.item.id}
        />
      );
    }

    // Fallback empty state
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

        {/* GameInfoModal - Always mounted but hidden until needed */}
        <GameInfoModal
          visible={showModal && selectedLevel !== null}
          onClose={handleCloseModal}
          onStart={handleStartGame}
          levelData={selectedLevel?.questionData || levels[0]?.questionData}
          gameMode={typeof gameMode === "string" ? gameMode : String(gameMode)}
          isLoading={isLoading}
          difficulty={selectedLevel?.difficultyCategory || "easy"}
        />
        {preloadGameModal}
      </SafeAreaView>
    </View>
  );
};

export default LevelSelection;
