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
  RefreshControl,
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

const GameProgressModal: React.FC<GameProgressModalProps> = ({
  visible,
  onClose,
  gameMode,
  gameTitle,
}) => {
  // Add a unique instance ID to track this specific modal instance
  const instanceId = useRef(Date.now()).current;

  // Performance tracking with instance ID
  const mountTimeRef = useRef<number>(0);

  // Log with instance ID to see which modal is which
  useEffect(() => {
    if (visible) {
      mountTimeRef.current = Date.now();
      console.log(
        `[GameProgressModal-${instanceId}] Started mounting at ${mountTimeRef.current}`
      );

      return () => {
        console.log(
          `[GameProgressModal-${instanceId}] Unmounted after ${
            Date.now() - mountTimeRef.current
          }ms`
        );
      };
    }
  }, [visible, instanceId]);

  // Optimized state management
  const [progressData, setProgressData] =
    useState<EnhancedGameModeProgress | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [contentReady, setContentReady] = useState(false);

  // Animation refs for better control
  const overlayRef = useRef<Animatable.View>(null);
  const modalRef = useRef<Animatable.View>(null);

  // Add missing ref for tracking request IDs
  const latestRequestIdRef = useRef<number>(0);

  // IMPORTANT FIX: Subscribe to lastUpdated to detect progress changes
  const { getEnhancedGameProgress, lastUpdated } = useProgressStore();

  // Update the useEffect for data loading
  useEffect(() => {
    // Only attempt to load data when modal is visible
    if (!visible) return;

    // Create a unique ID for this loading request
    const requestId = Date.now();
    latestRequestIdRef.current = requestId;

    // Always show loading immediately
    setIsDataLoading(true);

    const loadData = async () => {
      try {
        // Check if we have cached data
        const cachedData =
          useProgressStore.getState().enhancedProgress[gameMode];

        // Use cached data if available, but still show loading for a minimum time
        if (cachedData) {
          // Ensure the loading state shows for at least 300ms for visual consistency
          await new Promise((resolve) => setTimeout(resolve, 300));

          // Only update if this request is still valid
          if (latestRequestIdRef.current === requestId && visible) {
            setProgressData(cachedData);
            setIsDataLoading(false);
          }
          return;
        }

        // No cached data, fetch new data
        const freshData = await useProgressStore
          .getState()
          .getEnhancedGameProgress(gameMode);

        // Ensure minimum loading time (visual consistency)
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Only update if this request is still valid
        if (latestRequestIdRef.current === requestId && visible) {
          setProgressData(freshData);
          setIsDataLoading(false);
          setHasError(!freshData);
        }
      } catch (error) {
        console.error(`[GameProgressModal] Error loading data:`, error);

        // Show error after minimum loading time
        await new Promise((resolve) => setTimeout(resolve, 300));

        if (latestRequestIdRef.current === requestId && visible) {
          setIsDataLoading(false);
          setHasError(true);
        }
      }
    };

    // Execute data loading
    loadData();
  }, [visible, gameMode]); // Keep dependencies minimal

  // Add cleanup effect separately
  useEffect(() => {
    if (!visible) {
      // Use a longer timeout to ensure modal is fully closed before resetting state
      const resetTimer = setTimeout(() => {
        setProgressData(null);
        setIsDataLoading(false);
        setHasError(false);
        setContentReady(false);
      }, 500);

      return () => clearTimeout(resetTimer);
    }
  }, [visible]);

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

  // Content renderer - make loading state more prominent
  const renderContent = useCallback(() => {
    return (
      <View style={styles.contentContainer}>
        {/* Loading Overlay - Always the same position in component tree */}
        {isDataLoading && (
          <Animatable.View
            animation="fadeIn"
            duration={200}
            style={styles.loadingOverlay}
            useNativeDriver={true}
          >
            <ActivityIndicator color="#fff" size="large" />
            <Text style={styles.quickLoadingText}>
              Loading progress data...
            </Text>
          </Animatable.View>
        )}

        {/* Content - Render but hide when loading */}
        {progressData && (
          <View
            style={[
              styles.contentWrapper,
              isDataLoading && styles.contentHidden,
            ]}
          >
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
          </View>
        )}

        {/* Error View - Only show when there's an error and not loading */}
        {!progressData && !isDataLoading && (
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
        )}
      </View>
    );
  }, [
    isDataLoading,
    progressData,
    hasError,
    getDifficultyColor,
    getDifficultyStars,
  ]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent={true}
      onRequestClose={handleClose}
      hardwareAccelerated={true}
    >
      <Animatable.View
        ref={overlayRef}
        animation={visible ? "fadeIn" : "fadeOut"}
        duration={200}
        style={styles.overlay}
        useNativeDriver={true}
      >
        <Animatable.View
          ref={modalRef}
          animation={visible ? "zoomIn" : "zoomOut"}
          duration={200}
          style={styles.modalContainer}
          useNativeDriver={true}
        >
          <LinearGradient
            colors={gradientColors}
            style={styles.gradientBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Header */}
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

            {/* Content ScrollView */}
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
  contentContainer: {
    flex: 1,
    position: "relative",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  contentWrapper: {
    opacity: 1,
  },
  contentHidden: {
    opacity: 0.3,
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
