import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";

import { formatTime } from "@/utils/gameUtils";
import { BASE_COLORS } from "@/constant/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constant/fontSizes";
const { width: screenWidth } = Dimensions.get("window");
const isSmallScreen = screenWidth < 350; // Adjust threshold as needed
interface CompletedLevelDetails {
  question: string;
  answer: string;
  timeSpent: number;
  completedDate: string;
  isCorrect: boolean;
  totalAttempts: number;
  correctAttempts: number;
}

interface LevelStatsSectionProps {
  details: CompletedLevelDetails | null;
}

const LevelStatsSection: React.FC<LevelStatsSectionProps> = ({ details }) => {
  // Calculate values for when data is available
  const completionDate = details?.completedDate;
  const successRate =
    details && details.totalAttempts > 0
      ? Math.round((details.correctAttempts / details.totalAttempts) * 100)
      : 100;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Level Stats</Text>
      {/* First Row - Time and Date */}
      <View style={styles.statsRow}>
        {/* Time spent */}
        <View style={styles.statItem}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Time Spent</Text>
            <Text style={styles.statValue}>
              {details ? formatTime(details.timeSpent || 0) : "--"}
            </Text>
          </View>
        </View>

        {/* Completion date */}
        <View style={styles.statItem}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Completed</Text>
            <Text style={styles.statValue} numberOfLines={2}>
              {completionDate || "--"}
            </Text>
          </View>
        </View>
      </View>

      {/* Second Row - Attempts and Success Rate */}
      <View style={styles.statsRow}>
        {/* Total attempts */}
        <View style={styles.statItem}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Attempts</Text>
            <Text style={styles.statValue}>
              {details?.totalAttempts || "--"}
            </Text>
          </View>
        </View>

        {/* Success rate */}
        <View style={styles.statItem}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Success Rate</Text>
            <Text style={styles.statValue}>
              {details ? `${successRate}%` : "--"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 120,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: isSmallScreen ? "center" : "space-between",
    marginBottom: 16,
  },
  statItem: {
    flexBasis: isSmallScreen ? "100%" : "48%",
    marginBottom: isSmallScreen ? 8 : 0,
  },
  statLabel: {
    fontSize: COMPONENT_FONT_SIZES.card.caption,
    fontFamily: POPPINS_FONT.regular,
    color: "rgba(255, 255, 255,0.9)",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  statBox: {
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  statValue: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
    marginTop: 6,
    textAlign: "center",
    letterSpacing: 0.2,
  },
});

export default React.memo(LevelStatsSection);
