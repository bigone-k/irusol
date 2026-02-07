import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OnboardingStore {
  isCompleted: boolean;
  nickname: string;
  setNickname: (nickname: string) => void;
  completeOnboarding: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      isCompleted: false,
      nickname: "",

      setNickname: (nickname: string) => set({ nickname }),

      completeOnboarding: () => set({ isCompleted: true }),

      reset: () => set({ isCompleted: false, nickname: "" }),
    }),
    {
      name: "onboarding-storage",
    }
  )
);
