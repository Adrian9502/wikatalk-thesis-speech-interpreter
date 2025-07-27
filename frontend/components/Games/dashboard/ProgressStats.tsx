import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import { Target, Award } from "react-native-feather";
import { SectionHeader } from "@/components/games/common/AnimatedSection";
import useProgressStore from "@/store/games/useProgressStore";
import { GAME_GRADIENTS, GAME_MODES } from "@/constant/gameConstants";
import { BASE_COLORS } from "@/constant/colors";

const ProgressStats = React.memo(() => {
  // Get progress data from the centralized store with lastUpdated
  const { totalCompletedCount, totalQuizCount, lastUpdated } =
    useProgressStore();

  // Log updates to help with debugging
  useEffect(() => {
    console.log("[ProgressStats] Progress updated:", {
      totalCompletedCount,
      totalQuizCount,
      timestamp: new Date(lastUpdated).toISOString(),
    });
  }, [totalCompletedCount, totalQuizCount, lastUpdated]);

  return (
    <Animatable.View
      animation="fadeInUp"
      duration={1000}
      delay={800}
      useNativeDriver
    >
      <SectionHeader
        icon={<Award width={20} height={20} color="#FF6B6B" />}
        title="Your Progress"
        subtitle="Track your completion across all game modes"
      />

      <View style={styles.statsGrid}>
        <View style={styles.quickStatCard}>
          <LinearGradient
            colors={GAME_GRADIENTS[GAME_MODES.FILL_BLANKS]}
            style={styles.statCardGradient}
          >
            <View style={styles.statIconContainer}>
              <Target width={24} height={24} color="#fff" />
            </View>
            <Text style={styles.statNumber}>{totalCompletedCount}</Text>
            <Text style={styles.statText}>Levels Completed</Text>
          </LinearGradient>
        </View>

        <View style={styles.quickStatCard}>
          <LinearGradient
            colors={GAME_GRADIENTS[GAME_MODES.MULTIPLE_CHOICE]}
            style={styles.statCardGradient}
          >
            <View style={styles.statIconContainer}>
              <Award width={24} height={24} color="#fff" />
            </View>
            <Text style={styles.statNumber}>{totalQuizCount}</Text>
            <Text style={styles.statText}>Total Quizzes</Text>
          </LinearGradient>
        </View>
      </View>

      <Animatable.View
        animation="fadeIn"
        delay={1000}
        style={styles.progressSummaryContainer}
        useNativeDriver
      >
        <Text style={styles.progressSummaryText}>
          {totalCompletedCount === 0
            ? `Start playing to track your progress! ${totalQuizCount} quizzes available`
            : `${Math.round(
                (totalCompletedCount / totalQuizCount) * 100
              )}% completion rate across all game modes (${totalCompletedCount}/${totalQuizCount})`}
        </Text>
      </Animatable.View>
    </Animatable.View>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  statCardGradient: {
    padding: 16,
    alignItems: "center",
    minHeight: 120,
    justifyContent: "center",
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 22,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    marginBottom: 4,
  },
  statText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    textAlign: "center",
  },
  progressSummaryContainer: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  progressSummaryText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    textAlign: "center",
  },
});

ProgressStats.displayName = "ProgressStats";
export default ProgressStats;
