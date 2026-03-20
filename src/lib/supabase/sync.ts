import { createClient } from "./client";
import type { Goal, Project, Task, Vision, PlayerStats, StageName } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";

// ============================================================
// Supabase context — client + userId 캐싱 (세션당 1회 auth 호출)
// ============================================================

const hasSupabaseConfig = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

let cachedClient: SupabaseClient | null = null;
let cachedUserId: string | null = null;
let userIdPromise: Promise<string | null> | null = null;

function getClient(): SupabaseClient | null {
  if (!hasSupabaseConfig) return null;
  if (!cachedClient) cachedClient = createClient();
  return cachedClient;
}

async function getUserId(): Promise<string | null> {
  if (cachedUserId) return cachedUserId;
  if (userIdPromise) return userIdPromise;

  const supabase = getClient();
  if (!supabase) return null;

  userIdPromise = supabase.auth.getUser().then(({ data: { user } }) => {
    cachedUserId = user?.id ?? null;
    userIdPromise = null;
    return cachedUserId;
  });
  return userIdPromise;
}

/** auth 상태 변경 시 (로그인/로그아웃) 캐시 초기화 */
export function clearSyncCache() {
  cachedUserId = null;
  userIdPromise = null;
}

type SyncContext = { supabase: SupabaseClient; userId: string };

async function getContext(): Promise<SyncContext | null> {
  const supabase = getClient();
  const userId = await getUserId();
  if (!supabase || !userId) return null;
  return { supabase, userId };
}

// ============================================================
// Row ↔ Model 변환
// ============================================================

function toDateStr(d: Date | string | undefined | null): string | null {
  if (!d) return null;
  return new Date(d).toISOString().split("T")[0];
}

function visionToRow(vision: Vision, userId: string) {
  return {
    id: vision.id,
    user_id: userId,
    title: vision.title,
    description: vision.description || null,
    image_url: vision.imageUrl || null,
  };
}

function rowToVision(row: any): Vision {
  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    imageUrl: row.image_url || undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

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
    valueHistory:
      typeof row.value_history === "string"
        ? JSON.parse(row.value_history)
        : row.value_history || [],
    rewardClaimed: row.reward_claimed || false,
    rewardAmount: row.reward_amount || 500,
    visionId: row.vision_id || undefined,
    createdAt: new Date(row.created_at),
  };
}

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
    rewardClaimed: row.reward_claimed || false,
    rewardAmount: row.reward_amount || 300,
    createdAt: new Date(row.created_at),
  };
}

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
    start_date: toDateStr(task.startDate),
    end_date: toDateStr(task.endDate),
    due_date: toDateStr(task.dueDate),
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

// ============================================================
// PlayerStats CRUD
// ============================================================

interface PlayerStatsRow {
  level: number;
  experience: number;
  max_experience: number;
  coins: number;
  stage: string;
  hp: number;
  max_hp: number;
  today_earned_xp: number;
  today_earned_coins: number;
  today_date: string;
  last_visit_at: string;
}

function playerStatsToRow(stats: PlayerStats & {
  todayEarnedXP?: number;
  todayEarnedCoins?: number;
  todayDate?: string;
  lastVisitAt?: string;
}): Partial<PlayerStatsRow> {
  return {
    level: stats.level,
    experience: stats.experience,
    max_experience: stats.maxExperience,
    coins: stats.coins,
    stage: stats.stage,
    hp: stats.hp,
    max_hp: stats.maxHp,
    today_earned_xp: stats.todayEarnedXP ?? 0,
    today_earned_coins: stats.todayEarnedCoins ?? 0,
    today_date: stats.todayDate ?? "",
    last_visit_at: stats.lastVisitAt || new Date().toISOString(),
  };
}

function rowToPlayerStats(row: any): PlayerStats & {
  todayEarnedXP: number;
  todayEarnedCoins: number;
  todayDate: string;
  lastVisitAt: string;
} {
  return {
    level: row.level || 1,
    experience: row.experience || 0,
    maxExperience: row.max_experience || 100,
    coins: row.coins || 0,
    stage: (row.stage || "egg") as StageName,
    hp: row.hp ?? 50,
    maxHp: row.max_hp ?? 50,
    todayEarnedXP: row.today_earned_xp || 0,
    todayEarnedCoins: row.today_earned_coins || 0,
    todayDate: row.today_date || "",
    lastVisitAt: row.last_visit_at || "",
  };
}

export async function syncPlayerStatsUpdate(updates: Partial<PlayerStatsRow>) {
  const ctx = await getContext();
  if (!ctx) return;
  const { error } = await ctx.supabase
    .from("player_stats")
    .update(updates)
    .eq("user_id", ctx.userId);
  if (error) console.error("[sync] player_stats update failed:", error);
}

