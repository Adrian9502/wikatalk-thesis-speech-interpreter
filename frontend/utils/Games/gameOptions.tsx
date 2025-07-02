import { BASE_COLORS } from "@/constant/colors";
import { GameRoute } from "@/types/gameTypes";
import { Zap, AlignCenter, Edit3 } from "react-native-feather";

interface GameOption {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  gradientColors: readonly [string, string];
  description: string;
  animation: string;
  delay: number;
  difficulty: string;
}

const gameOptions: GameOption[] = [
  {
    id: "multipleChoice", // Make sure this matches the key in quizQuestions.json
    title: "Multiple Choice",
    icon: <Zap width={28} height={28} color={BASE_COLORS.white} />,
    color: BASE_COLORS.blue,
    gradientColors: ["#2563EB", "#1E40AF"],
    description: "Choose the correct answer from given options",
    animation: "bounceIn",
    delay: 100,
    difficulty: "Beginner",
  },
  {
    id: "identification", // Make sure this matches the key in quizQuestions.json
    title: "Word Identification",
    icon: <AlignCenter width={28} height={28} color={BASE_COLORS.white} />,
    color: BASE_COLORS.orange,
    gradientColors: [BASE_COLORS.orange, "#D97706"] as readonly [
      string,
      string
    ],
    description: "Identify the correct words in context",
    animation: "bounceIn",
    delay: 200,
    difficulty: "Intermediate",
  },
  {
    id: "fillBlanks", // Make sure this matches the key in quizQuestions.json
    title: "Fill in the Blanks",
    icon: <Edit3 width={28} height={28} color={BASE_COLORS.white} />,
    color: BASE_COLORS.success,
    gradientColors: [BASE_COLORS.success, "#059669"] as readonly [
      string,
      string
    ],
    description: "Complete sentences with the right words",
    animation: "bounceIn",
    delay: 300,
    difficulty: "Advanced",
  },
];

export default gameOptions;
