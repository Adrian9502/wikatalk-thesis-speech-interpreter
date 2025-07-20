import React from "react";
import { BASE_COLORS } from "@/constant/colors";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export const renderFocusIcon = (focusArea: string = "vocabulary") => {
  switch (focusArea.toLowerCase()) {
    case "grammar":
      return (
        <MaterialCommunityIcons
          name="format-text"
          size={18}
          color={BASE_COLORS.white}
        />
      );
    case "vocabulary":
      return (
        <MaterialCommunityIcons
          name="book-open-page-variant"
          size={18}
          color={BASE_COLORS.white}
        />
      );
    case "pronunciation":
      return (
        <MaterialCommunityIcons
          name="volume-high"
          size={18}
          color={BASE_COLORS.white}
        />
      );
    default:
      return (
        <MaterialCommunityIcons
          name="book-open-page-variant"
          size={18}
          color={BASE_COLORS.white}
        />
      );
  }
};

// Helper for getting focus area display text
export const getFocusAreaText = (focusArea: string = "vocabulary") => {
  switch (focusArea.toLowerCase()) {
    case "grammar":
      return "Grammar";
    case "vocabulary":
      return "Vocabulary";
    case "pronunciation":
      return "Pronunciation";
    default:
      return "Vocabulary";
  }
};

// Helper for getting game mode display name
export const getGameModeName = (gameMode: string) => {
  switch (gameMode) {
    case "multipleChoice":
      return "Multiple Choice";
    case "identification":
      return "Word Identification";
    case "fillBlanks":
      return "Fill in the Blank";
    default:
      return gameMode;
  }
};

export default renderFocusIcon;
