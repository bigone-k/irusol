"use client";

import { useTaskStore } from "@/store/useTaskStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import type { TabType, Task } from "@/types";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface TaskListProps {
  activeTab?: TabType;
}

export default function TaskList({ activeTab }: TaskListProps) {
  const t = useTranslations();
  const tasks = useTaskStore((state) => state.tasks);
  const toggleTask = useTaskStore((state) => state.toggleTask);
  const completeTask = usePlayerStore((state) => state.completeTask);
  const [celebratingTask, setCelebratingTask] = useState<string | null>(null);

  const handleToggle = (task: Task) => {
    if (!task.completed) {
      // Task being completed - add rewards
      const result = completeTask(task.difficulty);
      toggleTask(task.id);

      // Show celebration animation
      setCelebratingTask(task.id);
      setTimeout(() => setCelebratingTask(null), 1000);

      // Show level-up/evolution notification if needed
      if (result.evolved) {
        // TODO: Show evolution animation
        console.log(`Evolved to ${result.newStage}!`);
      } else if (result.leveledUp) {
        // TODO: Show level-up animation
        console.log(`Level up! Now level ${result.newLevel}`);
      }
    } else {
      // Uncompleting task - just toggle
      toggleTask(task.id);
    }
  };

  // If no activeTab is provided, show all tasks
  const filteredTasks = activeTab
    ? tasks.filter((task) => {
        if (activeTab === "habits") return task.type === "habit";
        if (activeTab === "todos") return task.type === "todo";
        return false;
      })
    : tasks;

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-lg">{t("today.noTasks")}</p>
        <p className="text-sm">{t("today.addTaskHint")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredTasks.map((task, index) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`bg-white rounded-lg p-4 border-2 ${
            task.completed ? "border-green-300 bg-green-50" : "border-gray-200"
          } shadow-sm ${
            celebratingTask === task.id ? "scale-105 border-yellow-400" : ""
          }`}
        >
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleToggle(task)}
              className="w-6 h-6 mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <div className="flex-1">
              <h4
                className={`font-semibold ${
                  task.completed ? "line-through text-gray-500" : "text-gray-800"
                }`}
              >
                {task.title}
              </h4>
              {task.description && (
                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
              )}
              <div className="flex gap-2 mt-2">
                <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                  {t(`tasks.types.${task.type}`)}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                  {t(`tasks.difficulty.${task.difficulty}`)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
