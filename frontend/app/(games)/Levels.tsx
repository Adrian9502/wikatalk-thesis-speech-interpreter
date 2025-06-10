import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  FlatList,
} from "react-native";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocalSearchParams, router } from "expo-router";
import {
  ArrowLeft,
  Star,
  AlertTriangle,
  RefreshCw,
  Lock,
} from "react-native-feather";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import useThemeStore from "@/store/useThemeStore";
import { BASE_COLORS } from "@/constant/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import GameInfoModal from "@/components/games/GameInfoModal";
import useQuizStore from "@/store/games/useQuizStore";
import DotsLoader from "@/components/DotLoader";
import { LevelData, QuizQuestions } from "@/types/gameTypes";
import { renderFocusIcon } from "@/utils/games/renderFocusIcon";
import { getStarCount, formatDifficulty } from "@/utils/games/difficultyUtils";

// Update convertQuizToLevels to handle type safety
const convertQuizToLevels = (
  gameMode: string,
  quizData: QuizQuestions
): LevelData[] => {
  console.log(`Attempting to convert ${gameMode} data`);

  // Ensure gameMode is a string, not an array
  const safeGameMode =
    typeof gameMode === "string" ? gameMode : String(gameMode);

  // Check if the gameMode exists in quizData
  if (!quizData[safeGameMode]) return [];

  // Get difficulties and ensure they're strings
  const difficulties = Object.keys(quizData[safeGameMode]);
  console.log(`Found difficulties for ${safeGameMode}:`, difficulties);

  // First, collect all questions from all difficulties
  let allQuestions: any[] = [];

  difficulties.forEach((difficulty: string | any) => {
    // Ensure difficulty is a string, not an array
    const difficultyKey =
      typeof difficulty === "string"
        ? difficulty
        : Array.isArray(difficulty) && difficulty.length > 0
        ? String(difficulty[0])
        : "easy";

    // Access the questions using the safe string key
    const difficultyQuestions = quizData[safeGameMode][difficultyKey] || [];
    console.log(
      `${safeGameMode}/${difficultyKey}: ${difficultyQuestions.length} questions`
    );

    // Add all questions with their difficulty
    difficultyQuestions.forEach((question: any) => {
      allQuestions.push({
        ...question,
        difficultyCategory: difficultyKey,
      });
    });
  });

  // Sort all questions by their questionId or id
  allQuestions.sort((a: any, b: any) => {
    const idA = a.questionId || a.id || 0;
    const idB = b.questionId || b.id || 0;
    return idA - idB;
  });

  // Now map the sorted questions to level objects
  const allLevels: LevelData[] = allQuestions.map(
    (item: any, index: number) => {
      // Make all levels either completed or current
      const status = index < 3 ? "completed" : "current";

      // Create a level with the proper id and number
      const level: LevelData = {
        id: item.questionId || item.id || index + 1,
        number: item.questionId || item.id || index + 1,
        levelString:
          item.level || `Level ${item.questionId || item.id || index + 1}`,
        title: item.title || `Level ${item.questionId || item.id || index + 1}`,
        description: item.description || "Practice your skills",
        difficulty:
          typeof item.difficultyCategory === "string"
            ? item.difficultyCategory.charAt(0).toUpperCase() +
              item.difficultyCategory.slice(1)
            : "Easy",
        status: status as "completed" | "current" | "locked",
        stars: status === "completed" ? 3 : Math.floor(Math.random() * 3),
        focusArea: item.focusArea
          ? item.focusArea.charAt(0).toUpperCase() + item.focusArea.slice(1)
          : item.description?.includes("grammar")
          ? "Grammar"
          : item.description?.includes("pronunciation")
          ? "Pronunciation"
          : "Vocabulary",
        questionData: item,
        difficultyCategory: item.difficultyCategory || "easy",
      };

      return level;
    }
  );

  console.log(
    `Converted ${allLevels.length} levels for ${gameMode} in proper order`
  );
  return allLevels;
};

// Fix LevelCard interface
interface LevelCardProps {
  level: LevelData;
  onSelect: (level: LevelData) => void;
  gradientColors: readonly [string, string];
}

