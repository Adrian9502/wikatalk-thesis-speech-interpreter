import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Clock, Calendar, Target, Award } from "react-native-feather";
import { formatTime } from "@/utils/gameUtils";

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
      <Text style={styles.title}>Level Details</Text>
      {/* First Row - Time and Date */}
      <View style={styles.statsRow}>
        {/* Time spent */}
        <View style={styles.statItem}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Time Spent</Text>
            <Clock width={17} height={17} color="#fff" strokeWidth={2} />
            <Text style={styles.statValue}>
              {details ? formatTime(details.timeSpent || 0) : "--"}
            </Text>
          </View>
        </View>

        {/* Completion date */}
        <View style={styles.statItem}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Completed</Text>
            <Calendar width={17} height={17} color="#fff" strokeWidth={2} />
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

            <Target width={17} height={17} color="#fff" strokeWidth={2} />
            <Text style={styles.statValue}>
              {details?.totalAttempts || "--"}
            </Text>
          </View>
        </View>

        {/* Success rate */}
        <View style={styles.statItem}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Success Rate</Text>

            <Award width={17} height={17} color="#fff" strokeWidth={2} />
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
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    lineHeight: 22,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: "rgb(255, 255, 255)",
    marginBottom: 6,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  statBox: {
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  statValue: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
    marginTop: 6,
    textAlign: "center",
    letterSpacing: 0.2,
  },
});

export default React.memo(LevelStatsSection);
