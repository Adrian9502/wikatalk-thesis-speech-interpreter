import React, { useCallback, useRef } from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { RANKING_CATEGORIES } from "@/constant/rankingConstants";
import { BASE_COLORS, RANKING_SELECTOR_COLORS } from "@/constant/colors";

interface RankingCategorySelectorProps {
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

const RankingCategorySelector: React.FC<RankingCategorySelectorProps> = ({
  selectedCategory,
  onCategorySelect,
}) => {
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const lastSelectedRef = useRef<string>(selectedCategory);

  // ENHANCED: Debounced category selection to prevent rapid switches
  const handleCategorySelect = useCallback(
    (categoryId: string) => {
      // Don't process if same category
      if (categoryId === selectedCategory) return;

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Update immediately for UI responsiveness
      lastSelectedRef.current = categoryId;

      // Debounce the actual data fetching
      debounceTimerRef.current = setTimeout(() => {
        console.log(
          `[RankingCategorySelector] Switching to ${categoryId} after debounce`
        );
        onCategorySelect(categoryId);
      }, 150); // 150ms debounce
    },
    [selectedCategory, onCategorySelect]
  );

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

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
            onPress={() => handleCategorySelect(category.id)}
            style={styles.categoryWrapper}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                isSelected
                  ? RANKING_SELECTOR_COLORS
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
