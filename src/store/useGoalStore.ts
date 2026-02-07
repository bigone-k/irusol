import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Goal } from "@/types";

interface GoalStore {
  goals: Goal[];
  addGoal: (goal: Omit<Goal, "id" | "createdAt" | "completed">) => void;
  toggleGoal: (id: string) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  reset: () => void;
}

export const useGoalStore = create<GoalStore>()(
  persist(
    (set) => ({
      goals: [],

      addGoal: (goalData) => {
        const newGoal: Goal = {
          ...goalData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          completed: false,
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

      reset: () => set({ goals: [] }),
    }),
    {
      name: "goal-storage",
    }
  )
);
