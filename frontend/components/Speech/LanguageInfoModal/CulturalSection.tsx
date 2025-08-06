import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Info } from "react-native-feather";
import { CulturalSection as CulturalSectionType } from "@/types/languageInfo";

interface CulturalSectionProps {
  data: CulturalSectionType["data"];
  colors: {
    primary: string;
    text: string;
    cardBg: string;
  };
}

const CulturalSection: React.FC<CulturalSectionProps> = ({ data, colors }) => {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Info width={18} height={18} strokeWidth={2} stroke={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Cultural Notes
        </Text>
      </View>
      <View style={[styles.culturalBox, { backgroundColor: colors.cardBg }]}>
        <View style={styles.culturalItem}>
          <Text style={[styles.culturalLabel, { color: colors.primary }]}>
            Symbol
          </Text>
          <Text style={{ color: colors.text, fontFamily: "Poppins-Regular" }}>
            {data.symbol}
          </Text>
        </View>
        <View>
          <Text style={[styles.culturalLabel, { color: colors.primary }]}>
            Fun Fact
          </Text>
          <Text
            style={{
              color: colors.text,
              lineHeight: 20,
              fontFamily: "Poppins-Regular",
            }}
          >
            {data.fact}
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
  culturalBox: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  culturalItem: {
    marginBottom: 16,
  },
  culturalLabel: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    marginBottom: 8,
  },
});

export default CulturalSection;
