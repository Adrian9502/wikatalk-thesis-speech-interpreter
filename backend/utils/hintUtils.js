/**
 * Hint system utilities for calculating costs and managing hint state
 */

const HINT_COSTS = {
  1: 5,   // First hint: 5 coins
  2: 10,  // Second hint: 10 coins  
  3: 15   // Third hint: 15 coins
};

const MAX_HINTS_PER_QUESTION = 3;

/**
 * Calculate hint cost based on hint number
 */
function getHintCost(hintNumber) {
  if (hintNumber < 1 || hintNumber > MAX_HINTS_PER_QUESTION) {
    throw new Error(`Invalid hint number: ${hintNumber}. Must be between 1 and ${MAX_HINTS_PER_QUESTION}`);
  }
  return HINT_COSTS[hintNumber];
}

/**
 * Get all available hints and their costs
 */
function getHintPricing() {
  return Object.entries(HINT_COSTS).map(([hintNumber, cost]) => ({
    hintNumber: parseInt(hintNumber),
    cost,
    description: `Hint ${hintNumber}: Remove ${hintNumber} incorrect choice${hintNumber > 1 ? 's' : ''}`
  }));
}

/**
 * Calculate next hint cost for a question
 */
function getNextHintCost(currentHintsUsed) {
  const nextHintNumber = currentHintsUsed + 1;
  if (nextHintNumber > MAX_HINTS_PER_QUESTION) {
    return null; // No more hints available
  }
  return getHintCost(nextHintNumber);
}

/**
 * Validate if hint can be purchased
 */
function canPurchaseHint(userCoins, currentHintsUsed) {
  const nextHintCost = getNextHintCost(currentHintsUsed);
  if (!nextHintCost) return { canPurchase: false, reason: 'Maximum hints reached' };
  if (userCoins < nextHintCost) return { canPurchase: false, reason: 'Insufficient coins' };
  return { canPurchase: true, cost: nextHintCost };
}

module.exports = {
  getHintCost,
  getHintPricing,
  getNextHintCost,
  canPurchaseHint,
  MAX_HINTS_PER_QUESTION,
  HINT_COSTS
};