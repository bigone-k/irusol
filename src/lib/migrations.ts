import type { Goal, Project, Task } from "@/types";

/**
 * Goal 데이터 마이그레이션
 * v1 → v2: 상태, 달성수치, 보상 필드 추가
 */
export function migrateGoalData(oldGoal: Partial<Goal>): Goal {
  return {
    ...oldGoal,
    id: oldGoal.id || crypto.randomUUID(),
    title: oldGoal.title || "",
    description: oldGoal.description || "",
    completed: oldGoal.completed || false,
    createdAt: oldGoal.createdAt || new Date(),

    // 신규 필드 기본값
    status: oldGoal.status || (oldGoal.completed ? "completed" : "notStarted"),
    currentValue: oldGoal.currentValue ?? 0,
    targetValue: oldGoal.targetValue ?? 100,
    unit: oldGoal.unit || "%",
    valueHistory: oldGoal.valueHistory || [],
    rewardClaimed: oldGoal.rewardClaimed ?? false,
    rewardAmount: oldGoal.rewardAmount ?? 500,
  } as Goal;
}

/**
 * Project 데이터 마이그레이션
 * v1 → v2: 상태, 보상 필드 추가
 */
export function migrateProjectData(oldProject: Partial<Project>): Project {
  return {
    ...oldProject,
    id: oldProject.id || crypto.randomUUID(),
    goalId: oldProject.goalId || "",
    title: oldProject.title || "",
    description: oldProject.description || "",
    completed: oldProject.completed || false,
    createdAt: oldProject.createdAt || new Date(),

    // 신규 필드 기본값
    status: oldProject.status || (oldProject.completed ? "completed" : "inProgress"),
    rewardClaimed: oldProject.rewardClaimed ?? false,
    rewardAmount: oldProject.rewardAmount ?? 300,
  } as Project;
}

/**
 * Task 데이터 마이그레이션
 * v1 → v2: 빈도, 종료날짜, 보상 필드 추가
 */
export function migrateTaskData(oldTask: Partial<Task>): Task {
  return {
    ...oldTask,
    id: oldTask.id || crypto.randomUUID(),
    type: oldTask.type || "todo",
    title: oldTask.title || "",
    description: oldTask.description || "",
    completed: oldTask.completed || false,
    difficulty: oldTask.difficulty || "normal",
    createdAt: oldTask.createdAt || new Date(),

    // 신규 필드 기본값
    endDate: oldTask.endDate,
    frequencyTarget: oldTask.frequencyTarget,
    frequencyPeriod: oldTask.frequencyPeriod,
    completionCount: oldTask.completionCount ?? 0,
    rewardClaimed: oldTask.rewardClaimed ?? oldTask.completed ?? false,
  } as Task;
}

/**
 * 전체 Store 마이그레이션 헬퍼
 */
export function migrateGoalStore(state: { goals: Partial<Goal>[] }) {
  return {
    goals: state.goals.map(migrateGoalData),
  };
}

export function migrateProjectStore(state: { projects: Partial<Project>[] }) {
  return {
    projects: state.projects.map(migrateProjectData),
  };
}

export function migrateTaskStore(state: { tasks: Partial<Task>[] }) {
  return {
    tasks: state.tasks.map(migrateTaskData),
  };
}
