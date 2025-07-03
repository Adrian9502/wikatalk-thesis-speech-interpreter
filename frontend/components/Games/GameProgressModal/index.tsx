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
import { useUserProgress } from "@/hooks/useUserProgress";
import useGameStore from "@/store/games/useGameStore";
import { getQuizCountByDifficulty } from "@/utils/quizCountUtils";

// Import component types
import {
  GameProgressModalProps,
  DifficultyProgress,
  LevelProgress,
  EnhancedGameModeProgress,
} from "@/types/gameProgressTypes";

// Import the extracted components
import DifficultyCard from "./DifficultyCard";
import RecentAttempt from "./RecentAttempt";
import StatBox from "./StatBox";
import DotsLoader from "@/components/DotLoader";

const GameProgressModal: React.FC<GameProgressModalProps> = ({
  visible,
  onClose,
  gameMode,
  gameTitle,
}) => {
  const [progressData, setProgressData] =
    useState<EnhancedGameModeProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { progress: globalProgress } = useUserProgress("global");
  const { questions } = useGameStore();

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

  // Memoized calculation function
  const calculateEnhancedProgress = useCallback(() => {
    if (!Array.isArray(globalProgress) || !questions[gameMode]) {
      setProgressData(null);
      setIsLoading(false);
      return;
    }

    try {
      // Get all questions for this game mode
      const modeQuestions = questions[gameMode];
      const difficulties: ("easy" | "medium" | "hard")[] = [
        "easy",
        "medium",
        "hard",
      ];

      const expectedCounts = {
        easy: getQuizCountByDifficulty(gameMode, "easy"),
        medium: getQuizCountByDifficulty(gameMode, "medium"),
        hard: getQuizCountByDifficulty(gameMode, "hard"),
      };

      // Calculate progress for each difficulty
      const difficultyBreakdown: DifficultyProgress[] = difficulties.map(
        (difficulty) => {
          const difficultyQuestions = modeQuestions[difficulty] || [];
          const totalLevels = Math.max(
            difficultyQuestions.length,
            expectedCounts[difficulty]
          );

          // Find progress entries for this difficulty
          const difficultyProgress = globalProgress.filter((entry) => {
            // Find the question that matches this progress entry
            const question = difficultyQuestions.find(
              (q) =>
                String(q.id) === String(entry.quizId) ||
                String(q.questionId) === String(entry.quizId)
            );
            return !!question;
          });

          // Calculate level-by-level progress
          const levels: LevelProgress[] = difficultyQuestions.map(
            (question) => {
              const questionId = String(question.id || question.questionId);
              const levelProgress = difficultyProgress.find(
                (p) => String(p.quizId) === questionId
              );

              const attempts = levelProgress?.attempts || [];
              const totalAttempts = attempts.length;
              const correctAttempts = attempts.filter(
                (a: any) => a.isCorrect
              ).length;
              const totalTimeSpent = levelProgress?.totalTimeSpent || 0;
              const bestTime =
                attempts.length > 0
                  ? Math.min(
                      ...attempts
                        .map((a: any) => a.timeSpent || 0)
                        .filter((t) => t > 0)
                    )
                  : 0;

              // Extract level number and create better title
              const levelString = question.level || `Level ${questionId}`;
              const levelTitle = question.title || "Untitled";
              const displayTitle = `${levelString}: ${levelTitle}`;

              return {
                levelId: questionId,
                difficulty,
                title: displayTitle,
                isCompleted: levelProgress?.completed || false,
                totalAttempts,
                correctAttempts,
                totalTimeSpent,
                bestTime,
                lastAttemptDate: levelProgress?.lastAttemptDate,
                recentAttempts: attempts.slice(0, 3),
              };
            }
          );

          // Add placeholder levels for missing questions
          const missingCount = Math.max(
            0,
            expectedCounts[difficulty] - difficultyQuestions.length
          );
          for (let i = 0; i < missingCount; i++) {
            const levelNumber = difficultyQuestions.length + i + 1;
            levels.push({
              levelId: `placeholder_${difficulty}_${levelNumber}`,
              difficulty,
              title: `Level ${levelNumber}: Coming Soon`,
              isCompleted: false,
              totalAttempts: 0,
              correctAttempts: 0,
              totalTimeSpent: 0,
              bestTime: 0,
              recentAttempts: [],
            });
          }

          // Calculate difficulty statistics
          const completedLevels = levels.filter((l) => l.isCompleted).length;
          const totalAttempts = levels.reduce(
            (sum, l) => sum + l.totalAttempts,
            0
          );
          const correctAttempts = levels.reduce(
            (sum, l) => sum + l.correctAttempts,
            0
          );
          const totalTimeSpent = levels.reduce(
            (sum, l) => sum + l.totalTimeSpent,
            0
          );
          const completionRate =
            totalLevels > 0 ? (completedLevels / totalLevels) * 100 : 0;
          const averageScore =
            totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

          const allTimes = levels
            .flatMap((l) => l.recentAttempts.map((a: any) => a.timeSpent || 0))
            .filter((t) => t > 0);
          const bestTime = allTimes.length > 0 ? Math.min(...allTimes) : 0;
          const worstTime = allTimes.length > 0 ? Math.max(...allTimes) : 0;

          return {
            difficulty,
            totalLevels,
            completedLevels,
            totalAttempts,
            correctAttempts,
            totalTimeSpent,
            completionRate,
            averageScore,
            bestTime,
            worstTime,
            levels,
          };
        }
      );

      // Calculate overall statistics
      const totalLevels = difficultyBreakdown.reduce(
        (sum, d) => sum + d.totalLevels,
        0
      );
      const completedLevels = difficultyBreakdown.reduce(
        (sum, d) => sum + d.completedLevels,
        0
      );
      const totalAttempts = difficultyBreakdown.reduce(
        (sum, d) => sum + d.totalAttempts,
        0
      );
      const correctAttempts = difficultyBreakdown.reduce(
        (sum, d) => sum + d.correctAttempts,
        0
      );
      const totalTimeSpent = difficultyBreakdown.reduce(
        (sum, d) => sum + d.totalTimeSpent,
        0
      );
      const overallCompletionRate =
        totalLevels > 0 ? (completedLevels / totalLevels) * 100 : 0;
      const overallAverageScore =
        totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

      const allTimes = difficultyBreakdown
        .flatMap((d) =>
          d.levels.flatMap((l) =>
            l.recentAttempts.map((a: any) => a.timeSpent || 0)
          )
        )
        .filter((t) => t > 0);
      const bestTime = allTimes.length > 0 ? Math.min(...allTimes) : 0;
      const worstTime = allTimes.length > 0 ? Math.max(...allTimes) : 0;

      // Collect recent attempts from all difficulties
      const recentAttempts = difficultyBreakdown
        .flatMap((d) =>
          d.levels.flatMap((l) =>
            l.recentAttempts.map((a) => ({
              ...a,
              levelId: l.levelId,
              levelTitle: l.title,
              difficulty: d.difficulty,
            }))
          )
        )
        .sort(
          (a, b) =>
            new Date(b.attemptDate).getTime() -
            new Date(a.attemptDate).getTime()
        )
        .slice(0, 10);

      const finalProgressData: EnhancedGameModeProgress = {
        totalLevels,
        completedLevels,
        totalTimeSpent,
        totalAttempts,
        correctAttempts,
        overallCompletionRate,
        overallAverageScore,
        bestTime,
        worstTime,
        difficultyBreakdown,
        recentAttempts,
      };

      setProgressData(finalProgressData);
      setIsLoading(false);
    } catch (error) {
      if (__DEV__) {
        console.error(
          `[GameProgressModal] Error calculating enhanced progress:`,
          error
        );
      }
      setProgressData(null);
      setIsLoading(false);
    }
  }, [globalProgress, questions, gameMode]);

  // Optimize effect by properly cleaning up and handling visibility changes
  useEffect(() => {
    let isMounted = true;
    let calculationTimer: NodeJS.Timeout;

    if (visible && globalProgress && questions) {
      setIsLoading(true);
      // Slight delay to allow UI to render loading state first
      calculationTimer = setTimeout(() => {
        if (isMounted) {
          calculateEnhancedProgress();
        }
      }, 50);
    } else if (!visible) {
      // Clear data when modal is hidden to free memory
      setProgressData(null);
      setIsLoading(false);
    }

    // Cleanup function
    return () => {
      isMounted = false;
      if (calculationTimer) {
        clearTimeout(calculationTimer);
      }
    };
  }, [visible, globalProgress, gameMode, questions, calculateEnhancedProgress]);

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
            colors={["#3B4DA3", "#251D79"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBackground}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{gameTitle} Progress</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <X width={18} height={18} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={true} // Optimize for off-screen content
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
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.2)",
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
