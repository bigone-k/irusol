"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useTaskStore } from "@/store/useTaskStore";
import { EVOLUTION_STAGES, getStageImagePath } from "@/lib/evolution";
import { motion } from "framer-motion";
import { FiTrendingUp, FiAward } from "react-icons/fi";
import { GiCrownCoin } from "react-icons/gi";
import Image from "next/image";

export default function CharacterPage() {
  const [mounted, setMounted] = useState(false);
  const t = useTranslations();
  const { level, experience, maxExperience, coins, stage } = usePlayerStore();
  const tasks = useTaskStore((state) => state.tasks);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use default values during SSR to prevent hydration mismatch
  const displayLevel = mounted ? level : 1;
  const displayExperience = mounted ? experience : 0;
  const displayMaxExperience = mounted ? maxExperience : 25;
  const displayCoins = mounted ? coins : 0;
  const displayStage = mounted ? stage : "egg";
  const displayTasks = mounted ? tasks : [];

  // Calculate statistics
  const completedTasks = displayTasks.filter((task) => task.completed).length;
  const totalExp = displayTasks
    .filter((task) => task.completed)
    .reduce((sum, task) => {
      const expMap = { easy: 10, normal: 15, hard: 20 };
      return sum + expMap[task.difficulty];
    }, 0);

  const totalCoins = displayTasks
    .filter((task) => task.completed)
    .reduce((sum, task) => {
      const coinMap = { easy: 3, normal: 5, hard: 6 };
      return sum + coinMap[task.difficulty];
    }, 0);

  // Get current stage info
  const currentStageInfo = EVOLUTION_STAGES.find((s) => s.stage === displayStage);
  const currentStageIndex = EVOLUTION_STAGES.findIndex((s) => s.stage === displayStage);
  const nextStage = EVOLUTION_STAGES[currentStageIndex + 1];

  return (
    <div className="p-4 space-y-6">

        {/* Character Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex flex-col items-center">
            {/* Character Image */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative w-48 h-48 mb-4"
            >
              <Image
                src={getStageImagePath(displayStage)}
                alt={t(`character.stage.${displayStage}`)}
                fill
                className="object-contain"
                priority
              />
            </motion.div>

            {/* Character Name & Level */}
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {t("character.name")}
            </h2>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg font-semibold text-purple-600">
                {t("character.level")} {displayLevel}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-lg text-gray-600">
                {t(`character.stage.${displayStage}`)}
              </span>
            </div>

            {/* Experience Bar */}
            <div className="w-full">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{t("character.exp")}</span>
                <span className="text-purple-600 font-semibold">
                  {displayExperience} / {displayMaxExperience}
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(displayExperience / displayMaxExperience) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Coins */}
            <div className="flex items-center gap-2 mt-4 px-4 py-2 bg-yellow-50 rounded-full">
              <GiCrownCoin className="text-yellow-600 text-xl" />
              <span className="font-bold text-yellow-700">{displayCoins}</span>
              <span className="text-sm text-yellow-600">
                {t("common.coins")}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Statistics */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3">
            {t("character.statistics")}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-4 shadow-md"
            >
              <FiAward className="text-blue-500 text-2xl mb-2" />
              <p className="text-2xl font-bold text-gray-800">
                {completedTasks}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {t("character.totalTasks")}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-4 shadow-md"
            >
              <FiTrendingUp className="text-purple-500 text-2xl mb-2" />
              <p className="text-2xl font-bold text-gray-800">{totalExp}</p>
              <p className="text-xs text-gray-600 mt-1">
                {t("character.totalExp")}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-4 shadow-md"
            >
              <GiCrownCoin className="text-yellow-500 text-2xl mb-2" />
              <p className="text-2xl font-bold text-gray-800">{totalCoins}</p>
              <p className="text-xs text-gray-600 mt-1">
                {t("character.totalCoins")}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Current Stage Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-3">
            {t("character.currentStage")}
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xl font-bold text-purple-600 mb-1">
                {t(`character.stage.${displayStage}`)}
              </p>
              <p className="text-sm text-gray-600">
                {t(`character.stageDescription.${displayStage}`)}
              </p>
            </div>
            {nextStage && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  {t("character.nextEvolution")}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    {t(`character.stage.${nextStage.stage}`)}
                  </span>
                  <span className="text-sm text-purple-600 font-semibold">
                    {t("character.requiredLevel")} {nextStage.requiredLevel}
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Evolution Timeline */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3">
            {t("character.evolutionTimeline")}
          </h3>
          <div className="space-y-3">
            {EVOLUTION_STAGES.map((evolutionStage, index) => {
              const isUnlocked = displayLevel >= evolutionStage.requiredLevel;
              const isCurrent = evolutionStage.stage === displayStage;

              return (
                <motion.div
                  key={evolutionStage.stage}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className={`bg-white rounded-xl p-4 shadow-md border-2 ${
                    isCurrent
                      ? "border-purple-400"
                      : isUnlocked
                      ? "border-green-200"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Stage Image */}
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={getStageImagePath(evolutionStage.stage)}
                        alt={t(`character.stage.${evolutionStage.stage}`)}
                        fill
                        className={`object-contain transition-all ${
                          isUnlocked ? "" : "opacity-30 grayscale blur-sm"
                        }`}
                      />
                    </div>

                    {/* Stage Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          className={`font-bold ${
                            isCurrent
                              ? "text-purple-600"
                              : isUnlocked
                              ? "text-gray-800"
                              : "text-gray-400"
                          }`}
                        >
                          {t(`character.stage.${evolutionStage.stage}`)}
                        </h4>
                        {isCurrent && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs font-semibold rounded-full">
                            {t("character.currentStage")}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {t(`character.stageDescription.${evolutionStage.stage}`)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t("character.requiredLevel")}{" "}
                        {evolutionStage.requiredLevel}
                      </p>
                    </div>

                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                      {isUnlocked ? (
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <FiAward className="text-green-600" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-gray-300 rounded-full" />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
    </div>
  );
}
