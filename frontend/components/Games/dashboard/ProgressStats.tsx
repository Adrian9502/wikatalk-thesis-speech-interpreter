import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Target, Award } from "react-native-feather";
import { SectionHeader } from "@/components/games/common/SectionHeader";
import useProgressStore from "@/store/games/useProgressStore";
import { GAME_GRADIENTS, GAME_MODES } from "@/constant/gameConstants";
import { BASE_COLORS } from "@/constant/colors";

// SIMPLE: Global flag
let PROGRESS_ANIMATION_PLAYED = false;

const ProgressStats = React.memo(() => {
  const { totalCompletedCount, totalQuizCount, lastUpdated } =
    useProgressStore();

  const [shouldAnimate] = useState(!PROGRESS_ANIMATION_PLAYED);

  // OPTIMIZED: Debounced state for smooth updates
  const [displayStats, setDisplayStats] = useState({
    completed: totalCompletedCount,
    total: totalQuizCount,
  });

  // Debounce timer ref
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Simple animated values
  const fadeAnim = useState(() => new Animated.Value(shouldAnimate ? 0 : 1))[0];
  const slideAnim = useState(
    () => new Animated.Value(shouldAnimate ? 25 : 0)
  )[0];

  // OPTIMIZED: Debounce progress updates to prevent rapid re-renders during animation
  useEffect(() => {
    // Clear existing timer
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current);
    }

    // Debounce the update - only update UI after values stabilize
    updateTimerRef.current = setTimeout(() => {
      console.log("[ProgressStats] Progress updated:", {
        totalCompletedCount,
        totalQuizCount,
        timestamp: new Date(lastUpdated).toISOString(),
      });

      setDisplayStats({
        completed: totalCompletedCount,
        total: totalQuizCount,
      });
    }, 500); // 500ms debounce to let animation complete

    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
    };
  }, [totalCompletedCount, totalQuizCount, lastUpdated]);

  // SIMPLE: One animation
  useEffect(() => {
    if (!shouldAnimate) return;

    // Delay this animation slightly so it comes after word of day
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        PROGRESS_ANIMATION_PLAYED = true;
        console.log("[ProgressStats] Simple animation completed");
      });
    }, 200);
  }, [shouldAnimate, fadeAnim, slideAnim]);

  // OPTIMIZED: Memoized completion percentage
  const completionPercentage = React.useMemo(() => {
    return displayStats.total > 0
      ? Math.round((displayStats.completed / displayStats.total) * 100)
      : 0;
  }, [displayStats.completed, displayStats.total]);

  // OPTIMIZED: Memoized summary text
  const summaryText = React.useMemo(() => {
    if (displayStats.completed === 0) {
      return `Start playing to track your progress! ${displayStats.total} quizzes available`;
    }
    return `${completionPercentage}% completion rate across all game modes (${displayStats.completed}/${displayStats.total})`;
  }, [displayStats.completed, displayStats.total, completionPercentage]);

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <SectionHeader
        icon={<Award width={20} height={20} color="#FF6B6B" />}
        title="Your Progress"
        subtitle="Track your completion across all game modes"
      />

      <View style={styles.statsGrid}>
        <View style={styles.quickStatCard}>
          <Text style={styles.statNumber}>{displayStats.completed}</Text>
          <Text style={styles.statText}>Levels Completed</Text>
        </View>

        <View style={styles.quickStatCard}>
          <Text style={styles.statNumber}>{displayStats.total}</Text>
          <Text style={styles.statText}>Total Quizzes</Text>
        </View>
      </View>

      <View style={styles.progressSummaryContainer}>
        <Text style={styles.progressSummaryText}>{summaryText}</Text>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: "row",
    gap: 20,
  },
  quickStatCard: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  statNumber: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    marginBottom: 4,
  },
  statText: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    textAlign: "center",
  },
  progressSummaryContainer: {
    marginTop: 20,
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  progressSummaryText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    textAlign: "center",
  },
});

ProgressStats.displayName = "ProgressStats";
export default ProgressStats;
