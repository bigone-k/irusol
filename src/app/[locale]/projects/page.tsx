"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useGoalStore } from "@/store/useGoalStore";
import { useProjectStore } from "@/store/useProjectStore";
import { useTaskStore } from "@/store/useTaskStore";
import { motion } from "framer-motion";
import { FiPlus, FiChevronLeft } from "react-icons/fi";
import Link from "next/link";
import ProjectForm from "@/components/ProjectForm";
import PlayerDashboard from "@/components/PlayerDashboard";

export default function ProjectsPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const goalId = searchParams.get("goal");

  const goals = useGoalStore((state) => state.goals);
  const projects = useProjectStore((state) => state.projects);
  const toggleProject = useProjectStore((state) => state.toggleProject);
  const tasks = useTaskStore((state) => state.tasks);
  const [showAddForm, setShowAddForm] = useState(false);

  // Filter projects by goal if goalId is provided
  const filteredProjects = goalId
    ? projects.filter((p) => p.goalId === goalId)
    : projects;

  const selectedGoal = goalId
    ? goals.find((g) => g.id === goalId)
    : null;

  const getProjectProgress = (projectId: string) => {
    const projectTasks = tasks.filter((t) => t.projectId === projectId);
    if (projectTasks.length === 0) return 0;
    const completed = projectTasks.filter((t) => t.completed).length;
    return Math.round((completed / projectTasks.length) * 100);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Player Dashboard */}
      <PlayerDashboard />

      {/* Subtitle and Add Button */}
      <div className="flex justify-between items-center">
        {selectedGoal && (
          <p className="text-sm text-gray-600">{selectedGoal.title}</p>
        )}
        <button
          onClick={() => setShowAddForm(true)}
          className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-purple-700 transition-colors ml-auto"
        >
          <FiPlus size={20} />
        </button>
      </div>

        {/* Projects List */}
        <div className="space-y-3">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg">{t("project.title")} 없음</p>
              <p className="text-sm">+ 버튼을 눌러 새로운 프로젝트를 추가하세요</p>
            </div>
          ) : (
            filteredProjects.map((project, index) => {
              const progress = getProjectProgress(project.id);
              const projectTasks = tasks.filter(
                (t) => t.projectId === project.id
              );

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white rounded-xl p-4 shadow-md border-2 ${
                    project.completed
                      ? "border-green-300 bg-green-50"
                      : "border-blue-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={project.completed}
                      onChange={() => toggleProject(project.id)}
                      className="w-5 h-5 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <h3
                        className={`font-bold text-lg ${
                          project.completed
                            ? "line-through text-gray-500"
                            : "text-gray-800"
                        }`}
                      >
                        {project.title}
                      </h3>
                      {project.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {project.description}
                        </p>
                      )}

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">
                            {t("goal.progress")}
                          </span>
                          <span className="text-blue-600 font-semibold">
                            {progress}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {projectTasks.filter((t) => t.completed).length} /{" "}
                          {projectTasks.length} Tasks
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

      {/* Add Project Form */}
      <ProjectForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        defaultGoalId={goalId || undefined}
      />
    </div>
  );
}
