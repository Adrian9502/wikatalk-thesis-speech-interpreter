import React from "react";
import { Text, TouchableOpacity, View, ScrollView } from "react-native";
import * as Animatable from "react-native-animatable";
import { levelStyles as styles } from "@/styles/games/levels.styles";
import useThemeStore from "@/store/useThemeStore";

interface FilterBarProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  activeFilter,
  setActiveFilter,
}) => {
  const { activeTheme } = useThemeStore();

  const renderFilterButton = (
    filter: string,
    label: string,
    icon?: React.ReactNode
  ) => {
    const isActive = activeFilter === filter;

    return (
      <TouchableOpacity
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
        ]}
        onPress={() => setActiveFilter(filter)}
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

  // Simplified difficulty filter - just text, no stars
  const renderDifficultyFilter = (difficulty: string) => {
    // Capitalize the first letter of the difficulty
    const label = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

    // Just render the button with text, no icon/stars
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
