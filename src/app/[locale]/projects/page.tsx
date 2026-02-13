"use client";

import { useTranslations } from "next-intl";
import { useSearchParams, useParams } from "next/navigation";
import { useGoalStore } from "@/store/useGoalStore";
import { useProjectStore } from "@/store/useProjectStore";
import PlayerDashboard from "@/components/PlayerDashboard";
import ProjectCard from "@/components/ProjectCard";
import FloatingAddButton from "@/components/FloatingAddButton";

export default function ProjectsPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params.locale as string;
  const goalId = searchParams.get("goal");

  const goals = useGoalStore((state) => state.goals);
  const projects = useProjectStore((state) => state.projects);
  const toggleProject = useProjectStore((state) => state.toggleProject);

  // Filter projects by goal if goalId is provided
  const filteredProjects = goalId
    ? projects.filter((p) => p.goalId === goalId)
    : projects;

  const selectedGoal = goalId
    ? goals.find((g) => g.id === goalId)
    : null;

  return (
    <div className="p-4 space-y-4">
      {/* Player Dashboard */}
      <PlayerDashboard />

      {/* Subtitle (Selected Goal) */}
      {selectedGoal && (
        <p className="text-sm text-gray-600">{selectedGoal.title}</p>
      )}

      {/* Projects List */}
      <div className="space-y-3">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">{t("project.empty")}</p>
            <p className="text-sm">{t("project.emptyDescription")}</p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onToggle={() => toggleProject(project.id)}
              locale={locale}
            />
          ))
        )}
      </div>

      {/* Floating Add Button */}
      <FloatingAddButton />
    </div>
  );
}
