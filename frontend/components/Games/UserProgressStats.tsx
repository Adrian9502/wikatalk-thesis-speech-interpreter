import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { getToken } from "@/lib/authTokenManager";
import axios from "axios";
import { BASE_COLORS } from "@/constant/colors";

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:5000";

interface ProgressSummary {
  totalQuizzes: number;
  completedQuizzes: number;
  totalTimeSpent: number;
}

const UserProgressStats = () => {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgressSummary = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const response = await axios.get(`${API_URL}/api/userprogress`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setSummary(response.data.summary);
        }
      } catch (error) {
        console.error("Error fetching progress summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressSummary();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={BASE_COLORS.white} />
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No progress data available</Text>
      </View>
    );
  }

  // Format time in hours:minutes:seconds
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${hours}h ${minutes}m ${secs}s`;
  };

  // Calculate completion percentage
  const completionPercentage =
    summary.totalQuizzes > 0
      ? Math.round((summary.completedQuizzes / summary.totalQuizzes) * 100)
      : 0;

  return (
    <View style={styles.container}>
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>Completed:</Text>
        <Text style={styles.statValue}>
          {summary.completedQuizzes}/{summary.totalQuizzes} (
          {completionPercentage}%)
        </Text>
      </View>

      <View style={styles.statRow}>
        <Text style={styles.statLabel}>Total Time:</Text>
        <Text style={styles.statValue}>
          {formatTime(summary.totalTimeSpent)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    opacity: 0.8,
  },
  statValue: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    opacity: 0.7,
    textAlign: "center",
  },
});

export default UserProgressStats;
