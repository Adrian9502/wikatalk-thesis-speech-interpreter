/**
 * Calculates the cost to reset the timer based on time spent.
 *
 * @param secondsSpent - Total time spent in seconds
 * @returns number - Coin cost for resetting the timer
 */
export function calculateResetCost(secondsSpent: number): number {
  if (secondsSpent <= 30) return 50; // 0–30 sec → 50 coins
  if (secondsSpent <= 120) return 60; // 30s – 2 mins → 60 coins
  if (secondsSpent <= 300) return 70; // 2 – 5 mins → 70 coins
  if (secondsSpent <= 600) return 85; // 5 – 10 mins → 85 coins
  if (secondsSpent <= 1200) return 100; // 10 – 20 mins → 100 coins
  return 120; // 20+ mins → 120 coins
}

/**
 * Gets a descriptive message for the reset cost based on time spent.
 *
 * @param secondsSpent - Total time spent in seconds
 * @returns string - Descriptive message for the cost tier
 */
export function getResetCostDescription(secondsSpent: number): string {
  if (secondsSpent <= 30) return "Quick reset (under 30 seconds)";
  if (secondsSpent <= 120) return "Short session (under 2 minutes)";
  if (secondsSpent <= 300) return "Medium session (2-5 minutes)";
  if (secondsSpent <= 600) return "Long session (5-10 minutes)";
  if (secondsSpent <= 1200) return "Extended session (10-20 minutes)";
  return "Very long session (over 20 minutes)";
}

/**
 * Formats the time range for display in UI
 *
 * @param secondsSpent - Total time spent in seconds
 * @returns string - Human readable time range
 */
export function getTimeRangeForDisplay(secondsSpent: number): string {
  if (secondsSpent <= 30) return "0-30s";
  if (secondsSpent <= 120) return "30s-2m";
  if (secondsSpent <= 300) return "2-5m";
  if (secondsSpent <= 600) return "5-10m";
  if (secondsSpent <= 1200) return "10-20m";
  return "20m+";
}
