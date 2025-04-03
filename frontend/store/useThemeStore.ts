import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {
  CUSTOM_BACKGROUND,
  BASE_COLORS,
  TITLE_COLORS,
} from "@/constant/colors";
import { ThemeOption } from "@/types/types";
import createThemeOptions from "@/utils/createThemeOptions";

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

// API URL from environment
const API_URL = `${process.env.EXPO_PUBLIC_BACKEND_URL}`;

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
const getAuthState = () => {
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
            const response = await axios.post(
              `${API_URL}/api/users/theme`,
              { themeName: themeToSet.name },
              {
                headers: {
                  Authorization: `Bearer ${authState.userToken}`,
                  "Content-Type": "application/json",
                },
              }
            );

            console.log("Theme sync response:", response.status, response.data);
          } else {
            console.log("User not logged in, skipping server theme sync");
          }
        } catch (error) {
          console.error("Failed to sync theme with server:", error);
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

          // Get user's theme from server
          const response = await axios.get(`${API_URL}/api/users/theme`, {
            headers: {
              Authorization: `Bearer ${authState.userToken}`,
              "Content-Type": "application/json",
            },
          });

          console.log("Theme fetch response:", response.status, response.data);

          if (response.data.success && response.data.theme) {
            const themeName = response.data.theme;
            const themeFromServer = get().findThemeByName(themeName);

            if (themeFromServer) {
              set({ activeTheme: themeFromServer });
              console.log("Theme loaded from server:", themeName);
            } else {
              console.warn("Theme not found in options:", themeName);
            }
          }
        } catch (error) {
          console.error("Failed to fetch theme from server:", error);
          set({ error: "Failed to sync theme with server" });
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
