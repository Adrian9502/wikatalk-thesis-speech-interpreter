/**
 * Calculates reward coins based on difficulty and time taken to answer correctly
 */

export interface RewardTier {
  minSeconds: number;
  maxSeconds: number;
  coins: number;
  label: string;
}

export interface DifficultyRewardConfig {
  baseCoins: number;
  tiers: RewardTier[];
}

// Define reward tiers for each difficulty
const REWARD_CONFIG: Record<string, DifficultyRewardConfig> = {
  easy: {
    baseCoins: 10,
    tiers: [
      { minSeconds: 0, maxSeconds: 10, coins: 10, label: "Lightning Fast!" },
      { minSeconds: 10, maxSeconds: 20, coins: 9, label: "Very Fast!" },
      { minSeconds: 20, maxSeconds: 30, coins: 8, label: "Fast!" },
      { minSeconds: 30, maxSeconds: 60, coins: 7, label: "Quick!" },
      { minSeconds: 60, maxSeconds: 120, coins: 6, label: "Good!" },
      { minSeconds: 120, maxSeconds: 180, coins: 5, label: "Nice!" },
      { minSeconds: 180, maxSeconds: 240, coins: 4, label: "Okay!" },
      { minSeconds: 240, maxSeconds: 300, coins: 3, label: "Slow!" },
      { minSeconds: 300, maxSeconds: 600, coins: 2, label: "Very Slow!" },
      { minSeconds: 600, maxSeconds: 1200, coins: 1, label: "Too Slow!" },
      { minSeconds: 1200, maxSeconds: Infinity, coins: 0, label: "No Reward" },
    ],
  },
  medium: {
    baseCoins: 15,
    tiers: [
      { minSeconds: 0, maxSeconds: 10, coins: 15, label: "Lightning Fast!" },
      { minSeconds: 10, maxSeconds: 20, coins: 14, label: "Very Fast!" },
      { minSeconds: 20, maxSeconds: 30, coins: 13, label: "Fast!" },
      { minSeconds: 30, maxSeconds: 60, coins: 12, label: "Quick!" },
      { minSeconds: 60, maxSeconds: 120, coins: 11, label: "Good!" },
      { minSeconds: 120, maxSeconds: 180, coins: 10, label: "Nice!" },
      { minSeconds: 180, maxSeconds: 240, coins: 9, label: "Okay!" },
      { minSeconds: 240, maxSeconds: 300, coins: 8, label: "Slow!" },
      { minSeconds: 300, maxSeconds: 600, coins: 7, label: "Very Slow!" },
      { minSeconds: 600, maxSeconds: 1200, coins: 6, label: "Too Slow!" },
      {
        minSeconds: 1200,
        maxSeconds: Infinity,
        coins: 5,
        label: "Minimum Reward",
      },
    ],
  },
  hard: {
    baseCoins: 20,
    tiers: [
      { minSeconds: 0, maxSeconds: 10, coins: 20, label: "Lightning Fast!" },
      { minSeconds: 10, maxSeconds: 20, coins: 19, label: "Very Fast!" },
      { minSeconds: 20, maxSeconds: 30, coins: 18, label: "Fast!" },
      { minSeconds: 30, maxSeconds: 60, coins: 17, label: "Quick!" },
      { minSeconds: 60, maxSeconds: 120, coins: 16, label: "Good!" },
      { minSeconds: 120, maxSeconds: 180, coins: 15, label: "Nice!" },
      { minSeconds: 180, maxSeconds: 240, coins: 14, label: "Okay!" },
      { minSeconds: 240, maxSeconds: 300, coins: 13, label: "Slow!" },
      { minSeconds: 300, maxSeconds: 600, coins: 12, label: "Very Slow!" },
      { minSeconds: 600, maxSeconds: 1200, coins: 11, label: "Too Slow!" },
      {
        minSeconds: 1200,
        maxSeconds: Infinity,
        coins: 10,
        label: "Minimum Reward",
      },
    ],
  },
};

/**
 * Calculate reward coins for a correct answer based on difficulty and time taken
 */
export function calculateRewardCoins(
  difficulty: string,
  timeSpentSeconds: number,
  isCorrect: boolean
): {
  coins: number;
  label: string;
  tier: RewardTier | null;
  baseCoins: number;
} {
  // No reward for incorrect answers
  if (!isCorrect) {
    return {
      coins: 0,
      label: "No Reward",
      tier: null,
      baseCoins: 0,
    };
  }

  // Normalize difficulty to lowercase
  const normalizedDifficulty = difficulty.toLowerCase();
  const config = REWARD_CONFIG[normalizedDifficulty];

  if (!config) {
    console.warn(
      `[RewardCalculation] Unknown difficulty: ${difficulty}, defaulting to easy`
    );
    return calculateRewardCoins("easy", timeSpentSeconds, isCorrect);
  }

  // Find the appropriate tier based on time spent
  const tier = config.tiers.find(
    (t) => timeSpentSeconds >= t.minSeconds && timeSpentSeconds < t.maxSeconds
  );

  if (!tier) {
    console.warn(
      `[RewardCalculation] No tier found for ${timeSpentSeconds}s, using last tier`
    );
    const lastTier = config.tiers[config.tiers.length - 1];
    return {
      coins: lastTier.coins,
      label: lastTier.label,
      tier: lastTier,
      baseCoins: config.baseCoins,
    };
  }

  return {
    coins: tier.coins,
    label: tier.label,
    tier,
    baseCoins: config.baseCoins,
  };
}

/**
 * Get reward breakdown for display purposes
 */
export function getRewardBreakdown(
  difficulty: string,
  timeSpentSeconds: number,
  isCorrect: boolean
): {
  coins: number;
  label: string;
  difficulty: string;
  timeSpent: string;
  tier: string;
} {
  const reward = calculateRewardCoins(difficulty, timeSpentSeconds, isCorrect);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    } else if (seconds < 3600) {
      return `${(seconds / 60).toFixed(1)}m`;
    } else {
      return `${(seconds / 3600).toFixed(1)}h`;
    }
  };

  const getTierDescription = (tier: RewardTier | null): string => {
    if (!tier) return "No Tier";

    if (tier.maxSeconds === Infinity) {
      return `${formatTime(tier.minSeconds)}+`;
    }
    return `${formatTime(tier.minSeconds)}-${formatTime(tier.maxSeconds)}`;
  };

  return {
    coins: reward.coins,
    label: reward.label,
    difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
    timeSpent: formatTime(timeSpentSeconds),
    tier: getTierDescription(reward.tier),
  };
}

/**
 * Get all reward tiers for a difficulty (useful for displaying reward tables)
 */
export function getRewardTiersForDifficulty(
  difficulty: string
): DifficultyRewardConfig | null {
  const normalizedDifficulty = difficulty.toLowerCase();
  return REWARD_CONFIG[normalizedDifficulty] || null;
}
