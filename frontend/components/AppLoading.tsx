import { SafeAreaView, StyleSheet } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import AuthLogo from "./AuthLogo";
import DotsLoader from "./DotLoader";
import { TITLE_COLORS } from "@/constant/colors";

const AppLoading = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <AuthLogo />
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
