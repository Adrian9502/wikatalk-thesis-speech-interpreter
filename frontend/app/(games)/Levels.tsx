import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { ArrowLeft, Star, BookOpen, AlertTriangle } from "react-native-feather";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import useThemeStore from "@/store/useThemeStore";
import { BASE_COLORS } from "@/constant/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import quizData from "@/utils/Games/quizQuestions.json";
import GameInfoModal from "@/components/Games/GameInfoModal";

const convertQuizToLevels = (gameMode) => {
  if (!quizData[gameMode]) return [];

  const difficulties = Object.keys(quizData[gameMode]);
  let allLevels = [];

  difficulties.forEach((difficulty, diffIndex) => {
    const difficultyQuestions = quizData[gameMode][difficulty] || [];

    const levelsFromDifficulty = difficultyQuestions.map((item, index) => {
      const overallIndex = diffIndex * 5 + index;
      // Make all levels either completed or current, never locked
      const status = overallIndex < 3 ? "completed" : "current";

      return {
        id: item.id,
        number: item.id,
        title: item.title || `Level ${item.id}`,
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
    });

    allLevels = [...allLevels, ...levelsFromDifficulty];
  });

  return allLevels;
};

const LevelSelection = () => {
  const params = useLocalSearchParams();
  const { gameMode, gameTitle } = params;
  const [levels, setLevels] = useState([]);
  const { activeTheme } = useThemeStore();

  // New state variables for modal
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (gameMode) {
      setLevels(convertQuizToLevels(gameMode));
    }
  }, [gameMode]);

  const completionPercentage =
    levels.length > 0
      ? (levels.filter((l) => l.status === "completed").length /
          levels.length) *
        100
      : 0;

  // Updated handleLevelSelect - now it just shows the modal
  const handleLevelSelect = (level) => {
    if (level.status === "locked") return;
    setSelectedLevel(level);
    setShowModal(true);
  };

  // New function to handle the START button press
  const handleStartGame = () => {
    if (!selectedLevel) return;

    setIsLoading(true);

    // Simulate loading (can be removed if not needed)
    setTimeout(() => {
      setIsLoading(false);
      setShowModal(false);

      // Navigate to Questions screen after modal is dismissed
      setTimeout(() => {
        router.push({
          pathname: "/(games)/Questions",
          params: {
            levelId: selectedLevel.id,
            gameMode,
            gameTitle,
            difficulty: selectedLevel.difficultyCategory,
            skipModal: "true", // Add this parameter to skip showing modal again
          },
        });
      }, 300);
    }, 1000);
  };

  const handleBack = () => {
    router.back();
  };

  const renderLevelCard = (level) => {
    const difficultyColors = {
      Easy: ["#4CAF50", "#2E7D32"],
      Medium: ["#FF9800", "#EF6C00"],
      Hard: ["#F44336", "#C62828"],
    };

    const gradientColors = difficultyColors[level.difficulty];

    const renderFocusIcon = () => {
      switch (level.focusArea) {
        case "Vocabulary":
          return <BookOpen width={14} height={14} color="#FFFFFF" />;
        case "Grammar":
          return <AlertTriangle width={14} height={14} color="#FFFFFF" />;
        case "Pronunciation":
          return <Star width={14} height={14} color="#FFFFFF" />;
        default:
          return <BookOpen width={14} height={14} color="#FFFFFF" />;
      }
    };

    return (
      <Animatable.View
        animation="fadeIn"
        duration={500}
        delay={level.id * 50}
        key={level.id}
      >
        <TouchableOpacity
          activeOpacity={0.8} // Same opacity for all levels
          onPress={() => handleLevelSelect(level)}
          // Removed disabled={level.status === "locked"}
          style={styles.levelCard} // Removed conditional styling
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.levelCardGradient}
          >
            <View style={styles.decorativeShape} />
            <View style={[styles.decorativeShape, styles.decorativeShape2]} />

            <View style={styles.levelHeader}>
              <View style={styles.levelNumberContainer}>
                <Text style={styles.levelNumber}>{level.number}</Text>
              </View>
              {/* Removed lock icon code */}
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelTitle}>{level.title}</Text>
              <View style={styles.levelMetadataRow}>
                <View style={styles.focusAreaBadge}>
                  {renderFocusIcon()}
                  <Text style={styles.focusAreaText}>{level.focusArea}</Text>
                </View>
                <View style={styles.difficultyBadge}>
                  <Text style={styles.difficultyText}>{level.difficulty}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animatable.View>
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
        <Animatable.View
          animation="fadeIn"
          duration={800}
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

        <ScrollView
          contentContainerStyle={styles.gridScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.levelGrid}>
            {levels.map((level) => renderLevelCard(level))}
          </View>
        </ScrollView>

        {/* Add GameInfoModal */}
        {selectedLevel && (
          <GameInfoModal
            visible={showModal}
            onClose={() => setShowModal(false)}
            onStart={handleStartGame}
            levelData={selectedLevel.questionData}
            gameMode={gameMode as string}
            isLoading={isLoading}
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
    fontSize: 14,
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
  },
  levelGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  levelCard: {
    width: width * 0.44,
    height: 150,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
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
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  decorativeShape2: {
    bottom: -30,
    left: -30,
    top: "auto",
    right: "auto",
    width: 60,
    height: 60,
  },
  levelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  levelNumberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  levelNumber: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: BASE_COLORS.white,
  },
  lockIconContainer: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
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
    paddingTop: 6,
  },
  levelTitle: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  levelMetadataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  focusAreaBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  focusAreaText: {
    fontSize: 10,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    marginLeft: 4,
  },
  difficultyBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 6,
  },
  difficultyText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
});

export default LevelSelection;
