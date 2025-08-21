import { StyleSheet, Dimensions } from "react-native";
import { BASE_COLORS } from "@/constant/colors";

const { width: screenWidth } = Dimensions.get("window");
const isSmallScreen = screenWidth < 375;

export default StyleSheet.create({
  // Scroll container for proper spacing
  scrollContainer: {
    paddingVertical: 10,
    flexGrow: 1,
    minHeight: "100%",
  },

  // Attempts Section
  attemptsContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    alignSelf: "center",
    marginBottom: 24,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
    borderColor: "rgba(255, 255, 255, 0.3)",
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
    color: BASE_COLORS.danger,
  },
  heartInactive: {
    color: "rgba(255, 255, 255, 0.31)",
  },

  // Input Section - UPDATED FOR CONSISTENT BUTTON SIZE
  inputSection: {
    marginBottom: 20,
    zIndex: 1,
  },
  inputHeader: {
    marginVertical: 10,
    alignItems: "flex-start",
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
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
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    alignSelf: "center",
    flexShrink: 0,
    flexGrow: 0,
  },
  submitButtonDisabled: {
    opacity: 0.8,
    elevation: 0,
    shadowOpacity: 0,
  },
  submitGradient: {
    paddingHorizontal: isSmallScreen ? 16 : 20,
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    minWidth: isSmallScreen ? 80 : 90,
    borderRadius: 20,
  },
  submitButtonText: {
    fontSize: isSmallScreen ? 12 : 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    letterSpacing: 0.5,
  },
  submitButtonTextDisabled: {
    color: "rgba(255, 255, 255, 0.6)",
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
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  helpCardHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  helpCardTitle: {
    fontSize: 13,
    textAlign: "center",
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
  },
  helpCardText: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
  },

  // Feedback
  feedbackContainer: {
    marginBottom: 20,
  },
  feedbackCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  feedbackIcon: {
    width: 38,
    height: 38,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  feedbackContent: {
    flex: 1,
  },
  feedbackTitle: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    marginBottom: 4,
  },
  feedbackText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    lineHeight: 20,
    opacity: 0.9,
  },
});
