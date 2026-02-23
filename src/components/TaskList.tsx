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
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

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

  // Calculate task progress (0-100)
  const getProgress = (task: Task): number => {
    if (task.type === "todo") {
      return task.completed ? 100 : 0;
    }
    // Habit
    if (task.targetDays) {
      return Math.min(100, ((task.completionCount || 0) / task.targetDays) * 100);
    }
    if (task.frequencyTarget && task.completedDates && task.frequencyPeriod) {
      const today = new Date();
      let periodStart: Date;
      let periodEnd: Date;
      if (task.frequencyPeriod === "weekly") {
        periodStart = startOfWeek(today, { weekStartsOn: 1 });
        periodEnd = endOfWeek(today, { weekStartsOn: 1 });
      } else if (task.frequencyPeriod === "monthly") {
        periodStart = startOfMonth(today);
        periodEnd = endOfMonth(today);
      } else {
        // daily
        const todayStr = format(today, "yyyy-MM-dd");
        return task.completedDates.includes(todayStr) ? 100 : 0;
      }
      const periodStartStr = format(periodStart, "yyyy-MM-dd");
      const periodEndStr = format(periodEnd, "yyyy-MM-dd");
      const periodCompletions = task.completedDates.filter(
        (d) => d >= periodStartStr && d <= periodEndStr
      ).length;
      return Math.min(100, (periodCompletions / task.frequencyTarget) * 100);
    }
    // Fallback: today completed?
    const todayStr = format(new Date(), "yyyy-MM-dd");
    return task.completedDates?.includes(todayStr) ? 100 : 0;
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

        const progress = getProgress(task);

        return (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`relative overflow-hidden bg-background-surface rounded-lg p-4 border-2 ${
              task.completed ? "border-accent" : "border"
            } cursor-pointer ${
              celebratingTask === task.id ? "scale-105 border-accent" : ""
            }`}
            onClick={() => handleTaskClick(task)}
          >
            {/* Background fill progress */}
            <motion.div
              className={`absolute inset-y-0 left-0 rounded-lg pointer-events-none
                ${task.type === "habit"
                  ? progress >= 100 ? "bg-primary/25" : "bg-primary/15"
                  : progress >= 100 ? "bg-accent/25" : "bg-accent/15"
                }`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: [0.68, -0.55, 0.265, 1.55] }}
            />
              <div className="relative z-10 w-full">
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

                {/* Type Badge */}
                <div className="flex flex-wrap gap-2 mt-2">
                  <span
                    className={`
                      text-xs px-2 py-1 rounded-full font-medium text-white
                      ${task.type === 'habit' ? 'bg-primary' : 'bg-accent'}
                    `}
                  >
                    {t(`tasks.types.${task.type}`)}
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

                {/* Progress Text */}
                <div className="flex justify-end mt-1">
                  {task.type === "habit" && task.targetDays ? (
                    <span className="text-xs text-text-muted font-medium">
                      {task.completionCount || 0}/{task.targetDays}
                    </span>
                  ) : task.type === "todo" && task.completed ? (
                    <span className="text-xs font-medium text-accent">완료</span>
                  ) : null}
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
