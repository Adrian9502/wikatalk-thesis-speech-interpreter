/**
 * Get the number of stars based on difficulty level
 * This function is case-insensitive for more reliable matching
 */
export const getStarCount = (difficulty: string = "easy"): number => {
  // Normalize the difficulty to lowercase for case-insensitive comparison
  const normalizedDifficulty = difficulty.toLowerCase();

  if (normalizedDifficulty.includes("hard")) {
    return 3;
  } else if (normalizedDifficulty.includes("medium")) {
    return 2;
  } else {
    return 1;
  }
};

/**
 * Format the difficulty string with proper capitalization
 */
export const formatDifficulty = (difficulty: string = "easy"): string => {
  // Normalize the difficulty to lowercase first
  const normalized = difficulty.toLowerCase();

  if (normalized.includes("hard")) {
    return "Hard";
  } else if (normalized.includes("medium")) {
    return "Medium";
  } else {
    return "Easy";
  }
};
