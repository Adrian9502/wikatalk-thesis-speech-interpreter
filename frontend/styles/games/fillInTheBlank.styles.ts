// ! THIS FILE IS FOR FillInTheBlank.tsx

import { BASE_COLORS } from "@/constant/colors";
import gameSharedStyles from "../gamesSharedStyles";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  sentenceCard: {
    ...gameSharedStyles.questionCardWrapper,
    marginBottom: 20,
  },
  sentenceGradient: {
    ...gameSharedStyles.questionGradient,
  },
  sentenceText: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    textAlign: "center",
    lineHeight: 26,
  },
  inputSection: {
    marginTop: 24,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 16,
  },
  input: {
    flex: 1,
    height: 54,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
  },
  submitButton: {
    height: 54,
    paddingHorizontal: 20,
    backgroundColor: BASE_COLORS.success,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  correctButton: {
    backgroundColor: BASE_COLORS.success,
  },
  incorrectButton: {
    backgroundColor: BASE_COLORS.danger,
  },
  attemptsContainer: {
    marginBottom: 12,
    alignItems: "center",
  },
  attemptsText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    opacity: 0.9,
  },
  helpButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 10,
  },
  clearButton: {
    height: 40,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: 90,
    opacity: 0.7,
  },
  attemptsDots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 4,
    gap: 6,
  },
  attemptDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BASE_COLORS.white,
  },
  hintButton: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  hintButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
  },
  hintCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  hintLabel: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    marginBottom: 4,
  },
  hintText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    fontStyle: "italic",
  },
  feedbackCard: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  correctFeedback: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderWidth: 1,
    borderColor: BASE_COLORS.success,
  },
  incorrectFeedback: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderWidth: 1,
    borderColor: BASE_COLORS.danger,
  },
  feedbackIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  feedbackText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    flex: 1,
  },
});

export default styles;
