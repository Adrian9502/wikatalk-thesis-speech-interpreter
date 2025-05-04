import { StyleSheet, Text, View } from "react-native";
import React from "react";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";
import { SafeAreaView } from "react-native-safe-area-context";

const Games = () => {
  // Theme store
  const { activeTheme } = useThemeStore();

  // Get the dynamic styles based on the current theme
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);
  return (
    <SafeAreaView style={dynamicStyles.container}>
      <Text style={{ color: "white", fontSize: 42 }}>Games</Text>
    </SafeAreaView>
  );
};

export default Games;

const styles = StyleSheet.create({});
