import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Task, DailyStats } from "@/types";
import { calculateExp, calculateCoins } from "@/lib/rewards";

interface TaskStore {
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt" | "completed">) => void;
  toggleTask: (id: string) => void;
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
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
      },

      toggleTask: (id: string) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task
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
    }
  )
);
