import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Goal, ValueChange } from "@/types";
import { migrateGoalStore } from "@/lib/migrations";
import { syncGoalInsert, syncGoalUpdate, syncGoalDelete, syncProjectDelete, syncTaskDelete } from "@/lib/supabase/sync";

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
  hydrate: (goals: Goal[]) => void;
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
          status: goalData.status || "notStarted",
          currentValue: goalData.currentValue ?? 0,
          targetValue: goalData.targetValue ?? 100,
          unit: goalData.unit || "%",
          ...goalData,
        };
        set((state) => ({ goals: [...state.goals, newGoal] }));

        // FK 보장: visionId가 있으면 vision store에서 parent 조회 후 전달
        const { useVisionStore } = require("@/store/useVisionStore");
        const vision = newGoal.visionId ? useVisionStore.getState().vision : null;
        syncGoalInsert(newGoal, vision).catch((e) => console.error("[sync]", e));
      },

      toggleGoal: (id: string) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id ? { ...goal, completed: !goal.completed } : goal
          ),
        }));
        const goal = get().goals.find((g) => g.id === id);
        if (goal) syncGoalUpdate(id, { completed: goal.completed }).catch((e) => console.error("[sync]", e));
      },

      updateGoal: (id: string, updates: Partial<Goal>) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id ? { ...goal, ...updates } : goal
          ),
        }));
        syncGoalUpdate(id, updates).catch((e) => console.error("[sync]", e));
      },

      deleteGoal: (id: string) => {
        // 하위 데이터를 먼저 수집 (삭제 전)
        const { useProjectStore } = require("@/store/useProjectStore");
        const { useTaskStore } = require("@/store/useTaskStore");
        const childProjectIds = useProjectStore.getState().projects
          .filter((p: any) => p.goalId === id)
          .map((p: any) => p.id);

        // Task 로컬 삭제 + DB soft delete (goal 직속 + project 경유)
        const taskStore = useTaskStore.getState();
        const childTaskIds = taskStore.tasks
          .filter((t: any) => t.goalId === id || childProjectIds.includes(t.projectId))
          .map((t: any) => t.id);
        useTaskStore.setState({
          tasks: taskStore.tasks.filter((t: any) => !childTaskIds.includes(t.id)),
        });
        for (const taskId of childTaskIds) syncTaskDelete(taskId).catch((e) => console.error("[sync]", e));

        // Project 로컬 삭제 + DB soft delete
        useProjectStore.setState({
          projects: useProjectStore.getState().projects.filter((p: any) => p.goalId !== id),
        });
        for (const projectId of childProjectIds) syncProjectDelete(projectId).catch((e) => console.error("[sync]", e));

        // Goal 로컬 삭제 + DB soft delete
        set((state) => ({
          goals: state.goals.filter((goal) => goal.id !== id),
        }));
        syncGoalDelete(id).catch((e) => console.error("[sync]", e));
      },

      incrementValue: (id: string, amount: number = 1) => {
        let updatedGoal: Goal | undefined;
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
            updatedGoal = { ...goal, currentValue: newValue, valueHistory: updatedHistory };
            return updatedGoal;
          }),
        }));
        if (updatedGoal) {
          syncGoalUpdate(id, {
            currentValue: updatedGoal.currentValue,
            valueHistory: updatedGoal.valueHistory,
          }).catch((e) => console.error("[sync]", e));
        }
      },

      decrementValue: (id: string, amount: number = 1) => {
        let updatedGoal: Goal | undefined;
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
            updatedGoal = { ...goal, currentValue: newValue, valueHistory: updatedHistory };
            return updatedGoal;
          }),
        }));
        if (updatedGoal) {
          syncGoalUpdate(id, {
            currentValue: updatedGoal.currentValue,
            valueHistory: updatedGoal.valueHistory,
          }).catch((e) => console.error("[sync]", e));
        }
      },

      updateStatus: (id: string, status: Goal["status"]) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id ? { ...goal, status } : goal
          ),
        }));
        syncGoalUpdate(id, { status }).catch((e) => console.error("[sync]", e));
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
        syncGoalUpdate(id, { rewardClaimed: true }).catch((e) => console.error("[sync]", e));
        return true;
      },

      hydrate: (goals) => set({ goals }),
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
