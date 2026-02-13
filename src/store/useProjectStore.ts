import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Project } from "@/types";
import { migrateProjectStore } from "@/lib/migrations";

interface ProjectStore {
  projects: Project[];
  addProject: (project: Omit<Project, "id" | "createdAt" | "completed" | "status" | "rewardClaimed" | "rewardAmount">) => void;
  toggleProject: (id: string) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProjectsByGoal: (goalId: string) => Project[];
  updateStatus: (id: string, status: Project["status"]) => void;
  claimReward: (id: string) => boolean;
  reset: () => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],

      addProject: (projectData) => {
        const newProject: Project = {
          ...projectData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          completed: false,
          status: "notStarted",
          rewardClaimed: false,
          rewardAmount: 300,
        };
        set((state) => ({ projects: [...state.projects, newProject] }));
      },

      toggleProject: (id: string) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id
              ? { ...project, completed: !project.completed }
              : project
          ),
        }));
      },

      updateProject: (id: string, updates: Partial<Project>) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id ? { ...project, ...updates } : project
          ),
        }));
      },

      deleteProject: (id: string) => {
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
        }));
      },

      getProjectsByGoal: (goalId: string) => {
        return get().projects.filter((project) => project.goalId === goalId);
      },

      updateStatus: (id: string, status: Project["status"]) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id ? { ...project, status } : project
          ),
        }));
      },

      claimReward: (id: string): boolean => {
        const project = get().projects.find((p) => p.id === id);
        if (!project || project.rewardClaimed || project.status !== "completed") {
          return false;
        }

        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, rewardClaimed: true } : p
          ),
        }));

        return true;
      },

      reset: () => set({ projects: [] }),
    }),
    {
      name: "project-storage",
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          return migrateProjectStore(persistedState);
        }
        return persistedState;
      },
    }
  )
);
