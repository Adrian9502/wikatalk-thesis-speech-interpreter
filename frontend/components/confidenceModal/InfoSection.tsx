import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Info, TrendingUp } from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";
import {
  COMPONENT_FONT_SIZES,
  FONT_SIZES,
  POPPINS_FONT,
} from "@/constant/fontSizes";

interface InfoSectionProps {
  language: string;
  wer: number;
  untrainedWer: number;
  percentageDecrease: number;
  classification: string;
}

const InfoSection: React.FC<InfoSectionProps> = ({
  language,
  wer,
  untrainedWer,
  percentageDecrease,
  classification,
}) => {
  const getClassificationExplanation = (classification: string) => {
    switch (classification) {
      case "Excellent":
        return "This is excellent performance with minimal errors expected.";
      case "High Accuracy":
        return "This represents high accuracy with very reliable results.";
      case "Good":
        return "This is good performance with generally reliable results.";
      case "Moderate":
        return "This indicates moderate accuracy - results may need some review.";
      default:
        return "Performance level varies depending on content complexity.";
    }
  };

  return (
    <View style={styles.infoSection}>
      <View style={styles.sectionHeader}>
        <Info width={14} height={14} color={BASE_COLORS.blue} />
        <Text style={styles.sectionTitle}>What This Means</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          Translation accuracy is measured using Word Error Rate (WER), which
          indicates how many words might be incorrectly transcribed out of 100
          words.
        </Text>

        <Text style={styles.infoText}>
          {language} currently achieves{" "}
          <Text style={styles.boldText}>{wer.toFixed(1)}% WER</Text>, meaning
          approximately {Math.round(wer)} out of every 100 words might need
          review. This qualifies as{" "}
          <Text style={styles.boldText}>"{classification}"</Text> performance.
        </Text>

        <View style={styles.improvementSection}>
          <View style={styles.improvementHeader}>
            <TrendingUp width={12} height={12} color={BASE_COLORS.success} />
            <Text style={styles.improvementTitle}>Training Impact</Text>
          </View>

          <Text style={styles.improvementText}>
            Through fine-tuning, the model improved from{" "}
            <Text style={styles.boldText}>{untrainedWer.toFixed(1)}% WER</Text>{" "}
            to <Text style={styles.boldText}>{wer.toFixed(1)}% WER</Text>,
            representing a{" "}
            <Text style={[styles.boldText, styles.successText]}>
              {percentageDecrease.toFixed(1)}% reduction
            </Text>{" "}
            in errors.
          </Text>
        </View>

        <Text style={styles.infoText}>
          {getClassificationExplanation(classification)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoSection: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.darkText,
    marginLeft: 6,
  },
  infoCard: {
    backgroundColor: BASE_COLORS.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: BASE_COLORS.borderColor,
  },
  infoText: {
    fontSize: FONT_SIZES.md,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.darkText,
    lineHeight: 18,
    marginBottom: 8,
  },
  boldText: {
    fontFamily: POPPINS_FONT.semiBold,
  },
  successText: {
    color: BASE_COLORS.success,
  },
  improvementSection: {
    backgroundColor: "rgba(34, 197, 94, 0.05)",
    borderRadius: 12,
    padding: 10,
    marginVertical: 8,
    borderLeftWidth: 2,
    borderLeftColor: BASE_COLORS.success,
  },
  improvementHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  improvementTitle: {
    fontSize: COMPONENT_FONT_SIZES.card.caption,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.success,
    marginLeft: 4,
  },
  improvementText: {
    fontSize: COMPONENT_FONT_SIZES.card.caption,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.darkText,
    lineHeight: 16,
  },
});

export default InfoSection;
