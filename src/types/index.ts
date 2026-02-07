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
}

// Goal & Project Types
export interface Goal {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
}

export interface Project {
  id: string;
  goalId: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
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
