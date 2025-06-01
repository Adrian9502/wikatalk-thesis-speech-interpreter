import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  FlatList,
} from "react-native";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocalSearchParams, router } from "expo-router";
import {
  ArrowLeft,
  Star,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Circle,
  RefreshCw,
  Lock,
  Volume2,
} from "react-native-feather";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import useThemeStore from "@/store/useThemeStore";
import { BASE_COLORS } from "@/constant/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import GameInfoModal from "@/components/Games/GameInfoModal";
import useQuizStore from "@/store/Games/useQuizStore";
import DotsLoader from "@/components/DotLoader";

// Update the convertQuizToLevels function to fix level numbering
const convertQuizToLevels = (gameMode, quizData) => {
  console.log(
    `Attempting to convert ${gameMode} data: ${
      quizData
        ? `Has ${gameMode} key: ${!!quizData[gameMode]}`
        : "No quizData provided"
    }`
  );

  if (!quizData[gameMode]) return [];

  const difficulties = Object.keys(quizData[gameMode]);
  console.log(`Found difficulties for ${gameMode}:`, difficulties);

  let allLevels = [];
  let levelNumber = 1; // Start numbering from 1 for each game mode

  difficulties.forEach((difficulty, diffIndex) => {
    const difficultyQuestions = quizData[gameMode][difficulty] || [];
    console.log(
      `${gameMode}/${difficulty}: ${difficultyQuestions.length} questions`
    );

    const levelsFromDifficulty = difficultyQuestions.map((item, index) => {
      const overallIndex = diffIndex * 5 + index;
      // Make all levels either completed or current, never locked
      const status = overallIndex < 3 ? "completed" : "current";

      // Create a level with sequential numbering
      const level = {
        id: item.id, // Keep original ID for internal reference
        number: levelNumber++, // Use sequential number starting from 1
        title: item.title || `Level ${levelNumber - 1}`, // Use level number in title if none provided
        description: item.description || "Practice your skills",
        difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
        status: status, // No more "locked" status
        stars: status === "completed" ? 3 : Math.floor(Math.random() * 3),
        focusArea: item.description?.includes("Grammar")
          ? "Grammar"
          : item.description?.includes("Pronunciation")
          ? "Pronunciation"
          : "Vocabulary",
        questionData: item,
        difficultyCategory: difficulty,
      };

      return level;
    });

    allLevels = [...allLevels, ...levelsFromDifficulty];
  });

  console.log(`Converted ${allLevels.length} levels for ${gameMode}`);
  return allLevels;
};

