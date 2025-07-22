import { StyleSheet } from "react-native";
import { BASE_COLORS } from "@/constant/colors";

export default StyleSheet.create({
  // Enhanced Options
  optionsContainer: {
    flex: 1,
  },
  optionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  optionsTitle: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.8)",
  },
  optionsIndicator: {
    flexDirection: "row",
    gap: 6,
  },
  optionWrapper: {
    marginBottom: 20,
  },
  optionCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  selectedOption: {
    borderColor: "rgb(255, 255, 255)",
  },
  correctOption: {
    borderColor: "#4CAF50",
    shadowColor: "#4CAF50",
    shadowOpacity: 0.3,
  },
  optionGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    minHeight: 40,
    position: "relative",
  },
  optionLetter: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  optionLetterText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
  },
  optionContent: {
    flex: 1,
    paddingRight: 16,
  },
  optionText: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    lineHeight: 22,
  },
  resultIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  // Legacy styles for compatibility
  multipleChoiceOptions: {
    gap: 16,
  },
});
