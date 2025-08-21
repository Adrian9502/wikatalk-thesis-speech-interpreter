import React from "react";
import { View, StyleSheet } from "react-native";
import { formatTime } from "@/utils/gameUtils";
import StatBox from "./StatBox";
import { EnhancedGameModeProgress } from "@/types/gameProgressTypes";

interface StatGridProps {
  progressData: EnhancedGameModeProgress;
}

const StatGrid: React.FC<StatGridProps> = ({ progressData }) => {
  return (
    <View style={styles.statsGrid}>
      <StatBox
        value={`${Math.round(progressData.overallAverageScore)}%`}
        label="Success Rate"
      />
      <StatBox
        value={formatTime(progressData.totalTimeSpent)}
        label="Total Time"
      />
      <StatBox value={progressData.totalAttempts} label="Total Attempts" />
      <StatBox value={progressData.correctAttempts} label="Correct" />
    </View>
  );
};

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: 8,
  },
});

export default React.memo(StatGrid);
