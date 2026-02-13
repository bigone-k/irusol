import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Task, DailyStats } from "@/types";
import { calculateExp, calculateCoins } from "@/lib/rewards";
import { migrateTaskStore } from "@/lib/migrations";

interface TaskStore {
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt" | "completed" | "rewardClaimed">) => void;
  toggleTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  incrementCompletion: (id: string) => void;
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

      incrementCompletion: (id: string) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, completionCount: (task.completionCount || 0) + 1 }
              : task
          ),
        }));
      },

      reset: () => set({ tasks: [] }),

      getDailyStats: (): DailyStats => {
        const { tasks } = get();
        const today = new Date().toDateString();

        const todayTasks = tasks.filter(
          (task) => new Date(task.createdAt).toDateString() === today
        );

        const completedTasks = todayTasks.filter((task) => task.completed);

        const totalExp = completedTasks.reduce(
          (sum, task) => sum + calculateExp(task.difficulty),
          0
        );

        const totalCoins = completedTasks.reduce(
          (sum, task) => sum + calculateCoins(task.difficulty),
          0
        );

        return {
          totalTasks: todayTasks.length,
          completedTasks: completedTasks.length,
          totalExp,
          totalCoins,
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
