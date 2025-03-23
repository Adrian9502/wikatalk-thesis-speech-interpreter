import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import useThemeStore from "@/store/useThemeStore";
import { CUSTOM_BACKGROUND } from "@/constant/colors";
import DotsLoader from "./DotLoader";

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { activeTheme } = useThemeStore();

  useEffect(() => {
    // When the store is hydrated
    setTimeout(() => setIsLoaded(true), 500);
  }, []);

  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor:
            activeTheme.backgroundColor || CUSTOM_BACKGROUND.navyBlue,
        }}
      >
        <DotsLoader />
      </View>
    );
  }

  return <>{children}</>;
};

export default ThemeProvider;
