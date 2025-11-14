import React from "react";
import { BASE_COLORS } from "@/constants/colors";
import Feather from "react-native-vector-icons/Feather";

export const renderFocusIcon = (focusArea: string = "vocabulary") => {
  switch (focusArea.toLowerCase()) {
    case "grammar":
      return <Feather name="type" size={14} color={BASE_COLORS.white} />;
    case "vocabulary":
      return <Feather name="book-open" size={14} color={BASE_COLORS.white} />;
    case "pronunciation":
      return <Feather name="volume-2" size={14} color={BASE_COLORS.white} />;
    default:
      return <Feather name="book-open" size={14} color={BASE_COLORS.white} />;
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
