import React, { useEffect, useState } from "react";
import useThemeStore from "@/store/useThemeStore";
import { CUSTOM_BACKGROUND } from "@/constant/colors";

interface ThemeProviderProps {
  children: React.ReactNode;
  onThemeReady?: () => void;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  onThemeReady,
}) => {
  // Load theme
  useEffect(() => {
    // Ensure theme store is initialized
    const loadTheme = async () => {
      try {
        // Small delay to ensure store is hydrated
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Signal that theme is ready
        if (onThemeReady) {
          onThemeReady();
        }
      } catch (error) {
        console.error("Error initializing theme:", error);
        // Signal ready anyway to prevent infinite loading
        if (onThemeReady) {
          onThemeReady();
        }
      }
    };

    loadTheme();
  }, [onThemeReady]);

  return <>{children}</>;
};

export default ThemeProvider;
