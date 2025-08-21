import React from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { RANKING_CATEGORIES } from "@/constant/rankingConstants";

import { BASE_COLORS, rankingButtonColors } from "@/constant/colors";

interface RankingCategorySelectorProps {
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

const RankingCategorySelector: React.FC<RankingCategorySelectorProps> = ({
  selectedCategory,
  onCategorySelect,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scrollView}
    >
      {RANKING_CATEGORIES.map((category) => {
        const isSelected = selectedCategory === category.id;

        return (
          <TouchableOpacity
            key={category.id}
            onPress={() => onCategorySelect(category.id)}
            style={styles.categoryWrapper}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                isSelected
                  ? rankingButtonColors.yellow
                  : ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.02)"]
              }
              style={[styles.categoryButton, isSelected && { borderWidth: 0 }]}
            >
              <View style={styles.categoryIcon}>{category.icon}</View>
              <Text
                style={[
                  styles.categoryTitle,
                  isSelected && styles.selectedCategoryTitle,
                ]}
                numberOfLines={2}
              >
                {category.title}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: 76,
  },
  container: {
    padding: 8,
    alignItems: "center",
  },
  categoryWrapper: {
    marginRight: 8,
  },
  categoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 90,
    height: 60,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.20)",
  },
  categoryIcon: {
    marginBottom: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryTitle: {
    fontSize: 11,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: 12,
  },
  selectedCategoryTitle: {
    color: BASE_COLORS.white,
    fontFamily: "Poppins-SemiBold",
  },
});

export default React.memo(RankingCategorySelector);
