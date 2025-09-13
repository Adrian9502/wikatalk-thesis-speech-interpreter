export interface Attempt {
  quizId: string;
  timeSpent: number;
  attemptDate: string;
}
export interface UserProgress {
  _id?: string;
  userId: string;
  quizId: string;
  exercisesCompleted: number;
  totalExercises: number;
  completed: boolean;
  totalTimeSpent: number;
  attempts: Attempt[];
  lastAttemptDate?: string;
}
