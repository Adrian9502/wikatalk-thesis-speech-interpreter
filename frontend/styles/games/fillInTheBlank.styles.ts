import { StyleSheet, Dimensions } from "react-native";
import { BASE_COLORS, ICON_COLORS } from "@/constant/colors";

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
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.8)",
  },
  heartsContainer: {
    flexDirection: "row",
    gap: 4,
  },
  heartIcon: {
    fontSize: 16,
  },
  heartActive: {
    color: "#FF6B6B",
  },
  heartInactive: {
    color: "rgba(255, 255, 255, 0.3)",
  },

  // Hint Section with Letter Display and Button
  hintSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    gap: 16,
  },

  //  Letter hint display (left side)
  letterHintContainer: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  letterHintHeader: {
    marginBottom: 8,
  },
  letterHintLabel: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: "rgba(255, 255, 255, 0.9)",
  },
  letterHintDisplay: {
    backgroundColor: "rgba(255, 215, 0, 0.15)",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
    minWidth: 120,
    flex: 1,
  },
  letterHintText: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
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
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.8)",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    paddingHorizontal: isSmallScreen ? 10 : 12,
    minHeight: 34,
    minWidth: isSmallScreen ? 200 : 250,
  },
  input: {
    flex: 1,
    fontSize: isSmallScreen ? 13 : 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    paddingVertical: 10,
    paddingHorizontal: 15,
    textAlignVertical: "center",
  },
  clearButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
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
    paddingVertical: isSmallScreen ? 10 : 12,
    alignItems: "center",
    minWidth: isSmallScreen ? 80 : 100,
  },
  submitButtonText: {
    fontSize: isSmallScreen ? 12 : 14,
    fontFamily: "Poppins-SemiBold",
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
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    marginBottom: 2,
  },
  feedbackText: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.9)",
  },

  // Help Section
  helpSection: {
    marginBottom: 20,
  },
  helpTitle: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
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
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.7)",
  },
  helpButtonTextActive: {
    color: BASE_COLORS.white,
  },

  // Help Cards
  helpCard: {
    marginBottom: 16,
  },
  helpCardGradient: {
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
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
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  helpCardText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
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
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 12,
  },
});
