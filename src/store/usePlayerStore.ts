import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PlayerStats, RewardResult } from "@/types";
import { calculateExp, calculateCoins, getRequiredExp } from "@/lib/rewards";
import { getStageForLevel, checkEvolution } from "@/lib/evolution";

const getTodayStr = () => new Date().toISOString().split("T")[0];

const initialStats: PlayerStats = {
  level: 1,
  experience: 0,
  maxExperience: 100,
  coins: 0,
  stage: "egg",
  hp: 50,
  maxHp: 50,
};

interface PlayerStore extends PlayerStats {
  // 오늘 받은 보상 추적
  todayEarnedXP: number;
  todayEarnedCoins: number;
  todayDate: string;

  // 마지막 접속 시각 (ISO string)
  lastVisitAt: string;

  completeTask: () => RewardResult;
  completeTaskXPOnly: () => RewardResult;
  loseExperience: (amount: number) => { leveledDown: boolean; newLevel?: number };
  addExperience: (amount: number) => void;
  addCoins: (amount: number) => void;
  /** 접속 시 미접속 패널티 확인 및 HP 차감. 패널티 발생 시 { hpLost, daysSinceVisit } 반환, 없으면 null */
  checkAbsencePenalty: () => { hpLost: number; daysSinceVisit: number } | null;
  reset: () => void;
}

/** 날짜가 바뀌었으면 일일 보상 초기화 */
const resetDailyIfNeeded = (
  set: (partial: Partial<PlayerStore>) => void,
  get: () => PlayerStore
) => {
  const today = getTodayStr();
  if (get().todayDate !== today) {
    set({ todayEarnedXP: 0, todayEarnedCoins: 0, todayDate: today });
  }
};

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      ...initialStats,

      // 일일 보상 초기값
      todayEarnedXP: 0,
      todayEarnedCoins: 0,
      todayDate: getTodayStr(),

      // 마지막 접속 시각 (첫 접속 시 빈 문자열)
      lastVisitAt: "",

      completeTask: (): RewardResult => {
        resetDailyIfNeeded(set, get);
        const { level, experience, todayEarnedXP, todayEarnedCoins } = get();

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
          todayEarnedXP: todayEarnedXP + exp,
          todayEarnedCoins: todayEarnedCoins + coins,
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
        resetDailyIfNeeded(set, get);
        const { level, experience, todayEarnedXP } = get();

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
          todayEarnedXP: todayEarnedXP + exp,
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
        resetDailyIfNeeded(set, get);
        const { level, experience, todayEarnedXP } = get();

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
          todayEarnedXP: Math.max(0, todayEarnedXP - amount),
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

      addCoins: (amount: number) => {
        resetDailyIfNeeded(set, get);
        const { todayEarnedCoins } = get();
        set({
          coins: get().coins + amount,
          todayEarnedCoins: todayEarnedCoins + amount,
        });
      },

      checkAbsencePenalty: () => {
        const { lastVisitAt, hp } = get();
        const now = new Date();
        const nowStr = now.toISOString();

        if (!lastVisitAt) {
          // 첫 접속 - 시각만 기록
          set({ lastVisitAt: nowStr });
          return null;
        }

        const lastVisit = new Date(lastVisitAt);
        const hoursDiff = (now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60);
        const daysSinceVisit = Math.floor(hoursDiff / 24);

        // 마지막 접속 시각을 현재로 갱신
        set({ lastVisitAt: nowStr });

        if (daysSinceVisit < 1) return null;

        // 패널티: 2^(daysSinceVisit - 1) HP 차감
        const hpLost = Math.pow(2, daysSinceVisit - 1);
        const newHp = Math.max(0, hp - hpLost);
        set({ hp: newHp });

        return { hpLost, daysSinceVisit };
      },

      reset: () =>
        set({
          ...initialStats,
          todayEarnedXP: 0,
          todayEarnedCoins: 0,
          todayDate: getTodayStr(),
          lastVisitAt: "",
        }),
    }),
    {
      name: "player-storage",
    }
  )
);
