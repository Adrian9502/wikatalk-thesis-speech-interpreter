/**
 * Hint system utilities for calculating costs and managing hint state
 */

const HINT_COSTS = {
  1: 5,   // First hint: 5 coins
  2: 10,  // Second hint: 10 coins  
  3: 15,  // Third hint: 15 coins
  4: 20   // Fourth hint: 20 coins (for identification)
};

// NEW: Different max hints per game mode
const MAX_HINTS_PER_GAME_MODE = {
  multipleChoice: 2,    // Max 2 hints for Multiple Choice
  identification: 4,    // Max 4 hints for Identification  
  fillBlanks: 3        // Max 3 hints for Fill in the Blanks (default)
};

// Default fallback
const DEFAULT_MAX_HINTS = 3;

/**
 * Get maximum hints allowed for a specific game mode
 */
function getMaxHintsForGameMode(gameMode) {
  return MAX_HINTS_PER_GAME_MODE[gameMode] || DEFAULT_MAX_HINTS;
}

/**
 * Calculate hint cost based on hint number
 */
function getHintCost(hintNumber) {
  if (hintNumber < 1 || hintNumber > 4) { // Updated max to 4
    throw new Error(`Invalid hint number: ${hintNumber}. Must be between 1 and 4`);
  }
  return HINT_COSTS[hintNumber];
}

/**
 * Get all available hints and their costs for a specific game mode
 */
function getHintPricing(gameMode) {
  const maxHints = getMaxHintsForGameMode(gameMode);
  const availableHints = {};

  for (let i = 1; i <= maxHints; i++) {
    availableHints[i] = HINT_COSTS[i];
  }

  return Object.entries(availableHints).map(([hintNumber, cost]) => ({
    hintNumber: parseInt(hintNumber),
    cost,
    description: `Hint ${hintNumber}: Remove ${hintNumber} incorrect choice${hintNumber > 1 ? 's' : ''}`
  }));
}

/**
 * Calculate next hint cost for a question in specific game mode
 */
function getNextHintCost(currentHintsUsed, gameMode) {
  const maxHints = getMaxHintsForGameMode(gameMode);
  const nextHintNumber = currentHintsUsed + 1;

  if (nextHintNumber > maxHints) {
    return null; // No more hints available for this game mode
  }

  return getHintCost(nextHintNumber);
}

/**
 * Validate if hint can be purchased for specific game mode
 */
function canPurchaseHint(userCoins, currentHintsUsed, gameMode) {
  const maxHints = getMaxHintsForGameMode(gameMode);
  const nextHintCost = getNextHintCost(currentHintsUsed, gameMode);

  if (currentHintsUsed >= maxHints) {
    return {
      canPurchase: false,
      reason: `Maximum hints reached for ${gameMode} (${maxHints} max)`
    };
  }

  if (!nextHintCost) {
    return {
      canPurchase: false,
      reason: `Maximum hints reached for ${gameMode}`
    };
  }

  if (userCoins < nextHintCost) {
    return {
      canPurchase: false,
      reason: 'Insufficient coins',
      cost: nextHintCost,
      coinsNeeded: nextHintCost - userCoins
    };
  }

  return {
    canPurchase: true,
    cost: nextHintCost,
    hintsRemaining: maxHints - currentHintsUsed - 1
  };
}

module.exports = {
  getHintCost,
  getHintPricing,
  getNextHintCost,
  canPurchaseHint,
  getMaxHintsForGameMode,
  MAX_HINTS_PER_GAME_MODE,
  DEFAULT_MAX_HINTS,
  HINT_COSTS
};