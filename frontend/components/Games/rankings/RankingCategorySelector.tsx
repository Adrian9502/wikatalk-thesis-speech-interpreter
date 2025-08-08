import React from "react";
import { ScrollView, TouchableOpacity, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { RANKING_CATEGORIES } from "@/constant/rankingConstants";

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
                  ? category.color
                  : ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]
              }
              style={[
                styles.categoryButton,
                isSelected && styles.selectedCategoryButton,
              ]}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
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
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryWrapper: {
    marginRight: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
    maxWidth: 120,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  selectedCategoryButton: {
    borderColor: "rgba(255, 255, 255, 0.4)",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryTitle: {
    fontSize: 11,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  selectedCategoryTitle: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
  },
});

export default React.memo(RankingCategorySelector);
