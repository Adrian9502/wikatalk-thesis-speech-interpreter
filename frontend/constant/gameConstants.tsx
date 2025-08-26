import { BASE_COLORS } from "./colors";

export const GAME_MODES = {
  MULTIPLE_CHOICE: "multipleChoice",
  IDENTIFICATION: "identification",
  FILL_BLANKS: "fillBlanks",
};

export const DIFFICULTY_LEVELS = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
};

export const GAME_TITLES = {
  [GAME_MODES.MULTIPLE_CHOICE]: "Multiple Choice",
  [GAME_MODES.IDENTIFICATION]: "Word Identification",
  [GAME_MODES.FILL_BLANKS]: "Fill in the Blanks",
};
