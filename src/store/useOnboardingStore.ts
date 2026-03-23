import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import { withPerfLog } from "@/lib/perfLogger";

interface OnboardingStore {
  isCompleted: boolean;
  completeOnboarding: () => Promise<void>;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      isCompleted: false,

      completeOnboarding: async () => {
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await withPerfLog(
              { category: 'onboarding', operation: 'completeOnboarding', table_name: 'profiles', method: 'update', context: 'useOnboardingStore', user_id: user.id },
              async () => {
                const { error } = await supabase
                  .from("profiles")
                  .update({ is_onboarded: true })
                  .eq("id", user.id);
                if (error) throw error;
              }
            );
          }
        } catch {
          // DB update failed — still mark locally completed
        }
        set({ isCompleted: true });
      },

      reset: () => set({ isCompleted: false }),
    }),
    {
      name: "onboarding-storage",
    }
  )
);
