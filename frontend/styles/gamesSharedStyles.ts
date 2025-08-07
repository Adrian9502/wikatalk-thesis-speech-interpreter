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

  questionText: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    marginBottom: 10,
    lineHeight: 26,
  },

  optionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 16,
    flex: 1,
    borderRadius: 20,
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    minHeight: 60,
  },
  correctOption: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderColor: BASE_COLORS.success,
  },
  incorrectOption: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderColor: BASE_COLORS.danger,
  },

  // Loader styles
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Game playing content shared styles
  // used in MultipleChoicePlayingContent,IdentificationPlayingContent and FillInBlankPlayingContent
  gameContainer: {
    flex: 1,
  },
  cardDecoration1: {
    position: "absolute",
    top: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  cardDecoration2: {
    position: "absolute",
    bottom: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  questionCardContainer: {
    marginVertical: 30,
  },

  questionCard: {
    borderRadius: 20,
    padding: 16,
    position: "relative",
    overflow: "hidden",
    minHeight: 100,
  },

  questionContainer: {
    borderRadius: 20,
    padding: 40,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default gameSharedStyles;
