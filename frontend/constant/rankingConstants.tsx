import React from "react";
import { Image } from "react-native";
import { RankingCategory } from "@/types/rankingTypes";
import { Ionicons } from "@expo/vector-icons";
import { iconColors } from "@/constant/colors";
import { Zap } from "react-native-feather";

export const RANKING_CATEGORIES: RankingCategory[] = [
  {
    id: "quizChampions",
    title: "Quiz Champions",
    description: "Most quizzes completed",
    icon: <Ionicons name="trophy" size={18} color={iconColors.brightYellow} />,
  },
  {
    id: "coinMasters",
    title: "Coin Masters",
    description: "Highest coin balances",
    icon: (
      <Image
        source={require("@/assets/images/coin.png")}
        style={{ width: 18, height: 18 }}
        resizeMode="contain"
      />
    ),
  },
  {
    id: "speedDemons",
    title: "Speed Demons",
    description: "Best average completion times",
    icon: <Zap width={18} height={18} color={iconColors.brightYellow} />,
  },
  {
    id: "consistencyKings",
    title: "Consistency Kings",
    description: "Highest completion rates",
    icon: (
      <Ionicons name="stats-chart" size={18} color={iconColors.brightYellow} />
    ),
  },
];

export const getRankingCategory = (id: string): RankingCategory | undefined => {
  return RANKING_CATEGORIES.find((category) => category.id === id);
};

export const getRankingTitle = (type: string): string => {
  const category = RANKING_CATEGORIES.find((cat) => cat.id === type);
  return category?.title || "Rankings";
};

export const getRankingIcon = (type: string): React.ReactNode => {
  const category = RANKING_CATEGORIES.find((cat) => cat.id === type);
  return (
    category?.icon || (
      <Ionicons name="trophy" size={18} color={iconColors.brightYellow} />
    )
  );
};
