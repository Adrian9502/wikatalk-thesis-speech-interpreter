import React from "react";
import { Text, TouchableOpacity } from "react-native";
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
  return (
    <Animatable.View
      animation="fadeIn"
      duration={500}
      style={styles.filterContainer}
    >
      <TouchableOpacity
        style={[
          styles.filterButton,
          activeFilter === "all" && {
            backgroundColor: activeTheme.tabActiveColor,
          },
        ]}
        onPress={() => setActiveFilter("all")}
        accessible={true}
        accessibilityLabel="Show all levels"
        accessibilityRole="button"
      >
        <Text
          style={[
            styles.filterText,
            activeFilter === "all" && styles.activeFilterText,
          ]}
        >
          All
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          activeFilter === "completed" && {
            backgroundColor: activeTheme.tabActiveColor,
          },
        ]}
        onPress={() => setActiveFilter("completed")}
        accessible={true}
        accessibilityLabel="Show completed levels"
        accessibilityRole="button"
      >
        <Text
          style={[
            styles.filterText,
            activeFilter === "completed" && styles.activeFilterText,
          ]}
        >
          Completed
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          activeFilter === "current" && {
            backgroundColor: activeTheme.tabActiveColor,
          },
        ]}
        onPress={() => setActiveFilter("current")}
        accessible={true}
        accessibilityLabel="Show current levels"
        accessibilityRole="button"
      >
        <Text
          style={[
            styles.filterText,
            activeFilter === "current" && styles.activeFilterText,
          ]}
        >
          Current
        </Text>
      </TouchableOpacity>
    </Animatable.View>
  );
};

export default FilterBar;
