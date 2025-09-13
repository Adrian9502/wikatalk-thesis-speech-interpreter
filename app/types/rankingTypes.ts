import React from "react";

export interface RankingUser {
  userId: string;
  username: string;
  avatar?: string;
  value: number;
  lastActive?: string;
  // Quiz Champions
  totalCompleted?: number;
  // Coin Masters
  coins?: number;
  // Speed Demons
  avgTime?: number;
  bestTime?: number;
  // Consistency Kings
  completionRate?: number;
  correctAttempts?: number;
  totalAttempts?: number;
}

export interface UserRank {
  rank: number;
  value: number;
}

export interface RankingData {
  rankings: RankingUser[];
  userRank: UserRank | null;
  totalCount: number;
  lastUpdated: string;
}

export interface RankingCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export type RankingType =
  | "quizChampions"
  | "coinMasters"
  | "speedDemons"
  | "consistencyKings";
