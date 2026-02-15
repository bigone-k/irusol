"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useProjectStore } from "@/store/useProjectStore";
import { useGoalStore } from "@/store/useGoalStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useTaskStore } from "@/store/useTaskStore";
import { useToastStore } from "@/store/useToastStore";
import { motion } from "framer-motion";
import { FiArrowLeft, FiCalendar, FiTarget, FiEdit2, FiSave, FiTrash2, FiAward, FiClock, FiRepeat } from "react-icons/fi";
import { GiTwoCoins } from "react-icons/gi";
import { PROJECT_REWARD } from "@/lib/rewards";
import type { ProjectStatus } from "@/types";

export default function ProjectDetailsPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const projectId = params.id as string;

  const projects = useProjectStore((state) => state.projects);
  const goals = useGoalStore((state) => state.goals);
  const updateProject = useProjectStore((state) => state.updateProject);
  const updateStatus = useProjectStore((state) => state.updateStatus);
  const deleteProject = useProjectStore((state) => state.deleteProject);
  const claimReward = useProjectStore((state) => state.claimReward);
  const addCoins = usePlayerStore((state) => state.addCoins);
  const tasks = useTaskStore((state) => state.tasks);
  const { success, error, info } = useToastStore();

  const project = projects.find((p) => p.id === projectId);
  const goal = project ? goals.find((g) => g.id === project.goalId) : null;
  const projectTasks = tasks.filter((t) => t.projectId === projectId);
  const habits = projectTasks.filter((t) => t.type === "habit");
  const todos = projectTasks.filter((t) => t.type === "todo");

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("notStarted");
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);

  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setDescription(project.description || "");
      setStatus(project.status);
    }
  }, [project]);

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="text-center py-12">
          <p className="text-text-muted mb-4">{t("project.notFound")}</p>
          <button
            onClick={() => router.push(`/${locale}/projects`)}
            className="text-primary-dark font-semibold underline"
          >
            {t("common.back")}
          </button>
        </div>
      </div>
    );
  }

  // Calculate period duration
  const getPeriodDays = () => {
    if (!project.startDate || !project.endDate) return null;
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Helper functions for task display
  const getDaysRemaining = (endDate?: Date) => {
    if (!endDate) return null;
    const today = new Date();
    const end = new Date(endDate);
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const formatPeriod = (startDate?: Date, endDate?: Date) => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate).toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
    });
    const end = new Date(endDate).toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
    });
    return `${start} - ${end}`;
  };

  const getFrequencyText = (task: any) => {
    if (!task.frequencyTarget || !task.frequencyPeriod) return null;
    // Use the same format as TaskList component
    const periodKey =
      task.frequencyPeriod === "daily"
        ? "일"
        : task.frequencyPeriod === "weekly"
        ? "주"
        : "월";
    return `${periodKey} ${task.frequencyTarget}회`;
  };

  const handleSave = () => {
    if (!project) return;

    if (!title.trim()) {
      error(t("project.title") + " " + t("task.titlePlaceholder"));
      return;
    }

    updateProject(projectId, {
      title,
      description,
    });

    if (status !== project.status) {
      updateStatus(projectId, status);
    }

    success(t("common.save") + " 완료");
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(t("project.deleteConfirm"))) {
      deleteProject(projectId);
      success(t("project.title") + " 삭제됨");
      router.push(`/${locale}/projects`);
    }
  };

  const getStatusColor = (s: ProjectStatus) => {
    switch (s) {
      case "notStarted":
        return "bg-track text-text border shadow-sm";
      case "inProgress":
        return "bg-primary text-white border-primary-dark shadow-md";
      case "completed":
        return "bg-accent text-white border-accent shadow-md";
    }
  };

  const handleClaimReward = () => {
    if (!project) {
      error("프로젝트를 찾을 수 없습니다");
      return;
    }

    if (project.rewardClaimed) {
      info("이미 보상을 받았습니다");
      return;
    }

    if (project.status !== "completed") {
      error("프로젝트를 완료해야 보상을 받을 수 있습니다");
      return;
    }

    const claimSuccess = claimReward(projectId);
    if (claimSuccess) {
      addCoins(PROJECT_REWARD);
      success(`+${PROJECT_REWARD} 코인 획득!`);
      setShowRewardAnimation(true);
      setTimeout(() => setShowRewardAnimation(false), 2000);
    } else {
      error("보상 수령에 실패했습니다");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()}>
              <FiArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold">{t("project.details")}</h1>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 hover:bg-primary-dark rounded-lg transition-colors"
          >
            <FiEdit2 size={20} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Project Info Card */}
        <motion.div
          className="bg-background-surface rounded-2xl p-6 shadow-md space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Goal Name (Read-only) */}
          {goal && (
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">
                {t("goal.title")}
              </label>
              <p className="text-sm text-text">📂 {goal.title}</p>
            </div>
          )}

          {/* Project Title */}
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">
              {t("project.title")}
            </label>
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text"
              />
            ) : (
              <h2 className="text-2xl font-bold text-text">
                {project.title}
              </h2>
            )}
          </div>

          {/* Status Selector */}
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-2">
              {t("project.status.label")}
            </label>
            <div className="flex gap-2">
              {(["notStarted", "inProgress", "completed"] as ProjectStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => isEditing && setStatus(s)}
                  disabled={!isEditing}
                  className={`flex-1 px-3 py-1.5 rounded-lg border font-bold text-xs transition-all ${
                    status === s
                      ? getStatusColor(s)
                      : "bg-background-surface text-text-muted border hover:bg-gray-50"
                  } ${!isEditing && "opacity-60 cursor-not-allowed"}`}
                >
                  {t(`project.status.${s}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">
              {t("task.description")}
            </label>
            {isEditing ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-text"
              />
            ) : (
              <p className="text-text-muted">
                {project.description || t("project.noDescription")}
              </p>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* Difficulty */}
            {project.difficulty && (
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <FiTarget className="mx-auto mb-1 text-text-muted" size={20} />
                <p className="text-xs text-text-muted mb-1">
                  {t("project.difficulty")}
                </p>
                <p className="font-semibold text-sm">{project.difficulty}</p>
              </div>
            )}

            {/* Period */}
            {getPeriodDays() !== null && (
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <FiCalendar className="mx-auto mb-1 text-text-muted" size={20} />
                <p className="text-xs text-text-muted mb-1">
                  {t("project.period")}
                </p>
                <p className="font-semibold text-sm">
                  {getPeriodDays()} {t("common.days")}
                </p>
              </div>
            )}

            {/* Reward */}
            {project.reward && (
              <div className="bg-amber-50 rounded-lg p-3 text-center">
                <GiTwoCoins
                  className="mx-auto mb-1 text-amber-600"
                  size={20}
                />
                <p className="text-xs text-text-muted mb-1">
                  {t("project.reward")}
                </p>
                <p className="font-semibold text-sm text-amber-600">
                  +{project.reward}
                </p>
              </div>
            )}
          </div>

          {/* Reward Section */}
          {status === "completed" && (
            <div className="pt-4 border-t border">
              {project.rewardClaimed ? (
                <div className="px-4 py-3 bg-accent/10 border border-accent rounded-lg">
                  <p className="text-sm text-accent font-medium text-center">
                    보상 받음 ({PROJECT_REWARD} 코인)
                  </p>
                </div>
              ) : (
                <motion.button
                  onClick={handleClaimReward}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary-dark hover:to-accent text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiAward size={20} />
                  보상 받기 (+{PROJECT_REWARD} 코인)
                </motion.button>
              )}
            </div>
          )}

          {/* Action Buttons (Edit Mode) */}
          {isEditing && (
            <div className="flex gap-3 pt-4 border-t border">
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <FiTrash2 size={16} />
                {t("common.delete")}
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-primary hover:bg-primary-dark text-white py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <FiSave size={16} />
                {t("common.save")}
              </button>
            </div>
          )}
        </motion.div>

        {/* Habits Section */}
        {habits.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-bold text-text mb-3">
              {t("habit.title")}
            </h3>
            <div className="space-y-2">
              {habits.map((habit) => {
                const period = formatPeriod(habit.startDate, habit.endDate);
                const frequency = getFrequencyText(habit);

                return (
                  <div
                    key={habit.id}
                    className="bg-background-surface rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={habit.completed}
                        readOnly
                        className="w-5 h-5 mt-1 rounded border text-accent flex-shrink-0"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-text">{habit.title}</p>
                        {habit.description && (
                          <p className="text-sm text-text-muted mt-1">
                            {habit.description}
                          </p>
                        )}

                        {/* Habit-specific Info */}
                        <div className="mt-2 space-y-1">
                          {period && (
                            <div className="flex items-center gap-1 text-xs text-text-muted">
                              <FiCalendar size={12} />
                              <span>{period}</span>
                            </div>
                          )}
                          {frequency && (
                            <div className="flex items-center gap-1 text-xs text-text-muted">
                              <FiRepeat size={12} />
                              <span>{frequency}</span>
                              {habit.completionCount !== undefined && (
                                <span className="text-primary-dark font-semibold ml-1">
                                  ({habit.completionCount}회 달성)
                                </span>
                              )}
                            </div>
                          )}
                          {habit.streak && habit.streak > 0 && (
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-text-muted font-semibold">
                                🔥 {habit.streak}일 연속
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* To-Dos Section */}
        {todos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-bold text-text mb-3">
              {t("todo.title")}
            </h3>
            <div className="space-y-2">
              {todos.map((todo) => {
                const daysRemaining = getDaysRemaining(todo.endDate);

                return (
                  <div
                    key={todo.id}
                    className="bg-background-surface rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        readOnly
                        className="w-5 h-5 mt-1 rounded border text-primary-dark flex-shrink-0"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-text">{todo.title}</p>
                        {todo.description && (
                          <p className="text-sm text-text-muted mt-1">
                            {todo.description}
                          </p>
                        )}

                        {/* Todo-specific Info */}
                        {todo.endDate && (
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-1 text-xs text-text-muted">
                              <FiCalendar size={12} />
                              <span>
                                {new Date(todo.endDate).toLocaleDateString(locale, {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                            {daysRemaining !== null && (
                              <div
                                className={`flex items-center gap-1 text-xs font-semibold ${
                                  daysRemaining < 0
                                    ? "text-red-500"
                                    : daysRemaining <= 3
                                    ? "text-text-muted"
                                    : "text-text-muted"
                                }`}
                              >
                                <FiClock size={12} />
                                <span>
                                  {daysRemaining < 0
                                    ? `D+${Math.abs(daysRemaining)}`
                                    : `D-${daysRemaining}`}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {habits.length === 0 && todos.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            <p className="text-lg">{t("project.noTasks")}</p>
            <p className="text-sm">{t("project.addTasksDescription")}</p>
          </div>
        )}
      </div>

      {/* Reward Animation */}
      {showRewardAnimation && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
        >
          <div className="bg-gradient-to-r from-primary to-accent text-white px-8 py-4 rounded-2xl shadow-2xl text-center">
            <FiAward size={40} className="mx-auto mb-2" />
            <p className="text-2xl font-bold">+{PROJECT_REWARD} 코인</p>
            <p className="text-sm">보상을 받았습니다!</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
