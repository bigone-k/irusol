"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiSave, FiTrash2, FiAward } from "react-icons/fi";
import { useGoalStore } from "@/store/useGoalStore";
import { useProjectStore } from "@/store/useProjectStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useToastStore } from "@/store/useToastStore";
import { useRouter } from "@/i18n/routing";
import { GOAL_REWARD } from "@/lib/rewards";
import type { Goal, GoalStatus } from "@/types";

interface GoalDetailSheetProps {
  goal: Goal | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function GoalDetailSheet({
  goal,
  isOpen,
  onClose,
}: GoalDetailSheetProps) {
  const t = useTranslations("goal");
  const router = useRouter();
  const updateGoal = useGoalStore((state) => state.updateGoal);
  const deleteGoal = useGoalStore((state) => state.deleteGoal);
  const updateStatus = useGoalStore((state) => state.updateStatus);
  const claimReward = useGoalStore((state) => state.claimReward);
  const getProjectsByGoal = useProjectStore((state) => state.getProjectsByGoal);
  const addCoins = usePlayerStore((state) => state.addCoins);
  const { success, error, info } = useToastStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<GoalStatus>("notStarted");
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [currentValue, setCurrentValue] = useState(0);
  const [targetValue, setTargetValue] = useState(100);
  const [unit, setUnit] = useState("%");

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setDescription(goal.description);
      setStatus(goal.status);
      setCurrentValue(goal.currentValue);
      setTargetValue(goal.targetValue);
      setUnit(goal.unit);
    }
  }, [goal]);

  if (!goal) return null;

  const projects = getProjectsByGoal(goal.id);

  const handleSave = () => {
    if (!title.trim()) {
      error(t("title") + " " + t("titlePlaceholder"));
      return;
    }
    updateGoal(goal.id, {
      title,
      description,
      status,
      currentValue,
      targetValue,
      unit,
    });
    success(t("save") + " 완료");
    onClose();
  };

  const handleDelete = () => {
    if (confirm(t("deleteConfirm"))) {
      deleteGoal(goal.id);
      success(t("title") + " 삭제됨");
      onClose();
    }
  };

  const handleStatusChange = (newStatus: GoalStatus) => {
    setStatus(newStatus);
    updateStatus(goal.id, newStatus);
  };

  const handleProjectClick = (projectId: string) => {
    onClose();
    router.push(`/projects?goal=${goal.id}`);
  };

  const handleClaimReward = () => {
    if (!goal) {
      error("목표를 찾을 수 없습니다");
      return;
    }

    if (goal.rewardClaimed) {
      info("이미 보상을 받았습니다");
      return;
    }

    if (goal.status !== "completed") {
      error("목표를 완료해야 보상을 받을 수 있습니다");
      return;
    }

    const claimSuccess = claimReward(goal.id);
    if (claimSuccess) {
      addCoins(GOAL_REWARD);
      success(`+${GOAL_REWARD} 코인 획득!`);
      setShowRewardAnimation(true);
      setTimeout(() => setShowRewardAnimation(false), 2000);
    } else {
      error("보상 수령에 실패했습니다");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
            aria-hidden="true"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-background-surface rounded-t-3xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="goal-detail-title"
          >
            {/* Header */}
            <div className="sticky top-0 bg-background-surface border-b border px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <h2
                id="goal-detail-title"
                className="text-xl font-bold text-text"
              >
                {t("detailTitle")}
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full hover:bg-primary/5 flex items-center justify-center transition-colors"
                aria-label="Close dialog"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  제목
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text"
                  placeholder={t("titlePlaceholder")}
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  {t("status.label")}
                </label>
                <div className="flex gap-2">
                  {(["notStarted", "inProgress", "completed"] as GoalStatus[]).map((s) => {
                    const getStatusStyle = (status: GoalStatus) => {
                      if (status === "notStarted") return "bg-track text-text border shadow-sm";
                      if (status === "inProgress") return "bg-primary text-white border-primary-dark shadow-md";
                      if (status === "completed") return "bg-accent text-white border-accent shadow-md";
                      return "";
                    };

                    return (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(s)}
                        className={`flex-1 px-3 py-1.5 rounded-lg border font-bold text-xs transition-all ${
                          status === s
                            ? getStatusStyle(s)
                            : "bg-background-surface text-text-muted border hover:bg-gray-50"
                        }`}
                      >
                        {t(`status.${s}`)}
                      </button>
                    );
                  })}
                </div>
                {/* Reward Section */}
                {status === "completed" && (
                  <div className="mt-2">
                    {goal.rewardClaimed ? (
                      <div className="px-3 py-2 bg-accent/10 border border-accent rounded-lg">
                        <p className="text-sm text-accent font-medium">
                          {t("reward.claimed")} ({goal.rewardAmount} 코인)
                        </p>
                      </div>
                    ) : (
                      <motion.button
                        onClick={handleClaimReward}
                        className="w-full bg-accent text-white font-bold py-2 px-4 rounded-lg hover:brightness-110 flex items-center justify-center gap-2 transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <FiAward size={20} />
                        보상 받기 (+{GOAL_REWARD} 코인)
                      </motion.button>
                    )}
                  </div>
                )}
              </div>

              {/* Value Inputs */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  {t("achievementInfo")}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-text-muted mb-1">
                      {t("currentValue")}
                    </label>
                    <input
                      type="number"
                      value={currentValue}
                      onChange={(e) => setCurrentValue(Number(e.target.value))}
                      className="w-full px-3 py-2 border border rounded-lg focus:ring-2 focus:ring-primary text-text"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1">
                      {t("targetValue")}
                    </label>
                    <input
                      type="number"
                      value={targetValue}
                      onChange={(e) => setTargetValue(Number(e.target.value))}
                      className="w-full px-3 py-2 border border rounded-lg focus:ring-2 focus:ring-primary text-text"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1">
                      {t("unit")}
                    </label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-3 py-2 border border rounded-lg focus:ring-2 focus:ring-primary text-text"
                      placeholder="kg"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  {t("description")}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-text"
                  placeholder={t("descriptionPlaceholder")}
                />
              </div>

              {/* Connected Projects */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  {t("connectedProjects")}
                </label>
                {projects.length === 0 ? (
                  <p className="text-sm text-text-muted">{t("noProjects")}</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {projects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => handleProjectClick(project.id)}
                        className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary-dark rounded-full font-medium text-sm transition-all"
                      >
                        #{project.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Value History */}
              {goal.valueHistory && goal.valueHistory.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">
                    {t("valueHistory")}
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {goal.valueHistory.slice(0, 10).map((change) => (
                      <div
                        key={change.id}
                        className="px-3 py-2 bg-gray-50 rounded-lg flex items-center justify-between"
                      >
                        <span className="text-sm text-text-muted">
                          {new Date(change.timestamp).toLocaleDateString()}
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            change.change > 0
                              ? "text-accent"
                              : "text-red-600"
                          }`}
                        >
                          {change.change > 0 ? "+" : ""}
                          {change.change} {unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-background-surface border-t border px-6 py-4 flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
              >
                <FiSave size={20} />
                {t("save")}
              </button>
              <button
                onClick={handleDelete}
                className="px-6 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
              >
                <FiTrash2 size={20} />
              </button>
            </div>
          </motion.div>

          {/* Reward Animation */}
          {showRewardAnimation && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
            >
              <div className="bg-accent text-white px-8 py-4 rounded-2xl shadow-2xl text-center">
                <FiAward size={40} className="mx-auto mb-2" />
                <p className="text-2xl font-bold">+{GOAL_REWARD} 코인</p>
                <p className="text-sm">보상을 받았습니다!</p>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
