import { createClient } from "./client";
import type { Goal, Project, Task, Vision, PlayerStats, StageName } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { withPerfLog, logPerf } from "@/lib/perfLogger";

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
// Tracked helpers — getContext + withPerfLog + error handling 공통화
// ============================================================

/** Write 작업: getContext → withPerfLog(sync-write) → catch */
async function trackedWrite(
  operation: string,
  table: string,
  method: string,
  fn: (ctx: SyncContext) => Promise<void>,
) {
  const ctx = await getContext();
  if (!ctx) return;
  await withPerfLog(
    { category: 'sync-write', operation, table_name: table, method, context: 'sync.ts', user_id: ctx.userId },
    () => fn(ctx),
  ).catch((e) => console.error(`[sync] ${operation} failed:`, e));
}

/** Read 작업: getContext → withPerfLog(sync-read) → fallback */
async function trackedRead<T>(
  operation: string,
  table: string,
  fallback: T,
  fn: (ctx: SyncContext) => Promise<T>,
): Promise<T> {
  const ctx = await getContext();
  if (!ctx) return fallback;
  return withPerfLog(
    { category: 'sync-read', operation, table_name: table, method: 'select', context: 'sync.ts', user_id: ctx.userId },
    () => fn(ctx),
  );
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
  return trackedWrite('syncPlayerStatsUpdate', 'player_stats', 'update', async ({ supabase, userId }) => {
    const { error } = await supabase.from("player_stats").update(updates).eq("user_id", userId);
    if (error) throw error;
  });
}

export async function syncPlayerStatsFull(stats: PlayerStats & {
  todayEarnedXP?: number;
  todayEarnedCoins?: number;
  todayDate?: string;
  lastVisitAt?: string;
}) {
  return trackedWrite('syncPlayerStatsFull', 'player_stats', 'update', async ({ supabase, userId }) => {
    const { error } = await supabase.from("player_stats").update(playerStatsToRow(stats)).eq("user_id", userId);
    if (error) throw error;
  });
}

export function fetchPlayerStats(): Promise<ReturnType<typeof rowToPlayerStats> | null> {
  return trackedRead('fetchPlayerStats', 'player_stats', null, async ({ supabase, userId }) => {
    const { data } = await supabase.from("player_stats").select("*").eq("user_id", userId).maybeSingle();
    return data ? rowToPlayerStats(data) : null;
  });
}

// ============================================================
// Vision CRUD
// ============================================================

export async function syncVisionUpsert(vision: Vision) {
  return trackedWrite('syncVisionUpsert', 'visions', 'upsert', async ({ supabase, userId }) => {
    const { error } = await supabase.from("visions").upsert(visionToRow(vision, userId), { onConflict: "id" });
    if (error) throw error;
  });
}

export function fetchVision(): Promise<Vision | null> {
  return trackedRead('fetchVision', 'visions', null, async ({ supabase, userId }) => {
    const { data } = await supabase
      .from("visions").select("*").eq("user_id", userId)
      .is("deleted_at", null).order("created_at", { ascending: false }).limit(1).maybeSingle();
    return data ? rowToVision(data) : null;
  });
}

// ============================================================
// Goal CRUD
// ============================================================

export async function syncGoalInsert(goal: Goal, parentVision?: Vision | null) {
  return trackedWrite('syncGoalInsert', 'goals', 'upsert', async ({ supabase, userId }) => {
    if (goal.visionId && parentVision) {
      await supabase.from("visions").upsert(visionToRow(parentVision, userId), { onConflict: "id" });
    }
    const { error } = await supabase.from("goals").upsert(goalToRow(goal, userId), { onConflict: "id" });
    if (error) throw error;
  });
}

export async function syncGoalUpdate(id: string, updates: Partial<Goal>) {
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
  if (updates.valueHistory !== undefined) row.value_history = JSON.stringify(updates.valueHistory);
  if (Object.keys(row).length === 0) return;

  return trackedWrite('syncGoalUpdate', 'goals', 'update', async ({ supabase }) => {
    const { error } = await supabase.from("goals").update(row).eq("id", id);
    if (error) throw error;
  });
}

export async function syncGoalDelete(id: string) {
  return trackedWrite('syncGoalDelete', 'goals', 'delete', async ({ supabase, userId }) => {
    const { error } = await supabase
      .from("goals").update({ deleted_at: new Date().toISOString() }).eq("id", id).eq("user_id", userId);
    if (error) throw error;
  });
}

export function fetchGoals(): Promise<Goal[]> {
  return trackedRead('fetchGoals', 'goals', [], async ({ supabase, userId }) => {
    const { data } = await supabase
      .from("goals").select("*").eq("user_id", userId).is("deleted_at", null).order("created_at", { ascending: true });
    return (data || []).map(rowToGoal);
  });
}

