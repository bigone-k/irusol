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
          <span className="text-blue-600 font-semibold">
            ⭐ {t("stats.experience")}
          </span>
          <span className="text-gray-600">
            {experience}/{maxExperience}
          </span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
            initial={{ width: 0 }}
            animate={{ width: `${expPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Daily Statistics */}
      <div className="bg-purple-50 rounded-lg p-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-gray-600">{t("today.tasksCompleted")}</p>
          <p className="text-lg font-bold text-purple-600">
            {stats.completedTasks}/{stats.totalTasks}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600">{t("today.todayRewards")}</p>
          <p className="text-sm font-semibold text-gray-700">
            ⭐ {stats.totalExp} · 💰 {stats.totalCoins}
          </p>
        </div>
      </div>
    </div>
  );
}
