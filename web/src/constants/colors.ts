export const COLORS = {
  // Primary brand colors
  primary: {
    navyBlue: "#0A0F28",
    blue: "#1F51FF",
    red: "#FF3B30",
    yellow: "#FFD700",
    white: "#FFFFFF",
  },

  // Secondary colors
  secondary: {
    lightBlue: "#4785FF",
    lightRed: "#FF6B6B",
    lightYellow: "#FCD116",
    gray: "#6B7280",
    lightGray: "#F3F4F6",
    darkGray: "#374151",
  },

  // Background variants
  background: {
    primary: "#0A0F28",
    dark: "#0A0E2A",
    light: "#1A2355",
    white: "#FFFFFF",
    overlay: "rgba(15, 22, 66, 0.9)",
  },

  // Text colors
  text: {
    primary: "#FFFFFF",
    secondary: "rgba(255, 255, 255, 0.8)",
    yellow: "#FFD700",
    dark: "#1F2937",
  },

  // Gradients (similar to your mobile app)
  gradients: {
    primary: "linear-gradient(135deg, #1F51FF 0%, #0F1642 100%)",
    secondary: "linear-gradient(135deg, #FFD700 0%, #FF3B30 100%)",
    hero: "linear-gradient(135deg, #0F1642 0%, #1F51FF 50%, #0A0E2A 100%)",
    feature:
      "linear-gradient(135deg, rgba(31, 81, 255, 0.1) 0%, rgba(15, 22, 66, 0.1) 100%)",
  },
} as const;

// Feature specific colors (matching your mobile app features)
export const FEATURE_COLORS = {
  translate: {
    primary: "#1F51FF",
    gradient: "linear-gradient(135deg, #1F51FF 0%, #0A7D94 100%)",
  },
  speech: {
    primary: "#FFD700",
    gradient: "linear-gradient(135deg, #FFD700 0%, #B9A115 100%)",
  },
  scan: {
    primary: "#FF3B30",
    gradient: "linear-gradient(135deg, #FF3B30 0%, #D64343 100%)",
  },
  games: {
    primary: "#A52FCF",
    gradient: "linear-gradient(135deg, #6B029C 0%, #A52FCF 100%)",
  },
  pronounce: {
    primary: "#10B981",
    gradient: "linear-gradient(135deg, #029C35 0%, #0DAF5E 100%)",
  },
} as const;
