import React, { useState, useEffect } from "react";
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
import {
  X,
  Clock,
  Target,
  Award,
  CheckCircle,
  XCircle,
  PlayCircle,
} from "react-native-feather";
import { formatTime } from "@/utils/gameUtils";
import { useUserProgress } from "@/hooks/useUserProgress";
import useGameStore from "@/store/games/useGameStore";

interface GameProgressModalProps {
  visible: boolean;
  onClose: () => void;
  gameMode: string;
  gameTitle: string;
}

interface DifficultyProgress {
  difficulty: "easy" | "medium" | "hard";
  totalLevels: number;
  completedLevels: number;
  totalAttempts: number;
  correctAttempts: number;
  totalTimeSpent: number;
  completionRate: number;
  averageScore: number;
  bestTime: number;
  worstTime: number;
  levels: LevelProgress[];
}

interface LevelProgress {
  levelId: string;
  difficulty: "easy" | "medium" | "hard";
  title: string;
  isCompleted: boolean;
  totalAttempts: number;
  correctAttempts: number;
  totalTimeSpent: number;
  bestTime: number;
  lastAttemptDate?: string;
  recentAttempts: any[];
}

interface EnhancedGameModeProgress {
  totalLevels: number;
  completedLevels: number;
  totalTimeSpent: number;
  totalAttempts: number;
  correctAttempts: number;
  overallCompletionRate: number;
  overallAverageScore: number;
  bestTime: number;
  worstTime: number;
  difficultyBreakdown: DifficultyProgress[];
  recentAttempts: any[];
}

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

  useEffect(() => {
    if (visible && globalProgress && questions) {
      console.log("[GameProgressModal] useEffect triggered for", gameMode);
      setIsLoading(true);
      setTimeout(() => {
        calculateEnhancedProgress();
      }, 50);
    } else if (!visible) {
      setProgressData(null);
      setIsLoading(false);
    }
  }, [visible, globalProgress, gameMode, questions]);

  const calculateEnhancedProgress = () => {
    console.log(
      `[GameProgressModal] Calculating enhanced progress for ${gameMode}`
    );

    if (!Array.isArray(globalProgress) || !questions[gameMode]) {
      console.log(
        `[GameProgressModal] Missing data - globalProgress: ${Array.isArray(
          globalProgress
        )}, questions: ${!!questions[gameMode]}`
      );
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

      // Expected counts based on your specification
      const expectedCounts = {
        easy: 10,
        medium: 20,
        hard: 20,
      };

      console.log(`[GameProgressModal] Mode questions structure:`, {
        easy: modeQuestions.easy?.length || 0,
        medium: modeQuestions.medium?.length || 0,
        hard: modeQuestions.hard?.length || 0,
      });

      // Calculate progress for each difficulty
      const difficultyBreakdown: DifficultyProgress[] = difficulties.map(
        (difficulty) => {
          const difficultyQuestions = modeQuestions[difficulty] || [];
          const totalLevels = Math.max(
            difficultyQuestions.length,
            expectedCounts[difficulty]
          );

          console.log(
            `[GameProgressModal] Processing ${difficulty}: ${difficultyQuestions.length} actual, ${expectedCounts[difficulty]} expected`
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

          console.log(
            `[GameProgressModal] Found ${difficultyProgress.length} progress entries for ${difficulty}`
          );

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

              // ENHANCED: Extract level number and create better title
              const levelString = question.level || `Level ${questionId}`;
              const levelTitle = question.title || "Untitled";
              const displayTitle = `${levelString}: ${levelTitle}`;

              return {
                levelId: questionId,
                difficulty,
                title: displayTitle, // Now includes level number
                isCompleted: levelProgress?.completed || false,
                totalAttempts,
                correctAttempts,
                totalTimeSpent,
                bestTime,
                lastAttemptDate: levelProgress?.lastAttemptDate,
                recentAttempts: attempts.slice(0, 3), // Last 3 attempts per level
              };
            }
          );

          // Add placeholder levels for missing questions (to reach expected count)
          const missingCount = Math.max(
            0,
            expectedCounts[difficulty] - difficultyQuestions.length
          );
          for (let i = 0; i < missingCount; i++) {
            const levelNumber = difficultyQuestions.length + i + 1;
            levels.push({
              levelId: `placeholder_${difficulty}_${levelNumber}`,
              difficulty,
              title: `Level ${levelNumber}: Coming Soon`, // ENHANCED: Better placeholder title
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
              levelTitle: l.title, // This now includes the level number
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

      console.log(`[GameProgressModal] Final enhanced progress:`, {
        totalLevels,
        completedLevels,
        difficulties: difficultyBreakdown.map((d) => ({
          difficulty: d.difficulty,
          total: d.totalLevels,
          completed: d.completedLevels,
        })),
      });

      setProgressData(finalProgressData);
      setIsLoading(false);
    } catch (error) {
      console.error(
        `[GameProgressModal] Error calculating enhanced progress:`,
        error
      );
      setProgressData(null);
      setIsLoading(false);
    }
  };

  // ENHANCED: Updated renderRecentAttempt with better styling for level titles
  const renderRecentAttempt = (attempt: any, index: number) => (
    <Animatable.View
      key={`${attempt.levelId}-${attempt.attemptDate}-${index}`}
      animation="fadeInUp"
      delay={index * 50}
      style={styles.attemptItem}
    >
      <View style={styles.attemptHeader}>
        <View style={styles.attemptTitleRow}>
          <Text style={styles.attemptLevel} numberOfLines={1}>
            {attempt.levelTitle}
          </Text>
          <View style={styles.difficultyBadgeSmall}>
            <Text style={styles.attemptDifficulty}>
              {attempt.difficulty?.charAt(0).toUpperCase() +
                attempt.difficulty?.slice(1)}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.attemptResult,
            { backgroundColor: attempt.isCorrect ? "#4CAF50" : "#F44336" },
          ]}
        >
          {attempt.isCorrect ? (
            <CheckCircle width={12} height={12} color="#fff" />
          ) : (
            <XCircle width={12} height={12} color="#fff" />
          )}
        </View>
      </View>
      <View style={styles.attemptDetails}>
        <Text style={styles.attemptTime}>
          <Clock width={12} height={12} color="#fff" />{" "}
          {formatTime(attempt.timeSpent || 0)}
        </Text>
        <Text style={styles.attemptDate}>
          {new Date(attempt.attemptDate).toLocaleDateString()}
        </Text>
      </View>
    </Animatable.View>
  );

  const renderDifficultyCard = (diffProgress: DifficultyProgress) => {
    const getDifficultyColor = (diff: string) => {
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
    };

    const getDifficultyStars = (diff: string) => {
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
    };

    return (
      <View key={diffProgress.difficulty} style={styles.difficultyCard}>
        <View style={styles.difficultyHeader}>
          <View style={styles.difficultyTitleRow}>
            <Text style={styles.difficultyStars}>
              {getDifficultyStars(diffProgress.difficulty)}
            </Text>
            <Text style={styles.difficultyTitle}>
              {diffProgress.difficulty.charAt(0).toUpperCase() +
                diffProgress.difficulty.slice(1)}
            </Text>
          </View>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(diffProgress.difficulty) },
            ]}
          >
            <Text style={styles.difficultyBadgeText}>
              {diffProgress.completedLevels}/{diffProgress.totalLevels}
            </Text>
          </View>
        </View>

        <View style={styles.difficultyStats}>
          <View style={styles.difficultyStatItem}>
            <Text style={styles.difficultyStatLabel}>Completion</Text>
            <Text style={styles.difficultyStatValue}>
              {Math.round(diffProgress.completionRate)}%
            </Text>
          </View>
          <View style={styles.difficultyStatItem}>
            <Text style={styles.difficultyStatLabel}>Attempts</Text>
            <Text style={styles.difficultyStatValue}>
              {diffProgress.totalAttempts}
            </Text>
          </View>
          <View style={styles.difficultyStatItem}>
            <Text style={styles.difficultyStatLabel}>Success Rate</Text>
            <Text style={styles.difficultyStatValue}>
              {Math.round(diffProgress.averageScore)}%
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${diffProgress.completionRate}%`,
                  backgroundColor: getDifficultyColor(diffProgress.difficulty),
                },
              ]}
            />
          </View>
          <Text style={styles.progressBarText}>
            {Math.round(diffProgress.completionRate)}% Complete
          </Text>
        </View>
      </View>
    );
  };

  console.log(
    `[GameProgressModal] Rendering - visible: ${visible}, isLoading: ${isLoading}, progressData: ${!!progressData}`
  );

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent={true}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <Animatable.View
          animation="zoomIn"
          duration={300}
          style={styles.modalContainer}
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
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X width={18} height={18} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#FFD700" />
                  <Text style={styles.loadingText}>Loading progress...</Text>
                </View>
              ) : progressData ? (
                <>
                  {/* Overall Progress Summary */}
                  <View style={styles.summaryCard}>
                    <View style={styles.summaryHeader}>
                      <Text style={styles.summaryLabel}>Overall Progress</Text>
                      <View style={styles.completionBadge}>
                        <Text style={styles.badgeText}>
                          {Math.round(progressData.overallCompletionRate)}%
                          COMPLETE
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
                            progressData.totalLevels -
                            progressData.completedLevels
                          } more to go!`}
                    </Text>
                  </View>

                  {/* Difficulty Breakdown */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      Progress by Difficulty
                    </Text>
                    {progressData.difficultyBreakdown.map(renderDifficultyCard)}
                  </View>

                  {/* Overall Stats */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Overall Statistics</Text>
                    <View style={styles.statsGrid}>
                      <View style={styles.statBox}>
                        <Target width={20} height={20} color="#FFD700" />
                        <Text style={styles.statValue}>
                          {Math.round(progressData.overallAverageScore)}%
                        </Text>
                        <Text style={styles.statLabel}>Success Rate</Text>
                      </View>
                      <View style={styles.statBox}>
                        <Clock width={20} height={20} color="#4CAF50" />
                        <Text style={styles.statValue}>
                          {formatTime(progressData.totalTimeSpent)}
                        </Text>
                        <Text style={styles.statLabel}>Total Time</Text>
                      </View>
                      <View style={styles.statBox}>
                        <PlayCircle width={20} height={20} color="#2196F3" />
                        <Text style={styles.statValue}>
                          {progressData.totalAttempts}
                        </Text>
                        <Text style={styles.statLabel}>Total Attempts</Text>
                      </View>
                      <View style={styles.statBox}>
                        <Award width={20} height={20} color="#9C27B0" />
                        <Text style={styles.statValue}>
                          {progressData.correctAttempts}
                        </Text>
                        <Text style={styles.statLabel}>Correct</Text>
                      </View>
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
                            .map(renderRecentAttempt)}
                        </View>
                      </View>
                    )}

                  {/* Motivational Message */}
                  <View style={styles.section}>
                    <View style={styles.motivationCard}>
                      <Text style={styles.motivationText}>
                        {progressData.overallCompletionRate === 100
                          ? "🏆 Congratulations! You've mastered this game mode!"
                          : progressData.overallCompletionRate >= 70
                          ? "🎯 Excellent progress! You're almost there!"
                          : progressData.overallCompletionRate >= 30
                          ? "💪 Good work! Keep practicing to improve!"
                          : "🚀 Great start! Every expert was once a beginner!"}
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>
                    No progress data available for this game mode.
                  </Text>
                  <Text style={styles.noDataSubtext}>
                    Start playing to see your statistics!
                  </Text>
                </View>
              )}
            </ScrollView>
          </LinearGradient>
        </Animatable.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // ENHANCED: Updated attempt styles for better level display
  attemptTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginRight: 8,
  },
  attemptLevel: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    flex: 1,
    marginRight: 8,
  },
  difficultyBadgeSmall: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  attemptDifficulty: {
    fontSize: 9,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.8)",
  },
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
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
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
  // Difficulty Cards
  difficultyCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  difficultyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  difficultyTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  difficultyStars: {
    fontSize: 16,
    marginRight: 8,
  },
  difficultyTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyBadgeText: {
    fontSize: 12,
    fontFamily: "Poppins-Bold",
    color: "#FFF",
  },
  difficultyStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  difficultyStatItem: {
    alignItems: "center",
    flex: 1,
  },
  difficultyStatLabel: {
    fontSize: 11,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 2,
  },
  difficultyStatValue: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: "#fff",
  },
  progressBarContainer: {
    alignItems: "center",
  },
  progressBarBackground: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressBarText: {
    fontSize: 11,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.7)",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  statBox: {
    width: "47%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  statValue: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "#fff",
    marginTop: 6,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
  attemptsContainer: {
    gap: 8,
  },
  attemptItem: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    padding: 12,
  },
  attemptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  attemptResult: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  attemptDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  attemptTime: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.7)",
  },
  attemptDate: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.5)",
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
  motivationCard: {
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
  },
  motivationText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default GameProgressModal;
