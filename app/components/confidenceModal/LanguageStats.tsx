import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BASE_COLORS } from "@/constants/colors";
import {
  COMPONENT_FONT_SIZES,
  FONT_SIZES,
  POPPINS_FONT,
} from "@/constants/fontSizes";

interface LanguageStatsProps {
  language: string;
  currentRank: number;
  accuracy: number;
  wer: number;
  untrainedAccuracy: number;
  accuracyImprovement: number;
  percentageDecrease: number;
  color: string;
  confidenceLevel: string;
  description: string;
  classification: string;
}

const LanguageStats: React.FC<LanguageStatsProps> = ({
  language,
  currentRank,
  accuracy,
  wer,
  untrainedAccuracy,
  accuracyImprovement,
  percentageDecrease,
  color,
  confidenceLevel,
  description,
  classification,
}) => {
  return (
    <View style={styles.currentStatsSection}>
      <View style={styles.languageHeader}>
        <Text style={styles.languageName}>{language}</Text>
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>#{currentRank} of 10</Text>
        </View>
      </View>

      <View style={[styles.accuracyCard, { borderLeftColor: color }]}>
        <View style={styles.accuracyMain}>
          <View style={styles.accuracyNumber}>
            <Text style={[styles.accuracyValue, { color }]}>
              {accuracy.toFixed(1)}%
            </Text>
            <Text style={styles.accuracyLabel}>Current Accuracy</Text>
          </View>

          <View style={styles.werInfo}>
            <Text style={styles.werLabel}>Word Error Rate</Text>
            <Text style={styles.werValue}>{wer.toFixed(1)}%</Text>
          </View>
        </View>

        {/* New improvement metrics section */}
        <View style={styles.improvementMetrics}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Before Training</Text>
            <Text style={styles.metricValue}>
              {untrainedAccuracy.toFixed(1)}%
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Improvement</Text>
            <Text style={[styles.metricValue, styles.improvementValue]}>
              +{accuracyImprovement.toFixed(1)}%
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>WER Reduction</Text>
            <Text style={[styles.metricValue, styles.improvementValue]}>
              {percentageDecrease.toFixed(1)}%
            </Text>
          </View>
        </View>

        <View style={styles.badgeContainer}>
          <View
            style={[styles.confidenceBadge, { backgroundColor: `${color}15` }]}
          >
            <View style={[styles.confidenceDot, { backgroundColor: color }]} />
            <Text style={[styles.confidenceText, { color }]}>
              {confidenceLevel === "high"
                ? "High Confidence"
                : confidenceLevel === "medium"
                ? "Moderate Confidence"
                : "Lower Confidence"}
            </Text>
          </View>

          <View
            style={[
              styles.classificationBadge,
              { backgroundColor: `${color}10` },
            ]}
          >
            <Text style={[styles.classificationText, { color }]}>
              {classification}
            </Text>
          </View>
        </View>

        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  currentStatsSection: {
    padding: 20,
    paddingBottom: 0,
  },
  languageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  languageName: {
    fontSize: FONT_SIZES["2xl"],
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.darkText,
  },
  rankBadge: {
    backgroundColor: BASE_COLORS.blue,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  rankText: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
  },
  accuracyCard: {
    borderWidth: 1,
    borderColor: BASE_COLORS.borderColor,
    backgroundColor: BASE_COLORS.white,
    borderRadius: 20,
    padding: 16,
  },
  accuracyMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  accuracyNumber: {
    alignItems: "flex-start",
  },
  accuracyValue: {
    fontSize: FONT_SIZES["2xl"],
    fontFamily: POPPINS_FONT.bold,
  },
  accuracyLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.placeholderText,
    marginTop: -4,
  },
  werInfo: {
    alignItems: "flex-end",
  },
  werLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.placeholderText,
  },
  werValue: {
    fontSize: FONT_SIZES.xl,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.danger,
  },
  improvementMetrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  metricItem: {
    alignItems: "center",
    flex: 1,
  },
  metricLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.placeholderText,
    textAlign: "center",
  },
  metricValue: {
    fontSize: FONT_SIZES.lg,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.darkText,
    marginTop: 2,
  },
  improvementValue: {
    color: BASE_COLORS.success,
  },
  badgeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  confidenceBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  confidenceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  confidenceText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: POPPINS_FONT.medium,
  },
  classificationBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  classificationText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: POPPINS_FONT.semiBold,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.placeholderText,
    lineHeight: 18,
  },
});

export default LanguageStats;
