import { StyleSheet } from "react-native";
import { BASE_COLORS } from "@/constant/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constant/fontSizes";

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
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.white,
    opacity: 0.8,
    textAlign: "center",
    marginBottom: 16,
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
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    minHeight: 50,
  },
  selectedWordCard: {
    borderColor: "rgb(255, 255, 255)",
  },

  wordNumber: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  wordNumberText: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
  },

  wordContent: {
    flex: 1,
    paddingRight: 8,
  },
  wordText: {
    fontSize: COMPONENT_FONT_SIZES.button.medium,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
    lineHeight: 22,
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
    fontSize: COMPONENT_FONT_SIZES.card.title,
    fontFamily: POPPINS_FONT.medium,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
  },

  // Enhanced Translation Section
  translationSection: {
    marginBottom: 20,
    alignItems: "center",
  },
  translationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    gap: 8,
    marginVertical: 12,
  },
  translationButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  translationButtonText: {
    fontSize: COMPONENT_FONT_SIZES.button.small,
    fontFamily: POPPINS_FONT.medium,
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
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  translationCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    gap: 8,
  },
  translationCardTitle: {
    fontSize: COMPONENT_FONT_SIZES.card.title,
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.white,
  },
  translationCardText: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.white,
    textAlign: "center",
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

  // NEW: Hint styles
  hintSection: {
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  disabledWord: {
    opacity: 0.5,
  },
  disabledWordText: {
    color: "rgba(255, 255, 255, 0.4)",
    textDecorationLine: "line-through",
  },
  disabledWordSubtext: {
    color: "rgba(255, 255, 255, 0.3)",
    textDecorationLine: "line-through",
  },
  strikeThrough: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    transform: [{ translateY: -1 }],
  },
});
