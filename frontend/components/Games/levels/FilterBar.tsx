import React, { useState } from "react";
import { Text, TouchableOpacity, View, ScrollView } from "react-native";
import * as Animatable from "react-native-animatable";
import { levelStyles as styles } from "@/styles/games/levels.styles";
import useThemeStore from "@/store/useThemeStore";

type FilterType = "all" | "completed" | "current" | "easy" | "medium" | "hard";

interface FilterBarProps {
  activeFilter: FilterType;
  setActiveFilter: (filter: FilterType) => void;
  isFilterLoading?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({
  activeFilter,
  setActiveFilter,
  isFilterLoading = false,
}) => {
  const { activeTheme } = useThemeStore();

  const renderFilterButton = (
    filter: FilterType,
    label: string,
    icon?: React.ReactNode
  ) => {
    const isActive = activeFilter === filter;
    const isDisabled = isFilterLoading && !isActive; // Disable non-active buttons during loading

    return (
      <TouchableOpacity
        key={filter}
        style={[
          styles.filterButton,
          isActive && {
            backgroundColor: activeTheme.tabActiveColor,
            borderColor: `${activeTheme.tabActiveColor}50`,
            shadowColor: activeTheme.tabActiveColor,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.5,
            shadowRadius: 5,
            elevation: 5,
          },
          isDisabled && {
            opacity: 0.5,
          },
        ]}
        onPress={() => !isDisabled && setActiveFilter(filter)}
        disabled={isDisabled}
        accessible={true}
        accessibilityLabel={`Show ${filter} levels`}
        accessibilityRole="button"
      >
        {icon && <View style={styles.filterIconContainer}>{icon}</View>}

        <Text style={[styles.filterText, isActive && styles.activeFilterText]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderDifficultyFilter = (difficulty: FilterType) => {
    const label = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    return renderFilterButton(difficulty, label);
  };

  return (
    <Animatable.View
      animation="fadeInDown"
      duration={500}
      style={styles.filterContainer}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScrollContent}
        scrollEnabled={!isFilterLoading}
      >
        {/* Status filters */}
        {renderFilterButton("all", "All Levels")}
        {renderFilterButton("completed", "Finished")}
        {renderFilterButton("current", "In Progress")}

        {/* Difficulty filters */}
        {renderDifficultyFilter("easy")}
        {renderDifficultyFilter("medium")}
        {renderDifficultyFilter("hard")}
      </ScrollView>
    </Animatable.View>
  );
};

export default FilterBar;
