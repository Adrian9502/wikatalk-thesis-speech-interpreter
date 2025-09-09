import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { BASE_COLORS } from "@/constant/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constant/fontSizes";
import { ThemeOption } from "@/types/types";

// Render functions
export const renderHeader = (expanded: boolean, toggleExpanded: () => void) => (
  <View style={styles.headerRow}>
    <Text style={styles.title}>Choose Theme</Text>
    <TouchableOpacity
      onPress={toggleExpanded}
      activeOpacity={0.7}
      style={styles.expandButtonContainer}
    >
      <Text style={styles.expandButton}>
        {expanded ? "Show Less" : "Show More"}
      </Text>
      <Feather
        name={expanded ? "chevron-up" : "chevron-down"}
        size={16}
        color={BASE_COLORS.blue}
        style={styles.expandIcon}
      />
    </TouchableOpacity>
  </View>
);

export const renderThemeItem = (
  theme: ThemeOption,
  activeTheme: ThemeOption,
  onSelect: (theme: ThemeOption) => void
) => {
  const isActive = activeTheme.name === theme.name;

  return (
    <TouchableOpacity
      key={theme.name}
      style={styles.themeItem}
      onPress={() => onSelect(theme)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={[theme.backgroundColor, theme.secondaryColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.colorPreview, isActive && styles.activeColorPreview]}
      >
        {isActive && (
          <Feather name="check" size={20} color={BASE_COLORS.white} />
        )}
      </LinearGradient>
      <Text style={styles.themeName}>{theme.name}</Text>
    </TouchableOpacity>
  );
};

export const renderThemeRow = (
  rowItems: ThemeOption[],
  activeTheme: ThemeOption,
  onSelect: (theme: ThemeOption) => void
) => (
  <View style={styles.themeRow}>
    {rowItems.map((theme) => renderThemeItem(theme, activeTheme, onSelect))}
  </View>
);

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  title: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.darkText,
  },
  expandButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  expandButton: {
    color: BASE_COLORS.blue,
    fontSize: COMPONENT_FONT_SIZES.card.caption,
    fontFamily: POPPINS_FONT.regular,
  },
  expandIcon: {
    marginLeft: 4,
  },
  themeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  themeItem: {
    width: "23%",
    alignItems: "center",
  },
  colorPreview: {
    width: 50,
    height: 50,
    borderRadius: 20,
    padding: 5,
    borderColor: "transparent",
    borderWidth: 2,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  activeColorPreview: {
    borderColor: BASE_COLORS.blue,
    backgroundColor: BASE_COLORS.blue,
  },
  themeName: {
    fontSize: COMPONENT_FONT_SIZES.settings.itemDescription,
    fontFamily: POPPINS_FONT.regular,
    textAlign: "center",
    color: BASE_COLORS.darkText,
  },
});

export default styles;
