import { createClient } from "./client";
import type { Goal, Project, Task, Vision } from "@/types";

const hasSupabaseConfig = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function getClient() {
  if (!hasSupabaseConfig) return null;
  return createClient();
}

async function getUserId(): Promise<string | null> {
  const supabase = getClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// ============================================================
// Vision
// ============================================================

export async function syncVisionUpsert(vision: Vision) {
  const supabase = getClient();
  const userId = await getUserId();
  if (!supabase || !userId) return;

  await supabase.from("visions").upsert(
    {
      id: vision.id,
      user_id: userId,
      title: vision.title,
      description: vision.description || null,
      image_url: vision.imageUrl || null,
    },
    { onConflict: "id" }
  );
}

export async function fetchVision(): Promise<Vision | null> {
  const supabase = getClient();
  const userId = await getUserId();
  if (!supabase || !userId) return null;

  const { data } = await supabase
    .from("visions")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return {
    id: data.id,
    title: data.title,
    description: data.description || undefined,
    imageUrl: data.image_url || undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

// ============================================================
// Goals
// ============================================================

function goalToRow(goal: Goal, userId: string) {
  return {
    id: goal.id,
    user_id: userId,
    title: goal.title,
    description: goal.description || null,
    status: goal.status,
    completed: goal.completed,
    current_value: goal.currentValue,
    target_value: goal.targetValue,
    unit: goal.unit,
    season_start: goal.seasonStart
      ? new Date(goal.seasonStart).toISOString().split("T")[0]
      : null,
    season_end: goal.seasonEnd
      ? new Date(goal.seasonEnd).toISOString().split("T")[0]
      : null,
    value_history: JSON.stringify(goal.valueHistory || []),
    reward_claimed: goal.rewardClaimed,
    reward_amount: goal.rewardAmount,
    vision_id: goal.visionId || null,
  };
}

function rowToGoal(row: any): Goal {
  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    status: row.status || "notStarted",
    completed: row.completed || false,
    currentValue: Number(row.current_value) || 0,
    targetValue: Number(row.target_value) || 0,
    unit: row.unit || "%",
    seasonStart: row.season_start ? new Date(row.season_start) : undefined,
    seasonEnd: row.season_end ? new Date(row.season_end) : undefined,
    valueHistory: typeof row.value_history === "string"
      ? JSON.parse(row.value_history)
      : row.value_history || [],
    rewardClaimed: row.reward_claimed || false,
    rewardAmount: row.reward_amount || 500,
    visionId: row.vision_id || undefined,
    createdAt: new Date(row.created_at),
  };
}

export async function syncGoalInsert(goal: Goal) {
  const supabase = getClient();
  const userId = await getUserId();
  if (!supabase || !userId) return;

  // FK 보장: visionId가 있으면 해당 vision이 DB에 존재하는지 확인 후 upsert
  if (goal.visionId) {
    const { useVisionStore } = await import("@/store/useVisionStore");
    const vision = useVisionStore.getState().vision;
    if (vision && vision.id === goal.visionId) {
      await supabase.from("visions").upsert(
        {
          id: vision.id,
          user_id: userId,
          title: vision.title,
          description: vision.description || null,
          image_url: vision.imageUrl || null,
        },
        { onConflict: "id" }
      );
    }
  }

  await supabase.from("goals").upsert(goalToRow(goal, userId), { onConflict: "id" });
}

export async function syncGoalUpdate(id: string, updates: Partial<Goal>) {
  const supabase = getClient();
  if (!supabase) return;

  const row: Record<string, any> = {};
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.description !== undefined) row.description = updates.description;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.completed !== undefined) row.completed = updates.completed;
  if (updates.currentValue !== undefined) row.current_value = updates.currentValue;
  if (updates.targetValue !== undefined) row.target_value = updates.targetValue;
  if (updates.unit !== undefined) row.unit = updates.unit;
  if (updates.rewardClaimed !== undefined) row.reward_claimed = updates.rewardClaimed;
  if (updates.valueHistory !== undefined)
    row.value_history = JSON.stringify(updates.valueHistory);

  if (Object.keys(row).length === 0) return;
  await supabase.from("goals").update(row).eq("id", id);
}

export async function syncGoalDelete(id: string) {
  const supabase = getClient();
  if (!supabase) return;
  await supabase
    .from("goals")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
}

