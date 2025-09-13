export interface GameModeProgress {
  completed: number;
  total: number;
}

export interface LevelProgress {
  levelId: number | string;
  title: string;
  isCompleted: boolean;
  totalAttempts: number;
  correctAttempts: number;
  totalTimeSpent: number;
  lastAttemptDate: string | null;
  recentAttempts: AttemptInfo[];
}

export interface DifficultyProgress {
  difficulty: string;
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

export interface AttemptInfo {
  attemptDate: string;
  isCorrect: boolean;
  timeSpent: number;
  attemptNumber: number;
  levelId?: number | string;
  levelTitle?: string;
  difficulty?: string;
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
  recentAttempts: (AttemptInfo & {
    levelId: number | string;
    levelTitle: string;
    difficulty: string;
  })[];
}
