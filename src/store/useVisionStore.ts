import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Vision } from "@/types";

interface VisionStore {
  vision: Vision | null;
  setVision: (vision: Omit<Vision, "id" | "createdAt" | "updatedAt">) => void;
  updateVision: (updates: Partial<Vision>) => void;
  reset: () => void;
}

export const useVisionStore = create<VisionStore>()(
  persist(
    (set) => ({
      vision: null,

      setVision: (visionData) => {
        const newVision: Vision = {
          ...visionData,
          id: "vision-singleton", // Singleton: only one vision exists
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set({ vision: newVision });
      },

      updateVision: (updates) => {
        set((state) => ({
          vision: state.vision
            ? { ...state.vision, ...updates, updatedAt: new Date() }
            : null,
        }));
      },

      reset: () => set({ vision: null }),
    }),
    {
      name: "vision-storage",
    }
  )
);
