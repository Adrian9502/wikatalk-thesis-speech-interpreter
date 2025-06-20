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
  isLoading?: boolean;
}

const LevelStatsSection: React.FC<LevelStatsSectionProps> = ({
  details,
  isLoading = false,
}) => {
  // Calculate values for when data is available
  const shortDate = details?.completedDate?.split(",")[0] || "";
  const successRate =
    details && details.totalAttempts > 0
      ? Math.round((details.correctAttempts / details.totalAttempts) * 100)
      : 100;

  return (
    <View style={styles.container}>
      {/* First Row - Time and Date */}
      <View style={styles.statsGrid}>
        {/* Time spent */}
        <View style={styles.statBox}>
          <Clock width={20} height={20} color="#fff" strokeWidth={2} />
          <Text style={styles.statLabel}>Time Spent</Text>
          {isLoading ? (
            <ActivityIndicator
              size="small"
              color="#fff"
              style={styles.loadingIndicator}
            />
          ) : (
            <Text style={styles.statValue}>
              {details ? formatTime(details.timeSpent || 0) : "--"}
            </Text>
          )}
        </View>

        {/* Completion date */}
        <View style={styles.statBox}>
          <Calendar width={20} height={20} color="#fff" strokeWidth={2} />
          <Text style={styles.statLabel}>Completed</Text>
          {isLoading ? (
            <ActivityIndicator
              size="small"
              color="#fff"
              style={styles.loadingIndicator}
            />
          ) : (
            <Text style={styles.statValue} numberOfLines={2}>
              {shortDate || "--"}
            </Text>
          )}
        </View>
      </View>

      {/* Second Row - Attempts and Success Rate */}
      <View style={styles.statsGrid}>
        {/* Total attempts */}
        <View style={styles.statBox}>
          <Target width={20} height={20} color="#fff" strokeWidth={2} />
          <Text style={styles.statLabel}>Attempts</Text>
          {isLoading ? (
            <ActivityIndicator
              size="small"
              color="#fff"
              style={styles.loadingIndicator}
            />
          ) : (
            <>
              <Text style={styles.statValue}>
                {details?.totalAttempts || "--"}
              </Text>
            </>
          )}
        </View>

        {/* Success rate */}
        <View style={styles.statBox}>
          <Award width={20} height={20} color="#fff" strokeWidth={2} />
          <Text style={styles.statLabel}>Success Rate</Text>
          {isLoading ? (
            <ActivityIndicator
              size="small"
              color="#fff"
              style={styles.loadingIndicator}
            />
          ) : (
            <>
              <Text style={styles.statValue}>
                {details ? `${successRate}%` : "--"}
              </Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 200,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 8,
    textAlign: "center",
  },
  statValue: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
    marginTop: 4,
    textAlign: "center",
  },
  // Loading indicator spacing
  loadingIndicator: {
    marginTop: 4,
  },
});

export default React.memo(LevelStatsSection);
