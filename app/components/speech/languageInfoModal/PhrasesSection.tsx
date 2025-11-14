import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MessageCircle } from "react-native-feather";
import { PhrasesSection as PhrasesSectionType } from "@/types/languageInfo";
import { FONT_SIZES, POPPINS_FONT } from "@/constants/fontSizes";

interface PhrasesSectionProps {
  data: PhrasesSectionType["data"];
  colors: {
    primary: string;
    text: string;
    cardBg: string;
  };
}

const PhrasesSection: React.FC<PhrasesSectionProps> = ({ data, colors }) => {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <MessageCircle
          width={17}
          height={17}
          strokeWidth={2}
          stroke={colors.primary}
        />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Common Phrases
        </Text>
      </View>
      <View style={styles.phrasesColumn}>
        <View style={[styles.phraseCard, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.phraseLabel, { color: colors.primary }]}>
            Hello
          </Text>
          <Text style={[styles.phraseText, { color: colors.text }]}>
            {data.hello}
          </Text>
        </View>
        <View style={[styles.phraseCard, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.phraseLabel, { color: colors.primary }]}>
            Thank You
          </Text>
          <Text style={[styles.phraseText, { color: colors.text }]}>
            {data.thankYou}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: POPPINS_FONT.medium,
    fontSize: FONT_SIZES.lg,
    marginLeft: 8,
  },
  phrasesColumn: {
    width: "100%",
    gap: 10,
  },
  phraseCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  phraseLabel: {
    marginBottom: 8,
    fontSize: FONT_SIZES.lg,
    fontFamily: POPPINS_FONT.medium,
  },
  phraseText: {
    fontSize: FONT_SIZES.md,
    fontFamily: POPPINS_FONT.regular,
  },
});

export default PhrasesSection;