export async function fetchGoals(): Promise<Goal[]> {
  const supabase = getClient();
  const userId = await getUserId();
  if (!supabase || !userId) return [];

  const { data } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  return (data || []).map(rowToGoal);
}

// ============================================================
// Projects
// ============================================================

function projectToRow(project: Project, userId: string) {
  return {
    id: project.id,
    user_id: userId,
    goal_id: project.goalId || null,
    title: project.title,
    description: project.description || null,
    status: project.status,
    completed: project.completed,
    reward: project.reward || null,
    start_date: project.startDate
      ? new Date(project.startDate).toISOString().split("T")[0]
      : null,
    end_date: project.endDate
      ? new Date(project.endDate).toISOString().split("T")[0]
      : null,
    reward_claimed: project.rewardClaimed,
    reward_amount: project.rewardAmount,
  };
}

function rowToProject(row: any): Project {
  return {
    id: row.id,
    goalId: row.goal_id || "",
    title: row.title,
    description: row.description || "",
    status: row.status || "notStarted",
    completed: row.completed || false,
    reward: row.reward || undefined,
    startDate: row.start_date ? new Date(row.start_date) : undefined,
    endDate: row.end_date ? new Date(row.end_date) : undefined,
    rewardClaimed: row.reward_claimed || false,
    rewardAmount: row.reward_amount || 300,
    createdAt: new Date(row.created_at),
  };
}

export async function syncProjectInsert(project: Project) {
  const supabase = getClient();
  const userId = await getUserId();
  if (!supabase || !userId) return;

  // FK 보장: goalId가 있으면 해당 goal을 먼저 upsert
  if (project.goalId) {
    const { useGoalStore } = await import("@/store/useGoalStore");
    const goal = useGoalStore.getState().goals.find((g) => g.id === project.goalId);
    if (goal) {
      await supabase.from("goals").upsert(goalToRow(goal, userId), { onConflict: "id" });
    }
  }

  await supabase.from("projects").upsert(projectToRow(project, userId), { onConflict: "id" });
}

export async function syncProjectUpdate(
  id: string,
  updates: Partial<Project>
) {
  const supabase = getClient();
  if (!supabase) return;

  const row: Record<string, any> = {};
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.description !== undefined) row.description = updates.description;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.completed !== undefined) row.completed = updates.completed;
  if (updates.rewardClaimed !== undefined) row.reward_claimed = updates.rewardClaimed;
  if (updates.goalId !== undefined) row.goal_id = updates.goalId;

  if (Object.keys(row).length === 0) return;
  await supabase.from("projects").update(row).eq("id", id);
}

export async function syncProjectDelete(id: string) {
  const supabase = getClient();
  if (!supabase) return;
  await supabase
    .from("projects")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
}

export async function fetchProjects(): Promise<Project[]> {
  const supabase = getClient();
  const userId = await getUserId();
  if (!supabase || !userId) return [];

  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  return (data || []).map(rowToProject);
}

// ============================================================
// Tasks
// ============================================================

function taskToRow(task: Task, userId: string) {
  return {
    id: task.id,
    user_id: userId,
    goal_id: task.goalId || null,
    project_id: task.projectId || null,
    type: task.type,
    title: task.title,
    description: task.description || null,
    completed: task.completed,
    streak: task.streak || 0,
    frequency: task.frequency || [],
    frequency_target: task.frequencyTarget || null,
    frequency_period: task.frequencyPeriod || null,
    completion_count: task.completionCount || 0,
    completed_dates: task.completedDates || [],
    start_date: task.startDate
      ? new Date(task.startDate).toISOString().split("T")[0]
      : null,
    end_date: task.endDate
      ? new Date(task.endDate).toISOString().split("T")[0]
      : null,
    due_date: task.dueDate
      ? new Date(task.dueDate).toISOString().split("T")[0]
      : null,
    reward_claimed: task.rewardClaimed,
  };
}

