"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import { useGoalStore } from "@/store/useGoalStore";
import { useToastStore } from "@/store/useToastStore";
import type { Goal } from "@/types";
import PlayerDashboard from "@/components/PlayerDashboard";
import VisionCard from "@/components/VisionCard";
import GoalCard from "@/components/GoalCard";
import GoalDetailSheet from "@/components/GoalDetailSheet";
import VisionFormBottomSheet from "@/components/VisionFormBottomSheet";
import FloatingAddButton from "@/components/FloatingAddButton";
import EmptyState from "@/components/EmptyState";
import { FiTarget } from "react-icons/fi";

export default function GoalsPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Show toast after Google account linking attempt
  useEffect(() => {
    if (searchParams.get('linked') === 'true') {
      useToastStore.getState().success(t('sidebar.linkSuccess'));
      const url = new URL(window.location.href);
      url.searchParams.delete('linked');
      router.replace(url.pathname, { scroll: false });
    }
    const linkError = searchParams.get('link_error');
    if (linkError) {
      const msg = linkError.toLowerCase();
      if (msg.includes('already linked') || msg.includes('identity already exists')) {
        useToastStore.getState().error(t('sidebar.linkErrorAlreadyLinked'));
      } else if (msg.includes('session') || msg.includes('not authenticated')) {
        useToastStore.getState().error(t('sidebar.linkErrorSessionExpired'));
      } else {
        useToastStore.getState().error(t('sidebar.linkError'));
      }
      const url = new URL(window.location.href);
      url.searchParams.delete('link_error');
      router.replace(url.pathname, { scroll: false });
    }
  }, [searchParams, t, router]);
  const rawGoals = useGoalStore((state) => state.goals);
  const STATUS_ORDER = { notStarted: 0, inProgress: 1, completed: 2 };
  const goals = [...rawGoals].sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
  );
  const toggleGoal = useGoalStore((state) => state.toggleGoal);

  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isVisionSheetOpen, setIsVisionSheetOpen] = useState(false);

  const handleGoalClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setSelectedGoal(null);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Player Dashboard */}
      <PlayerDashboard />

      {/* Vision Card (Fixed, Top Priority) */}
      <VisionCard onClick={() => setIsVisionSheetOpen(true)} />

      {/* Goals List */}
      <div className="space-y-3">
        {goals.length === 0 ? (
          <EmptyState
            title={t("goal.empty")}
            description={t("goal.emptyDescription")}
            icon={<FiTarget size={40} />}
          />
        ) : (
          goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onToggle={() => toggleGoal(goal.id)}
              onClick={() => handleGoalClick(goal)}
            />
          ))
        )}
      </div>

      {/* Floating Add Button */}
      <FloatingAddButton />

      {/* Goal Detail Sheet */}
      <GoalDetailSheet
        goal={selectedGoal}
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
      />

      {/* Vision Form Bottom Sheet */}
      <VisionFormBottomSheet
        isOpen={isVisionSheetOpen}
        onClose={() => setIsVisionSheetOpen(false)}
      />
    </div>
  );
}
