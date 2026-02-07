import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Project } from "@/types";

interface ProjectStore {
  projects: Project[];
  addProject: (project: Omit<Project, "id" | "createdAt" | "completed">) => void;
  toggleProject: (id: string) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProjectsByGoal: (goalId: string) => Project[];
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

      reset: () => set({ projects: [] }),
    }),
    {
      name: "project-storage",
    }
  )
);
