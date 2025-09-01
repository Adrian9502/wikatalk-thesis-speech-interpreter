import { StyleSheet, Dimensions } from "react-native";
import { BASE_COLORS } from "@/constant/colors";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Check if it's a small screen (like Nexus 4)
const isSmallScreen = screenWidth <= 384 && screenHeight <= 1280;

export const textAreaStyles = StyleSheet.create({
  // Container styles
  textSectionContainer: {
    height: isSmallScreen ? "47%" : "49%",
    borderRadius: isSmallScreen ? 18 : 20,
    overflow: "hidden",
    backgroundColor: BASE_COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    position: "relative",
    padding: isSmallScreen ? 16 : 20,
    marginBottom: isSmallScreen ? 8 : 10,
  },

  gradientBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },

  // Header styles
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 100,
    marginBottom: isSmallScreen ? 4 : 0,
  },

  sectionTitle: {
    fontSize: isSmallScreen ? 14 : 15,
    fontFamily: "Poppins-Medium",
  },

  controls: {
    flexDirection: "row",
    alignItems: "center",
  },

  controlButton: {
    width: isSmallScreen ? 36 : 40,
    height: isSmallScreen ? 36 : 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: isSmallScreen ? 18 : 20,
    marginLeft: isSmallScreen ? 6 : 8,
  },
  controlButtonActive: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },

  // Text area styles
  textAreaWrapper: {
    flex: 1,
    marginVertical: isSmallScreen ? 6 : 8,
  },

  textArea: {
    backgroundColor: BASE_COLORS.white,
    borderRadius: isSmallScreen ? 16 : 20,
    borderWidth: 1,
    padding: isSmallScreen ? 12 : 16,
    flex: 1,
  },

  textField: {
    fontFamily: "Poppins-Regular",
    textAlignVertical: "top",
    fontSize: isSmallScreen ? 12 : 13,
    lineHeight: isSmallScreen ? 18 : 20,
    color: BASE_COLORS.darkText,
  },

  // Loading and error states
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BASE_COLORS.white,
    borderRadius: isSmallScreen ? 16 : 20,
    borderWidth: 1,
    borderColor: BASE_COLORS.borderColor,
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BASE_COLORS.white,
    borderRadius: isSmallScreen ? 16 : 20,
    borderWidth: 1,
    borderColor: BASE_COLORS.borderColor,
    padding: isSmallScreen ? 12 : 16,
  },

  errorText: {
    fontSize: isSmallScreen ? 13 : 14,
    textAlign: "center",
    fontFamily: "Poppins-Regular",
  },
});
