import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { DifficultyProgress } from "@/types/gameProgressTypes";
import { BASE_COLORS } from "@/constant/colors";
import { POPPINS_FONT, COMPONENT_FONT_SIZES } from "@/constant/fontSizes";

interface DifficultyCardProps {
  diffProgress: DifficultyProgress;
  getDifficultyColor: (diff: string) => string;
  getDifficultyStars: (diff: string) => string;
}

const DifficultyCard = React.memo(
  ({
    diffProgress,
    getDifficultyColor,
    getDifficultyStars,
  }: DifficultyCardProps) => {
    return (
      <View key={diffProgress.difficulty} style={styles.difficultyCard}>
        <View style={styles.difficultyHeader}>
          <View style={styles.difficultyTitleRow}>
            <Text style={styles.difficultyStars}>
              {getDifficultyStars(diffProgress.difficulty)}
            </Text>
            <Text style={styles.difficultyTitle}>
              {diffProgress.difficulty.charAt(0).toUpperCase() +
                diffProgress.difficulty.slice(1)}
            </Text>
          </View>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(diffProgress.difficulty) },
            ]}
          >
            <Text style={styles.difficultyBadgeText}>
              {diffProgress.completedLevels}/{diffProgress.totalLevels}
            </Text>
          </View>
        </View>

        <View style={styles.difficultyStats}>
          <View style={styles.difficultyStatItem}>
            <Text style={styles.difficultyStatLabel}>Completion</Text>
            <Text style={styles.difficultyStatValue}>
              {Math.round(diffProgress.completionRate)}%
            </Text>
          </View>
          <View style={styles.difficultyStatItem}>
            <Text style={styles.difficultyStatLabel}>Attempts</Text>
            <Text style={styles.difficultyStatValue}>
              {diffProgress.totalAttempts}
            </Text>
          </View>
          <View style={styles.difficultyStatItem}>
            <Text style={styles.difficultyStatLabel}>Success Rate</Text>
            <Text style={styles.difficultyStatValue}>
              {Math.round(diffProgress.averageScore)}%
            </Text>
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${diffProgress.completionRate}%`,
                  backgroundColor: getDifficultyColor(diffProgress.difficulty),
                },
              ]}
            />
          </View>
          <Text style={styles.progressBarText}>
            {Math.round(diffProgress.completionRate)}% Complete
          </Text>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  difficultyCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  difficultyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  difficultyTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  difficultyStars: {
    fontSize: COMPONENT_FONT_SIZES.card.title,
    marginRight: 8,
  },
  difficultyTitle: {
    fontSize: COMPONENT_FONT_SIZES.card.title,
    marginTop: 2,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.white,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  difficultyBadgeText: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
  },
  difficultyStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  difficultyStatItem: {
    alignItems: "center",
    flex: 1,
  },
  difficultyStatLabel: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.medium,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 2,
  },
  difficultyStatValue: {
    fontSize: COMPONENT_FONT_SIZES.card.title,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
    marginVertical: 3,
  },
  progressBarContainer: {
    alignItems: "center",
  },
  progressBarBackground: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressBarText: {
    fontSize: COMPONENT_FONT_SIZES.card.caption,
    fontFamily: POPPINS_FONT.medium,
    marginTop: 2,
    color: "rgba(255, 255, 255, 0.7)",
  },
});

DifficultyCard.displayName = "DifficultyCard";
export default DifficultyCard;
