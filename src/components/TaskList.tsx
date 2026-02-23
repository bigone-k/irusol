"use client";

import { useTaskStore } from "@/store/useTaskStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useProjectStore } from "@/store/useProjectStore";
import type { TabType, Task, Project } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState, useMemo } from "react";
import { FiChevronDown, FiChevronUp, FiBriefcase } from "react-icons/fi";
import QuestDetailSheet from "@/components/QuestDetailSheet";
import QuestTaskCard from "@/components/QuestTaskCard";
import { isTodoCompleted, getProgress } from "@/lib/taskProgress";

interface TaskListProps {
  activeTab?: TabType;
  groupByProject?: boolean;
  projectId?: string;
}

interface TaskGroup {
  project: Project | null;
  tasks: Task[];
}

export default function TaskList({
  activeTab,
  groupByProject = false,
  projectId,
}: TaskListProps) {
  const t = useTranslations();
  const tasks = useTaskStore((state) => state.tasks);
  const projects = useProjectStore((state) => state.projects);
  const toggleTask = useTaskStore((state) => state.toggleTask);
  const completeTask = usePlayerStore((state) => state.completeTask);
  const [celebratingTask, setCelebratingTask] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const handleToggle = (task: Task) => {
    if (!task.completed) {
      const result = completeTask();
      toggleTask(task.id);

      setCelebratingTask(task.id);
      setTimeout(() => setCelebratingTask(null), 1000);

    } else {
      toggleTask(task.id);
    }
  };

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (projectId) {
      result = result.filter((task) => task.projectId === projectId);
    }
    if (activeTab === "habits") {
      result = result.filter((task) => task.type === "habit");
    } else if (activeTab === "todos") {
      result = result.filter((task) => task.type === "todo");
    }
    return result;
  }, [tasks, projectId, activeTab]);

  // Group tasks by project
  const taskGroups = useMemo((): TaskGroup[] => {
    if (!groupByProject) return [{ project: null, tasks: filteredTasks }];

    const projectMap = new Map<string, Task[]>();
    const noProjectTasks: Task[] = [];

    filteredTasks.forEach((task) => {
      if (task.projectId) {
        if (!projectMap.has(task.projectId)) projectMap.set(task.projectId, []);
        projectMap.get(task.projectId)!.push(task);
      } else {
        noProjectTasks.push(task);
      }
    });

    const groups: TaskGroup[] = [];
    projectMap.forEach((groupTasks, pid) => {
      const project = projects.find((p) => p.id === pid) ?? null;
      groups.push({ project, tasks: groupTasks });
    });

    // 프로젝트 없는 태스크는 맨 아래
    if (noProjectTasks.length > 0) {
      groups.push({ project: null, tasks: noProjectTasks });
    }

    return groups;
  }, [groupByProject, filteredTasks, projects]);

  const toggleGroupCollapse = (groupKey: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailSheetOpen(true);
  };

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted">
        <p className="text-lg">{t("today.noTasks")}</p>
        <p className="text-sm">{t("today.addTaskHint")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {taskGroups.map((group) => {
          const groupKey = group.project?.id ?? "__no_project__";
          const isCollapsed = collapsedGroups.has(groupKey);
          const completedCount = group.tasks.filter(
            (task) => task.type === "todo" ? isTodoCompleted(task) : getProgress(task) >= 100
          ).length;

          return (
            <div key={groupKey}>
              {/* Project Header (groupByProject 일 때만) */}
              {groupByProject && (
                <button
                  onClick={() => toggleGroupCollapse(groupKey)}
                  className="w-full flex items-center gap-3 mb-3 group"
                >
                  {/* 프로젝트 아이콘 & 이름 */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="flex items-center text-text-muted">
                      <FiBriefcase size={16} />
                    </span>
                    <span className="text-sm font-bold text-text truncate">
                      {group.project?.title ?? t("quest.noProject")}
                    </span>
                    {/* 완료/전체 뱃지 */}
                    <span className="flex-shrink-0 text-xs font-medium text-text-muted bg-track px-2 py-0.5 rounded-full">
                      {completedCount}/{group.tasks.length}
                    </span>
                  </div>
                  {/* 접기/펼치기 아이콘 */}
                  <span className="text-text-muted group-hover:text-text transition-colors">
                    {isCollapsed ? <FiChevronDown size={16} /> : <FiChevronUp size={16} />}
                  </span>
                </button>
              )}

              {/* Task Cards */}
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3 overflow-hidden"
                  >
                    {group.tasks.map((task, index) => (
                      <QuestTaskCard
                        key={task.id}
                        task={task}
                        index={index}
                        celebrating={celebratingTask === task.id}
                        onClick={handleTaskClick}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <QuestDetailSheet
        task={selectedTask}
        isOpen={isDetailSheetOpen}
        onClose={() => {
          setIsDetailSheetOpen(false);
          setSelectedTask(null);
        }}
      />
    </>
  );
}
