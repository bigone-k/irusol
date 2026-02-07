"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useGoalStore } from "@/store/useGoalStore";
import { useProjectStore } from "@/store/useProjectStore";
import { motion } from "framer-motion";
import { FiPlus, FiChevronRight } from "react-icons/fi";
import Link from "next/link";
import GoalForm from "@/components/GoalForm";
import PlayerDashboard from "@/components/PlayerDashboard";

export default function GoalsPage() {
  const t = useTranslations();
  const goals = useGoalStore((state) => state.goals);
  const toggleGoal = useGoalStore((state) => state.toggleGoal);
  const getProjectsByGoal = useProjectStore((state) => state.getProjectsByGoal);
  const [showAddForm, setShowAddForm] = useState(false);

  const getGoalProgress = (goalId: string) => {
    const projects = getProjectsByGoal(goalId);
    if (projects.length === 0) return 0;
    const completed = projects.filter((p) => p.completed).length;
    return Math.round((completed / projects.length) * 100);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Player Dashboard */}
      <PlayerDashboard />

      {/* Add Goal Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddForm(true)}
          className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-purple-700 transition-colors"
        >
          <FiPlus size={20} />
        </button>
      </div>

        {/* Goals List */}
        <div className="space-y-3">
          {goals.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg">{t("goal.title")} 없음</p>
              <p className="text-sm">+ 버튼을 눌러 새로운 목표를 추가하세요</p>
            </div>
          ) : (
            goals.map((goal, index) => {
              const progress = getGoalProgress(goal.id);
              const projects = getProjectsByGoal(goal.id);

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white rounded-xl p-4 shadow-md border-2 ${
                    goal.completed
                      ? "border-green-300 bg-green-50"
                      : "border-purple-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={goal.completed}
                      onChange={() => toggleGoal(goal.id)}
                      className="w-5 h-5 mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <h3
                        className={`font-bold text-lg ${
                          goal.completed
                            ? "line-through text-gray-500"
                            : "text-gray-800"
                        }`}
                      >
                        {goal.title}
                      </h3>
                      {goal.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {goal.description}
                        </p>
                      )}

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">
                            {t("goal.progress")}
                          </span>
                          <span className="text-purple-600 font-semibold">
                            {progress}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {projects.filter((p) => p.completed).length} /{" "}
                          {projects.length} {t("project.title")}
                        </p>
                      </div>

                      {/* View Projects Link */}
                      {projects.length > 0 && (
                        <Link
                          href={`/projects?goal=${goal.id}`}
                          className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 mt-2"
                        >
                          {t("project.title")} 보기
                          <FiChevronRight size={16} />
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

      {/* Add Goal Form */}
      <GoalForm isOpen={showAddForm} onClose={() => setShowAddForm(false)} />
    </div>
  );
}
