import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";

import { formatTime } from "@/utils/gameUtils";
import { BASE_COLORS } from "@/constant/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constant/fontSizes";
import StatBox from "./StatBox";
const { width: screenWidth } = Dimensions.get("window");
const isSmallScreen = screenWidth < 350;
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
          <StatBox
            label="Time Spent"
            value={details ? formatTime(details.timeSpent || 0) : "--"}
          />
        </View>

        {/* Completion date */}
        <View style={styles.statItem}>
          <StatBox label="Completed" value={completionDate || "--"} />
        </View>
      </View>

      {/* Second Row - Attempts and Success Rate */}
      <View style={styles.statsRow}>
        {/* Total attempts */}
        <View style={styles.statItem}>
          <StatBox
            label="Attempts"
            value={details?.totalAttempts.toString() || "--"}
          />
        </View>

        {/* Success rate */}
        <View style={styles.statItem}>
          <StatBox
            label="Success Rate"
            value={details ? `${successRate}%` : "--"}
          />
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
});

export default React.memo(LevelStatsSection);
