import { SafeAreaView } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import Logo from "./Logo";
import DotsLoader from "./DotLoader";

import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";
const AppLoading = () => {
  // Theme store
  const { activeTheme } = useThemeStore();
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);

  return (
    <SafeAreaView
      style={[
        dynamicStyles.container,
        {
          flex: 1,
          justifyContent: "space-around",
          alignItems: "center",
        },
      ]}
    >
      <StatusBar style="light" />
      <Logo />
      <DotsLoader />
    </SafeAreaView>
  );
};

export default AppLoading;
