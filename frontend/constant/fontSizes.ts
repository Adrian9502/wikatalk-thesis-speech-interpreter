import { Dimensions } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Check for different screen sizes
const isSmallScreen = screenWidth <= 384 && screenHeight <= 1280; // Nexus 4 and similar
const isMediumScreen = screenWidth <= 414 && screenHeight <= 896; // iPhone X/11 and similar

// Base font sizes optimized for non-scaling text
export const FONT_SIZES = {
  // Extra Small - for secondary info, captions
  xs: isSmallScreen ? 7 : 9,

  // Small - for descriptions, helper text
  sm: isSmallScreen ? 8 : isMediumScreen ? 9 : 10,

  // Medium - for body text, standard content
  md: isSmallScreen ? 9 : isMediumScreen ? 10 : 11,

  // Large - for important text, input fields
  lg: isSmallScreen ? 10 : isMediumScreen ? 11 : 12,

  // Extra Large - for section titles, button text
  xl: isSmallScreen ? 11 : isMediumScreen ? 12 : 13,

  // 2X Large - for card titles, important headings
  "2xl": isSmallScreen ? 12 : isMediumScreen ? 13 : 14,

  // 3X Large - for main titles, headers
  "3xl": isSmallScreen ? 14 : isMediumScreen ? 15 : 16,

  // 4X Large - for page titles, main headings
  "4xl": isSmallScreen ? 16 : isMediumScreen ? 18 : 20,

  // 5X Large - for app name, main branding
  "5xl": isSmallScreen ? 20 : isMediumScreen ? 24 : 28,
} as const;

// Specific font sizes for different components
export const COMPONENT_FONT_SIZES = {
  // Button text
  button: {
    small: FONT_SIZES.sm,
    medium: FONT_SIZES.lg,
    large: FONT_SIZES.xl,
  },

  // Input fields
  input: {
    placeholder: FONT_SIZES.md,
    text: FONT_SIZES.xl,
    label: FONT_SIZES.sm,
  },

  // Cards
  card: {
    title: FONT_SIZES.xl,
    subtitle: FONT_SIZES.md,
    description: FONT_SIZES.sm,
    caption: FONT_SIZES.xs,
  },

  // Navigation
  navigation: {
    title: FONT_SIZES["2xl"],
    tabLabel: FONT_SIZES.xs,
    headerTitle: FONT_SIZES["3xl"],
  },

  // Game components
  game: {
    question: FONT_SIZES["2xl"],
    answer: FONT_SIZES.lg,
    instruction: FONT_SIZES.md,
    score: FONT_SIZES.xl,
    level: FONT_SIZES.sm,
  },

  // Translation components (used by both Translate and Scan tabs)
  translation: {
    sourceText: FONT_SIZES["2xl"],
    translatedText: FONT_SIZES["2xl"],
    language: FONT_SIZES.lg,
    pronunciation: FONT_SIZES.sm,
  },

  // Speech-specific components
  speech: {
    recordingDuration: FONT_SIZES.xs,
    languageLabel: FONT_SIZES.sm,
    errorMessage: FONT_SIZES.md,
    loadingText: FONT_SIZES.md,
    modalTitle: FONT_SIZES.lg,
    dropdownText: FONT_SIZES.md,
  },

  // Scan-specific components
  scan: {
    permissionText: FONT_SIZES.lg,
    permissionButton: FONT_SIZES.sm,
    progressText: FONT_SIZES.sm,
    cameraLabel: FONT_SIZES.md,
    statusText: FONT_SIZES.sm,
  },

  pronunciation: {
    headerTitle: FONT_SIZES.xl,
    cardTitle: FONT_SIZES.xl,
    cardTranslation: FONT_SIZES.md,
    cardPronunciation: FONT_SIZES.md,
    searchPlaceholder: FONT_SIZES.md,
    dropdownText: FONT_SIZES.md,
    emptyStateTitle: FONT_SIZES["2xl"],
    emptyStateText: FONT_SIZES.md,
    errorTitle: FONT_SIZES["2xl"],
    errorText: FONT_SIZES.md,
    buttonText: FONT_SIZES.md,
  },

  // Home page components
  home: {
    greeting: FONT_SIZES.sm,
    sectionTitle: FONT_SIZES.lg,
    featuredTitle: FONT_SIZES.lg,
    featuredDescription: FONT_SIZES.sm,
    statsValue: FONT_SIZES["2xl"],
    statsLabel: FONT_SIZES.xs,
  },

  // Settings
  settings: {
    title: FONT_SIZES["2xl"],
    itemTitle: FONT_SIZES.lg,
    itemDescription: FONT_SIZES.xs,
    sectionHeader: FONT_SIZES.md,
  },
} as const;

// Line heights that work well with the font sizes
export const LINE_HEIGHTS = {
  tight: 1.25,
  normal: 1.4,
  relaxed: 1.6,
  loose: 1.8,
} as const;

// Font weights for consistency
export const POPPINS_FONT = {
  regular: "Poppins-Regular",
  medium: "Poppins-Medium",
  semiBold: "Poppins-SemiBold",
  bold: "Poppins-Bold",
  extraBold: "Poppins-ExtraBold",
  black: "Poppins-Black",
} as const;

export type FontSize = keyof typeof FONT_SIZES;
export type ComponentFontSize = typeof COMPONENT_FONT_SIZES;
