import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BASE_COLORS } from "@/constant/colors";
import {
  COMPONENT_FONT_SIZES,
  FONT_SIZES,
  POPPINS_FONT,
} from "@/constant/fontSizes";

interface LanguageStatsProps {
  language: string;
  currentRank: number;
  accuracy: number;
  wer: number;
  color: string;
  confidenceLevel: string;
  description: string;
}

const LanguageStats: React.FC<LanguageStatsProps> = ({
  language,
  currentRank,
  accuracy,
  wer,
  color,
  confidenceLevel,
  description,
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
            <Text style={styles.accuracyLabel}>Accuracy</Text>
          </View>

          <View style={styles.werInfo}>
            <Text style={styles.werLabel}>Word Error Rate</Text>
            <Text style={styles.werValue}>{wer.toFixed(1)}%</Text>
          </View>
        </View>

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
    fontSize: COMPONENT_FONT_SIZES.card.title,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.darkText,
  },
  rankBadge: {
    backgroundColor: BASE_COLORS.lightPink,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rankText: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.orange,
  },
  accuracyCard: {
    backgroundColor: "#FAF9F6",
    borderWidth: 0.5,
    borderColor: "#F0EAD6",
    borderRadius: 20,
    padding: 16,
  },
  accuracyMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  accuracyNumber: {
    alignItems: "flex-start",
  },
  accuracyValue: {
    fontSize: FONT_SIZES["2xl"],
    fontFamily: POPPINS_FONT.bold,
  },
  accuracyLabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.placeholderText,
    marginTop: -4,
  },
  werInfo: {
    alignItems: "flex-end",
  },
  werLabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.placeholderText,
  },
  werValue: {
    fontSize: FONT_SIZES.xl,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.danger,
  },
  confidenceBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  confidenceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  confidenceText: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.medium,
  },
  description: {
    fontSize: COMPONENT_FONT_SIZES.card.caption,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.placeholderText,
    lineHeight: 18,
  },
});

export default LanguageStats;