const LevelCard = React.memo(({ level, onSelect, gradientColors }) => {
  // Pull out needed props
  const { id, number, title, difficulty, status, focusArea } = level;

  // Determine number of stars based on difficulty
  const getStarCount = () => {
    switch (difficulty) {
      case "Easy":
        return 1;
      case "Medium":
        return 2;
      case "Hard":
        return 3;
      default:
        return 1;
    }
  };

  const starCount = getStarCount();

  // Render focus area icon
  const renderFocusIcon = () => {
    switch (focusArea) {
      case "Grammar":
        return (
          <AlertTriangle width={16} height={16} color={BASE_COLORS.white} />
        );
      case "Vocabulary":
        return <BookOpen width={16} height={16} color={BASE_COLORS.white} />;
      case "Pronunciation":
        return <Volume2 width={16} height={16} color={BASE_COLORS.white} />;
      default:
        return <BookOpen width={16} height={16} color={BASE_COLORS.white} />;
    }
  };

  return (
    <TouchableOpacity
      style={styles.levelCard}
      onPress={() => onSelect(level)}
      activeOpacity={0.8}
      disabled={status === "locked"}
    >
      <LinearGradient colors={gradientColors} style={styles.levelCardGradient}>
        {/* Decorative elements */}
        <View style={styles.decorativeShape} />
        <View style={[styles.decorativeShape, styles.decorativeShape2]} />

        {/* Card header with level number and lock status */}
        <View style={styles.levelHeader}>
          <View style={styles.levelNumberContainer}>
            <Text style={styles.levelNumber}>{number}</Text>
          </View>
          <View style={styles.specialIconContainer}>
            {status === "locked" ? (
              <Lock width={18} height={18} color={BASE_COLORS.white} />
            ) : null}
          </View>
        </View>

        {/* Card content with title and metadata */}
        <View style={styles.levelInfo}>
          <Text style={styles.levelTitle}>{title}</Text>

          {/* Focus area badge */}
          <View style={styles.levelMetadataRow}>
            <View style={styles.focusAreaBadge}>
              {renderFocusIcon()}
              <Text style={styles.focusAreaText}>{focusArea}</Text>
            </View>
          </View>

          {/* Difficulty stars */}
          <View style={styles.difficultyStarsContainer}>
            {Array(3)
              .fill(0)
              .map((_, index) => (
                <Star
                  key={index}
                  width={14}
                  height={14}
                  fill={index < starCount ? "#FFC107" : "transparent"}
                  stroke={
                    index < starCount ? "#FFC107" : "rgba(255, 255, 255, 0.4)"
                  }
                />
              ))}

            <Text style={styles.difficultyText}>{difficulty}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
});

// Optimize the LevelSelection component's renderLevelCard function
const LevelSelection = () => {
  const params = useLocalSearchParams();
  const { gameMode, gameTitle } = params;
  const [levels, setLevels] = useState([]);
  const { activeTheme } = useThemeStore();

  // Get quiz store methods - only use store's loading and error states
  const { fetchQuestionsByMode, questions, isLoading, error } = useQuizStore();

  // Modal state variables
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [showLevels, setShowLevels] = useState(false);

  // Fetch level data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (gameMode) {
        try {
          await fetchQuestionsByMode(gameMode);
        } catch (error) {
          console.error("Error fetching questions:", error);
        }
      }
    };

    fetchData();
  }, [gameMode]);

  // Process questions when they change in the store
  useEffect(() => {
    if (gameMode && questions) {
      try {
        console.log(
          "Processing questions for levels:",
          questions[gameMode]
            ? Object.keys(questions[gameMode]).map(
                (diff) => `${diff}: ${questions[gameMode][diff]?.length || 0}`
              )
            : "No questions data"
        );

        const currentLevels = convertQuizToLevels(gameMode, questions);
        console.log(`Setting ${currentLevels.length} levels for UI`);
        setLevels(currentLevels);

        // Show levels with a small delay to ensure smooth animation
        if (currentLevels.length > 0) {
          setTimeout(() => {
            setShowLevels(true);
          }, 100);
        }
      } catch (error) {
        console.error("Error converting levels:", error);
        setLevels([]);
        setShowLevels(false);
      }
    }
  }, [gameMode, questions]);

  const completionPercentage =
    levels.length > 0
      ? (levels.filter((l) => l.status === "completed").length /
          levels.length) *
        100
      : 0;

  // Memoize the level select handler
  const handleLevelSelect = useCallback((level) => {
    if (level.status === "locked") return;
    setSelectedLevel(level);
    setShowModal(true);
  }, []);

  const handleStartGame = () => {
    if (!selectedLevel) return;

    // Navigate directly without artificial delays
    router.push({
      pathname: "/(games)/Questions",
      params: {
        levelId: selectedLevel.id,
        gameMode,
        gameTitle,
        difficulty: selectedLevel.difficultyCategory,
        skipModal: "true",
      },
    });
  };

  const handleRetry = async () => {
    if (gameMode) {
      try {
        await fetchQuestionsByMode(gameMode);
      } catch (error) {
        console.error("Error retrying fetch:", error);
      }
    }
  };

  const handleBack = () => {
    router.back();
  };

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
    ({ item: level }) => {
      const gradientColors = difficultyColors[level.difficulty];
      return (
        <Animatable.View
          animation="fadeIn"
          duration={300} // Reduce animation duration
          delay={Math.min(level.id * 10, 300)} // Cap the delay at 300ms
          key={level.id}
          useNativeDriver // Use native driver for animations
        >
          <LevelCard
            level={level}
            onSelect={handleLevelSelect}
            gradientColors={gradientColors}
          />
        </Animatable.View>
      );
    },
    [difficultyColors, handleLevelSelect]
  );

  // Optimize keyExtractor
  const keyExtractor = useCallback((item) => item.id.toString(), []);

  const renderContent = () => {
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
          contentContainerStyle={styles.gridScrollContent}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.columnWrapper} // Add this style for column spacing
          initialNumToRender={6}
          maxToRenderPerBatch={4}
          windowSize={3}
          removeClippedSubviews={true}
          updateCellsBatchingPeriod={50}
          onEndReachedThreshold={0.5}
        />
      );
    }

    // Fallback empty state
    return (
      <View style={styles.loaderContainer}>
        <DotsLoader />
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: activeTheme.backgroundColor },
      ]}
    >
      <StatusBar barStyle="light-content" />

      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      <View style={styles.decorativeCircle3} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animatable.View
          animation="fadeIn"
          duration={500}
          style={styles.header}
        >
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft width={24} height={24} color={BASE_COLORS.white} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>{gameTitle || "Levels"}</Text>
            <Text style={styles.headerSubtitle}>Select a level to begin</Text>
          </View>
          <View style={{ width: 40 }} />
        </Animatable.View>

        {/* Progress bar */}
        <Animatable.View
          animation="fadeIn"
          duration={800}
          delay={100}
          style={styles.progressContainer}
        >
          <View style={styles.progressBarContainer}>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>Course Progress</Text>
              <Text style={styles.progressPercentage}>
                {Math.round(completionPercentage)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={["#8BC34A", "#4CAF50"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.progressFill,
                  { width: `${completionPercentage}%` },
                ]}
              />
            </View>
          </View>
        </Animatable.View>

        {/* Content Area */}
        <View style={styles.contentArea}>{renderContent()}</View>

        {/* GameInfoModal */}
        {selectedLevel && (
          <GameInfoModal
            visible={showModal}
            onClose={() => setShowModal(false)}
            onStart={handleStartGame}
            levelData={selectedLevel.questionData}
            gameMode={gameMode as string}
            isLoading={isStartingGame}
            difficulty={selectedLevel.difficulty}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111B21",
  },
  safeArea: {
    flex: 1,
  },
  decorativeCircle1: {
    position: "absolute",
    top: -100,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: `${BASE_COLORS.blue}20`,
  },
  decorativeCircle2: {
    position: "absolute",
    top: height * 0.3,
    left: -60,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${BASE_COLORS.orange}15`,
  },
  decorativeCircle3: {
    position: "absolute",
    bottom: -80,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: `${BASE_COLORS.success}15`,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    opacity: 0.8,
    textAlign: "center",
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBarContainer: {
    marginBottom: 10,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
  },
  progressPercentage: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  gridScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  columnWrapper: {
    justifyContent: "space-between",
    width: "100%",
  },
  levelCard: {
    width: width * 0.44,
    height: 175,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  levelCardGradient: {
    padding: 12, // Increased padding
    height: "100%",
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden",
  },
  decorativeShape: {
    position: "absolute",
    top: -25,
    right: -25,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)", // More subtle
  },
  decorativeShape2: {
    bottom: -35,
    left: -35,
    top: "auto",
    right: "auto",
    width: 80,
    height: 80,
  },
  levelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  levelNumberContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.25)", // Slightly more opaque
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  levelNumber: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: BASE_COLORS.white,
  },
  specialIconContainer: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  levelInfo: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 4,
  },
  levelTitle: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  levelMetadataRow: {
    flexDirection: "row",
    justifyContent: "flex-start", // Changed to flex-start
    marginBottom: 8, // Increased margin
  },
  focusAreaBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.25)", // Darker for better contrast
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  focusAreaText: {
    fontSize: 11,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    marginLeft: 5,
  },
  difficultyStarsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 4,
  },
  difficultyText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    marginLeft: 6,
  },
  contentArea: {
    flex: 1,
    position: "relative",
  },
  // Loading state styles
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    textAlign: "center",
  },
  // Error state styles
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    textAlign: "center",
    opacity: 0.8,
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BASE_COLORS.blue,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    marginLeft: 8,
  },
});

export default LevelSelection;
