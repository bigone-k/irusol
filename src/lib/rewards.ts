/**
 * Fixed experience reward per task completion
 */
export const TASK_EXP = 10;

/**
 * Fixed coin reward per task completion
 */
export const TASK_COINS = 3;

/**
 * Calculate experience reward (fixed)
 */
export function calculateExp(): number {
  return TASK_EXP;
}

/**
 * Calculate coin reward (fixed)
 */
export function calculateCoins(): number {
  return TASK_COINS;
}

/**
 * Calculate required experience for a given level
 * Formula: 100 + (level - 1) × 25
 */
export function getRequiredExp(level: number): number {
  return 100 + (level - 1) * 25;
}

/**
 * Goal reward amount
 */
export const GOAL_REWARD = 500;

/**
 * Project reward amount
 */
export const PROJECT_REWARD = 300;

/**
 * Reward claim result interface
 */
export interface ClaimRewardResult {
  success: boolean;
  coins: number;
  message?: string;
}
