import { Award, BookOpen, Target } from "react-native-feather";
import { BASE_COLORS } from "./colors";
import React from "react";

// Define IconProps type since it's not exported from react-native-feather
type IconProps = {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
};

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

export const GAME_ICONS = {
  [GAME_MODES.MULTIPLE_CHOICE]: (props: IconProps) => (
    <Award {...props} color="#FFF" />
  ),
  [GAME_MODES.IDENTIFICATION]: (props: IconProps) => (
    <Target {...props} color="#FFF" />
  ),
  [GAME_MODES.FILL_BLANKS]: (props: IconProps) => (
    <BookOpen {...props} color="#FFF" />
  ),
};

export const GAME_COLORS = {
  [GAME_MODES.MULTIPLE_CHOICE]: BASE_COLORS.blue,
  [GAME_MODES.IDENTIFICATION]: BASE_COLORS.orange,
  [GAME_MODES.FILL_BLANKS]: BASE_COLORS.success,
};

export const GAME_GRADIENTS = {
  [GAME_MODES.MULTIPLE_CHOICE]: ["#4361EE", "#3A0CA3"] as const,
  [GAME_MODES.IDENTIFICATION]: ["#e01f78", "#6a03ad"] as const,
  [GAME_MODES.FILL_BLANKS]: ["#22C216", "#007F3B"] as const,
};
