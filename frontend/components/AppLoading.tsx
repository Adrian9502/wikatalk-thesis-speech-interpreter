import { SafeAreaView, StyleSheet } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import Logo from "./Logo";
import DotsLoader from "./DotLoader";
import { TITLE_COLORS } from "@/constant/colors";

const AppLoading = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Logo />
      <DotsLoader />
    </SafeAreaView>
  );
};

export default AppLoading;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TITLE_COLORS.customNavyBlue,
    justifyContent: "space-around",
    alignItems: "center",
  },
});
