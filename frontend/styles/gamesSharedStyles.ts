import { StyleSheet } from "react-native";
import { BASE_COLORS } from "@/constant/colors";

export const gameSharedStyles = StyleSheet.create({
  // Base container styles
  wrapper: {
    flex: 1,
    position: "relative",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentContainer: {
    paddingBottom: 40,
  },

  // Decorative elements
  decorativeCircle1: {
    position: "absolute",
    top: -100,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: `${BASE_COLORS.blue}20`,
  },
  decorativeCircle2: {
    position: "absolute",
    bottom: -80,
    left: -60,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: `${BASE_COLORS.blue}15`,
  },
  decorativeCircle3: {
    position: "absolute",
    bottom: -80,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: `${BASE_COLORS.success}15`,
  },
  badgesContainer: {
    flexDirection: "row",
    gap: 8,
  },
  // Stats container styles
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  timeContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  timeValue: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  difficultyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  difficultyText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },

  // Card styles
  questionCardWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  questionGradient: {
    padding: 24,
    borderRadius: 16,
    position: "relative",
  },
  questionText: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    marginBottom: 10,
    lineHeight: 26,
  },

  // Completion styles
  completionTitle: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: BASE_COLORS.white,
    marginBottom: 12,
    textAlign: "center",
  },
  completionMessage: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    textAlign: "center",
    opacity: 0.9,
  },
  resultIconLarge: {
    width: 60,
    height: 60,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
  },

  // Navigation buttons
  navigationContainer: {
    gap: 16,
  },
  navButton: {
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  nextLevelButton: {
    backgroundColor: "rgba(34, 197, 94, 0.8)",
  },
  navButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    marginRight: 8,
  },
  secondaryButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
  },

  // Review styles
  reviewContainer: {
    marginBottom: 24,
  },
  reviewTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: BASE_COLORS.white,
    marginBottom: 10,
  },
  reviewCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  reviewSection: {
    marginBottom: 14,
  },
  reviewSectionTitle: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    marginBottom: 6,
    opacity: 0.9,
  },
  reviewQuestionText: {
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    opacity: 0.9,
    lineHeight: 22,
  },
  reviewAnswer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  reviewAnswerBadge: {
    width: 24,
    height: 24,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  correctBadge: {
    backgroundColor: BASE_COLORS.success,
  },
  incorrectBadge: {
    backgroundColor: BASE_COLORS.danger,
  },
  reviewAnswerText: {
    fontSize: 15,
    color: BASE_COLORS.white,
    fontFamily: "Poppins-Medium",
    lineHeight: 22,
  },
  correctAnswerText: {
    color: "white",
  },
  incorrectAnswerText: {
    color: "white",
  },

  // Translation and hint styles
  translationButton: {
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 16,
  },
  translationButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
  },
  translationCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  translationText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    fontStyle: "italic",
    textAlign: "center",
  },

  // Level header styles
  levelTitleContainer: {
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  levelTitleText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    opacity: 0.8,
  },

  // SHARED OPTION STYLES (moved from both components)
  optionsContainer: {
    marginBottom: 20,
  },
  optionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 16,
    flex: 1,
    borderRadius: 16,
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    minHeight: 60,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionIdContainer: {
    width: 36,
    height: 36,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  optionId: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  optionText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    flex: 1,
    lineHeight: 22,
    flexWrap: "wrap", // Ensure text wraps
  },
  correctOption: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderColor: BASE_COLORS.success,
  },
  incorrectOption: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderColor: BASE_COLORS.danger,
  },
  resultIconContainer: {
    position: "absolute",
    right: 16,
    top: "50%", // Position at 50% from top
    width: 32,
    height: 32,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Loader styles
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    textAlign: "center",
  },
  // Component-specific shared styles
  optionLetter: {
    width: 30,
    height: 30,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  optionLetterText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
});

export default gameSharedStyles;
