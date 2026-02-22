"use client";

import { useTranslations } from "next-intl";
import { useTaskStore } from "@/store/useTaskStore";
import { useGoalStore } from "@/store/useGoalStore";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiCalendar, FiClock, FiTrendingUp } from "react-icons/fi";
import { GiTwoCoins } from "react-icons/gi";
import StatusBadge from "@/components/StatusBadge";
import ProgressBar from "@/components/ProgressBar";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  locale: string;
}

export default function ProjectCard({ project, locale }: ProjectCardProps) {
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
        className={`gummy-card p-5 jelly-bounce ${
          project.completed
            ? "border-accent bg-accent/20 "
            : ""
        }`}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header: Title */}
        <div className="mb-3">
          {/* Goal Name */}
          {goal && (
            <p className="text-xs text-text-muted mb-1">
              📂 {goal.title}
            </p>
          )}

          <h3
            className={`font-black text-lg mb-1  ${
              project.completed
                ? "line-through text-text-muted"
                : "text-text"
            }`}
          >
            {project.title}
          </h3>

          {/* Period */}
          {formatPeriod() && (
            <div className="flex items-center gap-1 text-xs text-text-muted">
              <FiCalendar size={12} />
              <span>{formatPeriod()}</span>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="mb-3">
          <StatusBadge status={project.status} translationKey="project" />
        </div>

        {/* Metadata: Coin + D-day */}
        <div className="flex items-center gap-3 mb-3">
          {/* Coin Reward */}
          {project.reward && (
            <motion.div
              className="flex items-center gap-1 px-3 py-1.5 bg-secondary/60 rounded-full  border border-secondary-dark/30"
              whileHover={{ scale: 1.05 }}
            >
              <GiTwoCoins size={16} className="text-accent" />
              <span className="text-sm font-bold text-text">+{project.reward}</span>
            </motion.div>
          )}

          {/* D-day */}
          {daysRemaining !== null && (
            <div
              className={`flex items-center gap-1 text-sm font-semibold ${
                daysRemaining < 0
                  ? "text-red-500"
                  : daysRemaining <= 3
                  ? "text-text-muted"
                  : "text-text-muted"
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
            <span className="text-xs text-text-muted flex items-center gap-1">
              <FiTrendingUp size={12} />
              {t("progress")}
            </span>
            <span className="text-sm font-bold text-primary-dark">
              {progress}%
            </span>
          </div>

          {/* Progress Bar */}
          <ProgressBar
            progress={progress}
            color="bg-primary"
            height="h-2"
          />
        </div>
      </motion.div>
    </Link>
  );
}
