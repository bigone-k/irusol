"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useGoalStore } from "@/store/useGoalStore";
import { useProjectStore } from "@/store/useProjectStore";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGoalId?: string;
}

export default function ProjectForm({
  isOpen,
  onClose,
  defaultGoalId,
}: ProjectFormProps) {
  const t = useTranslations();
  const goals = useGoalStore((state) => state.goals);
  const addProject = useProjectStore((state) => state.addProject);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalId, setGoalId] = useState(defaultGoalId || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !goalId) return;

    addProject({
      goalId,
      title: title.trim(),
      description: description.trim(),
    });

    // Reset form
    setTitle("");
    setDescription("");
    setGoalId(defaultGoalId || "");
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
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-white rounded-2xl shadow-2xl z-50 p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {t("project.create")}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t("goal.title")} *
                </label>
                <select
                  value={goalId}
                  onChange={(e) => setGoalId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">{t("task.selectProject")}</option>
                  {goals.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t("task.title")} *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 매일 30분 운동하기"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t("task.description")}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="프로젝트에 대한 상세 설명"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all"
              >
                {t("project.create")}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
