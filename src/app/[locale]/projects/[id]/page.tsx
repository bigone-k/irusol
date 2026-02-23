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
import { FiArrowLeft, FiCalendar, FiTarget, FiEdit2, FiSave, FiTrash2, FiAward } from "react-icons/fi";
import { GiTwoCoins } from "react-icons/gi";
import { PROJECT_REWARD } from "@/lib/rewards";
import type { ProjectStatus, TabType } from "@/types";
import TaskList from "@/components/TaskList";
import { getProgress } from "@/lib/taskProgress";
import AddTaskButton from "@/components/AddTaskButton";
import { FiPlus } from "react-icons/fi";

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
  const habitCount = projectTasks.filter((t) => t.type === "habit").length;
  const todoCount = projectTasks.filter((t) => t.type === "todo").length;

  const projectProgress = projectTasks.length > 0
    ? Math.floor(
        projectTasks.reduce((sum, task) => sum + getProgress(task), 0) / projectTasks.length
      )
    : 0;
  const canComplete = projectProgress >= 80;

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("notStarted");
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [questTab, setQuestTab] = useState<"all" | TabType>("all");
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

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
      if (status === "completed" && !canComplete) {
        error("퀘스트 진행률이 80% 이상이어야 완료할 수 있습니다");
        return;
      }
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
        return "bg-track text-text border";
      case "inProgress":
        return "bg-primary text-white border-primary-dark";
      case "completed":
        return "bg-accent text-white border-accent";
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
      <div className="bg-primary text-white p-4 sticky top-0 z-10">
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
          className="bg-background-surface rounded-2xl p-6 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Goal Name (Read-only) */}
          {goal && (
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">
                {t("goal.title")}
              </label>
              <p className="text-sm text-text flex items-center gap-1.5">
                <FiTarget size={14} className="text-text-muted flex-shrink-0" />
                {goal.title}
              </p>
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
              {(["notStarted", "inProgress", "completed"] as ProjectStatus[]).map((s) => {
                const isCompleteBtn = s === "completed";
                const isDisabled = !isEditing || (isCompleteBtn && !canComplete);
                return (
                  <div key={s} className="flex-1 flex flex-col items-stretch gap-0.5">
                    <button
                      onClick={() => {
                        if (!isEditing) return;
                        if (isCompleteBtn && !canComplete) {
                          error("퀘스트 진행률이 80% 이상이어야 완료할 수 있습니다");
                          return;
                        }
                        setStatus(s);
                      }}
                      disabled={isDisabled}
                      className={`px-3 py-1.5 rounded-lg border font-bold text-xs transition-all ${
                        status === s
                          ? getStatusColor(s)
                          : "bg-background-surface text-text-muted border"
                      } ${isDisabled ? "opacity-40 cursor-not-allowed" : "hover:bg-track"}`}
                    >
                      {t(`project.status.${s}`)}
                    </button>
                    {isCompleteBtn && isEditing && !canComplete && (
                      <span className="text-center text-[10px] text-text-muted leading-tight">
                        {projectProgress}% / 80% 필요
                      </span>
                    )}
                  </div>
                );
              })}
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
          {(getPeriodDays() !== null || project.reward) && (
            <div className="grid grid-cols-3 gap-3">
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
          )}

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
                  className="w-full bg-accent text-white font-bold py-3 px-4 rounded-lg hover:brightness-110 flex items-center justify-center gap-2 transition-all"
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
            <div className={`flex gap-3 ${(getPeriodDays() !== null || project.reward || status === "completed") ? "pt-4 border-t border" : "pt-2"}`}>
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

        {/* Quest Tabs */}
        <div className="flex gap-2">
          {(
            [
              { key: "all", label: t("quest.title"), count: projectTasks.length },
              { key: "habits", label: t("habit.title"), count: habitCount },
              { key: "todos", label: t("todo.title"), count: todoCount },
            ] as { key: "all" | TabType; label: string; count: number }[]
          ).map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setQuestTab(key)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                questTab === key
                  ? "bg-primary text-white"
                  : "bg-track text-text-muted hover:bg-border"
              }`}
            >
              {label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  questTab === key ? "bg-white/30 text-white" : "bg-background text-text-muted"
                }`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Quest List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <TaskList
            projectId={projectId}
            activeTab={questTab === "all" ? undefined : questTab}
          />
        </motion.div>
      </div>

      {/* Floating Add Button */}
      <motion.button
        whileHover={{ scale: 1.15, y: -4, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsAddTaskOpen(true)}
        className="fixed bottom-20 right-6 w-16 h-16 bg-primary hover:bg-primary-dark text-white rounded-full flex items-center justify-center z-fab transition-all duration-300 border-2 border-white/50 glossy animate-pulse-glow"
      >
        <FiPlus size={28} strokeWidth={3} />
      </motion.button>

      <AddTaskButton
        hideButton
        defaultProjectId={projectId}
        externalIsOpen={isAddTaskOpen}
        onExternalClose={() => setIsAddTaskOpen(false)}
      />

      {/* Reward Animation */}
      {showRewardAnimation && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
        >
          <div className="bg-accent text-white px-8 py-4 rounded-2xl text-center">
            <FiAward size={40} className="mx-auto mb-2" />
            <p className="text-2xl font-bold">+{PROJECT_REWARD} 코인</p>
            <p className="text-sm">보상을 받았습니다!</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
