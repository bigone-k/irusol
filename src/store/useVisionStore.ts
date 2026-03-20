import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Vision } from "@/types";
import { syncVisionUpsert } from "@/lib/supabase/sync";

interface VisionStore {
  vision: Vision | null;
  setVision: (vision: Omit<Vision, "id" | "createdAt" | "updatedAt">) => void;
  updateVision: (updates: Partial<Vision>) => void;
  hydrate: (vision: Vision | null) => void;
  reset: () => void;
}

export const useVisionStore = create<VisionStore>()(
  persist(
    (set) => ({
      vision: null,

      setVision: (visionData) => {
        const newVision: Vision = {
          ...visionData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set({ vision: newVision });
        syncVisionUpsert(newVision).catch((e) => console.error("[sync]", e));
      },

      updateVision: (updates) => {
        set((state) => {
          if (!state.vision) return state;
          const updated = { ...state.vision, ...updates, updatedAt: new Date() };
          syncVisionUpsert(updated).catch((e) => console.error("[sync]", e));
          return { vision: updated };
        });
      },

      hydrate: (vision) => set({ vision }),
      reset: () => set({ vision: null }),
    }),
    {
      name: "vision-storage",
    }
  )
);
