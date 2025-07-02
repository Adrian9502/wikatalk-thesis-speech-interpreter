import { formatTime } from "@/utils/timeUtils";
import { GameOption } from "@/types/gameTypes";

// Format completion percentage with proper rounding
export const formatCompletionPercentage = (
  completed: number,
  total: number
): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

// Generate color-coded text based on completion percentage
export const getCompletionStatusText = (percentage: number): string => {
  if (percentage === 0) return "Not started";
  if (percentage < 25) return "Just started";
  if (percentage < 50) return "In progress";
  if (percentage < 100) return "Almost there!";
  return "Completed!";
};

// Get color based on completion status
export const getCompletionStatusColor = (percentage: number): string => {
  if (percentage === 0) return "#FF6B6B";
  if (percentage < 50) return "#FFD166";
  if (percentage < 100) return "#06D6A0";
  return "#118AB2";
};

// Format total time spent for display
export const formatTotalTimeSpent = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};
