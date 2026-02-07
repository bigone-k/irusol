"use client";

import PlayerDashboard from "@/components/PlayerDashboard";
import ObjectiveCard from "@/components/ObjectiveCard";
import TaskList from "@/components/TaskList";
import AddTaskButton from "@/components/AddTaskButton";
import Onboarding from "@/components/Onboarding";
import { useOnboardingStore } from "@/store/useOnboardingStore";

export default function Home() {
  const isOnboardingCompleted = useOnboardingStore(
    (state) => state.isCompleted
  );

  // Show onboarding if not completed
  if (!isOnboardingCompleted) {
    return <Onboarding />;
  }

  return (
    <div className="p-4 space-y-4">
      {/* Player Dashboard */}
      <PlayerDashboard />

      {/* Objective Card */}
      <ObjectiveCard />

      {/* Task List */}
      <TaskList />

      {/* Add Task Button */}
      <AddTaskButton />
    </div>
  );
}
