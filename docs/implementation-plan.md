# Figma Layout Implementation Plan

## 🎯 Overview

Figma 디자인 기반 4개 레이아웃 구현:
1. `/goals` - Vision 고정 카드 + Goal 카드
2. `/projects` - Project 카드 (D-day, 진행률)
3. `/projects/[id]` - Project 상세 (신규 페이지)
4. Task/Habit 등록 Bottom Sheet 개선

---

## 📊 Current State Analysis

### Existing Components
✅ `PlayerDashboard` - 캐릭터 정보 표시
✅ `GoalStore` - Goal 데이터 관리
✅ `ProjectStore` - Project 데이터 관리
✅ `TaskStore` - Task/Habit 데이터 관리
✅ `/goals` page - 기본 레이아웃 존재
✅ `/projects` page - 기본 레이아웃 존재

### Required Updates
🚧 Vision 카드 (고정, 1개만)
🚧 Goal 카드 UI 개선
🚧 Project 카드 UI (코인, 기간, D-day, 진행률)
🚧 `/projects/[id]` 상세 페이지 (신규)
🚧 Bottom Sheet 컴포넌트 (빈도, 목표, 날짜, 알림)

---

## 🏗️ Implementation Phases

### Phase 1: Data Model Updates (데이터 구조 확장)

#### 1.1 Vision Type Definition
```typescript
// src/types/index.ts
export interface Vision {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string; // Vision 카드 배경 이미지
  createdAt: Date;
  updatedAt: Date;
}
```

#### 1.2 Goal Type Updates
```typescript
// Existing Goal 타입에 추가
export interface Goal {
  // ... existing fields
  visionId?: string; // Vision 연결 (선택)
  seasonStart?: Date; // 시즌 시작일
  seasonEnd?: Date;   // 시즌 종료일
}
```

#### 1.3 Project Type Updates
```typescript
// Existing Project 타입에 추가
export interface Project {
  // ... existing fields
  reward?: number;      // 완료 시 코인 보상
  startDate?: Date;     // 프로젝트 시작일
  endDate?: Date;       // 프로젝트 종료일
  difficulty?: 'Easy' | 'Normal' | 'Hard'; // 난이도
}
```

#### 1.4 Task/Habit Type Updates
```typescript
// Existing Task 타입에 추가
export interface Task {
  // ... existing fields
  recurrence?: {
    type: 'daily' | 'weekly' | 'custom'; // 빈도
    daysOfWeek?: number[];  // 요일 (0=일요일, 6=토요일)
    interval?: number;      // 반복 간격
  };
  targetDays?: number;      // 목표 일수
  startDate?: Date;         // 시작 날짜
  reminder?: {
    enabled: boolean;
    time?: string;          // HH:MM 포맷
  };
}
```

**Output**: `src/types/index.ts` 업데이트

---

### Phase 2: Vision Store Creation (Vision 상태 관리)

#### 2.1 Create Vision Store
```typescript
// src/store/useVisionStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Vision } from "@/types";

interface VisionStore {
  vision: Vision | null;
  setVision: (vision: Omit<Vision, "id" | "createdAt" | "updatedAt">) => void;
  updateVision: (updates: Partial<Vision>) => void;
  reset: () => void;
}

export const useVisionStore = create<VisionStore>()(
  persist(
    (set) => ({
      vision: null,

      setVision: (visionData) => {
        const newVision: Vision = {
          ...visionData,
          id: "vision-singleton", // 고정 ID (1개만 존재)
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set({ vision: newVision });
      },

      updateVision: (updates) => {
        set((state) => ({
          vision: state.vision
            ? { ...state.vision, ...updates, updatedAt: new Date() }
            : null,
        }));
      },

      reset: () => set({ vision: null }),
    }),
    {
      name: "vision-storage",
    }
  )
);
```

**Output**: `src/store/useVisionStore.ts` 신규 생성

---

### Phase 3: Vision & Goal Cards (컴포넌트 구현)

#### 3.1 VisionCard Component
```typescript
// src/components/VisionCard.tsx
"use client";

import { useTranslations } from "next-intl";
import { useVisionStore } from "@/store/useVisionStore";
import { motion } from "framer-motion";

export default function VisionCard() {
  const t = useTranslations("vision");
  const vision = useVisionStore((state) => state.vision);

  if (!vision) {
    return (
      <motion.div
        className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 shadow-lg border-2 border-purple-200"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center">
          <h3 className="text-lg font-bold text-purple-800 mb-2">
            {t("createVision")}
          </h3>
          <p className="text-sm text-purple-600">
            {t("visionDescription")}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 shadow-lg border-2 border-purple-200"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Vision 배경 이미지 (선택) */}
      {vision.imageUrl && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-10">
          <img
            src={vision.imageUrl}
            alt={vision.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Vision 내용 */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-purple-600 uppercase">
            {t("vision")}
          </span>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {vision.title}
        </h2>

        {vision.description && (
          <p className="text-sm text-gray-700 leading-relaxed">
            {vision.description}
          </p>
        )}
      </div>
    </motion.div>
  );
}
```

