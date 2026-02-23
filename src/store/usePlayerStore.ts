import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PlayerStats, RewardResult } from "@/types";
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
  completeTask: () => RewardResult;
  completeTaskXPOnly: () => RewardResult;
  loseExperience: (amount: number) => { leveledDown: boolean; newLevel?: number };
  addExperience: (amount: number) => void;
  addCoins: (amount: number) => void;
  reset: () => void;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      ...initialStats,

      completeTask: (): RewardResult => {
        const { level, experience } = get();

        const exp = calculateExp();
        const coins = calculateCoins();

        const newExp = experience + exp;
        let newLevel = level;
        let remainingExp = newExp;
        let leveledUp = false;

        while (remainingExp >= getRequiredExp(newLevel)) {
          remainingExp -= getRequiredExp(newLevel);
          newLevel += 1;
          leveledUp = true;
        }

        const evolved = checkEvolution(level, newLevel);
        const newStage = getStageForLevel(newLevel);

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

      completeTaskXPOnly: (): RewardResult => {
        const { level, experience } = get();

        const exp = calculateExp();

        const newExp = experience + exp;
        let newLevel = level;
        let remainingExp = newExp;
        let leveledUp = false;

        while (remainingExp >= getRequiredExp(newLevel)) {
          remainingExp -= getRequiredExp(newLevel);
          newLevel += 1;
          leveledUp = true;
        }

        const evolved = checkEvolution(level, newLevel);
        const newStage = getStageForLevel(newLevel);

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

      loseExperience: (amount: number) => {
        const { level, experience } = get();

        let newLevel = level;
        let remainingExp = experience - amount;
        let leveledDown = false;

        // 경험치가 부족하면 레벨다운
        while (remainingExp < 0 && newLevel > 1) {
          newLevel -= 1;
          remainingExp += getRequiredExp(newLevel);
          leveledDown = true;
        }

        // 레벨 1에서는 0 이하로 내려가지 않음
        if (remainingExp < 0) remainingExp = 0;

        const newStage = getStageForLevel(newLevel);

        set({
          level: newLevel,
          experience: remainingExp,
          maxExperience: getRequiredExp(newLevel),
          stage: newStage,
        });

        return {
          leveledDown,
          newLevel: leveledDown ? newLevel : undefined,
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
