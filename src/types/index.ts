// Evolution Stage Types
export type StageName = "egg" | "sproutling" | "blooming" | "fullyGrown";

export interface EvolutionStage {
  stage: StageName;
  requiredLevel: number;
}

// Player Types
export interface PlayerStats {
  level: number;
  experience: number;
  maxExperience: number;
  coins: number;
  stage: StageName;
}

// Difficulty & Reward Types
export type Difficulty = "easy" | "normal" | "hard";

export interface RewardResult {
  exp: number;
  coins: number;
  leveledUp: boolean;
  evolved: boolean;
  newLevel?: number;
  newStage?: StageName;
}

// Task Types
export interface TaskRecurrence {
  type: "daily" | "weekly" | "custom";
  daysOfWeek?: number[]; // 0=Sunday, 6=Saturday
  interval?: number;
}

export interface TaskReminder {
  enabled: boolean;
  time?: string; // HH:MM format
}

export interface Task {
  id: string;
  type: "habit" | "todo";
  title: string;
  description: string;
  completed: boolean;
  difficulty: Difficulty;
  streak?: number;
  createdAt: Date;
  goalId?: string;
  projectId?: string;
  recurrence?: TaskRecurrence;
  targetDays?: number;
  reminder?: TaskReminder;

  // Period fields
  startDate?: Date; // Habit: 시작일
  endDate?: Date; // Habit: 종료일
  dueDate?: Date; // Todo: 특정일자
  frequency?: number[]; // Habit: 빈도 (0=일, 1=월, 2=화, 3=수, 4=목, 5=금, 6=토)

  // Completion tracking
  frequencyTarget?: number;
  frequencyPeriod?: "daily" | "weekly" | "monthly";
  completionCount?: number;
  rewardClaimed: boolean;
}

// Vision Type
export interface Vision {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Status Types
export type GoalStatus = "notStarted" | "inProgress" | "completed";
export type ProjectStatus = "notStarted" | "inProgress" | "completed";

// Value Change History
export interface ValueChange {
  id: string;
  timestamp: Date;
  previousValue: number;
  newValue: number;
  change: number; // +/- 변화량
}

// Goal & Project Types
export interface Goal {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  visionId?: string;
  seasonStart?: Date;
  seasonEnd?: Date;

  // 신규 필드
  status: GoalStatus;
  currentValue: number;
  targetValue: number;
  unit: string;
  valueHistory?: ValueChange[];
  rewardClaimed: boolean;
  rewardAmount: number;
}

export interface Project {
  id: string;
  goalId: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  reward?: number;
  startDate?: Date;
  endDate?: Date;
  difficulty?: "Easy" | "Normal" | "Hard";

  // 신규 필드
  status: ProjectStatus;
  rewardClaimed: boolean;
  rewardAmount: number;
}

// Objective Types
export interface Objective {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  reward: number;
}

// Statistics Types
export interface DailyStats {
  totalTasks: number;
  completedTasks: number;
  totalExp: number;
  totalCoins: number;
}

// Navigation Types
export type TabType = "habits" | "todos" | "rewards" | "social";
