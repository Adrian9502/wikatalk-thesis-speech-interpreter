import { BASE_COLORS } from "@/constant/colors";
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
    paddingVertical: 7,
    paddingHorizontal: 18,
    flex: 0,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  levelNumber: {
    fontSize: 15,

    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    fontFamily: "Poppins-Bold",
    color: BASE_COLORS.white,
  },
  levelTitle: {
    fontSize: 19,
    fontFamily: "Poppins-Bold",
    color: BASE_COLORS.white,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    textAlign: "center",
    marginBottom: 8,
  },

  // Badges
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(63, 212, 68, 0.75)",
    borderColor: "rgba(62, 223, 67, 1)",
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
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
    fontSize: 11,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },

  // Content Cards
  contentCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    lineHeight: 22,
  },

  // Action Buttons
  actionButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  actionButtonText: {
    color: BASE_COLORS.white,
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
  },

  // Loading States
  loadingContainer: {
    padding: 24,
    alignItems: "center",
  },
  loadingText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: "Poppins-Medium",
    marginTop: 12,
    fontSize: 14,
  },

  // Close and Start button
  startAndCloseButton: {
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
  },
  startAndCloseText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#000",
  },
});

export default modalSharedStyles;
