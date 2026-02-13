"use client";

import { useState, useEffect } from "react";
import { useTaskStore } from "@/store/useTaskStore";
import { useGoalStore } from "@/store/useGoalStore";
import { useProjectStore } from "@/store/useProjectStore";
import { FaPlus, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import type { Difficulty } from "@/types";

type AddTaskButtonProps = {
  hideButton?: boolean;
  externalIsOpen?: boolean;
  onExternalClose?: () => void;
};

export default function AddTaskButton({
  hideButton = false,
  externalIsOpen,
  onExternalClose,
}: AddTaskButtonProps = {}) {
  const t = useTranslations();
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Use external control if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = onExternalClose !== undefined ? (value: boolean) => {
    if (!value) onExternalClose();
  } : setInternalIsOpen;

  // Auto-open when externalIsOpen becomes true
  useEffect(() => {
    if (externalIsOpen) {
      setInternalIsOpen(true);
    }
  }, [externalIsOpen]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"habit" | "todo">("habit");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [goalId, setGoalId] = useState("");
  const [projectId, setProjectId] = useState("");

  const addTask = useTaskStore((state) => state.addTask);
  const goals = useGoalStore((state) => state.goals);
  const projects = useProjectStore((state) => state.projects);

  // Filter projects by selected goal
  const filteredProjects = goalId
    ? projects.filter((p) => p.goalId === goalId)
    : projects;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !goalId || !projectId) return;

    addTask({
      title: title.trim(),
      description: description.trim(),
      type,
      difficulty,
      goalId,
      projectId,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setType("habit");
    setDifficulty("normal");
    setGoalId("");
    setProjectId("");
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      {!hideButton && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-full shadow-lg flex items-center justify-center z-fab"
        >
          <FaPlus className="text-2xl" />
        </motion.button>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-modal"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-modal overflow-y-auto max-h-[90vh]"
            >
              {/* Handle Bar */}
              <div className="flex justify-center pt-3 pb-2 sticky top-0 bg-white z-10">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>

              <div className="px-6 pb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    {t("task.create")}
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 목표 (필수) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {t("goal.title")} *
                  </label>
                  <select
                    value={goalId}
                    onChange={(e) => {
                      setGoalId(e.target.value);
                      setProjectId(""); // Reset project when goal changes
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    required
                  >
                    <option value="">{t("common.selectPlaceholder")}</option>
                    {goals.map((goal) => (
                      <option key={goal.id} value={goal.id}>
                        {goal.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 프로젝트 (필수) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {t("project.title")} *
                  </label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    disabled={!goalId}
                    required
                  >
                    <option value="">{t("common.selectPlaceholder")}</option>
                    {filteredProjects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                  {!goalId && (
                    <p className="text-xs text-gray-500 mt-1">
                      {t("task.selectGoalFirst")}
                    </p>
                  )}
                </div>

                {/* 제목 (필수) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {t("task.title")} *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t("task.title")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>

                {/* 설명 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {t("task.description")}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t("task.description")}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  />
                </div>

                {/* 타입 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {t("task.type")}
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as typeof type)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  >
                    <option value="habit">{t("tasks.types.habit")}</option>
                    <option value="todo">{t("tasks.types.todo")}</option>
                  </select>
                </div>

                {/* 난이도 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {t("task.difficulty.label")}
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) =>
                      setDifficulty(e.target.value as Difficulty)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  >
                    <option value="easy">{t("task.difficulty.easy")}</option>
                    <option value="normal">{t("task.difficulty.normal")}</option>
                    <option value="hard">{t("task.difficulty.hard")}</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all"
                >
                  {t("task.create")}
                </button>
              </form>

              {/* Safe area for mobile */}
              <div className="pb-safe" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
