import React from "react";
import { View, StyleSheet } from "react-native";
import { Target, Clock, Award, PlayCircle } from "react-native-feather";
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
  );
};

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
  },
});

export default React.memo(StatGrid);
