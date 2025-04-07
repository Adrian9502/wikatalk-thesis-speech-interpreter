import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import useThemeStore from "@/store/useThemeStore";
import * as ThemeRenderers from "@/components/Settings/ThemeSelectorRenderers";
import { ThemeOption } from "@/types/types";

// Category types to organize themes
type ThemeCategory = {
  name: string;
  themes: ThemeOption[];
};

const ThemeSelector = () => {
  const { themeOptions, activeTheme, setTheme } = useThemeStore();
  const [expanded, setExpanded] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [animating, setAnimating] = useState(false);

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

  // Toggle expanded state with animation
  const toggleExpanded = () => {
    if (animating) return;

    setAnimating(true);

    // Fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      // Change the expanded state
      setExpanded(!expanded);

      // Then fade back in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setAnimating(false);
      });
    });
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
      {ThemeRenderers.renderHeader(expanded, toggleExpanded)}
      <Animated.View style={{ opacity: fadeAnim }}>
        {renderThemeGrid()}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
  },
});

export default ThemeSelector;
