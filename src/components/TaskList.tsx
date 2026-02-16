"use client";

import { useTaskStore } from "@/store/useTaskStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useProjectStore } from "@/store/useProjectStore";
import type { TabType, Task } from "@/types";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { FiCalendar, FiClock, FiRepeat, FiTarget } from "react-icons/fi";
import QuestDetailSheet from "@/components/QuestDetailSheet";

interface TaskListProps {
  activeTab?: TabType;
}

export default function TaskList({ activeTab }: TaskListProps) {
  const t = useTranslations();
  const tasks = useTaskStore((state) => state.tasks);
  const projects = useProjectStore((state) => state.projects);
  const toggleTask = useTaskStore((state) => state.toggleTask);
  const completeTask = usePlayerStore((state) => state.completeTask);
  const [celebratingTask, setCelebratingTask] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);

  // Get D-day for todos
  const getDaysRemaining = (endDate?: Date) => {
    if (!endDate) return null;
    const today = new Date();
    const end = new Date(endDate);
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Format period for habits
  const formatPeriod = (startDate?: Date, endDate?: Date) => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
    const end = new Date(endDate).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
    return `${start} - ${end}`;
  };

  // Get frequency text (weekday labels)
  const getFrequencyText = (task: Task) => {
    if (!task.frequency || task.frequency.length === 0) return null;
    const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];
    return task.frequency.map(d => dayLabels[d]).join(", ");
  };

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

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailSheetOpen(true);
  };

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted">
        <p className="text-lg">{t("today.noTasks")}</p>
        <p className="text-sm">{t("today.addTaskHint")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {filteredTasks.map((task, index) => {
        const project = task.projectId ? projects.find((p) => p.id === task.projectId) : null;
        const daysRemaining = task.type === "todo" ? getDaysRemaining(task.dueDate) : null;
        const frequency = task.type === "habit" ? getFrequencyText(task) : null;
        const period = task.type === "habit" ? formatPeriod(task.startDate, task.endDate) : null;

        return (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-background-surface rounded-lg p-4 border-2 ${
              task.completed ? "border-accent bg-accent/10" : "border"
            } shadow-sm ${
              celebratingTask === task.id ? "scale-105 border-accent" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggle(task)}
                onClick={(e) => e.stopPropagation()}
                className="w-6 h-6 mt-1 rounded border text-primary focus:ring-primary cursor-pointer"
              />
              <div
                className="flex-1 cursor-pointer"
                onClick={() => handleTaskClick(task)}
              >
                {/* Project Name */}
                {project && (
                  <p className="text-xs text-text-muted mb-1">
                    📂 {project.title}
                  </p>
                )}

                {/* Task Title */}
                <h4
                  className={`font-semibold ${
                    task.completed ? "line-through text-text-muted" : "text-text"
                  }`}
                >
                  {task.title}
                </h4>

                {task.description && (
                  <p className="text-sm text-text-muted mt-1">{task.description}</p>
                )}

                {/* Type & Difficulty Badges */}
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary text-text">
                    {t(`tasks.types.${task.type}`)}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary-dark">
                    {t(`tasks.difficulty.${task.difficulty}`)}
                  </span>
                </div>

                {/* Habit-specific Info */}
                {task.type === "habit" && (
                  <div className="mt-2 space-y-1">
                    {period && (
                      <div className="flex items-center gap-1 text-xs text-text-muted">
                        <FiCalendar size={12} />
                        <span>{period}</span>
                      </div>
                    )}
                    {frequency && (
                      <div className="flex items-center gap-1 text-xs text-text-muted">
                        <FiRepeat size={12} />
                        <span>{frequency}</span>
                      </div>
                    )}
                    {task.streak && task.streak > 0 && (
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-text-muted font-semibold">
                          🔥 {task.streak}일 연속
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Todo-specific Info */}
                {task.type === "todo" && task.dueDate && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-1 text-xs text-text-muted">
                      <FiCalendar size={12} />
                      <span>
                        {new Date(task.dueDate).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    {daysRemaining !== null && (
                      <div
                        className={`flex items-center gap-1 text-xs font-semibold ${
                          daysRemaining < 0
                            ? "text-red-500"
                            : daysRemaining <= 3
                            ? "text-text-muted"
                            : "text-text-muted"
                        }`}
                      >
                        <FiClock size={12} />
                        <span>
                          {daysRemaining < 0
                            ? `D+${Math.abs(daysRemaining)}`
                            : `D-${daysRemaining}`}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
      </div>

      <QuestDetailSheet
        task={selectedTask}
        isOpen={isDetailSheetOpen}
        onClose={() => {
          setIsDetailSheetOpen(false);
          setSelectedTask(null);
        }}
      />
    </>
  );
}
