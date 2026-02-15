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
        className="bg-background-surface rounded-2xl shadow-lg p-6 border-2 border"
      >
        <div className="flex gap-6">
          {/* Left: Avatar + Stage Badge */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center overflow-hidden border-2 border">
              <Image
                src={getStageImagePath(displayStage)}
                alt={t(`character.stage.${displayStage}`)}
                width={100}
                height={100}
                className="object-contain"
              />
            </div>
            <div className="px-4 py-1.5 bg-accent/20 rounded-full">
              <span className="text-sm font-semibold text-accent">
                {t("character.stage.label")}: {t(`character.stage.${displayStage}`)}
              </span>
            </div>
          </div>

          {/* Right: Stats */}
          <div className="flex-1 flex flex-col gap-3">
            {/* Level Title */}
            <div className="text-center">
              <h2 className="text-2xl font-black text-text tracking-wider">
                {t("character.level").toUpperCase()} {displayLevel}
              </h2>
            </div>

            {/* Coins */}
            <div className="flex items-center gap-2 justify-end">
              <GiCrownCoin className="text-accent text-xl" />
              <span className="font-bold text-text">{displayCoins}</span>
            </div>
            
            {/* Health Bar */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-semibold text-text">{t("stats.health")}</span>
                <span className="text-xs text-text-muted">50 / 50</span>
              </div>
              <div className="h-6 bg-track rounded-full overflow-hidden border border">
                <div
                  className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all"
                  style={{ width: `${healthPercent}%` }}
                />
              </div>
            </div>

            {/* Experience Bar */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-semibold text-text">{t("character.exp")}</span>
                <span className="text-xs text-text-muted">
                  {displayExperience} / {displayMaxExperience}
                </span>
              </div>
              <div className="h-6 bg-track rounded-full overflow-hidden border border">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${expPercent}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Bars */}
      <div className="space-y-3">
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
            <div className="flex items-center gap-2 text-sm font-semibold text-text">
              <span>⭐ {stats.totalExp}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <GiCrownCoin className="text-accent" />
                <span className="text-accent">{stats.totalCoins}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
