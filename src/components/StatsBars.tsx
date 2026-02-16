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
    <div className="space-y-3">
      {/* Experience Bar */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-primary-dark font-semibold">
            ⭐ {t("stats.experience")}
          </span>
          <span className="text-text-muted">
            {experience}/{maxExperience}
          </span>
        </div>
        <div className="h-3 bg-track rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${expPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Daily Statistics */}
      <div className="bg-secondary rounded-lg p-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-text-muted">{t("today.tasksCompleted")}</p>
          <p className="text-lg font-bold text-primary-dark">
            {stats.completedTasks}/{stats.totalTasks}
          </p>
        </div>
        <div>
          <p className="text-xs text-text-muted">{t("today.todayRewards")}</p>
          <p className="text-sm font-semibold text-text">
            ⭐ {stats.totalExp} · 💰 {stats.totalCoins}
          </p>
        </div>
      </div>
    </div>
  );
}
