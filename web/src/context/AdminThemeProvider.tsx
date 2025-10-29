import React, { useState } from "react";
import { AdminThemeContext } from "../types/adminThemeContext";

type ThemeMode = "light" | "dark";

export const AdminThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("adminThemeMode");
    return (saved as ThemeMode) || "light";
  });

  const toggleTheme = () => {
    setMode((prev) => {
      const newMode = prev === "light" ? "dark" : "light";
      localStorage.setItem("adminThemeMode", newMode);
      return newMode;
    });
  };

  return (
    <AdminThemeContext.Provider
      value={{ mode, toggleTheme, isDark: mode === "dark" }}
    >
      {children}
    </AdminThemeContext.Provider>
  );
};
