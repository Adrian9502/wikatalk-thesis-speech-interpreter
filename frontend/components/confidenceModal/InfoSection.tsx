import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Info } from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constant/fontSizes";

interface InfoSectionProps {
  language: string;
  wer: number;
}

const InfoSection: React.FC<InfoSectionProps> = ({ language, wer }) => {
  return (
    <View style={styles.infoSection}>
      <View style={styles.sectionHeader}>
        <Info width={14} height={14} color={BASE_COLORS.blue} />
        <Text style={styles.sectionTitle}>What This Means</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          Translation accuracy is measured using Word Error Rate (WER), which
          indicates how many words might be incorrectly translated out of 100
          words.
        </Text>
        <Text style={styles.infoText}>
          A lower WER means higher accuracy. {language} has a {wer.toFixed(1)}%
          error rate, meaning approximately {Math.round(wer)} out of every 100
          words might need review.
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
    backgroundColor: "rgba(74, 111, 255, 0.05)",
    borderRadius: 20,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: BASE_COLORS.blue,
  },
  infoText: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.darkText,
    lineHeight: 18,
    marginBottom: 8,
  },
});

export default InfoSection;
