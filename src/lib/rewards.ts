import type { Difficulty } from "@/types";

/**
 * Difficulty weights for reward calculation
 */
export const DIFFICULTY_WEIGHTS: Record<Difficulty, number> = {
  easy: 1.0,
  normal: 1.5,
  hard: 2.0,
};

/**
 * Calculate experience reward based on difficulty
 * Formula: 10 × difficulty_weight
 */
export function calculateExp(difficulty: Difficulty): number {
  return 10 * DIFFICULTY_WEIGHTS[difficulty];
}

/**
 * Calculate coin reward based on difficulty
 * Formula: 3 × difficulty_weight
 */
export function calculateCoins(difficulty: Difficulty): number {
  return 3 * DIFFICULTY_WEIGHTS[difficulty];
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
