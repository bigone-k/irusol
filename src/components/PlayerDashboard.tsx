"use client";

import { useState, useEffect } from "react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useTaskStore } from "@/store/useTaskStore";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { getStageImagePath } from "@/lib/evolution";
import { GiCrownCoin } from "react-icons/gi";
import Image from "next/image";

export default function PlayerDashboard() {
  const [mounted, setMounted] = useState(false);

  // Use selectors to ensure proper reactivity and synchronization
  const level = usePlayerStore((state) => state.level);
  const experience = usePlayerStore((state) => state.experience);
  const maxExperience = usePlayerStore((state) => state.maxExperience);
  const coins = usePlayerStore((state) => state.coins);
  const stage = usePlayerStore((state) => state.stage);

  const getDailyStats = useTaskStore((state) => state.getDailyStats);
  const t = useTranslations();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use default values during SSR to prevent hydration mismatch
  const displayLevel = mounted ? level : 1;
  const displayExperience = mounted ? experience : 0;
  const displayMaxExperience = mounted ? maxExperience : 100;
  const displayCoins = mounted ? coins : 0;
  const displayStage = mounted ? stage : "egg";

  const stats = mounted ? getDailyStats() : { completedTasks: 0, totalTasks: 0, totalExp: 0, totalCoins: 0 };
  const healthPercent = 100; // Health is always full for now
  const expPercent = Math.round((displayExperience / displayMaxExperience) * 100);

  return (
    <div className="space-y-3">
      {/* Character Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-4 border-2 border-purple-200"
      >
        <div className="flex gap-4">
          {/* Left: Avatar Box */}
          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
            <Image
              src={getStageImagePath(displayStage)}
              alt={t(`character.stage.${displayStage}`)}
              width={80}
              height={80}
              className="object-contain"
            />
          </div>

          {/* Right: Stats */}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            {/* Health Bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-red-600 font-medium">❤️ {t("stats.health")}</span>
                <span className="font-semibold text-gray-700">50 / 50</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all"
                  style={{ width: `${healthPercent}%` }}
                />
              </div>
            </div>

            {/* Experience Bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-yellow-600 font-medium">⭐ {t("stats.experience")}</span>
                <span className="font-semibold text-gray-700">
                  {displayExperience} / {displayMaxExperience}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-yellow-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${expPercent}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Level + Currency */}
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-gray-800">
                {t("character.level")} {displayLevel}
              </span>
              <div className="flex items-center gap-1 text-xs">
                <GiCrownCoin className="text-yellow-600 text-base" />
                <span className="font-semibold text-yellow-700">{displayCoins}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Bars */}
      <div className="space-y-3">
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
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span>⭐ {stats.totalExp}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <GiCrownCoin className="text-yellow-600" />
                <span className="text-yellow-700">{stats.totalCoins}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
