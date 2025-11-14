import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BarChart2 } from "react-native-feather";
import { BASE_COLORS } from "@/constants/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constants/fontSizes";

interface LanguageStat {
  displayName: string;
  trainedAccuracy: number; // Updated from 'accuracy'
  wer: number;
  percentageDecrease: number; // Added
  classification: string; // Added
  isSelected: boolean;
}

interface AccuracyRankingsProps {
  language: string;
  allStats: (LanguageStat | null)[]; // Updated to handle potential null values
  currentRank: number;
  accuracy: number; // This is trainedAccuracy from parent
}

const AccuracyRankings: React.FC<AccuracyRankingsProps> = ({
  language,
  allStats,
  currentRank,
  accuracy,
}) => {
  // Filter out null values
  const validStats = allStats.filter(
    (stat): stat is LanguageStat => stat !== null
  );

  return (
    <View style={styles.rankingSection}>
      <View style={styles.rankingTitle}>
        <BarChart2 width={16} height={16} color={BASE_COLORS.orange} />
        <Text style={styles.sectionTitle}>Accuracy Rankings</Text>
      </View>
      <Text style={styles.rankingSubtitle}>
        How {language} compares to other dialects (post-training accuracy)
      </Text>

      <View style={styles.rankingList}>
        {validStats.slice(0, 5).map((stat, index) => (
          <View
            key={stat.displayName}
            style={[
              styles.rankingItem,
              stat.isSelected && styles.rankingItemSelected,
              index === validStats.slice(0, 5).length - 1 && styles.lastItem,
            ]}
          >
            <View style={styles.rankingLeft}>
              <Text
                style={[
                  styles.rankingPosition,
                  stat.isSelected && styles.rankingPositionSelected,
                ]}
              >
                #{index + 1}
              </Text>
              <View style={styles.languageInfo}>
                <Text
                  style={[
                    styles.rankingLanguage,
                    stat.isSelected && styles.rankingLanguageSelected,
                  ]}
                >
                  {stat.displayName}
                </Text>
                <Text style={styles.classificationText}>
                  {stat.classification}
                </Text>
              </View>
            </View>
            <View style={styles.rankingRight}>
              <Text
                style={[
                  styles.rankingAccuracy,
                  stat.isSelected && styles.rankingAccuracySelected,
                ]}
              >
                {stat.trainedAccuracy.toFixed(1)}%
              </Text>
              <Text style={styles.werText}>{stat.wer.toFixed(1)}% WER</Text>
            </View>
          </View>
        ))}

        {currentRank > 5 && (
          <>
            <View style={styles.rankingDivider}>
              <Text style={styles.rankingDividerText}>...</Text>
            </View>
            <View
              style={[
                styles.rankingItem,
                styles.rankingItemSelected,
                styles.lastItem,
              ]}
            >
              <View style={styles.rankingLeft}>
                <Text
                  style={[
                    styles.rankingPosition,
                    styles.rankingPositionSelected,
                  ]}
                >
                  #{currentRank}
                </Text>
                <View style={styles.languageInfo}>
                  <Text
                    style={[
                      styles.rankingLanguage,
                      styles.rankingLanguageSelected,
                    ]}
                  >
                    {language}
                  </Text>
                </View>
              </View>
              <View style={styles.rankingRight}>
                <Text
                  style={[
                    styles.rankingAccuracy,
                    styles.rankingAccuracySelected,
                  ]}
                >
                  {accuracy.toFixed(1)}%
                </Text>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rankingSection: {
    padding: 20,
    paddingTop: 16,
  },
  rankingTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.darkText,
    marginLeft: 6,
  },
  rankingSubtitle: {
    fontSize: COMPONENT_FONT_SIZES.card.caption,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.placeholderText,
    marginBottom: 12,
    marginTop: 5,
  },
  rankingList: {
    backgroundColor: BASE_COLORS.white,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: BASE_COLORS.borderColor,
  },
  rankingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: BASE_COLORS.borderColor,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  rankingItemSelected: {
    backgroundColor: BASE_COLORS.lightPink,
  },
  rankingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rankingPosition: {
    fontSize: COMPONENT_FONT_SIZES.card.caption,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.placeholderText,
    width: 24,
  },
  rankingPositionSelected: {
    color: BASE_COLORS.orange,
  },
  languageInfo: {
    marginLeft: 8,
    flex: 1,
  },
  rankingLanguage: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.darkText,
  },
  rankingLanguageSelected: {
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.orange,
  },
  classificationText: {
    fontSize: COMPONENT_FONT_SIZES.card.caption - 1,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.placeholderText,
    marginTop: 1,
  },
  rankingRight: {
    alignItems: "flex-end",
  },
  rankingAccuracy: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.darkText,
  },
  rankingAccuracySelected: {
    color: BASE_COLORS.orange,
  },
  werText: {
    fontSize: COMPONENT_FONT_SIZES.card.caption - 1,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.placeholderText,
    marginTop: 1,
  },
  rankingDivider: {
    padding: 8,
    alignItems: "center",
  },
  rankingDividerText: {
    fontSize: COMPONENT_FONT_SIZES.card.caption,
    color: BASE_COLORS.placeholderText,
  },
});

export default AccuracyRankings;