function rowToTask(row: any): Task {
  return {
    id: row.id,
    type: row.type || "todo",
    title: row.title,
    description: row.description || "",
    completed: row.completed || false,
    streak: row.streak || 0,
    goalId: row.goal_id || undefined,
    projectId: row.project_id || undefined,
    frequency: row.frequency || undefined,
    frequencyTarget: row.frequency_target || undefined,
    frequencyPeriod: row.frequency_period || undefined,
    completionCount: row.completion_count || 0,
    completedDates: row.completed_dates || [],
    startDate: row.start_date ? new Date(row.start_date) : undefined,
    endDate: row.end_date ? new Date(row.end_date) : undefined,
    dueDate: row.due_date ? new Date(row.due_date) : undefined,
    rewardClaimed: row.reward_claimed || false,
    createdAt: new Date(row.created_at),
  };
}

export async function syncTaskInsert(task: Task) {
  const supabase = getClient();
  const userId = await getUserId();
  if (!supabase || !userId) return;

  // FK 보장: goalId → goal upsert, projectId → project upsert (순서 중요)
  if (task.goalId) {
    const { useGoalStore } = await import("@/store/useGoalStore");
    const goal = useGoalStore.getState().goals.find((g) => g.id === task.goalId);
    if (goal) {
      await supabase.from("goals").upsert(goalToRow(goal, userId), { onConflict: "id" });
    }
  }

  if (task.projectId) {
    const { useProjectStore } = await import("@/store/useProjectStore");
    const project = useProjectStore.getState().projects.find((p) => p.id === task.projectId);
    if (project) {
      await supabase.from("projects").upsert(projectToRow(project, userId), { onConflict: "id" });
    }
  }

  await supabase.from("tasks").upsert(taskToRow(task, userId), { onConflict: "id" });
}

export async function syncTaskUpdate(id: string, updates: Partial<Task>) {
  const supabase = getClient();
  if (!supabase) return;

  const row: Record<string, any> = {};
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.description !== undefined) row.description = updates.description;
  if (updates.completed !== undefined) row.completed = updates.completed;
  if (updates.completedDates !== undefined) row.completed_dates = updates.completedDates;
  if (updates.completionCount !== undefined) row.completion_count = updates.completionCount;
  if (updates.rewardClaimed !== undefined) row.reward_claimed = updates.rewardClaimed;
  if (updates.streak !== undefined) row.streak = updates.streak;
  if (updates.type !== undefined) row.type = updates.type;

  if (Object.keys(row).length === 0) return;
  await supabase.from("tasks").update(row).eq("id", id);
}

export async function syncTaskDelete(id: string) {
  const supabase = getClient();
  if (!supabase) return;
  await supabase
    .from("tasks")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
}

export async function fetchTasks(): Promise<Task[]> {
  const supabase = getClient();
  const userId = await getUserId();
  if (!supabase || !userId) return [];

  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  return (data || []).map(rowToTask);
}

// ============================================================
// Bulk fetch — 앱 시작 시 한번에 로드
// ============================================================

export async function fetchAllData() {
  const [vision, goals, projects, tasks] = await Promise.all([
    fetchVision(),
    fetchGoals(),
    fetchProjects(),
    fetchTasks(),
  ]);
  return { vision, goals, projects, tasks };
}

// ============================================================
// 순차 sync — 온보딩 등 배치 생성 시 FK 순서 보장
// Vision → Goals → Projects → Tasks 순서로 upsert
// ============================================================

export async function syncAllStoresInOrder(data: {
  vision: Vision | null;
  goals: Goal[];
  projects: Project[];
  tasks: Task[];
}) {
  const supabase = getClient();
  const userId = await getUserId();
  if (!supabase || !userId) return;

  // 1. Vision
  if (data.vision) {
    await supabase.from("visions").upsert(
      {
        id: data.vision.id,
        user_id: userId,
        title: data.vision.title,
        description: data.vision.description || null,
        image_url: data.vision.imageUrl || null,
      },
      { onConflict: "id" }
    );
  }

  // 2. Goals (순차)
  for (const goal of data.goals) {
    await supabase.from("goals").upsert(goalToRow(goal, userId), {
      onConflict: "id",
    });
  }

  // 3. Projects (순차 — goal_id FK 보장)
  for (const project of data.projects) {
    await supabase.from("projects").upsert(projectToRow(project, userId), {
      onConflict: "id",
    });
  }

  // 4. Tasks (순차 — goal_id, project_id FK 보장)
  for (const task of data.tasks) {
    await supabase.from("tasks").upsert(taskToRow(task, userId), {
      onConflict: "id",
    });
  }
}
