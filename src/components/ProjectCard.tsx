"use client";

import { useTranslations } from "next-intl";
import { useTaskStore } from "@/store/useTaskStore";
import { useGoalStore } from "@/store/useGoalStore";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiTarget } from "react-icons/fi";
import { GiTwoCoins } from "react-icons/gi";
import StatusBadge from "@/components/StatusBadge";
import { getProgress } from "@/lib/taskProgress";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  locale: string;
  showGoal?: boolean;
}

export default function ProjectCard({ project, locale, showGoal = false }: ProjectCardProps) {
  const t = useTranslations("project");
  const tasks = useTaskStore((state) => state.tasks);
  const goals = useGoalStore((state) => state.goals);

  const goal = goals.find((g) => g.id === project.goalId);
  const projectTasks = tasks.filter((task) => task.projectId === project.id);

  // 각 퀘스트의 getProgress 평균으로 프로젝트 진행률 계산
  const progress = projectTasks.length > 0
    ? Math.floor(
        projectTasks.reduce((sum, task) => sum + getProgress(task), 0) / projectTasks.length
      )
    : 0;

  // 완료된 퀘스트 수 (getProgress >= 100)
  const completedCount = projectTasks.filter((task) => getProgress(task) >= 100).length;

  return (
    <Link href={`/${locale}/projects/${project.id}`}>
      <motion.div
        className={`relative overflow-hidden bg-background-surface rounded-lg p-4 border-2 ${
          progress >= 100 ? "border-primary" : "border"
        }`}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* 배경 채우기 프로그레스 */}
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-lg pointer-events-none ${
            progress >= 100 ? "bg-primary/25" : "bg-primary/15"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: [0.68, -0.55, 0.265, 1.55] }}
        />

        <div className="relative z-10">
          {/* 목표명 */}
          {showGoal && goal && (
            <p className="text-xs text-text-muted mb-1 flex items-center gap-1">
              <FiTarget size={11} />
              {goal.title}
            </p>
          )}

          {/* Row 1: 프로젝트명 + 진행률 % */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3
              className={`font-bold text-base leading-snug ${
                progress >= 100 ? "text-text-muted line-through" : "text-text"
              }`}
            >
              {project.title}
            </h3>
            <span className="text-sm font-bold text-primary-dark flex-shrink-0">
              {progress}%
            </span>
          </div>

          {/* Row 2: 상태 + 코인 | 퀘스트 완료 수 */}
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2">
              <StatusBadge status={project.status} translationKey="project" />

              {project.reward && (
                <span className="flex items-center gap-0.5 text-xs font-bold text-text">
                  <GiTwoCoins size={13} className="text-accent" />
                  +{project.reward}
                </span>
              )}
            </div>

            {/* 퀘스트 완료 수 */}
            {projectTasks.length > 0 && (
              <span className="text-xs font-medium text-text-muted bg-track px-2 py-0.5 rounded-full">
                {completedCount}/{projectTasks.length}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
