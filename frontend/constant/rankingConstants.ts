import { RankingCategory } from "@/types/rankingTypes";

export const RANKING_CATEGORIES: RankingCategory[] = [
  {
    id: "coinMasters",
    title: "Coin Masters",
    description: "Users with the highest coin balances",
    icon: "🪙",
    color: ["#FFD700", "#FFA500"] as const,
  },
  {
    id: "quizChampions",
    title: "Quiz Champions",
    description: "Most quizzes completed overall",
    icon: "🏆",
    color: ["#4CAF50", "#2E7D32"] as const,
  },
  {
    id: "speedDemons",
    title: "Speed Demons",
    description: "Best average completion times",
    icon: "⚡",
    color: ["#2196F3", "#1565C0"] as const,
  },
  {
    id: "lightningFast",
    title: "Lightning Fast",
    description: "Fastest single quiz completions",
    icon: "🚀",
    color: ["#FF5722", "#D84315"] as const,
  },
  {
    id: "consistencyKings",
    title: "Consistency Kings",
    description: "Highest completion rates",
    icon: "📊",
    color: ["#9C27B0", "#6A1B9A"] as const,
  },
  {
    id: "progressLeaders",
    title: "Progress Leaders",
    description: "Overall progress across all games",
    icon: "📈",
    color: ["#00BCD4", "#00838F"] as const,
  },
  {
    id: "quizChampions_multipleChoice",
    title: "Multiple Choice Masters",
    description: "Best at multiple choice questions",
    icon: "🎯",
    gameMode: "multipleChoice",
    color: ["#4361EE", "#3A0CA3"] as const,
  },
  {
    id: "quizChampions_identification",
    title: "Identification Masters",
    description: "Best at word identification",
    icon: "🎯",
    gameMode: "identification",
    color: ["#e01f78", "#6a03ad"] as const,
  },
  {
    id: "quizChampions_fillBlanks",
    title: "Fill Blanks Masters",
    description: "Best at fill in the blanks",
    icon: "🎯",
    gameMode: "fillBlanks",
    color: ["#22C216", "#007F3B"] as const,
  },
  {
    id: "streakMasters",
    title: "Streak Masters",
    description: "Longest winning streaks",
    icon: "🔥",
    color: ["#FF9800", "#F57C00"] as const,
  },
  {
    id: "precisionPros",
    title: "Precision Pros",
    description: "Highest first-try accuracy",
    icon: "🎯",
    color: ["#8BC34A", "#689F38"] as const,
  },
  {
    id: "weeklyWarriors",
    title: "Weekly Warriors",
    description: "Most active in the past week",
    icon: "⭐",
    color: ["#E91E63", "#AD1457"] as const,
  },
  {
    id: "perfectScorers",
    title: "Perfect Scorers",
    description: "Most perfect quiz completions",
    icon: "💯",
    color: ["#673AB7", "#4527A0"] as const,
  },
  {
    id: "timeWarriors",
    title: "Time Warriors",
    description: "Most time spent learning",
    icon: "⏰",
    color: ["#607D8B", "#455A64"] as const,
  },
  {
    id: "comebackKings",
    title: "Comeback Kings",
    description: "Best at succeeding after failing",
    icon: "👑",
    color: ["#795548", "#5D4037"] as const,
  },
];

export const getRankingCategory = (id: string): RankingCategory | undefined => {
  return RANKING_CATEGORIES.find((category) => category.id === id);
};

export const getRankingTitle = (type: string, gameMode?: string): string => {
  if (gameMode && type === "quizChampions") {
    const category = RANKING_CATEGORIES.find(
      (cat) => cat.id === `${type}_${gameMode}`
    );
    return category?.title || "Quiz Champions";
  }

  const category = RANKING_CATEGORIES.find((cat) => cat.id === type);
  return category?.title || "Rankings";
};

export const getRankingIcon = (type: string, gameMode?: string): string => {
  if (gameMode && type === "quizChampions") {
    const category = RANKING_CATEGORIES.find(
      (cat) => cat.id === `${type}_${gameMode}`
    );
    return category?.icon || "🏆";
  }

  const category = RANKING_CATEGORIES.find((cat) => cat.id === type);
  return category?.icon || "🏆";
};
