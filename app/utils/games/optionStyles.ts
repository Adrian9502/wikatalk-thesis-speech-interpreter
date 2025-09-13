import { StyleProp, ViewStyle } from "react-native";
import gameSharedStyles from "@/styles/gamesSharedStyles";

interface OptionStyleParams {
  // Common parameters
  isSelected: boolean;
  isCorrect: boolean;

  // Additional style options
  additionalStyles?: StyleProp<ViewStyle>;
  correctStyle?: StyleProp<ViewStyle>;
  incorrectStyle?: StyleProp<ViewStyle>;
}

/**
 * Get styling for a game option based on its selection and correctness state
 */
export const getOptionStyle = ({
  isSelected,
  isCorrect,
  additionalStyles = {},
  correctStyle = gameSharedStyles.correctOption,
  incorrectStyle = gameSharedStyles.incorrectOption,
}: OptionStyleParams): StyleProp<ViewStyle> => {
  const baseStyle = [gameSharedStyles.optionCard, additionalStyles];

  if (isSelected) {
    return isCorrect
      ? [...baseStyle, correctStyle]
      : [...baseStyle, incorrectStyle];
  }

  return baseStyle;
};

/**
 * Get word-specific styling with additional default styling for word items
 */
export const getWordStyle = (
  wordParams: OptionStyleParams
): StyleProp<ViewStyle> => {
  const wordSpecificStyles = {
    minHeight: 60,
    position: "relative" as const,
  };

  return getOptionStyle({
    ...wordParams,
    additionalStyles: [wordParams.additionalStyles, wordSpecificStyles],
  });
};