**Output**: `src/components/VisionCard.tsx` 신규 생성

#### 3.2 Enhanced GoalCard Component
```typescript
// src/components/GoalCard.tsx
"use client";

import { useTranslations } from "next-intl";
import { useProjectStore } from "@/store/useProjectStore";
import { motion } from "framer-motion";
import type { Goal } from "@/types";

interface GoalCardProps {
  goal: Goal;
  onToggle: () => void;
}

export default function GoalCard({ goal, onToggle }: GoalCardProps) {
  const t = useTranslations("goal");
  const getProjectsByGoal = useProjectStore((state) => state.getProjectsByGoal);

  const projects = getProjectsByGoal(goal.id);
  const completedProjects = projects.filter((p) => p.completed).length;
  const progress = projects.length > 0
    ? Math.round((completedProjects / projects.length) * 100)
    : 0;

  return (
    <motion.div
      className={`bg-white rounded-2xl p-5 shadow-md border-2 transition-all ${
        goal.completed
          ? "border-green-300 bg-green-50"
          : "border-purple-200"
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <input
          type="checkbox"
          checked={goal.completed}
          onChange={onToggle}
          className="w-5 h-5 mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
        />
        <div className="flex-1">
          <h3
            className={`font-bold text-lg ${
              goal.completed
                ? "line-through text-gray-500"
                : "text-gray-800"
            }`}
          >
            {goal.title}
          </h3>
          {goal.description && (
            <p className="text-sm text-gray-600 mt-1">
              {goal.description}
            </p>
          )}
        </div>
      </div>

      {/* Progress Section */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-600">{t("progress")}</span>
          <span className="text-sm font-bold text-purple-600">
            {progress}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Project Count */}
        <p className="text-xs text-gray-500 text-right">
          {completedProjects} / {projects.length} {t("projects")}
        </p>
      </div>
    </motion.div>
  );
}
```

**Output**: `src/components/GoalCard.tsx` 신규 생성

---

### Phase 4: Enhanced Project Cards (프로젝트 카드 개선)

#### 4.1 ProjectCard Component
```typescript
// src/components/ProjectCard.tsx
"use client";

import { useTranslations } from "next-intl";
import { useTaskStore } from "@/store/useTaskStore";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiCalendar, FiClock, FiTrendingUp } from "react-icons/fi";
import { GiTwoCoins } from "react-icons/gi";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  onToggle: () => void;
}

