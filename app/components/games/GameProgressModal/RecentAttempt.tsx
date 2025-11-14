import React from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";
import { Clock, CheckCircle, XCircle } from "react-native-feather";
import { formatTime } from "@/utils/gameUtils";
import { BASE_COLORS } from "@/constants/colors";
import { POPPINS_FONT, COMPONENT_FONT_SIZES } from "@/constants/fontSizes";

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
              x {attempt.attemptNumber}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.attemptResult,
            {
              backgroundColor: attempt.isCorrect
                ? BASE_COLORS.success
                : BASE_COLORS.danger,
            },
          ]}
        >
          {attempt.isCorrect ? (
            <CheckCircle width={12} height={12} color={BASE_COLORS.white} />
          ) : (
            <XCircle width={12} height={12} color={BASE_COLORS.white} />
          )}
        </View>
      </View>
      <View style={styles.attemptDetails}>
        <View style={styles.attemptTimeContainer}>
          <Clock width={12} height={12} color={BASE_COLORS.white} />
          <Text style={styles.attemptTime}>
            {"  "}
            {formatTime(attempt.timeSpent || 0)}
          </Text>
        </View>
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
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
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
    fontSize: COMPONENT_FONT_SIZES.card.caption,
    fontFamily: POPPINS_FONT.medium,
    color: "rgba(255, 255, 255, 0.8)",
  },
  attemptItem: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
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
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  attemptDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  attemptTimeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  attemptTime: {
    fontSize: COMPONENT_FONT_SIZES.card.caption,
    marginTop: 2,
    fontFamily: POPPINS_FONT.regular,
    color: "rgba(255, 255, 255, 0.7)",
  },
  attemptDate: {
    fontSize: COMPONENT_FONT_SIZES.card.caption,
    fontFamily: POPPINS_FONT.regular,
    color: "rgba(255, 255, 255, 0.6)",
  },
});

RecentAttempt.displayName = "RecentAttempt";
export default RecentAttempt;
