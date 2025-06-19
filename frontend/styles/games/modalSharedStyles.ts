import { StyleSheet } from "react-native";
import { BASE_COLORS } from "@/constant/colors";

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
    padding: 24,
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

  // Close Button
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },

  // Level Header
  levelHeader: {
    alignItems: "center",
    marginBottom: 8,
  },
  levelNumberContainer: {
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 18,
    flex: 0,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  levelNumber: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#fff",
  },
  levelTitle: {
    fontSize: 23,
    fontFamily: "Poppins-Bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },

  // Badges
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(36, 192, 57, 0.79)",
    backgroundColor: "rgba(36, 192, 57, 0.55)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  badgesContainer: {
    flexDirection: "row",
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
  },
  focusAreaBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  focusAreaText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    marginLeft: 6,
  },

  // Content Cards
  contentCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    lineHeight: 22,
  },

  // Action Buttons
  actionButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  actionButtonText: {
    color: "#fff",
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
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderColor: "rgb(255,255,255)",
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  startAndCloseText: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    color: "#000",
  },
});

export default modalSharedStyles;
