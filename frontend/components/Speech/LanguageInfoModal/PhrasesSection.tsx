import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MessageCircle } from "react-native-feather";
import { PhrasesSection as PhrasesSectionType } from "@/types/languageInfo";

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
          width={18}
          height={18}
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
    fontFamily: "Poppins-Medium",
    fontSize: 15,
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
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
  phraseText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
  },
});

export default PhrasesSection;
