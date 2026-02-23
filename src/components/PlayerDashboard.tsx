"use client";

import { useState, useEffect, useMemo } from "react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useTaskStore } from "@/store/useTaskStore";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { getStageImagePath } from "@/lib/evolution";
import { GiCrownCoin } from "react-icons/gi";
import { FiStar } from "react-icons/fi";
import Image from "next/image";

export default function PlayerDashboard() {
  const [mounted, setMounted] = useState(false);

  const level = usePlayerStore((state) => state.level);
  const experience = usePlayerStore((state) => state.experience);
  const maxExperience = usePlayerStore((state) => state.maxExperience);
  const coins = usePlayerStore((state) => state.coins);
  const stage = usePlayerStore((state) => state.stage);
  const todayEarnedXP = usePlayerStore((state) => state.todayEarnedXP);
  const todayEarnedCoins = usePlayerStore((state) => state.todayEarnedCoins);
  const hp = usePlayerStore((state) => state.hp);
  const maxHp = usePlayerStore((state) => state.maxHp);

  // tasks를 직접 구독해야 완료 상태 변경 시 re-render됨
  const tasks = useTaskStore((state) => state.tasks);
  const getDailyStats = useTaskStore((state) => state.getDailyStats);

  const t = useTranslations();

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayLevel = mounted ? level : 1;
  const displayExperience = mounted ? experience : 0;
  const displayMaxExperience = mounted ? maxExperience : 100;
  const displayCoins = mounted ? coins : 0;
  const displayStage = mounted ? stage : "egg";
  const displayHp = mounted ? hp : 50;
  const displayMaxHp = mounted ? maxHp : 50;

  // tasks 구독으로 인해 완료 시 자동 재계산됨
  const stats = useMemo(
    () =>
      mounted
        ? getDailyStats()
        : { completedTasks: 0, totalTasks: 0, totalExp: 0, totalCoins: 0 },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mounted, tasks]
  );

  const healthPercent = displayMaxHp > 0 ? Math.round((displayHp / displayMaxHp) * 100) : 0;
  const expPercent = Math.round((displayExperience / displayMaxExperience) * 100);

  return (
    <div className="space-y-4">
      {/* Character Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.68, -0.55, 0.265, 1.55] }}
        className="gummy-card p-6 jelly-bounce"
      >
        <div className="flex gap-6">
          {/* Left: Avatar + Stage Badge */}
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
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
                className="object-contain"
              />
            </motion.div>

            <motion.div
              className="gummy-badge bg-accent/20 border border-accent/40"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <span className="text-sm font-bold text-accent">
                {t("character.stage.label")}: {t(`character.stage.${displayStage}`)}
              </span>
            </motion.div>
          </div>

          {/* Right: Stats */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="text-center">
              <motion.h2
                className="text-3xl font-black text-text tracking-wider"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {t("character.level").toUpperCase()} {displayLevel}
              </motion.h2>
            </div>

            {/* Coins Badge */}
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

            {/* Health Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-text">
                  {t("stats.health")}
                </span>
                <span className="text-xs text-text-muted font-semibold">
                  {displayHp} / {displayMaxHp}
                </span>
              </div>
              <div className="gummy-progress-track">
                <motion.div
                  className="gummy-progress-bar text-red-500"
                  style={{ width: `${healthPercent}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${healthPercent}%` }}
                  transition={{ duration: 0.8, ease: [0.68, -0.55, 0.265, 1.55] }}
                />
              </div>
            </div>

            {/* Experience Bar */}
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
                  transition={{ duration: 0.8, ease: [0.68, -0.55, 0.265, 1.55] }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Daily Statistics Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-secondary/80 backdrop-blur-sm rounded-2xl p-4 grid grid-cols-2 gap-4 border border-secondary-dark/20 jelly-bounce"
      >
        {/* 마친 퀘스트 */}
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

        {/* 오늘 받은 보상 */}
        <div className="space-y-1">
          <p className="text-xs text-text-muted font-medium">
            {t("today.todayRewards")}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-bold text-primary-dark flex items-center gap-1">
              <FiStar className="text-yellow-400 fill-yellow-400" />
              {mounted ? todayEarnedXP : 0}
            </span>
            <span className="text-text-muted">·</span>
            <span className="text-lg font-bold text-accent flex items-center gap-1">
              <GiCrownCoin className="text-accent" />
              {mounted ? todayEarnedCoins : 0}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
