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
      className={`gummy-card p-5 cursor-pointer jelly-bounce ${
        goal.completed
          ? "border-accent bg-accent/15 "
          : ""
      }`}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="font-black text-lg text-text ">
          {goal.title}
        </h3>
        {goal.description && (
          <p className="text-sm text-text-muted mt-1.5">
            {goal.description}
          </p>
        )}
      </div>

      {/* Status Badge - Gummy Style */}
      <div className="mb-4">
        <StatusBadge status={goal.status} translationKey="goal" />
      </div>

      {/* Value Tracker with Gummy Progress */}
      <div className="mb-4 relative rounded-xl overflow-hidden border-2 border-primary/20">
        {/* Background Overlay */}
        <motion.div
          className={`absolute inset-0 ${getProgressColor(valueProgress)}`}
          initial={{ width: 0 }}
          animate={{ width: `${valueProgress}%` }}
          transition={{ duration: 0.8, ease: [0.68, -0.55, 0.265, 1.55] }}
        />

        {/* Content */}
        <div className="relative z-10 p-4 backdrop-blur-xs">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <span
                className={`text-base font-black transition-colors  ${
                  valueProgress >= 80 ? "text-white" : "text-text"
                }`}
              >
                {goal.currentValue} / {goal.targetValue} {goal.unit}
              </span>
              <span
                className={`ml-2 text-xs font-bold transition-colors ${
                  valueProgress >= 80 ? "text-white/90" : "text-text-muted"
                }`}
              >
                ({valueProgress}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Decrement Button - Gummy Style */}
              <motion.button
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDecrement}
                disabled={goal.currentValue <= 0}
                className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center border-2 border-white disabled:bg-track disabled:cursor-not-allowed transition-all glossy"
              >
                <FiMinus size={18} strokeWidth={3} />
              </motion.button>
              {/* Increment Button - Gummy Style */}
              <motion.button
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleIncrement}
                disabled={goal.currentValue >= goal.targetValue}
                className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center border-2 border-white  disabled:bg-track disabled:cursor-not-allowed transition-all glossy"
              >
                <FiPlus size={18} strokeWidth={3} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Projects - Gummy Badges */}
      {projects.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {projects.slice(0, 3).map((project) => (
            <motion.span
              key={project.id}
              whileHover={{ scale: 1.05 }}
              className="text-xs font-bold text-text bg-secondary/50 px-3 py-1.5 rounded-full border border-secondary-dark/30"
            >
              #{project.title}
            </motion.span>
          ))}
          {projects.length > 3 && (
            <span className="text-xs text-text-muted font-bold">
              +{projects.length - 3}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
