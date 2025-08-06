import { StyleSheet } from "react-native";
import { BASE_COLORS } from "@/constant/colors";

export default StyleSheet.create({
  // Attempts Section
  attemptsContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    alignSelf: "center",
    marginBottom: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  attemptsLabel: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.8)",
  },
  heartsContainer: {
    flexDirection: "row",
    gap: 5,
  },
  heartIcon: {
    fontSize: 13,
  },
  heartActive: {
    color: "#E91E63",
  },
  heartInactive: {
    color: "rgba(255, 255, 255, 0.31)",
  },

  // Enhanced Input Section
  inputSection: {
    marginBottom: 24,
  },
  inputHeader: {
    marginVertical: 12,
    alignItems: "flex-start",
  },
  inputLabel: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 70,
    alignItems: "stretch",
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    minHeight: 54,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    paddingVertical: 12,
  },
  clearButton: {
    padding: 8,
    marginLeft: 8,
  },
  submitButton: {
    borderRadius: 20,
    overflow: "hidden",
    minWidth: 80,
  },
  submitButtonDisabled: {
    opacity: 0.8,
  },
  submitGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
  },
  submitButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: BASE_COLORS.white,
    letterSpacing: 0.5,
  },
  submitButtonTextDisabled: {
    color: "rgba(255, 255, 255, 0.6)",
  },

  // Enhanced Help Section
  helpSection: {
    marginBottom: 20,
  },
  helpTitle: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: 12,
  },
  helpButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  helpButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
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

  // Enhanced Help Cards
  helpCard: {
    marginBottom: 16,
  },
  helpCardGradient: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  helpCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  helpCardTitle: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  helpCardText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
  },

  // Enhanced Feedback
  feedbackContainer: {
    marginTop: 8,
  },
  feedbackCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    padding: 16,
  },
  feedbackIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  feedbackContent: {
    flex: 1,
  },
  feedbackTitle: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    marginBottom: 4,
  },
  feedbackText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    lineHeight: 20,
    opacity: 0.9,
  },

  // Legacy compatibility
  sentenceGradient: {
    borderRadius: 24,
    padding: 24,
  },
  hintCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  hintLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    marginBottom: 6,
    opacity: 0.9,
  },
  hintText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    lineHeight: 20,
    opacity: 0.8,
  },
  correctFeedback: {
    borderColor: "#4CAF50",
  },
  incorrectFeedback: {
    borderColor: "#F44336",
  },
  feedbackIconContainer: {
    marginRight: 12,
  },
  attemptsText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    opacity: 0.9,
  },
  helpButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 20,
  },
  hintButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  hintButtonText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    textAlign: "center",
  },
});
