"use client";

import { useState, useEffect, useMemo } from "react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useTaskStore } from "@/store/useTaskStore";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { getStageImagePath } from "@/lib/evolution";
import { GiCrownCoin } from "react-icons/gi";
import { FiShield, FiAward, FiCheckCircle } from "react-icons/fi";
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

  const tasks = useTaskStore((state) => state.tasks);
  const getDailyStats = useTaskStore((state) => state.getDailyStats);

  const t = useTranslations();
  const tc = useTranslations("character");

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

  const hpBarColor =
    healthPercent > 50
      ? "from-red-500 to-red-400"
      : healthPercent > 25
      ? "from-orange-500 to-yellow-400"
      : "from-red-700 to-red-500";

  return (
    <div className="space-y-3">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-background-surface border border-border"
        style={{ boxShadow: "0 2px 16px rgba(79,212,168,0.1)" }}
      >
        {/* 상단 포인트 라인 */}
        <div className="h-1 w-full bg-gradient-to-r from-primary via-primary-dark to-primary" />

        {/* ── Header: 레벨 + 코인 ── */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          {/* 레벨 배지 */}
          <div className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 bg-primary/10 border border-primary/30">
            <span className="text-[10px] font-bold tracking-[0.2em] text-primary-dark">LV</span>
            <motion.span
              className="text-2xl font-black text-text leading-none"
              key={displayLevel}
              initial={{ scale: 1.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {displayLevel}
            </motion.span>
          </div>

          {/* 코인 */}
          <motion.div
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-secondary border border-secondary"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <GiCrownCoin className="text-accent text-base" />
            <span className="text-text font-bold text-sm">{displayCoins.toLocaleString()}</span>
          </motion.div>
        </div>

        {/* ── 캐릭터 초상화 (중앙) ── */}
        <div className="flex flex-col items-center px-5 pb-4">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 260 }}
          >
            <div
              className="relative w-40 h-40 rounded-2xl overflow-hidden bg-background border-2 border-primary/30"
              style={{ boxShadow: "0 4px 20px rgba(125,230,195,0.2)" }}
            >
              <Image
                src={getStageImagePath(displayStage)}
                alt={t(`character.stage.${displayStage}`)}
                width={160}
                height={160}
                className="object-contain w-full h-full"
                priority
              />
              {/* 코너 장식 */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary/50 rounded-tl" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary/50 rounded-tr" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary/50 rounded-bl" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary/50 rounded-br" />
            </div>
          </motion.div>

          {/* 스테이지 뱃지 */}
          <div className="mt-2.5 px-4 py-1 rounded-full text-xs font-bold tracking-widest bg-accent/10 border border-accent/30 text-accent">
            {t(`character.stage.${displayStage}`)}
          </div>
        </div>

        {/* ── 스탯 바 ── */}
        <div className="px-5 pb-4 space-y-3">
          {/* HP */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-1.5">
                <FiShield className="text-red-400 text-xs" />
                <span className="text-xs font-bold tracking-widest text-text-muted">{tc("hpLabel")}</span>
              </div>
              <span className="text-[11px] font-semibold text-text-muted">
                {displayHp} / {displayMaxHp}
              </span>
            </div>
            <div className="h-3 rounded-full overflow-hidden bg-track">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${hpBarColor}`}
                initial={{ width: 0 }}
                animate={{ width: `${healthPercent}%` }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* EXP */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs leading-none">⚡</span>
                <span className="text-xs font-bold tracking-widest text-text-muted">{tc("expLabel")}</span>
              </div>
              <span className="text-[11px] font-semibold text-text-muted">
                {displayExperience} / {displayMaxExperience}
              </span>
            </div>
            <div className="h-3 rounded-full overflow-hidden bg-track">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary-dark"
                initial={{ width: 0 }}
                animate={{ width: `${expPercent}%` }}
                transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
              />
            </div>
            <p className="mt-1 text-[10px] text-text-muted">
              {tc("nextLevel", { amount: displayMaxExperience - displayExperience })}
            </p>
          </div>
        </div>

        {/* ── 하단 통계 풋터 ── */}
        <div className="px-5 py-3 flex items-center justify-between border-t border-border bg-background">
          <div className="flex items-center gap-2">
            <FiCheckCircle className="text-primary/60 text-base" />
            <div>
              <p className="text-[10px] font-medium text-text-muted">
                {t("today.tasksCompleted")}
              </p>
              <p className="text-sm font-black text-text leading-tight">
                {stats.completedTasks}
                <span className="text-xs font-semibold ml-0.5 text-text-muted">
                  /{stats.totalTasks}
                </span>
              </p>
            </div>
          </div>

          <div className="w-px h-8 bg-border" />

          <div className="flex items-center gap-2">
            <FiAward className="text-accent text-base" />
            <div>
              <p className="text-[10px] font-medium text-text-muted">
                {t("today.todayRewards")}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-primary-dark">
                  +{mounted ? todayEarnedXP : 0} ⚡
                </span>
                <span className="text-sm font-bold text-accent flex items-center gap-0.5">
                  +{mounted ? todayEarnedCoins : 0}
                  <GiCrownCoin className="text-xs" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
