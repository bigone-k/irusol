"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useGoalStore } from "@/store/useGoalStore";
import type { Goal } from "@/types";
import PlayerDashboard from "@/components/PlayerDashboard";
import VisionCard from "@/components/VisionCard";
import GoalCard from "@/components/GoalCard";
import GoalDetailSheet from "@/components/GoalDetailSheet";
import VisionFormBottomSheet from "@/components/VisionFormBottomSheet";
import FloatingAddButton from "@/components/FloatingAddButton";
import EmptyState from "@/components/EmptyState";

export default function GoalsPage() {
  const t = useTranslations();
  const goals = useGoalStore((state) => state.goals);
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
            icon="🎯"
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
