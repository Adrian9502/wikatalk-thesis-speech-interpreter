import { StyleSheet } from "react-native";
import { BASE_COLORS } from "@/constant/colors";

export const textAreaStyles = StyleSheet.create({
  // Container styles
  textSectionContainer: {
    height: "49%",
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: BASE_COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    position: "relative",
    padding: 20,
    marginBottom: 10,
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
  },

  sectionTitle: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
  },

  controls: {
    flexDirection: "row",
    alignItems: "center",
  },

  controlButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    marginLeft: 8,
  },

  // Text area styles
  textAreaWrapper: {
    flex: 1,
    marginVertical: 8,
  },

  textArea: {
    backgroundColor: BASE_COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    flex: 1,
  },

  textField: {
    fontFamily: "Poppins-Regular",
    textAlignVertical: "top",
    fontSize: 14,
    lineHeight: 20,
    color: BASE_COLORS.darkText,
  },

  // Loading and error states
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BASE_COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BASE_COLORS.borderColor,
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BASE_COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BASE_COLORS.borderColor,
    padding: 16,
  },

  errorText: {
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Poppins-Regular",
  },
});
