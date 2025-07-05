import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  InteractionManager,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { X, Clock, Target, Award, PlayCircle } from "react-native-feather";
import { formatTime } from "@/utils/gameUtils";
import useProgressStore from "@/store/games/useProgressStore";
import { GAME_GRADIENTS } from "@/constant/gameConstants";
import { isProgressDataPrecomputed } from "@/store/useSplashStore";

// Import component types
import {
  GameProgressModalProps,
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
  // Optimized state management
  const [progressData, setProgressData] =
    useState<EnhancedGameModeProgress | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [contentReady, setContentReady] = useState(false);

  // Animation refs for better control
  const overlayRef = useRef<Animatable.View>(null);
  const modalRef = useRef<Animatable.View>(null);

  const { getEnhancedGameProgress } = useProgressStore();

  // Ultra-fast data loading - synchronous when possible
  useEffect(() => {
    if (!visible || !gameMode) {
      // Reset all states when modal closes
      setProgressData(null);
      setIsDataLoading(false);
      setHasError(false);
      setContentReady(false);
      return;
    }

    // Load data synchronously when possible
    const loadData = () => {
      const startTime = Date.now();

      try {
        // Priority 1: Check precomputed data (synchronous)
        if (isProgressDataPrecomputed()) {
          const { enhancedProgress } = useProgressStore.getState();
          const precomputedData = enhancedProgress[gameMode];

          if (precomputedData) {
            const loadTime = Date.now() - startTime;
            console.log(
              `[GameProgressModal] Precomputed data loaded for ${gameMode} in ${loadTime}ms`
            );

            // Set data immediately
            setProgressData(precomputedData);
            setIsDataLoading(false);
            setHasError(false);

            // Use InteractionManager to set content ready after animations
            InteractionManager.runAfterInteractions(() => {
              setContentReady(true);
            });
            return;
          }
        }

        // Priority 2: Check store cache (synchronous)
        const { enhancedProgress } = useProgressStore.getState();
        const cachedData = enhancedProgress[gameMode];

        if (cachedData) {
          const loadTime = Date.now() - startTime;
          console.log(
            `[GameProgressModal] Cached data loaded for ${gameMode} in ${loadTime}ms`
          );

          setProgressData(cachedData);
          setIsDataLoading(false);
          setHasError(false);

          InteractionManager.runAfterInteractions(() => {
            setContentReady(true);
          });
          return;
        }

        // Priority 3: Need to load data (asynchronous - rare case)
        console.log(
          `[GameProgressModal] Loading fresh data for ${gameMode}...`
        );
        setIsDataLoading(true);
        setHasError(false);

        // Load asynchronously
        getEnhancedGameProgress(gameMode)
          .then((data) => {
            const loadTime = Date.now() - startTime;
            console.log(
              `[GameProgressModal] Fresh data loaded for ${gameMode} in ${loadTime}ms`
            );

            setProgressData(data);
            setIsDataLoading(false);
            setHasError(!data);

            InteractionManager.runAfterInteractions(() => {
              setContentReady(true);
            });
          })
          .catch((error) => {
            console.error(
              `[GameProgressModal] Error loading data for ${gameMode}:`,
              error
            );
            setIsDataLoading(false);
            setHasError(true);
            setContentReady(true);
          });
      } catch (error) {
        console.error(`[GameProgressModal] Sync error:`, error);
        setIsDataLoading(false);
        setHasError(true);
        setContentReady(true);
      }
    };

    // Execute immediately
    loadData();
  }, [visible, gameMode, getEnhancedGameProgress]);

  // Optimized helper functions - stable references
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

  // Memoized gradient colors
  const gradientColors = useMemo((): [string, string] => {
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

  // Optimized close handler
  const handleClose = useCallback(() => {
    // Animate out smoothly
    if (overlayRef.current && modalRef.current) {
      onClose();
    } else {
      onClose();
    }
  }, [onClose]);

  const laoding = true;

  // Content renderer - memoized and optimized
  const renderContent = useCallback(() => {
    // Quick loading state for rare cases
    // isDataLoading && !progressData
    if ((isDataLoading && !progressData) || !contentReady) {
      return (
        <View style={styles.quickLoadingContainer}>
          <ActivityIndicator size="small" color="#fff" />
        </View>
      );
    }

    // Error state
    if (hasError || !progressData) {
      return (
        <View style={styles.errorContainer}>
          <Target width={32} height={32} color="rgba(255,255,255,0.6)" />
          <Text style={styles.errorText}>
            {hasError
              ? "Failed to load progress data"
              : "No progress data available"}
          </Text>
          <Text style={styles.errorSubtext}>
            {hasError
              ? "Please try again later"
              : "Start playing to see your statistics!"}
          </Text>
        </View>
      );
    }

    // Main content - render only when ready

    return (
      <Animatable.View animation="fadeIn" duration={300} useNativeDriver={true}>
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
      </Animatable.View>
    );
  }, [
    isDataLoading,
    progressData,
    hasError,
    contentReady,
    getDifficultyColor,
    getDifficultyStars,
  ]);

  // Don't render if not visible
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={handleClose}
      hardwareAccelerated={true}
    >
      <Animatable.View
        ref={overlayRef}
        animation="fadeIn"
        duration={300}
        style={styles.overlay}
        useNativeDriver={true}
      >
        <Animatable.View
          ref={modalRef}
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
            {/* Header - always visible for immediate feedback */}
            <View style={styles.header}>
              <Text style={styles.title}>{gameTitle} Progress</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                activeOpacity={0.7}
              >
                <X width={20} height={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              removeClippedSubviews={false}
              keyboardShouldPersistTaps="handled"
            >
              {renderContent()}
            </ScrollView>
          </LinearGradient>
        </Animatable.View>
      </Animatable.View>
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
    height: "60%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 10,
  },

  // Quick loading state
  quickLoadingContainer: {
    marginTop: 100,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    gap: 12,
  },
  quickLoadingText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.8)",
  },

  // Preparing state
  preparingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },

  // Error state
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
  },

  // Content styles
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
});

export default React.memo(GameProgressModal);
