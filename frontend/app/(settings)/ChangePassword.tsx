import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";
const ChangePassword = () => {
  // Theme store
  const { activeTheme } = useThemeStore();

  // Get the dynamic styles based on the current theme
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <Text>ChangePassword</Text>
    </SafeAreaView>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({});
