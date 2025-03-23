import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import useThemeStore, { ThemeOption } from "@/store/useThemeStore";
import * as ThemeRenderers from "@/components/Settings/ThemeSelectorRenderers";

// Category types to organize themes
type ThemeCategory = {
  name: string;
  themes: ThemeOption[];
};

const ThemeSelector = () => {
  const { themeOptions, activeTheme, setTheme } = useThemeStore();
  const [expanded, setExpanded] = useState(false);

  // Organize themes by category
  const categorizeThemes = (): ThemeCategory[] => {
    // Group themes by color category
    const blackThemes = themeOptions.filter((theme) =>
      theme.name.includes("Black")
    );

    const blueThemes = themeOptions.filter((theme) =>
      theme.name.includes("Blue")
    );

    const redThemes = themeOptions.filter(
      (theme) =>
        theme.name.includes("Red") ||
        theme.name.includes("Maroon") ||
        theme.name.includes("Ox Blood")
    );

    const yellowThemes = themeOptions.filter(
      (theme) =>
        theme.name.includes("Yellow") ||
        theme.name.includes("Amber") ||
        theme.name.includes("Gamboge") ||
        theme.name.includes("Mango") ||
        theme.name.includes("Mustard") ||
        theme.name.includes("Citrine")
    );

    return [
      { name: "Black", themes: blackThemes },
      { name: "Blue", themes: blueThemes },
      { name: "Red", themes: redThemes },
      { name: "Yellow", themes: yellowThemes },
    ];
  };

  // Get themes to display based on expanded state
  const getDisplayThemes = (): ThemeOption[] => {
    if (expanded) {
      return themeOptions;
    }

    // When collapsed, show 2 themes from each category
    const categories = categorizeThemes();
    return categories.flatMap((category) => category.themes.slice(0, 2));
  };

  // Create grid layout by rows
  const renderThemeGrid = () => {
    const displayThemes = getDisplayThemes();
    const itemsPerRow = 4;
    const rows = [];

    for (let i = 0; i < displayThemes.length; i += itemsPerRow) {
      const rowItems = displayThemes.slice(i, i + itemsPerRow);
      rows.push(
        <View key={`theme-row-${i}`}>
          {ThemeRenderers.renderThemeRow(rowItems, activeTheme, setTheme)}
        </View>
      );
    }

    return rows;
  };

  return (
    <View style={styles.container}>
      {ThemeRenderers.renderHeader(expanded, () => setExpanded(!expanded))}
      <View>{renderThemeGrid()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
  },
});

export default ThemeSelector;
