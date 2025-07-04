import { BASE_COLORS } from "@/constant/colors";
import { GameOption } from "@/types/gameTypes";
import { Zap, AlignCenter, Edit3 } from "react-native-feather";
import React from "react";

const gameOptions: GameOption[] = [
  {
    id: "multipleChoice",
    title: "Multiple Choice",
    icon: <Zap width={28} height={28} color={BASE_COLORS.white} />,
    color: BASE_COLORS.blue,
    description: "Choose the correct answer from given options",
    difficulty: "Beginner",
  },
  {
    id: "identification",
    title: "Word Identification",
    icon: <AlignCenter width={28} height={28} color={BASE_COLORS.white} />,
    color: BASE_COLORS.orange,
    description: "Identify the correct words in context",
    difficulty: "Intermediate",
  },
  {
    id: "fillBlanks",
    title: "Fill in the Blanks",
    icon: <Edit3 width={28} height={28} color={BASE_COLORS.white} />,
    color: BASE_COLORS.success,
    description: "Complete sentences with the right words",
    difficulty: "Advanced",
  },
];

export default gameOptions;
