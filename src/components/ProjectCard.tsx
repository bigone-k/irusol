"use client";

import { useTranslations } from "next-intl";
import { useTaskStore } from "@/store/useTaskStore";
import { useGoalStore } from "@/store/useGoalStore";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiCalendar, FiClock, FiTrendingUp } from "react-icons/fi";
import { GiTwoCoins } from "react-icons/gi";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  onToggle: () => void;
  locale: string;
}

export default function ProjectCard({ project, onToggle, locale }: ProjectCardProps) {
  const t = useTranslations("project");
  const tasks = useTaskStore((state) => state.tasks);
  const goals = useGoalStore((state) => state.goals);

  const goal = goals.find((g) => g.id === project.goalId);

  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const completedTasks = projectTasks.filter((t) => t.completed).length;
  const progress = projectTasks.length > 0
    ? Math.round((completedTasks / projectTasks.length) * 100)
    : 0;

  // D-day calculation
  const getDaysRemaining = () => {
    if (!project.endDate) return null;
    const today = new Date();
    const end = new Date(project.endDate);
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysRemaining = getDaysRemaining();

  // Get status badge properties
  const getStatusColor = () => {
    switch (project.status) {
      case "notStarted":
        return "bg-gray-200 text-gray-800 border-gray-400 shadow-sm";
      case "inProgress":
        return "bg-blue-500 text-white border-blue-600 shadow-md";
      case "completed":
        return "bg-green-500 text-white border-green-600 shadow-md";
      default:
        return "bg-gray-200 text-gray-800 border-gray-400 shadow-sm";
    }
  };

  const getStatusIcon = () => {
    switch (project.status) {
      case "notStarted":
        return "⏸️";
      case "inProgress":
        return "🔄";
      case "completed":
        return "✅";
      default:
        return "";
    }
  };

  // Format period
  const formatPeriod = () => {
    if (!project.startDate || !project.endDate) return null;
    const start = new Date(project.startDate).toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US", {
      month: "short",
      day: "numeric",
    });
    const end = new Date(project.endDate).toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US", {
      month: "short",
      day: "numeric",
    });
    return `${start} - ${end}`;
  };

  return (
    <Link href={`/${locale}/projects/${project.id}`}>
      <motion.div
        className={`bg-white rounded-2xl p-5 shadow-md border-2 transition-all ${
          project.completed
            ? "border-green-300 bg-green-50"
            : "border-blue-200"
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Header: Title + Checkbox */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            {/* Goal Name */}
            {goal && (
              <p className="text-xs text-gray-500 mb-1">
                📂 {goal.title}
              </p>
            )}

            <h3
              className={`font-bold text-lg mb-1 ${
                project.completed
                  ? "line-through text-gray-500"
                  : "text-gray-800"
              }`}
            >
              {project.title}
            </h3>

            {/* Period */}
            {formatPeriod() && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <FiCalendar size={12} />
                <span>{formatPeriod()}</span>
              </div>
            )}
          </div>

          <input
            type="checkbox"
            checked={project.completed}
            onChange={(e) => {
              e.preventDefault();
              onToggle();
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
          />
        </div>

        {/* Status Badge */}
        <div className="mb-3">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor()}`}
          >
            {t(`status.${project.status}`)}
          </span>
        </div>

        {/* Metadata: Coin + D-day */}
        <div className="flex items-center gap-3 mb-3">
          {/* Coin Reward */}
          {project.reward && (
            <div className="flex items-center gap-1 text-amber-600">
              <GiTwoCoins size={16} />
              <span className="text-sm font-semibold">+{project.reward}</span>
            </div>
          )}

          {/* D-day */}
          {daysRemaining !== null && (
            <div
              className={`flex items-center gap-1 text-sm font-semibold ${
                daysRemaining < 0
                  ? "text-red-500"
                  : daysRemaining <= 3
                  ? "text-orange-500"
                  : "text-gray-600"
              }`}
            >
              <FiClock size={14} />
              <span>
                {daysRemaining < 0
                  ? `D+${Math.abs(daysRemaining)}`
                  : `D-${daysRemaining}`}
              </span>
            </div>
          )}
        </div>

        {/* Progress Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-600 flex items-center gap-1">
              <FiTrendingUp size={12} />
              {t("progress")}
            </span>
            <span className="text-sm font-bold text-blue-600">
              {progress}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
