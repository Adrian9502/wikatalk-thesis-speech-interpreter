import React from "react";
import { View, StyleSheet } from "react-native";
import { Clock, Calendar, Target, Award } from "react-native-feather";
import { formatTime } from "@/utils/gameUtils";
import { StatItem } from "@/types/gameTypes";
import StatBox from "@/components/games/levelReviewModal/StatBox";

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
  if (!details) return null;

  const shortDate = details.completedDate.split(",")[0];
  const successRate =
    details.totalAttempts > 0
      ? Math.round((details.correctAttempts / details.totalAttempts) * 100)
      : 100;
  const showSubValues = details.totalAttempts > 1;

  const stats: StatItem[][] = [
    [
      {
        icon: <Clock width={18} height={18} color="#fff" strokeWidth={2} />,
        label: "Time Spent",
        value: formatTime(details.timeSpent || 0),
      },
      {
        icon: <Calendar width={18} height={18} color="#fff" strokeWidth={2} />,
        label: "Completed",
        value: shortDate,
      },
    ],
    [
      {
        icon: <Target width={18} height={18} color="#fff" strokeWidth={2} />,
        label: "Total Attempts",
        value: details.totalAttempts.toString(),
      },
      {
        icon: <Award width={18} height={18} color="#fff" strokeWidth={2} />,
        label: "Success Rate",
        value: `${successRate}%`,
        subValue: showSubValues
          ? `${details.correctAttempts}/${details.totalAttempts}`
          : undefined,
      },
    ],
  ];

  return (
    <View style={styles.container}>
      {stats.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.statsGrid}>
          {row.map((stat, statIndex) => (
            <StatBox key={statIndex} {...stat} />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 12,
  },
});

export default React.memo(LevelStatsSection);
