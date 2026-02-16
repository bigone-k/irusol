"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiSave, FiTrash2 } from "react-icons/fi";
import { useTaskStore } from "@/store/useTaskStore";
import { useProjectStore } from "@/store/useProjectStore";
import type { Task } from "@/types";

interface QuestDetailSheetProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuestDetailSheet({
  task,
  isOpen,
  onClose,
}: QuestDetailSheetProps) {
  const t = useTranslations();
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const projects = useProjectStore((state) => state.projects);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [frequency, setFrequency] = useState<number[]>([]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);

      if (task.type === "habit") {
        setStartDate(task.startDate ? new Date(task.startDate).toISOString().split("T")[0] : "");
        setEndDate(task.endDate ? new Date(task.endDate).toISOString().split("T")[0] : "");
        setFrequency(task.frequency || []);
      } else {
        setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
      }
    }
  }, [task]);

  if (!task) return null;

  const project = task.projectId ? projects.find((p) => p.id === task.projectId) : null;

  const handleSave = () => {
    if (!title.trim()) {
      return;
    }

    // Validate period fields
    if (task.type === "habit" && (!startDate || !endDate || frequency.length === 0)) {
      return;
    }
    if (task.type === "todo" && !dueDate) {
      return;
    }

    updateTask(task.id, {
      title,
      description,
      ...(task.type === "habit" && {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        frequency,
      }),
      ...(task.type === "todo" && {
        dueDate: new Date(dueDate),
      }),
    });

    onClose();
  };

  const handleDelete = () => {
    if (confirm(t("goal.deleteConfirm"))) {
      deleteTask(task.id);
      onClose();
    }
  };

  const formatPeriod = () => {
    if (task.type === "habit") {
      if (!task.startDate || !task.endDate) return "";
      const start = new Date(task.startDate).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      const end = new Date(task.endDate).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      return `${start} ~ ${end}`;
    } else {
      if (!task.dueDate) return "";
      return new Date(task.dueDate).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatFrequency = () => {
    if (!task.frequency || task.frequency.length === 0) return "";
    const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];
    return task.frequency.map(d => dayLabels[d]).join(", ");
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
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-text">
                  {t("quest.details")}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    className="text-red-500 hover:text-red-600 p-2"
                  >
                    <FiTrash2 className="text-xl" />
                  </button>
                  <button
                    onClick={onClose}
                    className="text-text-muted hover:text-text p-2"
                  >
                    <FiX className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Project Info */}
              <div className="mb-4">
                {project && (
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <span>📂 {project.title}</span>
                  </div>
                )}
              </div>

              {/* Task Type Badge */}
              <div className="mb-4">
                <span className="text-xs px-3 py-1.5 rounded-full bg-secondary text-text font-medium">
                  {t(`tasks.types.${task.type}`)}
                </span>
              </div>

              {/* Form */}
              <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-text mb-1">
                    {t("task.title")} *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 border border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-text mb-1">
                    {t("task.description")}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text"
                  />
                </div>

                {/* Period - Habit */}
                {task.type === "habit" && (
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

                {/* Period - Todo */}
                {task.type === "todo" && (
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

                {/* Save Button */}
                <button
                  type="submit"
                  className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
                >
                  <FiSave />
                  {t("common.save")}
                </button>
              </form>

              {/* Safe area for mobile */}
              <div className="pb-safe" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
