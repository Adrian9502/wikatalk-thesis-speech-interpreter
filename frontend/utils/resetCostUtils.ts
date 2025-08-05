/**
 * Calculates the cost to reset the timer based on time spent.
 *
 * @param secondsSpent - Total time spent in seconds
 * @returns number - Coin cost for resetting the timer
 */
export function calculateResetCost(secondsSpent: number): number {
  if (secondsSpent <= 10) return 20; // 0–10 sec → 20 coins
  if (secondsSpent <= 30) return 40; // 10–30 sec → 40 coins
  if (secondsSpent <= 60) return 55; // 30s – 1 min → 55 coins
  if (secondsSpent <= 120) return 70; // 1 – 2 mins → 70 coins
  if (secondsSpent <= 180) return 90; // 2 – 3 mins → 90 coins
  if (secondsSpent <= 240) return 100; // 3 – 4 mins → 100 coins
  return 110; // 4+ mins → 110 coins
}

/**
 * Gets a descriptive message for the reset cost based on time spent.
 *
 * @param secondsSpent - Total time spent in seconds
 * @returns string - Descriptive message for the cost tier
 */
export function getResetCostDescription(secondsSpent: number): string {
  if (secondsSpent <= 10) return "Ultra quick (under 10 seconds)";
  if (secondsSpent <= 30) return "Quick reset (10-30 seconds)";
  if (secondsSpent <= 60) return "Short session (30s - 1 minute)";
  if (secondsSpent <= 120) return "Medium session (1-2 minutes)";
  if (secondsSpent <= 180) return "Long session (2-3 minutes)";
  if (secondsSpent <= 240) return "Extended session (3-4 minutes)";
  return "Very long session (over 4 minutes)";
}

/**
 * Formats the time range for display in UI
 *
 * @param secondsSpent - Total time spent in seconds
 * @returns string - Human readable time range
 */
export function getTimeRangeForDisplay(secondsSpent: number): string {
  if (secondsSpent <= 10) return "0-10s";
  if (secondsSpent <= 30) return "10-30s";
  if (secondsSpent <= 60) return "30s-1m";
  if (secondsSpent <= 120) return "1-2m";
  if (secondsSpent <= 180) return "2-3m";
  if (secondsSpent <= 240) return "3-4m";
  return "4m+";
}
