import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  CUSTOM_BACKGROUND,
  BASE_COLORS,
  TITLE_COLORS,
} from "@/constants/colors";
import { ThemeOption } from "@/types/types";
import createThemeOptions from "@/utils/createThemeOptions";
import { themeService } from "@/services/api/themeService";

interface ThemeState {
  activeTheme: ThemeOption;
  themeOptions: ThemeOption[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setTheme: (theme: ThemeOption) => void;
  syncThemeWithServer: () => Promise<void>;
  resetToDefaultTheme: () => void;
  findThemeByName: (name: string) => ThemeOption | undefined;
}

// Define default theme
const defaultTheme = {
  name: "Default Navy",
  backgroundColor: CUSTOM_BACKGROUND.navyBlue || "#0a0f28",
  tabBarColor: "#0a0f28",
  secondaryColor: BASE_COLORS.blue,
  tabActiveColor: TITLE_COLORS.customBlueLight,
  tabInactiveColor: "#ebe5e5",
  lightColor: BASE_COLORS.lightBlue,
};

// Helper function to get auth state without importing useAuthStore
const getAuthState = async () => {
  // Dynamically import to avoid circular dependency
  try {
    // Get auth state directly from storage
    return AsyncStorage.getItem("auth-storage").then((data) => {
      if (!data) return { isLoggedIn: false, userToken: null };
      const parsedData = JSON.parse(data);
      return {
        isLoggedIn: !!parsedData.state?.userToken,
        userToken: parsedData.state?.userToken,
      };
    });
  } catch (error) {
    console.error("Failed to get auth state:", error);
    return Promise.resolve({ isLoggedIn: false, userToken: null });
  }
};

const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      activeTheme: defaultTheme,
      themeOptions: createThemeOptions(),
      isLoading: false,
      error: null,

      findThemeByName: (name: string) => {
        const themeOptions = get().themeOptions;
        return themeOptions.find((t) => t.name === name);
      },

      setTheme: async (theme) => {
        // Make sure the theme object is complete
        let themeToSet = theme;
        if (!theme.backgroundColor) {
          const themeOptions = createThemeOptions();
          const fullTheme = themeOptions.find((t) => t.name === theme.name);
          if (fullTheme) {
            themeToSet = fullTheme;
          }
        }

        // Set the theme locally first for immediate UI update
        set({ activeTheme: themeToSet });

        // Then sync with server if user is logged in
        try {
          const authState = await getAuthState();
          console.log(
            "Auth state in setTheme:",
            authState.isLoggedIn ? "Logged in" : "Not logged in"
          );

          if (authState.isLoggedIn && authState.userToken) {
            console.log("Saving theme to server:", themeToSet.name);

            // Use themeService
            const response = await themeService.updateUserTheme(
              themeToSet.name
            );

            console.log("Theme sync response:", response);

            if (!response.success) {
              console.warn("Theme sync failed:", response);
              set({ error: "Failed to sync theme with server" });
            }
          } else {
            console.log("User not logged in, skipping server theme sync");
          }
        } catch (error: any) {
          console.error("Failed to sync theme with server:", error);
          set({ error: error.message || "Failed to sync theme with server" });
        }
      },

      syncThemeWithServer: async () => {
        set({ isLoading: true, error: null });

        try {
          const authState = await getAuthState();
          console.log(
            "Auth state in syncTheme:",
            authState.isLoggedIn ? "Logged in" : "Not logged in"
          );

          if (!authState.isLoggedIn || !authState.userToken) {
            console.log("User not logged in, skipping theme sync");
            set({ isLoading: false });
            return;
          }

          // Use themeService
          const response = await themeService.getUserTheme();

          console.log("Theme fetch response:", response);

          if (response.success && response.theme) {
            const themeName = response.theme;
            const themeFromServer = get().findThemeByName(themeName);

            if (themeFromServer) {
              set({ activeTheme: themeFromServer });
              console.log("Theme loaded from server:", themeName);
            } else {
              console.warn("Theme not found in options:", themeName);
            }
          } else {
            console.warn("Failed to fetch theme from server:", response);
            set({ error: "Failed to sync theme with server" });
          }
        } catch (error: any) {
          console.error("Failed to fetch theme from server:", error);
          set({ error: error.message || "Failed to sync theme with server" });
        } finally {
          set({ isLoading: false });
        }
      },

      resetToDefaultTheme: () => {
        console.log("Resetting to default theme");
        set({ activeTheme: defaultTheme });
      },
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ activeTheme: state.activeTheme }),
    }
  )
);

export default useThemeStore;
