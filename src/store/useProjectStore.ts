import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Project } from "@/types";
import { migrateProjectStore } from "@/lib/migrations";
import { syncProjectInsert, syncProjectUpdate, syncProjectDelete, syncTaskDelete } from "@/lib/supabase/sync";

interface ProjectStore {
  projects: Project[];
  addProject: (project: Omit<Project, "id" | "createdAt" | "completed" | "status" | "rewardClaimed" | "rewardAmount">) => void;
  toggleProject: (id: string) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProjectsByGoal: (goalId: string) => Project[];
  updateStatus: (id: string, status: Project["status"]) => void;
  claimReward: (id: string) => boolean;
  hydrate: (projects: Project[]) => void;
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

        // FK 보장: goalId가 있으면 goal store에서 parent 조회 후 전달
        const { useGoalStore } = require("@/store/useGoalStore");
        const goal = newProject.goalId
          ? useGoalStore.getState().goals.find((g: any) => g.id === newProject.goalId)
          : null;
        syncProjectInsert(newProject, goal).catch((e) => console.error("[sync]", e));
      },

      toggleProject: (id: string) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id
              ? { ...project, completed: !project.completed }
              : project
          ),
        }));
        const project = get().projects.find((p) => p.id === id);
        if (project) syncProjectUpdate(id, { completed: project.completed }).catch((e) => console.error("[sync]", e));
      },

      updateProject: (id: string, updates: Partial<Project>) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id ? { ...project, ...updates } : project
          ),
        }));
        syncProjectUpdate(id, updates).catch((e) => console.error("[sync]", e));
      },

      deleteProject: (id: string) => {
        // Task 로컬 삭제 + DB soft delete
        const { useTaskStore } = require("@/store/useTaskStore");
        const taskStore = useTaskStore.getState();
        const childTaskIds = taskStore.tasks
          .filter((t: any) => t.projectId === id)
          .map((t: any) => t.id);
        useTaskStore.setState({
          tasks: taskStore.tasks.filter((t: any) => !childTaskIds.includes(t.id)),
        });
        for (const taskId of childTaskIds) syncTaskDelete(taskId).catch((e) => console.error("[sync]", e));

        // Project 로컬 삭제 + DB soft delete
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
        }));
        syncProjectDelete(id).catch((e) => console.error("[sync]", e));
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
        syncProjectUpdate(id, { status }).catch((e) => console.error("[sync]", e));
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
        syncProjectUpdate(id, { rewardClaimed: true }).catch((e) => console.error("[sync]", e));
        return true;
      },

      hydrate: (projects) => set({ projects }),
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