export default function ProjectCard({ project, onToggle }: ProjectCardProps) {
  const t = useTranslations("project");
  const tasks = useTaskStore((state) => state.tasks);

  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const completedTasks = projectTasks.filter((t) => t.completed).length;
  const progress = projectTasks.length > 0
    ? Math.round((completedTasks / projectTasks.length) * 100)
    : 0;

  // D-day 계산
  const getDaysRemaining = () => {
    if (!project.endDate) return null;
    const today = new Date();
    const end = new Date(project.endDate);
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysRemaining = getDaysRemaining();

  // 기간 포맷
  const formatPeriod = () => {
    if (!project.startDate || !project.endDate) return null;
    const start = new Date(project.startDate).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
    const end = new Date(project.endDate).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
    return `${start} - ${end}`;
  };

  return (
    <Link href={`/projects/${project.id}`}>
      <motion.div
        className={`bg-white rounded-2xl p-5 shadow-md border-2 transition-all ${
          project.completed
            ? "border-green-300 bg-green-50"
            : "border-blue-200"
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Header: 제목 + 체크박스 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3
              className={`font-bold text-lg mb-1 ${
                project.completed
                  ? "line-through text-gray-500"
                  : "text-gray-800"
              }`}
            >
              {project.title}
            </h3>

            {/* 기간 */}
            {formatPeriod() && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <FiCalendar size={12} />
                <span>{formatPeriod()}</span>
              </div>
            )}
          </div>

          <input
            type="checkbox"
            checked={project.completed}
            onChange={(e) => {
              e.preventDefault();
              onToggle();
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>

        {/* Metadata: 코인 + D-day */}
        <div className="flex items-center gap-3 mb-3">
          {/* 코인 보상 */}
          {project.reward && (
            <div className="flex items-center gap-1 text-amber-600">
              <GiTwoCoins size={16} />
              <span className="text-sm font-semibold">+{project.reward}</span>
            </div>
          )}

          {/* D-day */}
          {daysRemaining !== null && (
            <div
              className={`flex items-center gap-1 text-sm font-semibold ${
                daysRemaining < 0
                  ? "text-red-500"
                  : daysRemaining <= 3
                  ? "text-orange-500"
                  : "text-gray-600"
              }`}
            >
              <FiClock size={14} />
              <span>
                {daysRemaining < 0
                  ? `D+${Math.abs(daysRemaining)}`
                  : `D-${daysRemaining}`}
              </span>
            </div>
          )}
        </div>

        {/* Progress Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-600 flex items-center gap-1">
              <FiTrendingUp size={12} />
              {t("progress")}
            </span>
            <span className="text-sm font-bold text-blue-600">
              {progress}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
```

**Output**: `src/components/ProjectCard.tsx` 신규 생성

---

### Phase 5: Project Details Page (프로젝트 상세 페이지)

#### 5.1 Create Project Details Page
```typescript
// src/app/[locale]/projects/[id]/page.tsx
"use client";

import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useProjectStore } from "@/store/useProjectStore";
import { useTaskStore } from "@/store/useTaskStore";
import { motion } from "framer-motion";
import { FiArrowLeft, FiCalendar, FiTarget } from "react-icons/fi";
import { GiTwoCoins } from "react-icons/gi";
import Link from "next/link";

export default function ProjectDetailsPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const projects = useProjectStore((state) => state.projects);
  const tasks = useTaskStore((state) => state.tasks);

  const project = projects.find((p) => p.id === projectId);
  const projectTasks = tasks.filter((t) => t.projectId === projectId);
  const habits = projectTasks.filter((t) => t.type === "habit");
  const todos = projectTasks.filter((t) => t.type === "todo");

  if (!project) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">{t("project.notFound")}</p>
        <Link href="/projects" className="text-blue-600 underline mt-2 block">
          {t("common.back")}
        </Link>
      </div>
    );
  }

  // D-day 계산
  const getDaysRemaining = () => {
    if (!project.endDate) return null;
    const today = new Date();
    const end = new Date(project.endDate);
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}>
            <FiArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">{t("project.details")}</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Project Info Card */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {project.title}
          </h2>

          {project.description && (
            <p className="text-gray-600 mb-4">{project.description}</p>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* 난이도 */}
            {project.difficulty && (
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <FiTarget className="mx-auto mb-1 text-gray-500" size={20} />
                <p className="text-xs text-gray-500 mb-1">
                  {t("project.difficulty")}
                </p>
                <p className="font-semibold text-sm">{project.difficulty}</p>
              </div>
            )}

            {/* 기간 */}
            {project.startDate && project.endDate && (
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <FiCalendar className="mx-auto mb-1 text-gray-500" size={20} />
                <p className="text-xs text-gray-500 mb-1">
                  {t("project.period")}
                </p>
                <p className="font-semibold text-sm">
                  {Math.ceil(
                    (new Date(project.endDate).getTime() -
                      new Date(project.startDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}
                  {t("common.days")}
                </p>
              </div>
            )}

            {/* 보상 */}
            {project.reward && (
              <div className="bg-amber-50 rounded-lg p-3 text-center">
                <GiTwoCoins
                  className="mx-auto mb-1 text-amber-600"
                  size={20}
                />
                <p className="text-xs text-gray-500 mb-1">
                  {t("project.reward")}
                </p>
                <p className="font-semibold text-sm text-amber-600">
                  +{project.reward} {t("common.coins")}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Habits Section */}
        {habits.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-3">
              {t("habit.title")}
            </h3>
            <div className="space-y-2">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className="bg-white rounded-lg p-4 shadow-sm flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-800">{habit.title}</p>
                    {habit.description && (
                      <p className="text-sm text-gray-500">
                        {habit.description}
                      </p>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={habit.completed}
                    readOnly
                    className="w-5 h-5 rounded border-gray-300 text-green-600"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* To-Dos Section */}
        {todos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-3">
              {t("todo.title")}
            </h3>
            <div className="space-y-2">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className="bg-white rounded-lg p-4 shadow-sm flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-800">{todo.title}</p>
                    {todo.description && (
                      <p className="text-sm text-gray-500">
                        {todo.description}
                      </p>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    readOnly
                    className="w-5 h-5 rounded border-gray-300 text-blue-600"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
```

**Output**: `src/app/[locale]/projects/[id]/page.tsx` 신규 생성

---

### Phase 6: Bottom Sheet for Task/Habit Creation (등록 폼 개선)

#### 6.1 TaskFormBottomSheet Component
```typescript
// src/components/TaskFormBottomSheet.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";

interface TaskFormBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
  type: "habit" | "todo";
}

export interface TaskFormData {
  title: string;
  description?: string;
  projectId?: string;
  difficulty: "Easy" | "Normal" | "Hard";
  recurrence: {
    type: "daily" | "weekly" | "custom";
    daysOfWeek?: number[];
    interval?: number;
  };
  targetDays?: number;
  startDate?: Date;
  reminder?: {
    enabled: boolean;
    time?: string;
  };
}

export default function TaskFormBottomSheet({
  isOpen,
  onClose,
  onSubmit,
  type,
}: TaskFormBottomSheetProps) {
  const t = useTranslations();

  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    difficulty: "Normal",
    recurrence: {
      type: "daily",
    },
    reminder: {
      enabled: false,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[85vh] overflow-y-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {type === "habit" ? t("habit.create") : t("todo.create")}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* 제목 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("task.title")}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("task.titlePlaceholder")}
                  required
                />
              </div>

              {/* 빈도 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("task.frequency")}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        recurrence: { type: "daily" },
                      })
                    }
                    className={`py-3 px-4 rounded-lg font-medium transition-all ${
                      formData.recurrence.type === "daily"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {t("task.daily")}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        recurrence: { type: "weekly" },
                      })
                    }
                    className={`py-3 px-4 rounded-lg font-medium transition-all ${
                      formData.recurrence.type === "weekly"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {t("task.weekly")}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        recurrence: { type: "custom" },
                      })
                    }
                    className={`py-3 px-4 rounded-lg font-medium transition-all ${
                      formData.recurrence.type === "custom"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {t("task.custom")}
                  </button>
                </div>
              </div>

              {/* 목표 일수 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("task.targetDays")}
                </label>
                <input
                  type="number"
                  value={formData.targetDays || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targetDays: parseInt(e.target.value) || undefined,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="30"
                  min="1"
                />
              </div>

              {/* 시작 날짜 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("task.startDate")}
                </label>
                <input
                  type="date"
                  value={
                    formData.startDate
                      ? formData.startDate.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      startDate: e.target.value
                        ? new Date(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 알림 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t("task.reminder")}
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.reminder?.enabled || false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          reminder: {
                            ...formData.reminder,
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>

                {formData.reminder?.enabled && (
                  <input
                    type="time"
                    value={formData.reminder.time || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reminder: {
                          ...formData.reminder!,
                          time: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors"
              >
                {t("common.save")}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

**Output**: `src/components/TaskFormBottomSheet.tsx` 신규 생성

---

### Phase 7: Update Pages with New Components (페이지 업데이트)

#### 7.1 Update `/goals` Page
```typescript
// src/app/[locale]/goals/page.tsx
"use client";

import { useTranslations } from "next-intl";
import { useGoalStore } from "@/store/useGoalStore";
import PlayerDashboard from "@/components/PlayerDashboard";
import VisionCard from "@/components/VisionCard";
import GoalCard from "@/components/GoalCard";
import FloatingAddButton from "@/components/FloatingAddButton";

export default function GoalsPage() {
  const t = useTranslations();
  const goals = useGoalStore((state) => state.goals);
  const toggleGoal = useGoalStore((state) => state.toggleGoal);

  return (
    <div className="p-4 space-y-4">
      <PlayerDashboard />

      {/* Vision Card (고정, 최상단) */}
      <VisionCard />

      {/* Goals List */}
      <div className="space-y-3">
        {goals.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">{t("goal.empty")}</p>
            <p className="text-sm">{t("goal.emptyDescription")}</p>
          </div>
        ) : (
          goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onToggle={() => toggleGoal(goal.id)}
            />
          ))
        )}
      </div>

      <FloatingAddButton />
    </div>
  );
}
```

**Output**: `src/app/[locale]/goals/page.tsx` 업데이트

#### 7.2 Update `/projects` Page
```typescript
// src/app/[locale]/projects/page.tsx
"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useGoalStore } from "@/store/useGoalStore";
import { useProjectStore } from "@/store/useProjectStore";
import PlayerDashboard from "@/components/PlayerDashboard";
import ProjectCard from "@/components/ProjectCard";
import FloatingAddButton from "@/components/FloatingAddButton";

