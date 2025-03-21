import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import useThemeStore from "@/store/useThemeStore";

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { activeTheme } = useThemeStore();

  useEffect(() => {
    // When the store is hydrated
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: activeTheme.backgroundColor,
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return <>{children}</>;
};

export default ThemeProvider;
