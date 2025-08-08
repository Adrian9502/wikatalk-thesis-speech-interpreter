export interface RankingUser {
  userId: string;
  username: string;
  avatar?: string;
  value: number;
  lastActive?: string;

  // Additional fields based on ranking type
  coins?: number;
  totalCompleted?: number;
  avgTime?: number;
  bestTime?: number;
  fastestTime?: number;
  completionRate?: number;
  accuracy?: number;
  perfectScores?: number;
  totalProgress?: number;
  gameModesCount?: number;
  weeklyProgress?: number;
  weeklyTimeSpent?: number;
  comebacks?: number;
  currentStreak?: number;
  longestStreak?: number;
  hoursSpent?: number;
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
  icon: string;
  gameMode?: string;
  color: readonly [string, string];
}

export type RankingType =
  | "coinMasters"
  | "quizChampions"
  | "speedDemons"
  | "lightningFast"
  | "consistencyKings"
  | "progressLeaders"
  | "streakMasters"
  | "precisionPros"
  | "weeklyWarriors"
  | "perfectScorers"
  | "timeWarriors"
  | "comebackKings";
