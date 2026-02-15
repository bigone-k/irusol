"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import type { TaskRecurrence, TaskReminder } from "@/types";

interface TaskFormBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
  type: "habit" | "todo";
}

export interface TaskFormData {
  title: string;
  description?: string;
  projectId?: string;
  difficulty: "easy" | "normal" | "hard";
  recurrence?: TaskRecurrence;
  targetDays?: number;
  startDate?: Date;
  reminder?: TaskReminder;
}

export default function TaskFormBottomSheet({
  isOpen,
  onClose,
  onSubmit,
  type,
}: TaskFormBottomSheetProps) {
  const t = useTranslations();

  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    difficulty: "normal",
    recurrence: {
      type: "daily",
    },
    reminder: {
      enabled: false,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSubmit(formData);
    onClose();
    // Reset form
    setFormData({
      title: "",
      difficulty: "normal",
      recurrence: { type: "daily" },
      reminder: { enabled: false },
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[85vh] overflow-y-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border p-4 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-xl font-bold">
                {type === "habit" ? t("habit.create") : t("todo.create")}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-primary/5 rounded-full transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  {t("task.title")}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 border border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={t("task.titlePlaceholder")}
                  required
                />
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  {t("task.frequency")}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        recurrence: { type: "daily" },
                      })
                    }
                    className={`py-3 px-4 rounded-lg font-medium transition-all ${
                      formData.recurrence?.type === "daily"
                        ? "bg-primary text-white"
                        : "bg-track text-text hover:bg-track"
                    }`}
                  >
                    {t("task.daily")}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        recurrence: { type: "weekly" },
                      })
                    }
                    className={`py-3 px-4 rounded-lg font-medium transition-all ${
                      formData.recurrence?.type === "weekly"
                        ? "bg-primary text-white"
                        : "bg-track text-text hover:bg-track"
                    }`}
                  >
                    {t("task.weekly")}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        recurrence: { type: "custom" },
                      })
                    }
                    className={`py-3 px-4 rounded-lg font-medium transition-all ${
                      formData.recurrence?.type === "custom"
                        ? "bg-primary text-white"
                        : "bg-track text-text hover:bg-track"
                    }`}
                  >
                    {t("task.custom")}
                  </button>
                </div>
              </div>

              {/* Target Days */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  {t("task.targetDays")}
                </label>
                <input
                  type="number"
                  value={formData.targetDays || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targetDays: parseInt(e.target.value) || undefined,
                    })
                  }
                  className="w-full px-4 py-3 border border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="30"
                  min="1"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  {t("task.startDate")}
                </label>
                <input
                  type="date"
                  value={
                    formData.startDate
                      ? formData.startDate.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      startDate: e.target.value
                        ? new Date(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full px-4 py-3 border border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Reminder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-text">
                    {t("task.reminder")}
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.reminder?.enabled || false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          reminder: {
                            ...formData.reminder,
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-track rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>

                {formData.reminder?.enabled && (
                  <input
                    type="time"
                    value={formData.reminder.time || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reminder: {
                          ...formData.reminder!,
                          time: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-3 border border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-primary text-white py-4 rounded-lg font-bold text-lg hover:bg-primary-dark transition-colors"
              >
                {t("common.save")}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
