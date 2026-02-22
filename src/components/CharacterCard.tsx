"use client";

import { usePlayerStore } from "@/store/usePlayerStore";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { getStageImagePath } from "@/lib/evolution";
import Image from "next/image";

export default function CharacterCard() {
  const { level, experience, maxExperience, coins, stage } = usePlayerStore();
  const t = useTranslations();

  // Temporary: Health is always 100% (feature not implemented yet)
  const health = 50;
  const maxHealth = 50;
  const healthPercent = 100;
  const expPercent = Math.round((experience / maxExperience) * 100);

  return (
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
              src={getStageImagePath(stage)}
              alt={t(`character.stage.${stage}`)}
              width={100}
              height={100}
              className="object-contain"
            />
          </motion.div>

          {/* Stage Badge - Gummy Style */}
          <motion.div
            className="gummy-badge bg-accent/20 border border-accent/40"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <span className="text-sm font-bold text-accent ">
              {t("character.stage.label")}: {t(`character.stage.${stage}`)}
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
              {t("character.level").toUpperCase()} {level}
            </motion.h2>
          </div>

          {/* Coins - Gummy Badge */}
          <div className="flex items-center gap-2 justify-end">
            <motion.div
              className="flex items-center gap-2 px-4 py-2 bg-secondary/30 rounded-full border border-secondary-dark/30"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="text-xl">🪙</span>
              <span className="font-black text-text text-lg">{coins}</span>
            </motion.div>
          </div>

          {/* Experience Bar - Gummy Style */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-text">
                {t("character.exp")}
              </span>
              <span className="text-xs text-text-muted font-semibold">
                {experience} / {maxExperience}
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

          {/* Health Bar - Gummy Style */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-text">
                {t("stats.health")}
              </span>
              <span className="text-xs text-text-muted font-semibold">
                {health} / {maxHealth}
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
        </div>
      </div>
    </motion.div>
  );
}
