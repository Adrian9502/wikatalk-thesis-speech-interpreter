import { StyleSheet, Dimensions } from "react-native";
import { BASE_COLORS } from "@/constants/colors";
import {
  FONT_SIZES,
  POPPINS_FONT,
  COMPONENT_FONT_SIZES,
} from "@/constants/fontSizes";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Check for different screen sizes
const isSmallScreen = screenWidth <= 384 && screenHeight <= 1280; // Nexus 4 and similar

export const pronunciationStyles = StyleSheet.create({
  header: {
    marginBottom: isSmallScreen ? 8 : 10,
    marginTop: 6,
  },
  headerTitle: {
    fontSize: COMPONENT_FONT_SIZES.pronunciation.headerTitle,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
  },
  controlsContainer: {
    marginBottom: isSmallScreen ? 12 : 16,
    gap: 12,
  },
  headerDropdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: isSmallScreen ? 6 : 8,
  },
  flashListContent: {
    paddingBottom: 20,
    paddingTop: 8,
    backgroundColor: "transparent",
  },
  listHeaderTitle: {
    fontSize: COMPONENT_FONT_SIZES.pronunciation.cardPronunciation,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
    flex: 1,
  },
  loadingFooter: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  loadingText: {
    marginLeft: 8,
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.blue,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // Dropdown styles
  dropdown: {
    borderRadius: isSmallScreen ? 16 : 20,
    paddingHorizontal: isSmallScreen ? 10 : 12,
    paddingVertical: isSmallScreen ? 6 : 8,
    backgroundColor: BASE_COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minWidth: isSmallScreen ? 130 : 150,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  dropdownPlaceholder: {
    fontSize: FONT_SIZES.lg,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.placeholderText,
  },
  dropdownSelectedText: {
    fontSize: FONT_SIZES.lg,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.blue,
  },
  dropdownList: {
    borderRadius: 20,
    backgroundColor: BASE_COLORS.white,
    shadowColor: "#000",
    overflow: "hidden",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
});
