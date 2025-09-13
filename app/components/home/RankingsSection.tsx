import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { BookOpen } from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";
import RankingCategorySelector from "@/components/games/rankings/RankingCategorySelector";
import HomePageRankingContent from "./HomePageRankingContent";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constant/fontSizes";

const RankingsSection = React.memo(() => {
  const [selectedRankingCategory, setSelectedRankingCategory] =
    useState("quizChampions");

  const handleRankingCategorySelect = (categoryId: string) => {
    setSelectedRankingCategory(categoryId);
  };

  return (
    <>
      <Text style={styles.sectionTitle}>Top Rankings</Text>
      <View style={styles.rankingsSection}>
        <RankingCategorySelector
          selectedCategory={selectedRankingCategory}
          onCategorySelect={handleRankingCategorySelect}
        />

        <View style={styles.rankingsContentContainer}>
          <HomePageRankingContent
            selectedCategory={selectedRankingCategory}
            visible={true}
          />
        </View>
      </View>
    </>
  );
});

const styles = StyleSheet.create({
  rankingsSection: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    padding: 16,
    borderRadius: 20,
  },
  sectionTitle: {
    fontSize: COMPONENT_FONT_SIZES.home.sectionTitle,
    marginBottom: 16,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.white,
  },
  rankingsContentContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 20,
    height: 400,
    overflow: "hidden",
  },
});

RankingsSection.displayName = "RankingsSection";
export default RankingsSection;
