import { Zap, Search, Edit2 } from "react-native-feather";

type IconProps = {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
};

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
  yellow: "#FFD700",
  offWhite: "#F5F5F5",
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

// network status bar component colors
export const NETWORK_STATUS_BACKGROUND_COLORS = {
  offline: "#ce1126" as const,
  slow: "#D97706" as const,
};
// Homepage gradient colors
export const HOMEPAGE_COLORS = {
  // blue
  speech: ["#1d4ed8", "#3b82f6", "#60a5fa"] as const,
  // red
  translate: ["#dc2626", "#ef4444", "#f87171"] as const,
  // yellow
  scan: ["#d97706", "#f59e0b", "#fbbf24"] as const,
  // red
  games: ["#dc2626", "#ef4444", "#f87171"] as const,
  // blue
  pronounce: ["#1d4ed8", "#3b82f6", "#60a5fa"] as const,
};

// Colors for icon
export const ICON_COLORS = {
  brightYellow: "#fbff26ff" as const,
  gold: "#FFD700" as const,
  silver: "#C0C0C0" as const,
  bronze: "#CD7F32" as const,
  white: "#fff" as const,
};

// LevelCard colors
export const DIFFICULTY_COLORS = {
  Easy: ["#019c3aff", "#007F3B"] as const,
  Medium: ["#b36b00ff", "#d45e09ff"] as const,
  Hard: ["#c20d00ff", "#9e0135ff"] as const,
};
export const RANKING_SELECTOR_COLORS = ["#c9a60cff", "#b36b00ff"] as const;

// game card game mode gradients

export const GAME_MODE_GRADIENTS = {
  multipleChoice: ["#AD8A2B", "#E5C33B"] as const,
  identification: ["#2B52AD", "#3B6FE5"] as const,
  fillBlanks: ["#AD2B2B", "#E53B3B"] as const,
};

// Word of the Day card gradient
export const WORD_OF_DAY_GRADIENT = ["#3168dfff", "#0a7d94ff"] as const;

// Navigation colors on GameNavigation
export const NAVIGATION_COLORS = {
  green: ["#029c35ff", "#0daf5eff"] as const,
  yellow: ["#BA8E23", "#b9a115ff"] as const,
  blue: ["#02359cff", "#0a7d94ff"] as const,
  red: ["#9c0202ff", "#d64343ff"] as const,
  disabled: ["rgba(255, 255, 255, 0.15)", "rgba(255, 255, 255, 0.08)"] as const,
};

// Game icon colors
export const GAME_ICONS_COLORS = {
  multipleChoice: (props: IconProps) => <Zap {...props} color="#FFF" />,
  identification: (props: IconProps) => <Search {...props} color="#FFF" />,
  fillBlanks: (props: IconProps) => <Edit2 {...props} color="#FFF" />,
};

// Hero gradient colors on answer review
export const GAME_RESULT_COLORS = {
  userExit: ["#BA8E23", "#b9a115ff"] as const,
  correctAnswer: ["#029c35ff", "#0daf5eff"] as const,
  incorrectAnswer: ["#9c0202ff", "#d64343ff"] as const,
};

export const RANKING_COLORS = ["#053691ff", "#0a7d94ff"] as const;
