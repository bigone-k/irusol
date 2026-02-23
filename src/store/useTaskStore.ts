import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Task, DailyStats } from "@/types";
import { calculateExp, calculateCoins } from "@/lib/rewards";
import { getProgress } from "@/lib/taskProgress";
import { migrateTaskStore } from "@/lib/migrations";

interface TaskStore {
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt" | "completed" | "rewardClaimed">) => void;
  toggleTask: (id: string) => void;
  completeTask: (id: string, date?: string) => void;
  uncompleteTask: (id: string, date?: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  reset: () => void;
  getDailyStats: () => DailyStats;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          completed: false,
          rewardClaimed: false,
          completionCount: 0,
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
      },

      toggleTask: (id: string) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== id) return task;

            const newCompleted = !task.completed;
            // 완료 시 rewardClaimed 설정
            return {
              ...task,
              completed: newCompleted,
              rewardClaimed: newCompleted ? true : task.rewardClaimed,
            };
          }),
        }));
      },

      completeTask: (id: string, date?: string) => {
        const today = date || new Date().toISOString().split('T')[0];
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== id) return task;

            const completedDates = task.completedDates || [];
            if (completedDates.includes(today)) return task; // 이미 완료됨

            return {
              ...task,
              completedDates: [...completedDates, today],
              completionCount: (task.completionCount || 0) + 1,
            };
          }),
        }));
      },

      uncompleteTask: (id: string, date?: string) => {
        const today = date || new Date().toISOString().split('T')[0];
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== id) return task;

            const completedDates = task.completedDates || [];
            if (!completedDates.includes(today)) return task; // 완료되지 않음

            return {
              ...task,
              completedDates: completedDates.filter((d) => d !== today),
              completionCount: Math.max(0, (task.completionCount || 0) - 1),
            };
          }),
        }));
      },

      updateTask: (id: string, updates: Partial<Task>) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        }));
      },

      deleteTask: (id: string) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

      reset: () => set({ tasks: [] }),

      getDailyStats: (): DailyStats => {
        const { tasks } = get();

        // 전체 퀘스트 수
        const totalTasks = tasks.length;

        // 완료된 퀘스트 수 (progress 100% 달성한 것)
        const completedCount = tasks.filter(
          (task) => getProgress(task) >= 100
        ).length;

        return {
          totalTasks,
          completedTasks: completedCount,
          totalExp: completedCount * calculateExp(),
          totalCoins: completedCount * calculateCoins(),
        };
      },
    }),
    {
      name: "task-storage",
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          return migrateTaskStore(persistedState);
        }
        return persistedState;
      },
    }
  )
);
