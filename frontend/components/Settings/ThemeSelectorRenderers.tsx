import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { BASE_COLORS } from "@/constant/colors";
import { ThemeOption } from "@/store/useThemeStore";

// Render functions
export const renderHeader = (expanded: boolean, toggleExpanded: () => void) => (
  <View style={styles.headerRow}>
    <Text style={styles.title}>Choose Theme</Text>
    <TouchableOpacity onPress={toggleExpanded}>
      <Text style={styles.expandButton}>
        {expanded ? "Show Less" : "Show More"}
      </Text>
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
        {isActive && <Feather name="check" size={20} color="#fff" />}
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
    {rowItems.map((theme) => (
      <React.Fragment key={theme.name}>
        {renderThemeItem(theme, activeTheme, onSelect)}
      </React.Fragment>
    ))}
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
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: "#333",
  },
  expandButton: {
    fontSize: 12,
    color: "#4A6FFF",
    fontFamily: "Poppins-Medium",
  },
  themeRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 5,
  },
  themeItem: {
    flex: 1,
    alignItems: "center",
    maxWidth: "33%",
  },
  colorPreview: {
    width: 60,
    height: 60,
    padding: 5,
    marginBottom: 6,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "transparent",
    borderRadius: 12,
  },
  activeColorPreview: {
    borderColor: BASE_COLORS.blue,
    backgroundColor: BASE_COLORS.blue,
  },
  themeName: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    textAlign: "center",
    color: "#666",
  },
});

export default styles;
