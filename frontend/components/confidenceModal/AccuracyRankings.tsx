import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BarChart2 } from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constant/fontSizes";

interface LanguageStat {
  displayName: string;
  accuracy: number;
  wer: number;
  isSelected: boolean;
}

interface AccuracyRankingsProps {
  language: string;
  allStats: LanguageStat[];
  currentRank: number;
  accuracy: number;
}

const AccuracyRankings: React.FC<AccuracyRankingsProps> = ({
  language,
  allStats,
  currentRank,
  accuracy,
}) => {
  return (
    <View style={styles.rankingSection}>
      <View style={styles.rankingTitle}>
        <BarChart2 width={16} height={16} color={BASE_COLORS.orange} />
        <Text style={styles.sectionTitle}>Accuracy Rankings</Text>
      </View>
      <Text style={styles.rankingSubtitle}>
        How {language} compares to other dialects
      </Text>

      <View style={styles.rankingList}>
        {allStats.slice(0, 5).map((stat, index) => (
          <View
            key={stat.displayName}
            style={[
              styles.rankingItem,
              stat.isSelected && styles.rankingItemSelected,
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
              <Text
                style={[
                  styles.rankingLanguage,
                  stat.isSelected && styles.rankingLanguageSelected,
                ]}
              >
                {stat.displayName}
              </Text>
            </View>
            <Text
              style={[
                styles.rankingAccuracy,
                stat.isSelected && styles.rankingAccuracySelected,
              ]}
            >
              {stat.accuracy.toFixed(1)}%
            </Text>
          </View>
        ))}

        {currentRank > 5 && (
          <>
            <View style={styles.rankingDivider}>
              <Text style={styles.rankingDividerText}>...</Text>
            </View>
            <View style={[styles.rankingItem, styles.rankingItemSelected]}>
              <View style={styles.rankingLeft}>
                <Text
                  style={[
                    styles.rankingPosition,
                    styles.rankingPositionSelected,
                  ]}
                >
                  #{currentRank}
                </Text>
                <Text
                  style={[
                    styles.rankingLanguage,
                    styles.rankingLanguageSelected,
                  ]}
                >
                  {language}
                </Text>
              </View>
              <Text
                style={[styles.rankingAccuracy, styles.rankingAccuracySelected]}
              >
                {accuracy.toFixed(1)}%
              </Text>
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
  rankingItemSelected: {
    backgroundColor: BASE_COLORS.lightPink,
    borderBottomColor: BASE_COLORS.orange,
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
  rankingLanguage: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.darkText,
    marginLeft: 8,
  },
  rankingLanguageSelected: {
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.orange,
  },
  rankingAccuracy: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.darkText,
  },
  rankingAccuracySelected: {
    color: BASE_COLORS.orange,
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
