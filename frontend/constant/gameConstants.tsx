import { Zap, BookOpen, Search, Edit2 } from "react-native-feather";
import { BASE_COLORS } from "./colors";
import React from "react";

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
    <Zap {...props} color="#FFF" />
  ),
  [GAME_MODES.IDENTIFICATION]: (props: IconProps) => (
    <Search {...props} color="#FFF" />
  ),
  [GAME_MODES.FILL_BLANKS]: (props: IconProps) => (
    <Edit2 {...props} color="#FFF" />
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

export const NAVIGATION_COLORS = {
  green: ["#22C216", "#007F3B"] as const,
  yellow: ["#cfa012ff", "#B28704"] as const,
  blue: ["#2196F3", "#0D47A1"] as const,
  purple: ["#9C27B0", "#6A0080"] as const,
  pinkPurple: ["#e01f78", "#6a03ad"] as const,
  indigo: ["#4361EE", "#3A0CA3"] as const,
  disabled: ["rgba(255, 255, 255, 0.15)", "rgba(255, 255, 255, 0.08)"] as const,
};

export const GAME_RESULT_COLORS = {
  userExit: ["#FF9800", "#EF6C00"] as const,
  correctAnswer: NAVIGATION_COLORS.green,
  incorrectAnswer: ["#FF2919", "#B80D5F"] as const,
};
