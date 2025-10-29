import { useContext } from "react";
import { AdminThemeContext } from "../types/adminThemeContext";

export const useAdminTheme = () => {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error("useAdminTheme must be used within AdminThemeProvider");
  }
  return context;
};
