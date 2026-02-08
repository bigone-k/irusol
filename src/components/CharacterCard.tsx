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
      className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-200"
    >
      <div className="flex gap-6">
        {/* Left: Avatar + Stage Badge */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center overflow-hidden border-2 border-purple-200">
            <Image
              src={getStageImagePath(stage)}
              alt={t(`character.stage.${stage}`)}
              width={100}
              height={100}
              className="object-contain"
            />
          </div>
          <div className="px-4 py-1.5 bg-pink-100 rounded-full">
            <span className="text-sm font-semibold text-pink-700">
              {t("character.stage.label")}: {t(`character.stage.${stage}`)}
            </span>
          </div>
        </div>

        {/* Right: Stats */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Level Title */}
          <div className="text-center">
            <h2 className="text-2xl font-black text-gray-800 tracking-wider">
              {t("character.level").toUpperCase()} {level}
            </h2>
          </div>

          {/* Coins */}
          <div className="flex items-center gap-2 justify-end">
            <span className="text-lg">🪙</span>
            <span className="font-bold text-gray-800">{coins}</span>
          </div>

          {/* Experience Bar */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-semibold text-gray-700">{t("character.exp")}</span>
              <span className="text-xs text-gray-600">
                {experience} / {maxExperience}
              </span>
            </div>
            <div className="h-6 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${expPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Health Bar */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-semibold text-gray-700">{t("stats.health")}</span>
              <span className="text-xs text-gray-600">
                {health} / {maxHealth}
              </span>
            </div>
            <div className="h-6 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
              <div
                className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all"
                style={{ width: `${healthPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
