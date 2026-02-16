import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PlayerStats, Difficulty, RewardResult } from "@/types";
import { calculateExp, calculateCoins, getRequiredExp } from "@/lib/rewards";
import { getStageForLevel, checkEvolution } from "@/lib/evolution";

const initialStats: PlayerStats = {
  level: 1,
  experience: 0,
  maxExperience: 100,
  coins: 0,
  stage: "egg",
};

interface PlayerStore extends PlayerStats {
  completeTask: (difficulty: Difficulty) => RewardResult;
  completeTaskXPOnly: (difficulty: Difficulty) => RewardResult;
  addExperience: (amount: number) => void;
  addCoins: (amount: number) => void;
  reset: () => void;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      ...initialStats,

      completeTask: (difficulty: Difficulty): RewardResult => {
        const { level, experience, maxExperience } = get();

        // Calculate rewards
        const exp = calculateExp(difficulty);
        const coins = calculateCoins(difficulty);

        const newExp = experience + exp;
        let newLevel = level;
        let remainingExp = newExp;
        let leveledUp = false;

        // Handle level-ups (potentially multiple)
        while (remainingExp >= getRequiredExp(newLevel)) {
          remainingExp -= getRequiredExp(newLevel);
          newLevel += 1;
          leveledUp = true;
        }

        // Check for evolution
        const evolved = checkEvolution(level, newLevel);
        const newStage = getStageForLevel(newLevel);

        // Update state
        set({
          level: newLevel,
          experience: remainingExp,
          maxExperience: getRequiredExp(newLevel),
          coins: get().coins + coins,
          stage: newStage,
        });

        return {
          exp,
          coins,
          leveledUp,
          evolved,
          newLevel: leveledUp ? newLevel : undefined,
          newStage: evolved ? newStage : undefined,
        };
      },

      completeTaskXPOnly: (difficulty: Difficulty): RewardResult => {
        const { level, experience } = get();

        // Calculate XP only
        const exp = calculateExp(difficulty);

        const newExp = experience + exp;
        let newLevel = level;
        let remainingExp = newExp;
        let leveledUp = false;

        // Handle level-ups
        while (remainingExp >= getRequiredExp(newLevel)) {
          remainingExp -= getRequiredExp(newLevel);
          newLevel += 1;
          leveledUp = true;
        }

        // Check for evolution
        const evolved = checkEvolution(level, newLevel);
        const newStage = getStageForLevel(newLevel);

        // Update state (no coins)
        set({
          level: newLevel,
          experience: remainingExp,
          maxExperience: getRequiredExp(newLevel),
          stage: newStage,
        });

        return {
          exp,
          coins: 0,
          leveledUp,
          evolved,
          newLevel: leveledUp ? newLevel : undefined,
          newStage: evolved ? newStage : undefined,
        };
      },

      addExperience: (amount: number) => {
        const { level, experience } = get();
        const newExp = experience + amount;
        let newLevel = level;
        let remainingExp = newExp;

        while (remainingExp >= getRequiredExp(newLevel)) {
          remainingExp -= getRequiredExp(newLevel);
          newLevel += 1;
        }

        const newStage = getStageForLevel(newLevel);

        set({
          level: newLevel,
          experience: remainingExp,
          maxExperience: getRequiredExp(newLevel),
          stage: newStage,
        });
      },

      addCoins: (amount: number) => set({ coins: get().coins + amount }),

      reset: () => set(initialStats),
    }),
    {
      name: "player-storage",
    }
  )
);
