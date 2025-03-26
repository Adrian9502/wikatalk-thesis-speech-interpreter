import { SafeAreaView } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import DotsLoader from "./DotLoader";

import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";
const AppLoading = () => {
  // Theme store
  const { activeTheme } = useThemeStore();
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);

  return (
    <>
      <StatusBar style="light" />
      <SafeAreaView
        style={[
          dynamicStyles.container,
          {
            justifyContent: "space-around",
          },
        ]}
      >
        <DotsLoader />
      </SafeAreaView>
    </>
  );
};

export default AppLoading;
