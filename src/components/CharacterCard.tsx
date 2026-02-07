"use client";

import { usePlayerStore } from "@/store/usePlayerStore";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { getStageImagePath } from "@/lib/evolution";
import Image from "next/image";

export default function CharacterCard() {
  const { level, experience, maxExperience, coins, stage } = usePlayerStore();
  const t = useTranslations();

  const healthPercent = 100; // Health is always full for now
  const expPercent = Math.round((experience / maxExperience) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-4 border-2 border-purple-200"
    >
      <div className="flex gap-4">
        {/* Left: Avatar Box */}
        <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
          <Image
            src={getStageImagePath(stage)}
            alt={t(`character.stage.${stage}`)}
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
              <span className="text-red-600 font-medium">❤️ Health</span>
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
              <span className="text-yellow-600 font-medium">⭐ Experience</span>
              <span className="font-semibold text-gray-700">
                {experience} / {maxExperience}
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
              {t("character.level")} {level}
            </span>
            <div className="flex gap-3 text-xs">
              <span className="font-semibold">💎 0</span>
              <span className="font-semibold">🪙 {coins}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
