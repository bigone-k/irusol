"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams, useParams } from "next/navigation";
import { useGoalStore } from "@/store/useGoalStore";
import { useProjectStore } from "@/store/useProjectStore";
import PlayerDashboard from "@/components/PlayerDashboard";
import ProjectCard from "@/components/ProjectCard";
import FloatingAddButton from "@/components/FloatingAddButton";
import EmptyState from "@/components/EmptyState";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronDown, FiChevronUp, FiTarget, FiBriefcase } from "react-icons/fi";
import type { Project, Goal } from "@/types";

interface ProjectGroup {
  goal: Goal | null;
  projects: Project[];
}

export default function ProjectsPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params.locale as string;
  const goalId = searchParams.get("goal");

  const goals = useGoalStore((state) => state.goals);
  const projects = useProjectStore((state) => state.projects);

  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const filteredProjects = goalId
    ? projects.filter((p) => p.goalId === goalId)
    : projects;

  // Group projects by goal
  const projectGroups = useMemo((): ProjectGroup[] => {
    const goalMap = new Map<string, Project[]>();
    const noGoalProjects: Project[] = [];

    filteredProjects.forEach((project) => {
      if (project.goalId) {
        if (!goalMap.has(project.goalId)) goalMap.set(project.goalId, []);
        goalMap.get(project.goalId)!.push(project);
      } else {
        noGoalProjects.push(project);
      }
    });

    const groups: ProjectGroup[] = [];
    goalMap.forEach((groupProjects, gid) => {
      const goal = goals.find((g) => g.id === gid) ?? null;
      groups.push({ goal, projects: groupProjects });
    });

    if (noGoalProjects.length > 0) {
      groups.push({ goal: null, projects: noGoalProjects });
    }

    return groups;
  }, [filteredProjects, goals]);

  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Player Dashboard */}
      <PlayerDashboard />

      {/* Projects grouped by goal */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          title={t("project.empty")}
          description={t("project.emptyDescription")}
          icon={<FiBriefcase size={40} />}
        />
      ) : (
        <div className="space-y-6">
          {projectGroups.map((group) => {
            const groupKey = group.goal?.id ?? "__no_goal__";
            const isCollapsed = collapsedGroups.has(groupKey);

            return (
              <div key={groupKey}>
                {/* Goal Header */}
                <button
                  onClick={() => toggleGroup(groupKey)}
                  className="w-full flex items-center gap-3 mb-3 group"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-base text-text-muted flex items-center">
                      {group.goal ? <FiTarget size={16} /> : <FiBriefcase size={16} />}
                    </span>
                    <span className="text-sm font-bold text-text truncate">
                      {group.goal?.title ?? t("quest.noProject")}
                    </span>
                    <span className="flex-shrink-0 text-xs font-medium text-text-muted bg-track px-2 py-0.5 rounded-full">
                      {group.projects.length}
                    </span>
                  </div>
                  <span className="text-text-muted group-hover:text-text transition-colors">
                    {isCollapsed ? <FiChevronDown size={16} /> : <FiChevronUp size={16} />}
                  </span>
                </button>

                {/* Project Cards */}
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3 overflow-hidden"
                    >
                      {group.projects.map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          locale={locale}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Add Button */}
      <FloatingAddButton />
    </div>
  );
}
