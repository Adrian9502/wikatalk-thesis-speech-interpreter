import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { getGlobalStyles } from "@/styles/globalStyles";
import useThemeStore from "@/store/useThemeStore";

const Identification = () => {
  // Theme store
  const { activeTheme } = useThemeStore();

  // Get the dynamic styles based on the current theme
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);
  return (
    <SafeAreaView style={dynamicStyles.container}>
      <Text style={{ color: "white", fontSize: 32 }}>Identification</Text>
    </SafeAreaView>
  );
};

export default Identification;

const styles = StyleSheet.create({});
