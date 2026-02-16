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

  // Period fields
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [frequency, setFrequency] = useState<number[]>([]);

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

    // Validate period fields based on type
    if (type === "habit" && (!startDate || !endDate || frequency.length === 0)) {
      return;
    }
    if (type === "todo" && !dueDate) {
      return;
    }

    addTask({
      title: title.trim(),
      description: description.trim(),
      type,
      difficulty,
      goalId,
      projectId,
      ...(type === "habit" && {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        frequency,
      }),
      ...(type === "todo" && {
        dueDate: new Date(dueDate),
      }),
    });

    // Reset form
    setTitle("");
    setDescription("");
    setType("habit");
    setDifficulty("normal");
    setGoalId("");
    setProjectId("");
    setStartDate("");
    setEndDate("");
    setDueDate("");
    setFrequency([]);
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
          className="fixed bottom-20 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center z-fab hover:bg-primary-dark transition-colors"
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
              className="fixed bottom-0 left-0 right-0 bg-background-surface rounded-t-3xl shadow-2xl z-modal overflow-y-auto max-h-[90vh]"
            >
              {/* Handle Bar */}
              <div className="flex justify-center pt-3 pb-2 sticky top-0 bg-background-surface z-10">
                <div className="w-12 h-1.5 bg-border rounded-full" />
              </div>

              <div className="px-6 pb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-text">
                    {t("task.create")}
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-text-muted hover:text-text"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 목표 (필수) */}
                <div>
                  <label className="block text-sm font-semibold text-text mb-1">
                    {t("goal.title")} *
                  </label>
                  <select
                    value={goalId}
                    onChange={(e) => {
                      setGoalId(e.target.value);
                      setProjectId(""); // Reset project when goal changes
                    }}
                    className="w-full px-4 py-2 border border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text"
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
                  <label className="block text-sm font-semibold text-text mb-1">
                    {t("project.title")} *
                  </label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-4 py-2 border border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text"
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
                    <p className="text-xs text-text-muted mt-1">
                      {t("task.selectGoalFirst")}
                    </p>
                  )}
                </div>

                {/* 제목 (필수) */}
                <div>
                  <label className="block text-sm font-semibold text-text mb-1">
                    {t("task.title")} *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t("task.title")}
                    className="w-full px-4 py-2 border border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text"
                    required
                  />
                </div>

                {/* 설명 */}
                <div>
                  <label className="block text-sm font-semibold text-text mb-1">
                    {t("task.description")}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t("task.description")}
                    rows={3}
                    className="w-full px-4 py-2 border border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text"
                  />
                </div>

                {/* 타입 */}
                <div>
                  <label className="block text-sm font-semibold text-text mb-1">
                    {t("task.type")} *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as typeof type)}
                    className="w-full px-4 py-2 border border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text"
                  >
                    <option value="habit">{t("tasks.types.habit")}</option>
                    <option value="todo">{t("tasks.types.todo")}</option>
                  </select>
                </div>

                {/* 기간 - Habit */}
                {type === "habit" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-text mb-1">
                          {t("task.startDate")} *
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-4 py-2 border border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-text mb-1">
                          {t("task.endDate")} *
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-4 py-2 border border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-text mb-1">
                        {t("task.frequency")} *
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { value: 0, label: t("task.days.sun") },
                          { value: 1, label: t("task.days.mon") },
                          { value: 2, label: t("task.days.tue") },
                          { value: 3, label: t("task.days.wed") },
                          { value: 4, label: t("task.days.thu") },
                          { value: 5, label: t("task.days.fri") },
                          { value: 6, label: t("task.days.sat") },
                        ].map((day) => (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => {
                              setFrequency(
                                frequency.includes(day.value)
                                  ? frequency.filter((d) => d !== day.value)
                                  : [...frequency, day.value].sort()
                              );
                            }}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              frequency.includes(day.value)
                                ? "bg-primary text-white"
                                : "bg-track text-text-muted"
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* 기간 - Todo */}
                {type === "todo" && (
                  <div>
                    <label className="block text-sm font-semibold text-text mb-1">
                      {t("task.dueDate")} *
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-4 py-2 border border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text"
                      required
                    />
                  </div>
                )}

                {/* 난이도 */}
                <div>
                  <label className="block text-sm font-semibold text-text mb-1">
                    {t("task.difficulty.label")}
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) =>
                      setDifficulty(e.target.value as Difficulty)
                    }
                    className="w-full px-4 py-2 border border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text"
                  >
                    <option value="easy">{t("task.difficulty.easy")}</option>
                    <option value="normal">{t("task.difficulty.normal")}</option>
                    <option value="hard">{t("task.difficulty.hard")}</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary-dark transition-all"
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
