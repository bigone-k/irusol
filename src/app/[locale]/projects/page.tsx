"use client";

import { useTranslations } from "next-intl";
import { useSearchParams, useParams } from "next/navigation";
import { useGoalStore } from "@/store/useGoalStore";
import { useProjectStore } from "@/store/useProjectStore";
import PlayerDashboard from "@/components/PlayerDashboard";
import ProjectCard from "@/components/ProjectCard";
import FloatingAddButton from "@/components/FloatingAddButton";
import EmptyState from "@/components/EmptyState";

export default function ProjectsPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params.locale as string;
  const goalId = searchParams.get("goal");

  const goals = useGoalStore((state) => state.goals);
  const projects = useProjectStore((state) => state.projects);

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
        <p className="text-sm text-text-muted">{selectedGoal.title}</p>
      )}

      {/* Projects List */}
      <div className="space-y-3">
        {filteredProjects.length === 0 ? (
          <EmptyState
            title={t("project.empty")}
            description={t("project.emptyDescription")}
            icon="📂"
          />
        ) : (
          filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
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
