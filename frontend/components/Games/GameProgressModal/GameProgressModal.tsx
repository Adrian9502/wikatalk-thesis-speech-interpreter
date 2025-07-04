import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { X, Clock, Target, Award, PlayCircle } from "react-native-feather";
import { formatTime } from "@/utils/gameUtils";
import useProgressStore from "@/store/games/useProgressStore";
import { GAME_GRADIENTS } from "@/constant/gameConstants";

// Import component types
import {
  GameProgressModalProps,
  EnhancedGameModeProgress,
} from "@/types/gameProgressTypes";

// Import the extracted components
import DifficultyCard from "./DifficultyCard";
import RecentAttempt from "./RecentAttempt";
import StatBox from "./StatBox";

const GameProgressModal: React.FC<GameProgressModalProps> = ({
  visible,
  onClose,
  gameMode,
  gameTitle,
}) => {
  const [progressData, setProgressData] =
    useState<EnhancedGameModeProgress | null>(null);

  // Subscribe to progress updates using lastUpdated
  const { getEnhancedGameProgress, isLoading, lastUpdated } =
    useProgressStore();

  // Memoize helper functions to prevent recreation on each render
  const getDifficultyColor = useCallback((diff: string): string => {
    switch (diff) {
      case "easy":
        return "#4CAF50";
      case "medium":
        return "#FF9800";
      case "hard":
        return "#F44336";
      default:
        return "#4CAF50";
    }
  }, []);

  const getDifficultyStars = useCallback((diff: string): string => {
    switch (diff) {
      case "easy":
        return "⭐";
      case "medium":
        return "⭐⭐";
      case "hard":
        return "⭐⭐⭐";
      default:
        return "⭐";
    }
  }, []);

  // Get the gradient colors for the current game mode
  const getGradientColors = useCallback((): [string, string] => {
    // Default gradient if the game mode isn't found
    const defaultGradient: [string, string] = ["#3B4DA3", "#251D79"];

    if (!gameMode) return defaultGradient;

    switch (gameMode) {
      case "multipleChoice":
        return GAME_GRADIENTS.multipleChoice as [string, string];
      case "identification":
        return GAME_GRADIENTS.identification as [string, string];
      case "fillBlanks":
        return GAME_GRADIENTS.fillBlanks as [string, string];
      default:
        return defaultGradient;
    }
  }, [gameMode]);

  // Fetch enhanced progress data when modal becomes visible or when progress updates
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!visible || !gameMode) return;

      try {
        console.log(`[GameProgressModal] Refreshing data for ${gameMode}`);
        const enhancedData = await getEnhancedGameProgress(gameMode);

        if (isMounted) {
          setProgressData(enhancedData);
          console.log(`[GameProgressModal] Data refreshed for ${gameMode}`);
        }
      } catch (error) {
        console.error("Failed to load progress data:", error);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      // Clear data when modal is hidden to free memory
      if (!visible) {
        setProgressData(null);
      }
    };
  }, [visible, gameMode, getEnhancedGameProgress, lastUpdated]); // Added lastUpdated dependency

  // Memoized content sections to prevent unnecessary re-renders
  const modalContent = useMemo(() => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={"small"} color={"#fff"} />
          <Text style={styles.loadingText}>Loading progress...</Text>
        </View>
      );
    }

    if (!progressData) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>
            No progress data available for this game mode.
          </Text>
          <Text style={styles.noDataSubtext}>
            Start playing to see your statistics!
          </Text>
        </View>
      );
    }

    return (
      <>
        {/* Overall Progress Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryLabel}>Overall Progress</Text>
            <View style={styles.completionBadge}>
              <Text style={styles.badgeText}>
                {Math.round(progressData.overallCompletionRate)}% COMPLETE
              </Text>
            </View>
          </View>
          <View style={styles.progressSummary}>
            <View style={styles.progressNumbers}>
              <Text style={styles.completedText}>
                {progressData.completedLevels}
              </Text>
              <Text style={styles.totalText}>
                / {progressData.totalLevels} Levels
              </Text>
            </View>
          </View>
          <Text style={styles.encouragementText}>
            {progressData.overallCompletionRate === 100
              ? "Perfect! You've mastered all levels!"
              : `${
                  progressData.totalLevels - progressData.completedLevels
                } more to go!`}
          </Text>
        </View>

        {/* Difficulty Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress by Difficulty</Text>
          {progressData.difficultyBreakdown.map((diffProgress) => (
            <DifficultyCard
              key={diffProgress.difficulty}
              diffProgress={diffProgress}
              getDifficultyColor={getDifficultyColor}
              getDifficultyStars={getDifficultyStars}
            />
          ))}
        </View>

        {/* Overall Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Statistics</Text>
          <View style={styles.statsGrid}>
            <StatBox
              icon={<Target width={20} height={20} color="#FFD700" />}
              value={`${Math.round(progressData.overallAverageScore)}%`}
              label="Success Rate"
            />
            <StatBox
              icon={<Clock width={20} height={20} color="#4CAF50" />}
              value={formatTime(progressData.totalTimeSpent)}
              label="Total Time"
            />
            <StatBox
              icon={<PlayCircle width={20} height={20} color="#2196F3" />}
              value={progressData.totalAttempts}
              label="Total Attempts"
            />
            <StatBox
              icon={<Award width={20} height={20} color="#9C27B0" />}
              value={progressData.correctAttempts}
              label="Correct"
            />
          </View>
        </View>

        {/* Recent Activity */}
        {progressData.recentAttempts &&
          progressData.recentAttempts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <View style={styles.attemptsContainer}>
                {progressData.recentAttempts
                  .slice(0, 5)
                  .map((attempt, index) => (
                    <RecentAttempt
                      key={`${attempt.levelId}-${attempt.attemptDate}-${index}`}
                      attempt={attempt}
                      index={index}
                    />
                  ))}
              </View>
            </View>
          )}
      </>
    );
  }, [isLoading, progressData, getDifficultyColor, getDifficultyStars]);

  // Don't render anything if the modal isn't visible to save resources
  if (!visible) return null;

  // Get the current gradient colors
  const gradientColors = getGradientColors();

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animatable.View
          animation="zoomIn"
          duration={300}
          style={styles.modalContainer}
          useNativeDriver={true}
        >
          <LinearGradient
            colors={gradientColors}
            style={styles.gradientBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.header}>
              <Text style={styles.title}>{gameTitle} Progress</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X width={20} height={20} color="#FFF" />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {modalContent}
            </ScrollView>
          </LinearGradient>
        </Animatable.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    flex: 1,
    maxHeight: "70%",
    borderRadius: 16,
    overflow: "hidden",
  },
  gradientBackground: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  title: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: "#FFF",
    textAlign: "center",
    marginLeft: 8,
  },
  closeButton: {
    position: "absolute",
    right: 0,
    padding: 6,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 20,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    minHeight: 200,
    marginTop: 170,
  },
  loadingText: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "#fff",
    marginTop: 10,
  },
  summaryCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#FFF",
  },
  completionBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: "Poppins-Medium",
    color: "#FFF",
  },
  progressSummary: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  progressNumbers: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  completedText: {
    fontSize: 32,
    fontFamily: "Poppins-Bold",
    color: "#FFD700",
  },
  totalText: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: "#FFF",
    marginLeft: 4,
  },
  encouragementText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "rgba(255,255,255,0.8)",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  attemptsContainer: {
    gap: 8,
  },
  noDataContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    textAlign: "center",
  },
  noDataSubtext: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    marginTop: 8,
  },
});

export default React.memo(GameProgressModal);
