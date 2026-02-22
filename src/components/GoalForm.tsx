"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiSave } from "react-icons/fi";
import { useGoalStore } from "@/store/useGoalStore";
import { useToastStore } from "@/store/useToastStore";
import type { GoalStatus } from "@/types";

interface GoalFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GoalForm({ isOpen, onClose }: GoalFormProps) {
  const t = useTranslations("goal");
  const addGoal = useGoalStore((state) => state.addGoal);
  const { success, error } = useToastStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<GoalStatus>("notStarted");
  const [currentValue, setCurrentValue] = useState(0);
  const [targetValue, setTargetValue] = useState(100);
  const [unit, setUnit] = useState("%");

  const handleSave = () => {
    if (!title.trim()) {
      error(t("titlePlaceholder"));
      return;
    }

    addGoal({
      title: title.trim(),
      description: description.trim(),
      status,
      currentValue,
      targetValue,
      unit,
    });

    success(t("create") + " 완료");

    // Reset form
    setTitle("");
    setDescription("");
    setStatus("notStarted");
    setCurrentValue(0);
    setTargetValue(100);
    setUnit("%");
    onClose();
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
            className="fixed bottom-0 left-0 right-0 bg-background-surface rounded-t-3xl z-50 max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="goal-create-title"
          >
            {/* Header */}
            <div className="sticky top-0 bg-background-surface border-b border px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <h2
                id="goal-create-title"
                className="text-xl font-bold text-text"
              >
                {t("create")}
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
                  autoFocus
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
                      if (status === "notStarted") return "bg-track text-text border";
                      if (status === "inProgress") return "bg-primary text-white border-primary-dark";
                      if (status === "completed") return "bg-accent text-white border-accent";
                      return "";
                    };

                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(s)}
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
            </div>

            {/* Action Button */}
            <div className="sticky bottom-0 bg-background-surface border-t border px-6 py-4">
              <button
                onClick={handleSave}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
              >
                <FiSave size={20} />
                {t("save")}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
