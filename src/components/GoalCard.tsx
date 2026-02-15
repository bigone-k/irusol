"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useProjectStore } from "@/store/useProjectStore";
import { useGoalStore } from "@/store/useGoalStore";
import { useToastStore } from "@/store/useToastStore";
import { motion } from "framer-motion";
import { FiPlus, FiMinus } from "react-icons/fi";
import StatusBadge from "@/components/StatusBadge";
import type { Goal } from "@/types";

interface GoalCardProps {
  goal: Goal;
  onToggle: () => void;
  onClick?: () => void;
}

export default function GoalCard({ goal, onToggle, onClick }: GoalCardProps) {
  const t = useTranslations("goal");
  const getProjectsByGoal = useProjectStore((state) => state.getProjectsByGoal);
  const incrementValue = useGoalStore((state) => state.incrementValue);
  const decrementValue = useGoalStore((state) => state.decrementValue);
  const { info, warning } = useToastStore();

  const projects = getProjectsByGoal(goal.id);
  const completedProjects = projects.filter((p) => p.completed).length;
  const projectProgress = projects.length > 0
    ? Math.round((completedProjects / projects.length) * 100)
    : 0;

  const valueProgress = goal.targetValue > 0
    ? Math.round((goal.currentValue / goal.targetValue) * 100)
    : 0;

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (goal.currentValue >= goal.targetValue) {
      warning(`${t("title")} 목표값에 도달했습니다!`);
      return;
    }
    incrementValue(goal.id, 1);
    info(`+1 ${goal.unit}`);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (goal.currentValue <= 0) {
      warning(`${t("title")} 최소값입니다!`);
      return;
    }
    decrementValue(goal.id, 1);
    info(`-1 ${goal.unit}`);
  };

  const getProgressColor = (progress: number) => {
    if (progress <= 30) return "bg-red-400";
    if (progress <= 70) return "bg-secondary";
    return "bg-accent";
  };

  return (
    <motion.div
      className={`bg-background-surface rounded-2xl p-5 shadow-md border-2 transition-all cursor-pointer ${
        goal.completed
          ? "border-accent bg-accent/10"
          : "border"
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {/* Header */}
      <div className="mb-3">
        <h3 className="font-bold text-lg text-text">
          {goal.title}
        </h3>
        {goal.description && (
          <p className="text-sm text-text-muted mt-1">
            {goal.description}
          </p>
        )}
      </div>

      {/* Status Badge */}
      <div className="mb-3">
        <StatusBadge status={goal.status} translationKey="goal" />
      </div>

      {/* Value Tracker with Overlay Progress */}
      <div className="mb-3 relative rounded-lg overflow-hidden border border">
        {/* Background Overlay */}
        <motion.div
          className={`absolute inset-0 ${getProgressColor(valueProgress)}`}
          initial={{ width: 0 }}
          animate={{ width: `${valueProgress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        {/* Content */}
        <div className="relative z-10 p-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <span
                className={`text-sm font-bold transition-colors ${
                  valueProgress >= 80 ? "text-white" : "text-text"
                }`}
              >
                {goal.currentValue} / {goal.targetValue} {goal.unit}
              </span>
              <span
                className={`ml-2 text-xs font-semibold transition-colors ${
                  valueProgress >= 80 ? "text-white/80" : "text-text-muted"
                }`}
              >
                ({valueProgress}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDecrement}
                disabled={goal.currentValue <= 0}
                className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center border-2 border-background-surface shadow-lg hover:bg-red-600 disabled:bg-track disabled:cursor-not-allowed transition-colors"
              >
                <FiMinus size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleIncrement}
                disabled={goal.currentValue >= goal.targetValue}
                className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center border-2 border-background-surface shadow-lg hover:bg-accent/80 disabled:bg-track disabled:cursor-not-allowed transition-colors"
              >
                <FiPlus size={16} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Projects */}
      {projects.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {projects.slice(0, 3).map((project) => (
            <span
              key={project.id}
              className="text-xs font-medium text-text bg-secondary px-2 py-1 rounded"
            >
              #{project.title}
            </span>
          ))}
          {projects.length > 3 && (
            <span className="text-xs text-text-muted font-medium">
              +{projects.length - 3}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
