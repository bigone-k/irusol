"use client";

import PlayerDashboard from "@/components/PlayerDashboard";
import TaskList from "@/components/TaskList";
import AddTaskButton from "@/components/AddTaskButton";

export default function TodosPage() {
  return (
    <div className="p-4 space-y-4">
      {/* Player Dashboard */}
      <PlayerDashboard />

      {/* Task List - All Tasks */}
      <TaskList />

      {/* Add Task Button */}
      <AddTaskButton />
    </div>
  );
}