export async function syncPlayerStatsFull(stats: PlayerStats & {
  todayEarnedXP?: number;
  todayEarnedCoins?: number;
  todayDate?: string;
  lastVisitAt?: string;
}) {
  const ctx = await getContext();
  if (!ctx) return;
  const { error } = await ctx.supabase
    .from("player_stats")
    .update(playerStatsToRow(stats))
    .eq("user_id", ctx.userId);
  if (error) console.error("[sync] player_stats full update failed:", error);
}

export async function fetchPlayerStats(): Promise<ReturnType<typeof rowToPlayerStats> | null> {
  const ctx = await getContext();
  if (!ctx) return null;
  const { data } = await ctx.supabase
    .from("player_stats")
    .select("*")
    .eq("user_id", ctx.userId)
    .maybeSingle();
  return data ? rowToPlayerStats(data) : null;
}

// ============================================================
// Vision CRUD
// ============================================================

export async function syncVisionUpsert(vision: Vision) {
  const ctx = await getContext();
  if (!ctx) return;
  await ctx.supabase
    .from("visions")
    .upsert(visionToRow(vision, ctx.userId), { onConflict: "id" });
}

export async function fetchVision(): Promise<Vision | null> {
  const ctx = await getContext();
  if (!ctx) return null;

  const { data } = await ctx.supabase
    .from("visions")
    .select("*")
    .eq("user_id", ctx.userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data ? rowToVision(data) : null;
}

// ============================================================
// Goal CRUD
// ============================================================

export async function syncGoalInsert(
  goal: Goal,
  parentVision?: Vision | null
) {
  const ctx = await getContext();
  if (!ctx) return;

  // FK 보장: vision이 있으면 먼저 upsert
  if (goal.visionId && parentVision) {
    await ctx.supabase
      .from("visions")
      .upsert(visionToRow(parentVision, ctx.userId), { onConflict: "id" });
  }

  await ctx.supabase
    .from("goals")
    .upsert(goalToRow(goal, ctx.userId), { onConflict: "id" });
}

export async function syncGoalUpdate(id: string, updates: Partial<Goal>) {
  const ctx = await getContext();
  if (!ctx) return;

  const row: Record<string, any> = {};
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.description !== undefined) row.description = updates.description;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.completed !== undefined) row.completed = updates.completed;
  if (updates.currentValue !== undefined) row.current_value = updates.currentValue;
  if (updates.targetValue !== undefined) row.target_value = updates.targetValue;
  if (updates.unit !== undefined) row.unit = updates.unit;
  if (updates.rewardClaimed !== undefined) row.reward_claimed = updates.rewardClaimed;
  if (updates.rewardAmount !== undefined) row.reward_amount = updates.rewardAmount;
  if (updates.visionId !== undefined) row.vision_id = updates.visionId;
  if (updates.valueHistory !== undefined)
    row.value_history = JSON.stringify(updates.valueHistory);

  if (Object.keys(row).length === 0) return;
  const { error } = await ctx.supabase.from("goals").update(row).eq("id", id);
  if (error) console.error("[sync] goal update failed:", id, error);
}

export async function syncGoalDelete(id: string) {
  const ctx = await getContext();
  if (!ctx) { console.warn("[sync] goal delete skipped: no auth context"); return; }
  const { error, count } = await ctx.supabase
    .from("goals")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", ctx.userId);
  if (error) console.error("[sync] goal delete failed:", id, error);
  else console.log("[sync] goal deleted:", id, "affected:", count);
}

export async function fetchGoals(): Promise<Goal[]> {
  const ctx = await getContext();
  if (!ctx) return [];

  const { data } = await ctx.supabase
    .from("goals")
    .select("*")
    .eq("user_id", ctx.userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  return (data || []).map(rowToGoal);
}

// ============================================================
// Project CRUD
// ============================================================

export async function syncProjectInsert(
  project: Project,
  parentGoal?: Goal | null
) {
  const ctx = await getContext();
  if (!ctx) return;

  // FK 보장: goal이 있으면 먼저 upsert
  if (project.goalId && parentGoal) {
    await ctx.supabase
      .from("goals")
      .upsert(goalToRow(parentGoal, ctx.userId), { onConflict: "id" });
  }

  await ctx.supabase
    .from("projects")
    .upsert(projectToRow(project, ctx.userId), { onConflict: "id" });
}

export async function syncProjectUpdate(id: string, updates: Partial<Project>) {
  const ctx = await getContext();
  if (!ctx) return;

  const row: Record<string, any> = {};
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.description !== undefined) row.description = updates.description;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.completed !== undefined) row.completed = updates.completed;
  if (updates.rewardClaimed !== undefined) row.reward_claimed = updates.rewardClaimed;
  if (updates.rewardAmount !== undefined) row.reward_amount = updates.rewardAmount;
  if (updates.reward !== undefined) row.reward = updates.reward;
  if (updates.goalId !== undefined) row.goal_id = updates.goalId;

  if (Object.keys(row).length === 0) return;
  const { error } = await ctx.supabase.from("projects").update(row).eq("id", id);
  if (error) console.error("[sync] project update failed:", id, error);
}

