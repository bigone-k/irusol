import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Goal, ValueChange } from "@/types";
import { migrateGoalStore } from "@/lib/migrations";

interface GoalStore {
  goals: Goal[];
  addGoal: (goal: Omit<Goal, "id" | "createdAt" | "completed" | "valueHistory" | "rewardClaimed" | "rewardAmount" | "status" | "currentValue" | "targetValue" | "unit"> & {
    status?: Goal["status"];
    currentValue?: number;
    targetValue?: number;
    unit?: string;
  }) => void;
  toggleGoal: (id: string) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  incrementValue: (id: string, amount: number) => void;
  decrementValue: (id: string, amount: number) => void;
  updateStatus: (id: string, status: Goal["status"]) => void;
  claimReward: (id: string) => boolean;
  reset: () => void;
}

export const useGoalStore = create<GoalStore>()(
  persist(
    (set, get) => ({
      goals: [],

      addGoal: (goalData) => {
        const newGoal: Goal = {
          id: crypto.randomUUID(),
          createdAt: new Date(),
          completed: false,
          valueHistory: [],
          rewardClaimed: false,
          rewardAmount: 500,
          // 사용자 입력값 사용, 없으면 기본값
          status: goalData.status || "notStarted",
          currentValue: goalData.currentValue ?? 0,
          targetValue: goalData.targetValue ?? 100,
          unit: goalData.unit || "%",
          ...goalData,
        };
        set((state) => ({ goals: [...state.goals, newGoal] }));
      },

      toggleGoal: (id: string) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id ? { ...goal, completed: !goal.completed } : goal
          ),
        }));
      },

      updateGoal: (id: string, updates: Partial<Goal>) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id ? { ...goal, ...updates } : goal
          ),
        }));
      },

      deleteGoal: (id: string) => {
        set((state) => ({
          goals: state.goals.filter((goal) => goal.id !== id),
        }));
      },

      incrementValue: (id: string, amount: number = 1) => {
        set((state) => ({
          goals: state.goals.map((goal) => {
            if (goal.id !== id) return goal;

            const newValue = Math.min(goal.currentValue + amount, goal.targetValue);
            const change: ValueChange = {
              id: crypto.randomUUID(),
              timestamp: new Date(),
              previousValue: goal.currentValue,
              newValue,
              change: amount,
            };

            const updatedHistory = [change, ...(goal.valueHistory || [])].slice(0, 100);

            return {
              ...goal,
              currentValue: newValue,
              valueHistory: updatedHistory,
            };
          }),
        }));
      },

      decrementValue: (id: string, amount: number = 1) => {
        set((state) => ({
          goals: state.goals.map((goal) => {
            if (goal.id !== id) return goal;

            const newValue = Math.max(goal.currentValue - amount, 0);
            const change: ValueChange = {
              id: crypto.randomUUID(),
              timestamp: new Date(),
              previousValue: goal.currentValue,
              newValue,
              change: -amount,
            };

            const updatedHistory = [change, ...(goal.valueHistory || [])].slice(0, 100);

            return {
              ...goal,
              currentValue: newValue,
              valueHistory: updatedHistory,
            };
          }),
        }));
      },

      updateStatus: (id: string, status: Goal["status"]) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id ? { ...goal, status } : goal
          ),
        }));
      },

      claimReward: (id: string): boolean => {
        const goal = get().goals.find((g) => g.id === id);
        if (!goal || goal.rewardClaimed || goal.status !== "completed") {
          return false;
        }

        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, rewardClaimed: true } : g
          ),
        }));

        return true;
      },

      reset: () => set({ goals: [] }),
    }),
    {
      name: "goal-storage",
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          return migrateGoalStore(persistedState);
        }
        return persistedState;
      },
    }
  )
);