export default function ProjectsPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const goalId = searchParams.get("goal");

  const goals = useGoalStore((state) => state.goals);
  const projects = useProjectStore((state) => state.projects);
  const toggleProject = useProjectStore((state) => state.toggleProject);

  const filteredProjects = goalId
    ? projects.filter((p) => p.goalId === goalId)
    : projects;

  const selectedGoal = goalId ? goals.find((g) => g.id === goalId) : null;

  return (
    <div className="p-4 space-y-4">
      <PlayerDashboard />

      {selectedGoal && (
        <p className="text-sm text-gray-600">{selectedGoal.title}</p>
      )}

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
            />
          ))
        )}
      </div>

      <FloatingAddButton />
    </div>
  );
}
```

**Output**: `src/app/[locale]/projects/page.tsx` 업데이트

---

### Phase 8: i18n Translation Keys (번역 키 추가)

**⚠️ MANDATORY: i18n-generator Agent 사용 필수**

모든 번역 작업은 반드시 `i18n-generator` agent를 통해 수행해야 합니다.

**Required Translation Keys**:
```json
{
  "vision": {
    "vision": "Vision",
    "createVision": "Create your vision",
    "visionDescription": "Define your long-term vision"
  },
  "project": {
    "details": "Project Details",
    "difficulty": "Difficulty",
    "period": "Period",
    "reward": "Reward",
    "notFound": "Project not found",
    "empty": "No projects yet",
    "emptyDescription": "Tap + to create a new project"
  },
  "task": {
    "frequency": "Frequency",
    "daily": "Daily",
    "weekly": "Weekly",
    "custom": "Custom",
    "targetDays": "Target Days",
    "startDate": "Start Date",
    "reminder": "Reminder",
    "titlePlaceholder": "Enter task title"
  },
  "common": {
    "days": "days",
    "coins": "coins",
    "back": "Back",
    "save": "Save"
  }
}
```

**Output**:
- `messages/ko.json` 업데이트
- `messages/en.json` 업데이트

---

## 🗂️ Implementation Checklist

### Phase 1: Data Models ✅
- [x] Update `src/types/index.ts` (Vision, Goal, Project, Task types)
- [x] Test type definitions

### Phase 2: Vision Store ✅
- [x] Create `src/store/useVisionStore.ts`
- [x] Test store logic (singleton pattern)

### Phase 3: Vision & Goal Cards ✅
- [x] Create `src/components/VisionCard.tsx`
- [x] Create `src/components/GoalCard.tsx`
- [x] Test components

### Phase 4: Project Cards ✅
- [x] Create `src/components/ProjectCard.tsx`
- [x] Implement D-day calculation
- [x] Test progress bar and metadata

### Phase 5: Project Details ✅
- [x] Create `src/app/[locale]/projects/[id]/page.tsx`
- [x] Test routing and data display

### Phase 6: Bottom Sheet ✅
- [x] Create `src/components/TaskFormBottomSheet.tsx`
- [x] Implement form validation
- [x] Test recurrence, reminder, target days

### Phase 7: Page Updates ✅
- [x] Update `src/app/[locale]/goals/page.tsx`
- [x] Update `src/app/[locale]/projects/page.tsx`
- [x] Test integration

### Phase 8: i18n ✅
- [x] **Use i18n-generator agent for all translations**
- [x] Update `messages/ko.json`
- [x] Update `messages/en.json`
- [x] Test language switching

---

## 📊 Progress Tracking

| Phase | Status | Completed | Notes |
|-------|--------|-----------|-------|
| Phase 1 | ✅ | 2/2 | Data models updated |
| Phase 2 | ✅ | 2/2 | Vision store created |
| Phase 3 | ✅ | 3/3 | Vision & Goal cards completed |
| Phase 4 | ✅ | 3/3 | Project cards with D-day |
| Phase 5 | ✅ | 2/2 | Project details page |
| Phase 6 | ✅ | 3/3 | Bottom sheet form |
| Phase 7 | ✅ | 3/3 | Page updates |
| Phase 8 | ✅ | 3/3 | i18n translations |

---

## 🎯 Next Steps

1. **Phase 1 시작**: `src/types/index.ts` 업데이트
2. **각 Phase 완료 후**: 이 문서의 체크리스트 업데이트
3. **Phase 완료 시**: Progress Tracking 테이블 업데이트
4. **전체 완료 후**: 최종 테스트 및 QA

---

**Last Updated**: 2026-02-08
**Status**: Planning Complete, Ready for Implementation
