import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Task, DailyStats } from "@/types";
import { calculateExp, calculateCoins } from "@/lib/rewards";
import { getProgress } from "@/lib/taskProgress";
import { migrateTaskStore } from "@/lib/migrations";
import { syncTaskInsert, syncTaskUpdate, syncTaskDelete } from "@/lib/supabase/sync";

interface TaskStore {
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt" | "completed" | "rewardClaimed">) => void;
  toggleTask: (id: string) => void;
  completeTask: (id: string, date?: string) => void;
  uncompleteTask: (id: string, date?: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  hydrate: (tasks: Task[]) => void;
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
        syncTaskInsert(newTask).catch(() => {});
      },

      toggleTask: (id: string) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== id) return task;
            const newCompleted = !task.completed;
            return {
              ...task,
              completed: newCompleted,
              rewardClaimed: newCompleted ? true : task.rewardClaimed,
            };
          }),
        }));
        const task = get().tasks.find((t) => t.id === id);
        if (task) {
          syncTaskUpdate(id, {
            completed: task.completed,
            rewardClaimed: task.rewardClaimed,
          }).catch(() => {});
        }
      },

      completeTask: (id: string, date?: string) => {
        const today = date || new Date().toISOString().split("T")[0];
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== id) return task;
            const completedDates = task.completedDates || [];
            if (completedDates.includes(today)) return task;
            return {
              ...task,
              completedDates: [...completedDates, today],
              completionCount: (task.completionCount || 0) + 1,
            };
          }),
        }));
        const task = get().tasks.find((t) => t.id === id);
        if (task) {
          syncTaskUpdate(id, {
            completedDates: task.completedDates,
            completionCount: task.completionCount,
          }).catch(() => {});
        }
      },

      uncompleteTask: (id: string, date?: string) => {
        const today = date || new Date().toISOString().split("T")[0];
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== id) return task;
            const completedDates = task.completedDates || [];
            if (!completedDates.includes(today)) return task;
            return {
              ...task,
              completedDates: completedDates.filter((d) => d !== today),
              completionCount: Math.max(0, (task.completionCount || 0) - 1),
            };
          }),
        }));
        const task = get().tasks.find((t) => t.id === id);
        if (task) {
          syncTaskUpdate(id, {
            completedDates: task.completedDates,
            completionCount: task.completionCount,
          }).catch(() => {});
        }
      },

      updateTask: (id: string, updates: Partial<Task>) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        }));
        syncTaskUpdate(id, updates).catch(() => {});
      },

      deleteTask: (id: string) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
        syncTaskDelete(id).catch(() => {});
      },

      hydrate: (tasks) => set({ tasks }),
      reset: () => set({ tasks: [] }),

      getDailyStats: (): DailyStats => {
        const { tasks } = get();
        const totalTasks = tasks.length;
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
