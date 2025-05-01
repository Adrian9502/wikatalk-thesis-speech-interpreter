import { StyleSheet, Text, View } from "react-native";
import React from "react";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";
import { SafeAreaView } from "react-native-safe-area-context";

const Pronounce = () => {
  // Theme store
  const { activeTheme } = useThemeStore();

  // Get the dynamic styles based on the current theme
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);
  return (
    <SafeAreaView style={dynamicStyles.container}>
      <Text>Pronounce</Text>
    </SafeAreaView>
  );
};

export default Pronounce;

const styles = StyleSheet.create({});
