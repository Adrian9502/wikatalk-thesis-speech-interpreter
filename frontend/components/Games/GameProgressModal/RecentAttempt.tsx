import React from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";
import { Clock, CheckCircle, XCircle } from "react-native-feather";
import { formatTime } from "@/utils/gameUtils";

interface RecentAttemptProps {
  attempt: {
    levelId: string | number;
    levelTitle: string;
    difficulty: string;
    attemptDate: string;
    isCorrect: boolean;
    timeSpent: number;
    attemptNumber?: number;
  };
  index: number;
}

const RecentAttempt = React.memo(({ attempt, index }: RecentAttemptProps) => {
  return (
    <Animatable.View
      key={`${attempt.levelId}-${attempt.attemptDate}-${index}`}
      animation="fadeInUp"
      delay={index * 50}
      style={styles.attemptItem}
      useNativeDriver={true}
    >
      <View style={styles.attemptHeader}>
        <View style={styles.attemptTitleRow}>
          <Text style={styles.attemptLevel} numberOfLines={1}>
            {attempt.levelTitle}
          </Text>
          <View style={styles.difficultyBadgeSmall}>
            <Text style={styles.attemptDifficulty}>
              {attempt.difficulty?.charAt(0).toUpperCase() +
                attempt.difficulty?.slice(1)}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.attemptResult,
            { backgroundColor: attempt.isCorrect ? "#4CAF50" : "#F44336" },
          ]}
        >
          {attempt.isCorrect ? (
            <CheckCircle width={12} height={12} color="#fff" />
          ) : (
            <XCircle width={12} height={12} color="#fff" />
          )}
        </View>
      </View>
      <View style={styles.attemptDetails}>
        <Text style={styles.attemptTime}>
          <Clock width={12} height={12} color="#fff" />{" "}
          {formatTime(attempt.timeSpent || 0)}
        </Text>
        <Text style={styles.attemptDate}>
          {new Intl.DateTimeFormat("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }).format(new Date(attempt.attemptDate))}
        </Text>
      </View>
    </Animatable.View>
  );
});

const styles = StyleSheet.create({
  attemptTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginRight: 8,
  },
  attemptLevel: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    flex: 1,
    marginRight: 8,
  },
  difficultyBadgeSmall: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  attemptDifficulty: {
    fontSize: 9,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.8)",
  },
  attemptItem: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  attemptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  attemptResult: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  attemptDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  attemptTime: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.7)",
  },
  attemptDate: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.5)",
  },
});

RecentAttempt.displayName = "RecentAttempt";
export default RecentAttempt;
