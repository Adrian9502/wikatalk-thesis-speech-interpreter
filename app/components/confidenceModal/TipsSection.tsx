import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BarChart2, Camera } from "react-native-feather";
import { BASE_COLORS } from "@/constants/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constants/fontSizes";

interface TipItem {
  text: string;
}

interface TipsSectionProps {
  type: "speech" | "ocr";
}

const TipsSection: React.FC<TipsSectionProps> = ({ type }) => {
  const speechTips: TipItem[] = [
    { text: "Speak clearly and at moderate pace" },
    { text: "Minimize background noise" },
    { text: "Use standard pronunciation when possible" },
    { text: "Keep recordings between 2-30 seconds" },
  ];

  const ocrTips: TipItem[] = [
    { text: "Ensure good lighting when taking pictures" },
    { text: "Keep camera steady to avoid blurry images" },
    { text: "Avoid skewed or tilted text in images" },
    { text: "Make sure text is clearly visible and in focus" },
  ];

  const tips = type === "speech" ? speechTips : ocrTips;
  const icon =
    type === "speech" ? (
      <BarChart2 width={14} height={14} color={BASE_COLORS.orange} />
    ) : (
      <Camera width={14} height={14} color={BASE_COLORS.orange} />
    );
  const title =
    type === "speech"
      ? "Tips for Better Results"
      : "Tips for Better OCR Results";

  return (
    <View style={styles.tipsSection}>
      <View style={styles.sectionHeader}>
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      <View style={styles.tipsList}>
        {tips.map((tip, index) => (
          <View key={index} style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>{tip.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tipsSection: {
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
  tipsList: {
    backgroundColor: "rgba(255, 111, 74, 0.05)",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: BASE_COLORS.orange,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  tipBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: BASE_COLORS.orange,
    marginTop: 7,
    marginRight: 10,
  },
  tipText: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.darkText,
    lineHeight: 18,
    flex: 1,
  },
});

export default TipsSection;
