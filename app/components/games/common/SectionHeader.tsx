import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BASE_COLORS } from "@/constants/colors";
import { POPPINS_FONT, COMPONENT_FONT_SIZES } from "@/constants/fontSizes";

interface SectionHeaderProps {
  icon?: React.ReactNode;
  title: string;
  subtitle: string;
}

export const SectionHeader = React.memo(
  ({ icon, title, subtitle }: SectionHeaderProps) => {
    return (
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          {icon}
          <Text style={styles.sectionMainTitle}>{title}</Text>
        </View>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  sectionMainTitle: {
    fontSize: COMPONENT_FONT_SIZES.game.instruction,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.white,
    marginLeft: 8,
  },
  sectionSubtitle: {
    fontSize: COMPONENT_FONT_SIZES.card.description, // Changed from hardcoded 11
    fontFamily: POPPINS_FONT.regular, // Changed from "Poppins-Regular"
    color: "rgba(255, 255, 255, 0.7)",
  },
});

SectionHeader.displayName = "SectionHeader";
