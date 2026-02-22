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
    <div className="space-y-4">
      {/* Character Card - Gummy Style */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.68, -0.55, 0.265, 1.55] }}
        className="gummy-card p-6 jelly-bounce"
      >
        <div className="flex gap-6">
          {/* Left: Avatar + Stage Badge */}
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
            {/* Avatar with Glossy Effect */}
            <motion.div
              className="w-32 h-32 bg-background-surface rounded-2xl flex items-center justify-center overflow-hidden border-2 border glossy float-gentle"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Image
                src={getStageImagePath(displayStage)}
                alt={t(`character.stage.${displayStage}`)}
                width={100}
                height={100}
                className="object-contain "
              />
            </motion.div>

            {/* Stage Badge - Gummy Style */}
            <motion.div
              className="gummy-badge bg-accent/20 border border-accent/40"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <span className="text-sm font-bold text-accent ">
                {t("character.stage.label")}: {t(`character.stage.${displayStage}`)}
              </span>
            </motion.div>
          </div>

          {/* Right: Stats */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Level Title */}
            <div className="text-center">
              <motion.h2
                className="text-3xl font-black text-text tracking-wider "
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {t("character.level").toUpperCase()} {displayLevel}
              </motion.h2>
            </div>

            {/* Coins - Gummy Badge */}
            <div className="flex items-center gap-2 justify-end">
              <motion.div
                className="flex items-center gap-2 px-4 py-2 bg-secondary/30 rounded-full border border-secondary-dark/30"
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <GiCrownCoin className="text-accent text-xl" />
                <span className="font-black text-text text-lg">{displayCoins}</span>
              </motion.div>
            </div>

            {/* Health Bar - Gummy Style */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-text">
                  {t("stats.health")}
                </span>
                <span className="text-xs text-text-muted font-semibold">
                  50 / 50
                </span>
              </div>
              <div className="gummy-progress-track">
                <motion.div
                  className="gummy-progress-bar text-red-500"
                  style={{ width: `${healthPercent}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${healthPercent}%` }}
                  transition={{
                    duration: 0.8,
                    ease: [0.68, -0.55, 0.265, 1.55]
                  }}
                />
              </div>
            </div>

            {/* Experience Bar - Gummy Style */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-text">
                  {t("character.exp")}
                </span>
                <span className="text-xs text-text-muted font-semibold">
                  {displayExperience} / {displayMaxExperience}
                </span>
              </div>
              <div className="gummy-progress-track">
                <motion.div
                  className="gummy-progress-bar text-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${expPercent}%` }}
                  transition={{
                    duration: 0.8,
                    ease: [0.68, -0.55, 0.265, 1.55]
                  }}
                />
              </div>
            </div>
          </div>
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
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-bold text-primary-dark flex items-center gap-1">
              ⭐ {stats.totalExp}
            </span>
            <span className="text-text-muted">·</span>
            <span className="text-lg font-bold text-accent flex items-center gap-1">
              <GiCrownCoin className="text-accent" />
              {stats.totalCoins}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
