import { createContext } from "react";

type ThemeMode = "light" | "dark";

export interface AdminThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  isDark: boolean;
}

export const AdminThemeContext = createContext<
  AdminThemeContextType | undefined
>(undefined);
