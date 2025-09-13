import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { formatTime } from "@/utils/gameUtils";
import StatBox from "./StatBox";
import { EnhancedGameModeProgress } from "@/types/gameProgressTypes";
import {
  getDetailedGameModeStats,
  DetailedGameModeStats,
} from "@/utils/gameStatsUtils";

interface StatGridProps {
  gameMode: string;
  progressData?: EnhancedGameModeProgress;
}

const StatGrid: React.FC<StatGridProps> = ({ gameMode, progressData }) => {
  const [detailedStats, setDetailedStats] =
    useState<DetailedGameModeStats | null>(null);

  useEffect(() => {
    const loadDetailedStats = async () => {
      try {
        const stats = await getDetailedGameModeStats(gameMode);
        setDetailedStats(stats);
      } catch (error) {
        console.error("[StatGrid] Failed to load detailed stats:", error);
        // Fallback to progressData if available
      }
    };

    loadDetailedStats();
  }, [gameMode]);

  // Use detailed stats if available, otherwise fallback to progressData
  const statsToDisplay = detailedStats || {
    averageScore: progressData?.overallAverageScore || 0,
    totalTimeSpent: progressData?.totalTimeSpent || 0,
    totalAttempts: progressData?.totalAttempts || 0,
    correctAttempts: progressData?.correctAttempts || 0,
  };

  return (
    <View style={styles.statsGrid}>
      <StatBox
        value={`${Math.round(statsToDisplay.averageScore)}%`}
        label="Success Rate"
      />
      <StatBox
        value={formatTime(statsToDisplay.totalTimeSpent)}
        label="Total Time"
      />
      <StatBox value={statsToDisplay.totalAttempts} label="Total Attempts" />
      <StatBox value={statsToDisplay.correctAttempts} label="Correct" />
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