const LevelCard = React.memo(
  ({ level, onSelect, gradientColors }: LevelCardProps) => {
    // Pull out needed props with type assertion to handle possible undefined
    const {
      levelString = "",
      title = "",
      difficulty = "Easy",
      status = "current",
      focusArea = "Vocabulary",
    } = level || {};

    const starCount = getStarCount(difficulty);

    return (
      <TouchableOpacity
        style={styles.levelCard}
        onPress={() => onSelect(level)}
        activeOpacity={0.8}
        disabled={status === "locked"}
      >
        <LinearGradient
          colors={gradientColors}
          style={styles.levelCardGradient}
        >
          {/* Decorative elements */}
          <View style={styles.decorativeShape} />
          <View style={[styles.decorativeShape, styles.decorativeShape2]} />

          {/* Card header with level number and lock status */}
          <View style={styles.levelHeader}>
            <View style={styles.levelNumberContainer}>
              <Text style={styles.levelNumber}>
                {levelString.replace(/^Level\s+/, "")}
              </Text>
            </View>
            <View style={styles.specialIconContainer}>
              {status === "locked" ? (
                <Lock width={18} height={18} color={BASE_COLORS.white} />
              ) : null}
            </View>
          </View>

          {/* Card content with title and metadata */}
          <View style={styles.levelInfo}>
            <Text
              style={styles.levelTitle}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {title}
            </Text>

            {/* Focus area badge */}
            <View style={styles.levelMetadataRow}>
              <View style={styles.focusAreaBadge}>
                {renderFocusIcon(focusArea)}
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
              <Text style={styles.difficultyText}>
                {formatDifficulty(difficulty)}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }
);

const LevelSelection = () => {
  const params = useLocalSearchParams();
  const { gameMode, gameTitle } = params;
  const [levels, setLevels] = useState<LevelData[]>([]);
  const { activeTheme } = useThemeStore();

  // Get quiz store methods - only use store's loading and error states
  const { fetchQuestionsByMode, questions, isLoading, error } = useQuizStore();

  // Modal state variables
  const [selectedLevel, setSelectedLevel] = useState<LevelData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showLevels, setShowLevels] = useState(false);

  // Fetch level data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (gameMode) {
        try {
          // Remove cache clearing for now
          // Uncomment line below if you want to clear cache before fetching

          // await clearCache();

          await fetchQuestionsByMode(gameMode as string);
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
          questions[gameMode as string]
            ? Object.keys(questions[gameMode as string]).map((diff) => {
                // Need to cast the array to any[] to avoid 'never' type errors
                const questionArray = questions[gameMode as string][
                  diff
                ] as any[];
                return `${diff}: ${questionArray?.length || 0}`;
              })
            : "No questions data"
        );

        // Then ensure gameMode is always a string
        const safeGameMode =
          typeof gameMode === "string" ? gameMode : String(gameMode);

        // Convert the questions data safely - add type assertion to avoid 'never' issues
        const currentLevels = convertQuizToLevels(
          safeGameMode,
          questions as QuizQuestions
        );
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

  // Memoize the level select handler with immediate execution priority
  const handleLevelSelect = useCallback((level: LevelData) => {
    if (level.status === "locked") return;

    // Use requestAnimationFrame to prioritize UI update
    requestAnimationFrame(() => {
      setSelectedLevel(level);
      setShowModal(true);
    });
  }, []);

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

  const handleRetry = async () => {
    if (gameMode) {
      try {
        await fetchQuestionsByMode(
          typeof gameMode === "string" ? gameMode : String(gameMode)
        );
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
  const handleCloseModal = () => {
    setShowModal(false);
  };
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

  // Update FlatList state and key extractor
  const keyExtractor = useCallback((item: LevelData) => item.id.toString(), []);

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
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.gridScrollContent}
          showsVerticalScrollIndicator={false}
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
            onClose={handleCloseModal}
            onStart={handleStartGame}
            levelData={selectedLevel.questionData}
            gameMode={
              typeof gameMode === "string" ? gameMode : String(gameMode)
            }
            isLoading={isLoading}
            difficulty={selectedLevel.difficultyCategory}
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
    padding: 12,
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
    lineHeight: 20,
    height: 40,
  },
  levelMetadataRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 8,
  },
  focusAreaBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.25)",
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