// ============================================================
// Project CRUD
// ============================================================

export async function syncProjectInsert(project: Project, parentGoal?: Goal | null) {
  return trackedWrite('syncProjectInsert', 'projects', 'upsert', async ({ supabase, userId }) => {
    if (project.goalId && parentGoal) {
      await supabase.from("goals").upsert(goalToRow(parentGoal, userId), { onConflict: "id" });
    }
    const { error } = await supabase.from("projects").upsert(projectToRow(project, userId), { onConflict: "id" });
    if (error) throw error;
  });
}

export async function syncProjectUpdate(id: string, updates: Partial<Project>) {
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

  return trackedWrite('syncProjectUpdate', 'projects', 'update', async ({ supabase }) => {
    const { error } = await supabase.from("projects").update(row).eq("id", id);
    if (error) throw error;
  });
}

export async function syncProjectDelete(id: string) {
  return trackedWrite('syncProjectDelete', 'projects', 'delete', async ({ supabase, userId }) => {
    const { error } = await supabase
      .from("projects").update({ deleted_at: new Date().toISOString() }).eq("id", id).eq("user_id", userId);
    if (error) throw error;
  });
}

export function fetchProjects(): Promise<Project[]> {
  return trackedRead('fetchProjects', 'projects', [], async ({ supabase, userId }) => {
    const { data } = await supabase
      .from("projects").select("*").eq("user_id", userId).is("deleted_at", null).order("created_at", { ascending: true });
    return (data || []).map(rowToProject);
  });
}

// ============================================================
// Task CRUD
// ============================================================

export async function syncTaskInsert(
  task: Task,
  parents?: { goal?: Goal | null; project?: Project | null }
) {
  return trackedWrite('syncTaskInsert', 'tasks', 'upsert', async ({ supabase, userId }) => {
    if (task.goalId && parents?.goal) {
      await supabase.from("goals").upsert(goalToRow(parents.goal, userId), { onConflict: "id" });
    }
    if (task.projectId && parents?.project) {
      await supabase.from("projects").upsert(projectToRow(parents.project, userId), { onConflict: "id" });
    }
    const { error } = await supabase.from("tasks").upsert(taskToRow(task, userId), { onConflict: "id" });
    if (error) throw error;
  });
}

export async function syncTaskUpdate(id: string, updates: Partial<Task>) {
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

  return trackedWrite('syncTaskUpdate', 'tasks', 'update', async ({ supabase }) => {
    const { error } = await supabase.from("tasks").update(row).eq("id", id);
    if (error) throw error;
  });
}

export async function syncTaskDelete(id: string) {
  return trackedWrite('syncTaskDelete', 'tasks', 'delete', async ({ supabase, userId }) => {
    const { error } = await supabase
      .from("tasks").update({ deleted_at: new Date().toISOString() }).eq("id", id).eq("user_id", userId);
    if (error) throw error;
  });
}

export function fetchTasks(): Promise<Task[]> {
  return trackedRead('fetchTasks', 'tasks', [], async ({ supabase, userId }) => {
    const { data } = await supabase
      .from("tasks").select("*").eq("user_id", userId).is("deleted_at", null).order("created_at", { ascending: true });
    return (data || []).map(rowToTask);
  });
}

// ============================================================
// Bulk fetch — 앱 시작 시 한번에 로드 (4개 병렬)
// ============================================================

export async function fetchAllData() {
  const start = performance.now();
  const [vision, goals, projects, tasks] = await Promise.all([
    fetchVision(),
    fetchGoals(),
    fetchProjects(),
    fetchTasks(),
  ]);
  const duration_ms = Math.round(performance.now() - start);
  logPerf({
    category: 'sync-read', operation: 'fetchAllData', method: 'select',
    duration_ms, status: 'success', context: 'sync.ts',
    metadata: { goals: goals.length, projects: projects.length, tasks: tasks.length },
  });
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
  return trackedWrite('syncAllStoresInOrder', 'all', 'upsert', async ({ supabase, userId }) => {
    if (data.vision) {
      await supabase.from("visions").upsert(visionToRow(data.vision, userId), { onConflict: "id" });
    }
    if (data.goals.length > 0) {
      await supabase.from("goals").upsert(data.goals.map((g) => goalToRow(g, userId)), { onConflict: "id" });
    }
    if (data.projects.length > 0) {
      await supabase.from("projects").upsert(data.projects.map((p) => projectToRow(p, userId)), { onConflict: "id" });
    }
    if (data.tasks.length > 0) {
      await supabase.from("tasks").upsert(data.tasks.map((t) => taskToRow(t, userId)), { onConflict: "id" });
    }
  });
}
