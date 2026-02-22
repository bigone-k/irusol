"use client";

import { usePlayerStore } from "@/store/usePlayerStore";
import { useTaskStore } from "@/store/useTaskStore";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function StatsBars() {
  const { experience, maxExperience } = usePlayerStore();
  const getDailyStats = useTaskStore((state) => state.getDailyStats);
  const t = useTranslations();

  const stats = getDailyStats();
  const expPercent = (experience / maxExperience) * 100;

  return (
    <div className="space-y-4">
      {/* Experience Bar - Gummy Style */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-primary-dark flex items-center gap-1">
            ⭐ {t("stats.experience")}
          </span>
          <span className="text-xs text-text-muted font-medium">
            {experience}/{maxExperience}
          </span>
        </div>
        <div className="gummy-progress-track">
          <motion.div
            className="gummy-progress-bar text-primary"
            initial={{ width: 0 }}
            animate={{ width: `${expPercent}%` }}
            transition={{
              duration: 0.8,
              ease: [0.68, -0.55, 0.265, 1.55] // Bounce easing
            }}
          />
        </div>
      </motion.div>

      {/* Daily Statistics - Gummy Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-secondary/80 backdrop-blur-sm rounded-2xl p-4 grid grid-cols-2 gap-4 border border-secondary-dark/20 jelly-bounce"
      >
        <div className="space-y-1">
          <p className="text-xs text-text-muted font-medium">
            {t("today.tasksCompleted")}
          </p>
          <p className="text-2xl font-black text-primary-dark">
            {stats.completedTasks}
            <span className="text-sm text-text-muted font-semibold">
              /{stats.totalTasks}
            </span>
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-text-muted font-medium">
            {t("today.todayRewards")}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary-dark flex items-center gap-1">
              ⭐ {stats.totalExp}
            </span>
            <span className="text-text-muted">·</span>
            <span className="text-lg font-bold text-accent flex items-center gap-1">
              💰 {stats.totalCoins}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
