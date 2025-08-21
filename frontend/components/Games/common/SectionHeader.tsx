import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BASE_COLORS } from "@/constant/colors";

interface SectionHeaderProps {
  icon: React.ReactNode;
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
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    color: BASE_COLORS.white,
    marginLeft: 8,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    opacity: 0.7,
    lineHeight: 20,
  },
});

SectionHeader.displayName = "SectionHeader";
