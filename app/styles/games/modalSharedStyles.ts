import { BASE_COLORS } from "@/constants/colors";
import {
  COMPONENT_FONT_SIZES,
  FONT_SIZES,
  POPPINS_FONT,
} from "@/constants/fontSizes";
import { StyleSheet } from "react-native";

export const modalSharedStyles = StyleSheet.create({
  // Modal Containers
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  modalContent: {
    padding: 20,
    position: "relative",
    overflow: "hidden",
    minHeight: 300,
  },

  // Decorative Elements
  decorativeShape1: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  decorativeShape2: {
    position: "absolute",
    bottom: -40,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },

  // Level Header
  levelHeader: {
    alignItems: "center",
    marginBottom: 8,
  },
  levelNumberContainer: {
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 18,
    flex: 0,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  levelNumber: {
    fontSize: COMPONENT_FONT_SIZES.card.title,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    fontFamily: POPPINS_FONT.bold,
    color: BASE_COLORS.white,
  },
  levelTitle: {
    fontSize: FONT_SIZES["3xl"],
    fontFamily: POPPINS_FONT.bold,
    color: BASE_COLORS.white,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    textAlign: "center",
    marginBottom: 12,
  },

  // Badges
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BASE_COLORS.success,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    zIndex: 5,
  },
  badgesContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    gap: 14,
  },
  starContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginRight: 6,
  },
  difficultyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  difficultyText: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
  },

  // Close and Start button
  startAndCloseButton: {
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
  },
  startAndCloseText: {
    fontSize: COMPONENT_FONT_SIZES.button.medium,
    fontFamily: POPPINS_FONT.medium,
    color: "#000",
  },
});

export default modalSharedStyles;
