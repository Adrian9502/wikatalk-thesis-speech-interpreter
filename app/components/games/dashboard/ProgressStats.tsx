import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Award } from "react-native-feather";
import { SectionHeader } from "@/components/games/common/SectionHeader";
import { BASE_COLORS } from "@/constants/colors";
import { useFormattedStats } from "@/utils/gameStatsUtils";
import { POPPINS_FONT, COMPONENT_FONT_SIZES } from "@/constants/fontSizes";

// SIMPLE: Global flag
let PROGRESS_ANIMATION_PLAYED = false;

const ProgressStats = React.memo(() => {
  const overallStats = useFormattedStats(); // No gameMode = overall stats
  const [shouldAnimate] = useState(!PROGRESS_ANIMATION_PLAYED);
  // Simple animated values
  const fadeAnim = useState(() => new Animated.Value(shouldAnimate ? 0 : 1))[0];
  const slideAnim = useState(
    () => new Animated.Value(shouldAnimate ? 25 : 0)
  )[0];

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
          <Text style={styles.statNumber}>{overallStats.completed}</Text>
          <Text style={styles.statText}>Levels Completed</Text>
        </View>

        <View style={styles.quickStatCard}>
          <Text style={styles.statNumber}>{overallStats.total}</Text>
          <Text style={styles.statText}>Total Quizzes</Text>
        </View>
      </View>

      <View style={styles.progressSummaryContainer}>
        <Text style={styles.progressSummaryText}>
          {overallStats.statusText}
        </Text>
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
    fontSize: COMPONENT_FONT_SIZES.card.title,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.white,
    marginBottom: 4,
  },
  statText: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.regular,
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
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.white,
    textAlign: "center",
  },
});

ProgressStats.displayName = "ProgressStats";
export default ProgressStats;
