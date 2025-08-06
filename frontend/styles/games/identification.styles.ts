import { StyleSheet } from "react-native";
import { BASE_COLORS } from "@/constant/colors";

export default StyleSheet.create({
  scrollContainer: {
    paddingVertical: 10,
    paddingBottom: 20,
  },

  // Enhanced Instructions
  instructionsContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },

  // Enhanced Words Grid
  wordsContainer: {
    flex: 1,
    marginBottom: 12,
  },
  wordsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 4,
  },
  wordWrapper: {
    width: "48%",
    marginBottom: 12,
  },
  wordCard: {
    borderRadius: 20,
    overflow: "hidden",
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 12,
    minHeight: 50,
  },
  selectedWordCard: {
    borderColor: "rgb(255, 255, 255)",
  },
  incorrectWordCard: {
    borderColor: "#F44336",
    shadowColor: "#F44336",
    shadowOpacity: 0.3,
  },
  wordGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    minHeight: 40,
    position: "relative",
  },

  wordNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  wordNumberText: {
    fontSize: 12,
    fontFamily: "Poppins-Bold",
    color: BASE_COLORS.white,
  },

  wordContent: {
    flex: 1,
    paddingRight: 8,
  },
  wordText: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    lineHeight: 20,
  },

  resultIcon: {
    width: 32,
    height: 32,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  selectionPulse: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },

  // No Options State
  noOptionsContainer: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 40,
  },
  noOptionsText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
  },

  // Enhanced Translation Section
  translationSection: {
    marginBottom: 20, // ADDED: Bottom margin for better spacing
  },
  translationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    gap: 8,
    marginVertical: 12,
  },
  translationButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  translationButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.7)",
  },
  translationButtonTextActive: {
    color: BASE_COLORS.white,
  },

  // Enhanced Translation Card
  translationCard: {
    marginBottom: 8,
  },
  translationCardGradient: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(16, 60, 182, 0.1)",
  },
  translationCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  translationCardTitle: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  translationCardText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
  },

  // Legacy compatibility
  twoColumnContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  optionWrapper: {
    width: "48%",
    borderWidth: 2,
    borderColor: "red",
    marginBottom: 10,
  },
});
