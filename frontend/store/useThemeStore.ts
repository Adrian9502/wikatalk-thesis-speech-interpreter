import { create } from "zustand";

import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  CUSTOM_BACKGROUND,
  BASE_COLORS,
  TITLE_COLORS,
} from "@/constant/colors";

// Theme types - you can extend this as needed
export type ThemeOption = {
  name: string;
  backgroundColor: string;
  tabBarColor: string;
  secondaryColor: string;
  tabActiveColor: string;
  tabInactiveColor: string;
};

interface ThemeState {
  activeTheme: ThemeOption;
  themeOptions: ThemeOption[];
  setTheme: (theme: ThemeOption) => void;
}

// Create preset themes based on your existing colors
const createThemeOptions = (): ThemeOption[] => {
  return [
    // Black
    {
      name: "Black",
      backgroundColor: CUSTOM_BACKGROUND.Black,
      tabBarColor: CUSTOM_BACKGROUND.Black,
      secondaryColor: BASE_COLORS.orange,
      tabActiveColor: TITLE_COLORS.customBlueLight,
      tabInactiveColor: "#ebe5e5",
    },
    {
      name: "Charcoal Black",
      backgroundColor: CUSTOM_BACKGROUND.charcoalBlack,
      tabBarColor: CUSTOM_BACKGROUND.charcoalBlack,
      secondaryColor: BASE_COLORS.blue,
      tabActiveColor: TITLE_COLORS.customYellow,
      tabInactiveColor: "#ebe5e5",
    },
    {
      name: "Jet Black",
      backgroundColor: CUSTOM_BACKGROUND.jetBlack,
      tabBarColor: CUSTOM_BACKGROUND.jetBlack,
      secondaryColor: BASE_COLORS.blue,
      tabActiveColor: TITLE_COLORS.customYellow,
      tabInactiveColor: "#ebe5e5",
    },
    {
      name: "Matte Black",
      backgroundColor: CUSTOM_BACKGROUND.matteBlack,
      tabBarColor: CUSTOM_BACKGROUND.matteBlack,
      secondaryColor: BASE_COLORS.blue,
      tabActiveColor: TITLE_COLORS.customBlueLight,
      tabInactiveColor: "#ebe5e5",
    },
    {
      name: "Onyx Black",
      backgroundColor: CUSTOM_BACKGROUND.onyxBlack,
      tabBarColor: CUSTOM_BACKGROUND.onyxBlack,
      secondaryColor: BASE_COLORS.blue,
      tabActiveColor: TITLE_COLORS.customYellow,
      tabInactiveColor: "#ebe5e5",
    },
    // Blue
    {
      name: "Default Navy",
      backgroundColor: CUSTOM_BACKGROUND.navyBlue,
      tabBarColor: CUSTOM_BACKGROUND.navyBlue,
      secondaryColor: BASE_COLORS.blue,
      tabActiveColor: TITLE_COLORS.customBlueLight,
      tabInactiveColor: "#ebe5e5",
    },
    {
      name: "Sky Blue",
      backgroundColor: CUSTOM_BACKGROUND.skyBlue,
      tabBarColor: CUSTOM_BACKGROUND.skyBlue,
      secondaryColor: BASE_COLORS.blue,
      tabActiveColor: "#FFD700",
      tabInactiveColor: "#fff",
    },
    {
      name: "Baby Blue",
      backgroundColor: CUSTOM_BACKGROUND.babyBlue,
      tabBarColor: CUSTOM_BACKGROUND.babyBlue,
      secondaryColor: BASE_COLORS.blue,
      tabActiveColor: "#0038a8",
      tabInactiveColor: "#fff",
    },
    {
      name: "Midnight Blue",
      backgroundColor: CUSTOM_BACKGROUND.midnightBlue,
      tabBarColor: CUSTOM_BACKGROUND.midnightBlue,
      secondaryColor: BASE_COLORS.blue,
      tabActiveColor: TITLE_COLORS.customYellow,
      tabInactiveColor: "#ebe5e5",
    },
    {
      name: "Neon Blue",
      backgroundColor: CUSTOM_BACKGROUND.neonBlue,
      tabBarColor: CUSTOM_BACKGROUND.neonBlue,
      secondaryColor: BASE_COLORS.blue,
      tabActiveColor: TITLE_COLORS.customYellow,
      tabInactiveColor: "#ebe5e5",
    },
    {
      name: "Royal Blue",
      backgroundColor: CUSTOM_BACKGROUND.royalBlue,
      tabBarColor: CUSTOM_BACKGROUND.royalBlue,
      secondaryColor: "#5989ff",
      tabActiveColor: TITLE_COLORS.customYellow,
      tabInactiveColor: "#ebe5e5",
    },
    {
      name: "Sapphire ",
      backgroundColor: CUSTOM_BACKGROUND.sapphireBlue,
      tabBarColor: CUSTOM_BACKGROUND.sapphireBlue,
      secondaryColor: "#5989ff",
      tabActiveColor: TITLE_COLORS.customYellow,
      tabInactiveColor: "#ebe5e5",
    },
    {
      name: "Zaffre",
      backgroundColor: CUSTOM_BACKGROUND.zaffreBlue,
      tabBarColor: CUSTOM_BACKGROUND.zaffreBlue,
      secondaryColor: "#5989ff",
      tabActiveColor: TITLE_COLORS.customYellow,
      tabInactiveColor: "#ebe5e5",
    },
    // Red
    {
      name: "Blood Red",
      backgroundColor: CUSTOM_BACKGROUND.bloodRed,
      tabBarColor: CUSTOM_BACKGROUND.bloodRed,
      secondaryColor: BASE_COLORS.orange,
      tabActiveColor: TITLE_COLORS.customYellow,
      tabInactiveColor: "#ebe5e5",
    },
    {
      name: "Burgundy Red",
      backgroundColor: CUSTOM_BACKGROUND.burgundyRed,
      tabBarColor: CUSTOM_BACKGROUND.burgundyRed,
      secondaryColor: BASE_COLORS.orange,
      tabActiveColor: TITLE_COLORS.customYellow,
      tabInactiveColor: "#ebe5e5",
    },
    {
      name: "Cadmium Red",
      backgroundColor: CUSTOM_BACKGROUND.cadmiumRed,
      tabBarColor: CUSTOM_BACKGROUND.cadmiumRed,
      secondaryColor: BASE_COLORS.orange,
      tabActiveColor: TITLE_COLORS.customYellow,
      tabInactiveColor: "#ebe5e5",
    },
    {
      name: "Cherry Red",
      backgroundColor: CUSTOM_BACKGROUND.cherryRed,
      tabBarColor: CUSTOM_BACKGROUND.cherryRed,
      secondaryColor: BASE_COLORS.orange,
      tabActiveColor: TITLE_COLORS.customYellow,
      tabInactiveColor: "#ebe5e5",
    },
    {
      name: "Dark Red",
      backgroundColor: CUSTOM_BACKGROUND.darkRed,
      tabBarColor: CUSTOM_BACKGROUND.darkRed,
      secondaryColor: BASE_COLORS.orange,
      tabActiveColor: TITLE_COLORS.customYellow,
      tabInactiveColor: "#ebe5e5",
    },
    {
      name: "Falu",
      backgroundColor: CUSTOM_BACKGROUND.faluRed,
      tabBarColor: CUSTOM_BACKGROUND.faluRed,
      secondaryColor: BASE_COLORS.orange,
      tabActiveColor: TITLE_COLORS.customYellow,
      tabInactiveColor: "#ebe5e5",
    },
    {
      name: "Maroon",
      backgroundColor: CUSTOM_BACKGROUND.maroonRed,
      tabBarColor: CUSTOM_BACKGROUND.maroonRed,
      secondaryColor: BASE_COLORS.orange,
      tabActiveColor: TITLE_COLORS.customYellow,
      tabInactiveColor: "#ebe5e5",
    },
    {
      name: "Ox Blood",
      backgroundColor: CUSTOM_BACKGROUND.oxBloodRed,
      tabBarColor: CUSTOM_BACKGROUND.oxBloodRed,
      secondaryColor: BASE_COLORS.orange,
      tabActiveColor: TITLE_COLORS.customYellow,
      tabInactiveColor: "#ebe5e5",
    },
    // Yellow
    {
      name: "Gamboge",
      backgroundColor: CUSTOM_BACKGROUND.gambogeYellow,
      tabBarColor: CUSTOM_BACKGROUND.gambogeYellow,
      secondaryColor: "#ffaa33",
      tabActiveColor: TITLE_COLORS.customRed,
      tabInactiveColor: "#ebe5e5",
    },
    {
      name: "Mango",
      backgroundColor: CUSTOM_BACKGROUND.mangoYellow,
      tabBarColor: CUSTOM_BACKGROUND.mangoYellow,
      secondaryColor: "#ffaa33",
      tabActiveColor: TITLE_COLORS.customRed,
      tabInactiveColor: "#86670b",
    },
    {
      name: "Yellow Orange",
      backgroundColor: CUSTOM_BACKGROUND.yellowOrange,
      tabBarColor: CUSTOM_BACKGROUND.yellowOrange,
      secondaryColor: "#ffaa33",
      tabActiveColor: TITLE_COLORS.customRed,
      tabInactiveColor: "#ebe5e5",
    },
    {
      name: "Mustard",
      backgroundColor: CUSTOM_BACKGROUND.mustardYellow,
      tabBarColor: CUSTOM_BACKGROUND.mustardYellow,
      secondaryColor: "#ffaa33",
      tabActiveColor: TITLE_COLORS.customRed,
      tabInactiveColor: BASE_COLORS.darkText,
    },
    {
      name: "Amber Yellow",
      backgroundColor: CUSTOM_BACKGROUND.amberYellow,
      tabBarColor: CUSTOM_BACKGROUND.amberYellow,
      secondaryColor: "#ffaa33",
      tabActiveColor: TITLE_COLORS.customRed,
      tabInactiveColor: BASE_COLORS.darkText,
    },
    {
      name: "Cadmium Yellow",
      backgroundColor: CUSTOM_BACKGROUND.cadmiumYellow,
      tabBarColor: CUSTOM_BACKGROUND.cadmiumYellow,
      secondaryColor: "#ffaa33",
      tabActiveColor: TITLE_COLORS.customRed,
      tabInactiveColor: BASE_COLORS.darkText,
    },
    {
      name: "Amber",
      backgroundColor: CUSTOM_BACKGROUND.citrineYellow,
      tabBarColor: CUSTOM_BACKGROUND.citrineYellow,
      secondaryColor: "#ffaa33",
      tabActiveColor: TITLE_COLORS.customRed,
      tabInactiveColor: BASE_COLORS.darkText,
    },
  ];
};

// Define default theme
const defaultTheme = {
  name: "Default Navy",
  backgroundColor: CUSTOM_BACKGROUND.navyBlue || "#0a0f28",
  tabBarColor: "#0a0f28",
  secondaryColor: BASE_COLORS.blue,
  tabActiveColor: TITLE_COLORS.customBlueLight,
  tabInactiveColor: "#ebe5e5",
};
const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      activeTheme: defaultTheme,
      themeOptions: createThemeOptions(),
      setTheme: (theme) => {
        // Make sure the theme object is complete before setting it
        if (!theme.backgroundColor) {
          // Find the correct theme from themeOptions
          const themeOptions = createThemeOptions();
          const fullTheme = themeOptions.find((t) => t.name === theme.name);
          if (fullTheme) {
            console.log("Found full theme:", fullTheme);
            set({ activeTheme: fullTheme });
          } else {
            console.error("Theme not found in options:", theme.name);
            set({ activeTheme: theme });
          }
        } else {
          set({ activeTheme: theme });
        }
      },
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Make sure we're storing the full theme object
      partialize: (state) => ({ activeTheme: state.activeTheme }),
    }
  )
);

export default useThemeStore;
