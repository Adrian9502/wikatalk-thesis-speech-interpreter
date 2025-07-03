export const TITLE_COLORS: Record<string, string> = {
  customNavyBlue: "#E4D00A",
  customYellow: "#FCD116",
  customBlue: "#0038a8",
  customBlueLight: "#4785ff",
  customRed: "#ce1126",
  customWhite: "#F5F5F5",
};

export const CUSTOM_BACKGROUND = {
  // Black
  Black: "#000000",
  charcoalBlack: "#36454F",
  jetBlack: "#343434",
  matteBlack: "#28282B",
  onyxBlack: "#353935",

  // Blue
  navyBlue: "#0a0f28",
  skyBlue: "#2EA6D9",
  babyBlue: "#89CFF0",
  midnightBlue: "#191970",
  neonBlue: "#1F51FF",
  royalBlue: "#4169E1",
  sapphireBlue: "#0F52BA",
  zaffreBlue: "#0818A8",

  // Red
  bloodRed: "#8B0000",
  burgundyRed: "#800020",
  cadmiumRed: "#D22B2B",
  cherryRed: "#D2042D",
  darkRed: "#8B0000",
  faluRed: "#7B1818",
  maroonRed: "#800000",
  oxBloodRed: "#4A0404",

  // Yellow
  gambogeYellow: "#E49B0F",
  mangoYellow: "#F4BB44",
  yellowOrange: "#FFAA33",
  mustardYellow: "#FFDB58",
  amberYellow: "#FFBF00",
  cadmiumYellow: "#FDDA0D",
  citrineYellow: "#E4D00A",
};
/*
ORIGINAL:  
  lightBlue: "#E2EAFF",
  lightPink: "#F3E2FF",
Alternative colors for light blue and light pink
  lightBlue: "#cddbfe",
  lightPink: "#f2dfff",
*/

export const BASE_COLORS: Record<string, string> = {
  blue: "#3B6FE5",
  orange: "#FF6B6B",
  lightBlue: "#d9e3ff",
  lightPink: "#f2dfff",
  white: "#FFFFFF",
  darkText: "#212132",
  placeholderText: "#9E9EA7",
  borderColor: "#E8E8ED",
  success: "#10B981",
  danger: "#F44336",
};

export const getPositionalColors = (
  position: "top" | "bottom"
): Record<string, string> => {
  return {
    primary: position === "top" ? BASE_COLORS.blue : BASE_COLORS.orange,
    secondary:
      position === "top" ? BASE_COLORS.lightBlue : BASE_COLORS.lightPink,
    background: BASE_COLORS.white,
    text: BASE_COLORS.darkText,
    placeholder: BASE_COLORS.placeholderText,
    border: BASE_COLORS.borderColor,
    success: BASE_COLORS.success,
  };
};

export const difficultyColors = {
  Easy: ["#22C216", "#007F3B"] as const,
  Medium: ["#FF8E2B", "#B52A00"] as const,
  Hard: ["#FF2919", "#B80D5F"] as const,
};

// Game mode navigation
export const gameModeNavigationColors = {
  identification: ["#2563EB", "#1E40AF"] as const,
  fillBlanks: ["#F97316", "#C2410C"] as const,
  multipleChoice: ["#22C55E", "#15803D"] as const,
};
