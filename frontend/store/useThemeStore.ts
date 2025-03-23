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
  lightColor: string;
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
      secondaryColor: BASE_COLORS.blue,
      tabActiveColor: TITLE_COLORS.customBlueLight,
      tabInactiveColor: "#ebe5e5",
      lightColor: BASE_COLORS.lightBlue,
    },
    {
      name: "Charcoal Black",
      backgroundColor: CUSTOM_BACKGROUND.charcoalBlack,
      tabBarColor: CUSTOM_BACKGROUND.charcoalBlack,
      secondaryColor: BASE_COLORS.blue,
      tabActiveColor: TITLE_COLORS.customYellow,
      tabInactiveColor: "#ebe5e5",
      lightColor: BASE_COLORS.lightBlue,
    },
    {
      name: "Jet Black",
      backgroundColor: CUSTOM_BACKGROUND.jetBlack,
      tabBarColor: CUSTOM_BACKGROUND.jetBlack,
      secondaryColor: BASE_COLORS.blue,
      tabActiveColor: TITLE_COLORS.customYellow,
      tabInactiveColor: "#ebe5e5",
      lightColor: BASE_COLORS.lightBlue,
    },
    {
      name: "Matte Black",
      backgroundColor: CUSTOM_BACKGROUND.matteBlack,
      tabBarColor: CUSTOM_BACKGROUND.matteBlack,
      secondaryColor: BASE_COLORS.blue,
      tabActiveColor: TITLE_COLORS.customBlueLight,
      tabInactiveColor: "#ebe5e5",
      lightColor: BASE_COLORS.lightBlue,
    },
    {
      name: "Onyx Black",
      backgroundColor: CUSTOM_BACKGROUND.onyxBlack,
      tabBarColor: CUSTOM_BACKGROUND.onyxBlack,
      secondaryColor: BASE_COLORS.blue,
      tabActiveColor: TITLE_COLORS.customYellow,
      tabInactiveColor: "#ebe5e5",
      lightColor: BASE_COLORS.lightBlue,
    },
    // Blue
    {
      name: "Default Navy",
      backgroundColor: CUSTOM_BACKGROUND.navyBlue,
      tabBarColor: CUSTOM_BACKGROUND.navyBlue,
      secondaryColor: BASE_COLORS.blue,
      tabActiveColor: TITLE_COLORS.customBlueLight,
      tabInactiveColor: "#ebe5e5",
      lightColor: BASE_COLORS.lightBlue,
    },
    {
      name: "Sky Blue",
      backgroundColor: CUSTOM_BACKGROUND.skyBlue,
      tabBarColor: CUSTOM_BACKGROUND.skyBlue,
      secondaryColor: BASE_COLORS.blue,
      tabActiveColor: "#FFD700",
      tabInactiveColor: "#fff",
      lightColor: BASE_COLORS.lightBlue,
    },
    {
      name: "Baby Blue",
      backgroundColor: CUSTOM_BACKGROUND.babyBlue,
      tabBarColor: CUSTOM_BACKGROUND.babyBlue,
      secondaryColor: BASE_COLORS.blue,
      tabActiveColor: "#483607",
      tabInactiveColor: "#686861",
      lightColor: BASE_COLORS.lightBlue,
    },
    {
      name: "Midnight Blue",
      backgroundColor: CUSTOM_BACKGROUND.midnightBlue,
      tabBarColor: CUSTOM_BACKGROUND.midnightBlue,
      secondaryColor: BASE_COLORS.blue,
      tabActiveColor: TITLE_COLORS.customYellow,
      tabInactiveColor: "#ebe5e5",
      lightColor: BASE_COLORS.lightBlue,
    },
    {
      name: "Neon Blue",
      backgroundColor: CUSTOM_BACKGROUND.neonBlue,
      tabBarColor: CUSTOM_BACKGROUND.neonBlue,
      secondaryColor: BASE_COLORS.blue,
      tabActiveColor: TITLE_COLORS.customYellow,
      tabInactiveColor: "#ebe5e5",
      lightColor: BASE_COLORS.lightBlue,
    },
    {
      name: "Royal Blue",
      backgroundColor: CUSTOM_BACKGROUND.royalBlue,
      tabBarColor: CUSTOM_BACKGROUND.royalBlue,
      secondaryColor: "#5989ff",
      tabActiveColor: TITLE_COLORS.customYellow,
      tabInactiveColor: "#ebe5e5",
      lightColor: BASE_COLORS.lightBlue,
    },
    {
      name: "Sapphire ",
      backgroundColor: CUSTOM_BACKGROUND.sapphireBlue,
      tabBarColor: CUSTOM_BACKGROUND.sapphireBlue,
      secondaryColor: "#5989ff",
      tabActiveColor: TITLE_COLORS.customYellow,
      tabInactiveColor: "#ebe5e5",
      lightColor: BASE_COLORS.lightBlue,
    },
    {
      name: "Zaffre",
      backgroundColor: CUSTOM_BACKGROUND.zaffreBlue,
      tabBarColor: CUSTOM_BACKGROUND.zaffreBlue,
      secondaryColor: "#5989ff",
      tabActiveColor: TITLE_COLORS.customYellow,
      tabInactiveColor: "#ebe5e5",
      lightColor: BASE_COLORS.lightBlue,
    },
    // Red
    {
      name: "Blood Red",
      backgroundColor: CUSTOM_BACKGROUND.bloodRed,
      tabBarColor: CUSTOM_BACKGROUND.bloodRed,
      secondaryColor: BASE_COLORS.orange,
      tabActiveColor: TITLE_COLORS.customYellow,
      tabInactiveColor: "#ebe5e5",
      lightColor: BASE_COLORS.lightPink,
    },
    {
      name: "Burgundy Red",
      backgroundColor: CUSTOM_BACKGROUND.burgundyRed,
      tabBarColor: CUSTOM_BACKGROUND.burgundyRed,
      secondaryColor: BASE_COLORS.orange,
      tabActiveColor: TITLE_COLORS.customYellow,
      tabInactiveColor: "#ebe5e5",
      lightColor: BASE_COLORS.lightPink,
    },
    {
      name: "Cadmium Red",
      backgroundColor: CUSTOM_BACKGROUND.cadmiumRed,
      tabBarColor: CUSTOM_BACKGROUND.cadmiumRed,
      secondaryColor: BASE_COLORS.orange,
      tabActiveColor: TITLE_COLORS.customYellow,
      tabInactiveColor: "#ebe5e5",
      lightColor: BASE_COLORS.lightPink,
    },
    {
      name: "Cherry Red",
      backgroundColor: CUSTOM_BACKGROUND.cherryRed,
      tabBarColor: CUSTOM_BACKGROUND.cherryRed,
      secondaryColor: BASE_COLORS.orange,
      tabActiveColor: TITLE_COLORS.customYellow,
      tabInactiveColor: "#ebe5e5",
      lightColor: BASE_COLORS.lightPink,
    },
    {
      name: "Dark Red",
      backgroundColor: CUSTOM_BACKGROUND.darkRed,
      tabBarColor: CUSTOM_BACKGROUND.darkRed,
      secondaryColor: BASE_COLORS.orange,
      tabActiveColor: TITLE_COLORS.customYellow,
      tabInactiveColor: "#ebe5e5",
      lightColor: BASE_COLORS.lightPink,
    },
    {
      name: "Falu",
      backgroundColor: CUSTOM_BACKGROUND.faluRed,
      tabBarColor: CUSTOM_BACKGROUND.faluRed,
      secondaryColor: BASE_COLORS.orange,
      tabActiveColor: TITLE_COLORS.customYellow,
      tabInactiveColor: "#ebe5e5",
      lightColor: BASE_COLORS.lightPink,
    },
    {
      name: "Maroon",
      backgroundColor: CUSTOM_BACKGROUND.maroonRed,
      tabBarColor: CUSTOM_BACKGROUND.maroonRed,
      secondaryColor: BASE_COLORS.orange,
      tabActiveColor: TITLE_COLORS.customYellow,
      tabInactiveColor: "#ebe5e5",
      lightColor: BASE_COLORS.lightPink,
    },
    {
      name: "Ox Blood",
      backgroundColor: CUSTOM_BACKGROUND.oxBloodRed,
      tabBarColor: CUSTOM_BACKGROUND.oxBloodRed,
      secondaryColor: BASE_COLORS.orange,
      tabActiveColor: TITLE_COLORS.customYellow,
      tabInactiveColor: "#ebe5e5",
      lightColor: BASE_COLORS.lightPink,
    },
    // Yellow
    {
      name: "Gamboge",
      backgroundColor: CUSTOM_BACKGROUND.gambogeYellow,
      tabBarColor: CUSTOM_BACKGROUND.gambogeYellow,
      secondaryColor: "#ff930c",
      tabActiveColor: TITLE_COLORS.customRed,
      tabInactiveColor: "#1a1a1a",
      lightColor: "#fffcdf",
    },
    {
      name: "Mango",
      backgroundColor: CUSTOM_BACKGROUND.mangoYellow,
      tabBarColor: CUSTOM_BACKGROUND.mangoYellow,
      secondaryColor: "#ff930c",
      tabActiveColor: TITLE_COLORS.customRed,
      tabInactiveColor: "#1a1a1a",
      lightColor: "#fffcdf",
    },
    {
      name: "Yellow Orange",
      backgroundColor: CUSTOM_BACKGROUND.yellowOrange,
      tabBarColor: CUSTOM_BACKGROUND.yellowOrange,
      secondaryColor: "#ff930c",
      tabActiveColor: TITLE_COLORS.customRed,
      tabInactiveColor: "#1a1a1a",
      lightColor: "#fffcdf",
    },
    {
      name: "Mustard",
      backgroundColor: CUSTOM_BACKGROUND.mustardYellow,
      tabBarColor: CUSTOM_BACKGROUND.mustardYellow,
      secondaryColor: "#ff930c",
      tabActiveColor: TITLE_COLORS.customRed,
      tabInactiveColor: BASE_COLORS.darkText,
      lightColor: "#fffcdf",
    },
    {
      name: "Amber Yellow",
      backgroundColor: CUSTOM_BACKGROUND.amberYellow,
      tabBarColor: CUSTOM_BACKGROUND.amberYellow,
      secondaryColor: "#ff930c",
      tabActiveColor: TITLE_COLORS.customRed,
      tabInactiveColor: BASE_COLORS.darkText,
      lightColor: "#fffcdf",
    },
    {
      name: "Cadmium Yellow",
      backgroundColor: CUSTOM_BACKGROUND.cadmiumYellow,
      tabBarColor: CUSTOM_BACKGROUND.cadmiumYellow,
      secondaryColor: "#ff930c",
      tabActiveColor: TITLE_COLORS.customRed,
      tabInactiveColor: BASE_COLORS.darkText,
      lightColor: "#fffcdf",
    },
    {
      name: "Amber",
      backgroundColor: CUSTOM_BACKGROUND.citrineYellow,
      tabBarColor: CUSTOM_BACKGROUND.citrineYellow,
      secondaryColor: "#ff930c",
      tabActiveColor: TITLE_COLORS.customRed,
      tabInactiveColor: BASE_COLORS.darkText,
      lightColor: "#fffcdf",
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
  lightColor: BASE_COLORS.lightBlue,
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