export async function syncProjectDelete(id: string) {
  const ctx = await getContext();
  if (!ctx) { console.warn("[sync] project delete skipped: no auth context"); return; }
  const { error, count } = await ctx.supabase
    .from("projects")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", ctx.userId);
  if (error) console.error("[sync] project delete failed:", id, error);
  else console.log("[sync] project deleted:", id, "affected:", count);
}

export async function fetchProjects(): Promise<Project[]> {
  const ctx = await getContext();
  if (!ctx) return [];

  const { data } = await ctx.supabase
    .from("projects")
    .select("*")
    .eq("user_id", ctx.userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  return (data || []).map(rowToProject);
}

// ============================================================
// Task CRUD
// ============================================================

export async function syncTaskInsert(
  task: Task,
  parents?: { goal?: Goal | null; project?: Project | null }
) {
  const ctx = await getContext();
  if (!ctx) return;

  // FK 보장: goal → project 순서로 upsert
  if (task.goalId && parents?.goal) {
    await ctx.supabase
      .from("goals")
      .upsert(goalToRow(parents.goal, ctx.userId), { onConflict: "id" });
  }
  if (task.projectId && parents?.project) {
    await ctx.supabase
      .from("projects")
      .upsert(projectToRow(parents.project, ctx.userId), { onConflict: "id" });
  }

  await ctx.supabase
    .from("tasks")
    .upsert(taskToRow(task, ctx.userId), { onConflict: "id" });
}

export async function syncTaskUpdate(id: string, updates: Partial<Task>) {
  const ctx = await getContext();
  if (!ctx) return;

  const row: Record<string, any> = {};
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.description !== undefined) row.description = updates.description;
  if (updates.completed !== undefined) row.completed = updates.completed;
  if (updates.completedDates !== undefined) row.completed_dates = updates.completedDates;
  if (updates.completionCount !== undefined) row.completion_count = updates.completionCount;
  if (updates.rewardClaimed !== undefined) row.reward_claimed = updates.rewardClaimed;
  if (updates.streak !== undefined) row.streak = updates.streak;
  if (updates.type !== undefined) row.type = updates.type;
  if (updates.frequency !== undefined) row.frequency = updates.frequency;
  if (updates.frequencyTarget !== undefined) row.frequency_target = updates.frequencyTarget;
  if (updates.frequencyPeriod !== undefined) row.frequency_period = updates.frequencyPeriod;
  if (updates.startDate !== undefined) row.start_date = toDateStr(updates.startDate);
  if (updates.endDate !== undefined) row.end_date = toDateStr(updates.endDate);
  if (updates.dueDate !== undefined) row.due_date = toDateStr(updates.dueDate);

  if (Object.keys(row).length === 0) return;
  const { error } = await ctx.supabase.from("tasks").update(row).eq("id", id);
  if (error) console.error("[sync] task update failed:", id, error);
}

export async function syncTaskDelete(id: string) {
  const ctx = await getContext();
  if (!ctx) { console.warn("[sync] task delete skipped: no auth context"); return; }
  const { error, count } = await ctx.supabase
    .from("tasks")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", ctx.userId);
  if (error) console.error("[sync] task delete failed:", id, error);
  else console.log("[sync] task deleted:", id, "affected:", count);
}

export async function fetchTasks(): Promise<Task[]> {
  const ctx = await getContext();
  if (!ctx) return [];

  const { data } = await ctx.supabase
    .from("tasks")
    .select("*")
    .eq("user_id", ctx.userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  return (data || []).map(rowToTask);
}

// ============================================================
// Bulk fetch — 앱 시작 시 한번에 로드 (4개 병렬)
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
// 순차 batch sync — FK 순서 보장 + 같은 테이블은 batch upsert
// ============================================================

export async function syncAllStoresInOrder(data: {
  vision: Vision | null;
  goals: Goal[];
  projects: Project[];
  tasks: Task[];
}) {
  const ctx = await getContext();
  if (!ctx) return;

  const { supabase, userId } = ctx;

  if (data.vision) {
    await supabase
      .from("visions")
      .upsert(visionToRow(data.vision, userId), { onConflict: "id" });
  }

  if (data.goals.length > 0) {
    await supabase
      .from("goals")
      .upsert(
        data.goals.map((g) => goalToRow(g, userId)),
        { onConflict: "id" }
      );
  }

  if (data.projects.length > 0) {
    await supabase
      .from("projects")
      .upsert(
        data.projects.map((p) => projectToRow(p, userId)),
        { onConflict: "id" }
      );
  }

  if (data.tasks.length > 0) {
    await supabase
      .from("tasks")
      .upsert(
        data.tasks.map((t) => taskToRow(t, userId)),
        { onConflict: "id" }
      );
  }
}
