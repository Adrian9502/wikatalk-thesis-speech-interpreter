import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import useThemeStore, { ThemeOption } from "@/store/useThemeStore";
import { Feather } from "@expo/vector-icons";

const ThemeSelector = () => {
  const { themeOptions, activeTheme, setTheme } = useThemeStore();
  const [expanded, setExpanded] = useState(false);

  // Group themes by color category for better organization
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

  // Show only a few options when collapsed (2 from each category)
  const displayThemes = expanded
    ? themeOptions
    : [
        ...blackThemes.slice(0, 2),
        ...blueThemes.slice(0, 2),
        ...redThemes.slice(0, 2),
        ...yellowThemes.slice(0, 2),
      ];

  const renderThemeItem = ({ item }: { item: ThemeOption }) => {
    const isActive = activeTheme.name === item.name;

    return (
      <TouchableOpacity
        style={styles.themeItem}
        onPress={() => setTheme(item)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={[item.backgroundColor, item.tabBarColor]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.colorPreview, isActive && styles.activeColorPreview]}
        >
          {isActive && <Feather name="check" size={20} color="#fff" />}
        </LinearGradient>
        <Text style={styles.themeName}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Choose Theme</Text>
        <TouchableOpacity onPress={() => setExpanded(!expanded)}>
          <Text style={styles.expandButton}>
            {expanded ? "Show Less" : "Show More"}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayThemes}
        renderItem={renderThemeItem}
        keyExtractor={(item) => item.name}
        numColumns={3}
        nestedScrollEnabled={true}
        contentContainerStyle={styles.themeGrid}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#333",
  },
  expandButton: {
    fontSize: 14,
    color: "#4A6FFF",
    fontWeight: "500",
  },
  themeGrid: {
    paddingBottom: 8,
  },
  themeItem: {
    flex: 1,
    alignItems: "center",
    marginBottom: 16,
    maxWidth: "33%",
  },
  colorPreview: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  activeColorPreview: {
    borderColor: "#FCD116",
  },
  themeName: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    textAlign: "center",
    color: "#666",
  },
});

export default ThemeSelector;
