"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { FiCalendar, FiClock, FiRepeat } from "react-icons/fi";
import {
  getDaysRemaining,
  formatPeriod,
  getFrequencyText,
  getProgress,
  getProgressLabel,
} from "@/lib/taskProgress";
import type { Task } from "@/types";

interface QuestTaskCardProps {
  task: Task;
  index?: number;
  celebrating?: boolean;
  onClick?: (task: Task) => void;
}

export default function QuestTaskCard({
  task,
  index = 0,
  celebrating = false,
  onClick,
}: QuestTaskCardProps) {
  const t = useTranslations();

  const daysRemaining = task.type === "todo" ? getDaysRemaining(task.dueDate) : null;
  const frequency = task.type === "habit" ? getFrequencyText(task) : null;
  const period = task.type === "habit" ? formatPeriod(task.startDate, task.endDate) : null;
  const progress = getProgress(task);
  const progressLabel = getProgressLabel(task);

  return (
    <motion.div
      key={task.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`relative overflow-hidden bg-background-surface rounded-lg p-4 border-2 ${
        task.completed ? "border-accent" : "border"
      } cursor-pointer ${celebrating ? "scale-105 border-accent" : ""}`}
      onClick={() => onClick?.(task)}
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
        {/* Row 1: 유형 뱃지 + 퀘스트명 */}
        <div className="flex items-center gap-2">
          <span
            className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium text-white ${
              task.type === "habit" ? "bg-primary" : "bg-accent"
            }`}
          >
            {t(`tasks.types.${task.type}`)}
          </span>
          <h4
            className={`font-semibold truncate ${
              task.completed ? "line-through text-text-muted" : "text-text"
            }`}
          >
            {task.title}
          </h4>
        </div>

        {/* Row 2: 기간 */}
        {(period || task.dueDate) && (
          <div className="flex items-center gap-1 text-xs text-text-muted mt-1.5">
            <FiCalendar size={11} />
            <span>
              {task.type === "habit"
                ? period
                : new Date(task.dueDate!).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
            </span>
          </div>
        )}

        {/* Row 3: D-day(할일) or 주기(습관) + 진행률 */}
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-1 text-xs text-text-muted">
            {task.type === "todo" && daysRemaining !== null && (
              <>
                <FiClock size={11} />
                <span
                  className={`font-semibold ${
                    daysRemaining < 0 ? "text-red-500" : ""
                  }`}
                >
                  {daysRemaining < 0
                    ? `D+${Math.abs(daysRemaining)}`
                    : `D-${daysRemaining}`}
                </span>
              </>
            )}
            {task.type === "habit" && frequency && (
              <>
                <FiRepeat size={11} />
                <span>{frequency}</span>
              </>
            )}
            {task.type === "habit" && task.streak && task.streak > 0 && (
              <span className="ml-1 font-semibold">🔥 {task.streak}일 연속</span>
            )}
          </div>
          {progressLabel && (
            <span className="text-xs text-text-muted font-medium">
              {progressLabel}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
