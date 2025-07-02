export interface GameProgressModalProps {
  visible: boolean;
  onClose: () => void;
  gameMode: string;
  gameTitle: string;
}

export interface DifficultyProgress {
  difficulty: "easy" | "medium" | "hard";
  totalLevels: number;
  completedLevels: number;
  totalAttempts: number;
  correctAttempts: number;
  totalTimeSpent: number;
  completionRate: number;
  averageScore: number;
  bestTime: number;
  worstTime: number;
  levels: LevelProgress[];
}

export interface LevelProgress {
  levelId: string;
  difficulty: "easy" | "medium" | "hard";
  title: string;
  isCompleted: boolean;
  totalAttempts: number;
  correctAttempts: number;
  totalTimeSpent: number;
  bestTime: number;
  lastAttemptDate?: string;
  recentAttempts: any[];
}

export interface EnhancedGameModeProgress {
  totalLevels: number;
  completedLevels: number;
  totalTimeSpent: number;
  totalAttempts: number;
  correctAttempts: number;
  overallCompletionRate: number;
  overallAverageScore: number;
  bestTime: number;
  worstTime: number;
  difficultyBreakdown: DifficultyProgress[];
  recentAttempts: any[];
}