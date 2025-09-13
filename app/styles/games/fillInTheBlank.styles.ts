import { StyleSheet, Dimensions } from "react-native";
import { BASE_COLORS, ICON_COLORS } from "@/constant/colors";
import {
  COMPONENT_FONT_SIZES,
  FONT_SIZES,
  POPPINS_FONT,
} from "@/constant/fontSizes";

const { width: screenWidth } = Dimensions.get("window");
const isSmallScreen = screenWidth < 380;

export default StyleSheet.create({
  scrollContainer: {
    paddingVertical: 10,
    paddingBottom: 40,
  },

  // Attempts
  attemptsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  attemptsLabel: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.medium,
    color: "rgba(255, 255, 255, 0.8)",
  },
  heartsContainer: {
    flexDirection: "row",
    gap: 4,
  },
  heartIcon: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
  },
  heartActive: {
    color: BASE_COLORS.danger,
  },
  heartInactive: {
    color: "rgba(255, 255, 255, 0.3)",
  },

  // Hint Section with Letter Display and Button
  hintSection: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 20,
    gap: 16,
  },

  //  Letter hint display (left side)
  letterHintContainer: {
    minWidth: "60%",
    flex: 1,
    maxWidth: "80%",
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderColor: "rgba(255, 255, 255, 0.3)",
    gap: 2,
  },

  letterHintLabel: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    letterSpacing: 1,
    fontFamily: POPPINS_FONT.semiBold,
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.9)",
  },
  letterHintDisplay: {
    backgroundColor: "rgba(255, 215, 0, 0.15)",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
  },
  letterHintText: {
    fontSize: FONT_SIZES["2xl"],
    fontFamily: POPPINS_FONT.bold,
    color: ICON_COLORS.brightYellow,
    textAlign: "center",
    letterSpacing: 2,
  },

  // Hint button container (right side)
  hintButtonContainer: {
    alignItems: "flex-end",
  },

  // Input Section
  inputSection: {
    marginBottom: 20,
  },
  inputHeader: {
    alignItems: "center",
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.medium,
    color: "rgba(255, 255, 255, 0.8)",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: isSmallScreen ? 10 : 12,
    minHeight: 34,
    minWidth: isSmallScreen ? 200 : 250,
  },
  input: {
    flex: 1,
    fontSize: COMPONENT_FONT_SIZES.navigation.title,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.white,
    paddingVertical: 10,
    paddingHorizontal: 15,
    textAlignVertical: "center",
  },
  clearButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  submitButton: {
    borderRadius: 20,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitGradient: {
    paddingHorizontal: isSmallScreen ? 20 : 24,
    paddingVertical: isSmallScreen ? 6 : 8,
    alignItems: "center",
    minWidth: isSmallScreen ? 80 : 100,
  },
  submitButtonText: {
    fontSize: COMPONENT_FONT_SIZES.button.medium,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
  },
  submitButtonTextDisabled: {
    color: "rgba(255, 255, 255, 0.6)",
  },

  // Feedback
  feedbackContainer: {
    marginBottom: 20,
  },
  feedbackCard: {
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    gap: 12,
  },
  feedbackIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  feedbackContent: {
    flex: 1,
  },
  feedbackTitle: {
    fontSize: COMPONENT_FONT_SIZES.card.title,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.white,
    marginBottom: 2,
  },
  feedbackText: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.regular,
    color: "rgba(255, 255, 255, 0.9)",
  },

  // Help Section
  helpSection: {
    marginBottom: 20,
  },
  helpTitle: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.medium,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: 12,
  },
  helpButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  helpButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    gap: 6,
  },
  helpButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  helpButtonText: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.regular,
    color: "rgba(255, 255, 255, 0.7)",
  },
  helpButtonTextActive: {
    color: BASE_COLORS.white,
  },

  // Help Cards
  helpCard: {
    marginBottom: 20,
  },
  helpCardGradient: {
    borderRadius: 20,
    paddingVertical: 8,
    marginHorizontal: 20,
  },
  helpCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    gap: 8,
  },
  helpCardTitle: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.white,
  },
  helpCardText: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.regular,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 18,
  },

  // Loading animation
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.medium,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 12,
  },
});
