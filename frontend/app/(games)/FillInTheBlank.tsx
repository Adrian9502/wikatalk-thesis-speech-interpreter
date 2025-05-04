import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";

const FillInTheBlank = () => {
  // Theme store
  const { activeTheme } = useThemeStore();

  // Get the dynamic styles based on the current theme
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);
  return (
    <SafeAreaView style={dynamicStyles.container}>
      <Text style={{ color: "white", fontSize: 32 }}>FillInTheBlank</Text>
    </SafeAreaView>
  );
};

export default FillInTheBlank;

const styles = StyleSheet.create({});
