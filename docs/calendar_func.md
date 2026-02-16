# Calendar 화면 구현 계획서 (주간/월간 뷰)

## 📅 개요

**목표**: 주간/월간 뷰를 전환할 수 있는 달력 UI를 통해 습관(Habit)과 할일(Todo)을 날짜별로 시각화하고 완료 처리할 수 있는 캘린더 페이지 구현

**경로**: `/{locale}/calendar`

**디자인 참고**: `docs/calendar.png`

**선택 라이브러리**: **react-calendar** (월간 뷰) + **Custom Weekly View** (주간 뷰)

**🆕 핵심 기능**: **주간/월간 뷰 토글** (기본값: 주간 뷰)

---

## 🎯 핵심 기능

### 1. 뷰 모드 전환
- **기본 뷰**: 주간 내역 (Weekly View) ✅
- **대체 뷰**: 월별 내역 (Monthly View)
- **토글 버튼**: 상단 헤더에 주간/월간 전환 버튼
- **상태 저장**: localStorage에 사용자 선호도 저장

### 2. 주간 뷰 (Weekly View) - 기본

#### 레이아웃
```
┌─────────────────────────────────┐
│ TopAppBar: "달력"               │
├─────────────────────────────────┤
│ [주간] [월간]          2월 3주  │  ← 뷰 토글 + 주차 표시
├─────────────────────────────────┤
│  ◀  2월 16일 - 2월 22일  ▶     │  ← 주 네비게이션
├─────────────────────────────────┤
│ ┌────────────────────────────┐ │
│ │ 월 2/17              3개    │ │  ← 날짜별 작업 목록
│ │ ☐ 운동하기 (습관)    +10XP │ │
│ │ ☐ 보고서 작성 (할일) +10XP │ │
│ │ ☐ 독서하기 (습관)    +10XP │ │
│ ├────────────────────────────┤ │
│ │ 화 2/18              1개    │ │
│ │ ☐ 팀 미팅 (할일)     +10XP │ │
│ ├────────────────────────────┤ │
│ │ 수 2/19              오늘   │ │  ← 오늘 강조
│ │ ☐ 운동하기 (습관)    +10XP │ │
│ ├────────────────────────────┤ │
│ │ 목 2/20              2개    │ │
│ │ 금 2/21              0개    │ │
│ │ 토 2/22              1개    │ │
│ └────────────────────────────┘ │
├─────────────────────────────────┤
│ BottomNavigation                │
└─────────────────────────────────┘
```

#### 특징
- ✅ **세로 스크롤**: 일주일 전체 작업 한눈에 보기
- ✅ **인라인 완료**: 각 작업 옆 체크박스로 즉시 완료 처리
- ✅ **날짜별 섹션**: 날짜 헤더 + 작업 목록
- ✅ **좌우 네비게이션**: 이전/다음 주 이동
- ✅ **오늘 강조**: 현재 날짜 배경 강조
- ✅ **빈 날짜 축소**: 작업 없는 날은 1줄로 표시

### 3. 월간 뷰 (Monthly View) - 대체

#### 레이아웃
```
┌─────────────────────────────────┐
│ TopAppBar: "달력"               │
├─────────────────────────────────┤
│ [주간] [월간]        2026년 2월 │  ← 뷰 토글
├─────────────────────────────────┤
│  ◀  2026년 2월  ▶              │  ← 월 네비게이션
├─────────────────────────────────┤
│ 일  월  화  수  목  금  토      │
├─────────────────────────────────┤
│                    1    2    3  │
│  4    5    6    7    8    9   10│  ← 날짜 그리드
│ 11   12   13   14   15   16   17│     (작업 인디케이터)
│ 18   19   20   21   22   23   24│
│ 25   26   27   28               │
├─────────────────────────────────┤
│ BottomNavigation                │
└─────────────────────────────────┘
```

#### 특징
- ✅ **월 단위 조망**: 한 달 전체 작업 패턴 파악
- ✅ **작업 인디케이터**: 날짜 셀에 점으로 작업 표시
- ✅ **날짜 클릭**: Bottom Sheet로 상세 작업 목록
- ✅ **오늘 강조**: 현재 날짜 배경 강조

### 4. 작업 필터링 로직 (공통)

#### Habit (습관)
- **표시 조건**:
  - `startDate ≤ 선택된 날짜 ≤ endDate`
  - **AND** 선택된 날짜의 요일이 `frequency` 배열에 포함
- **예시**:
  - 습관: "운동하기" (2026-02-01 ~ 2026-02-28, 월/수/금)
  - 2026-02-17(월) 선택 시 → 표시 ✅
  - 2026-02-18(화) 선택 시 → 표시 안 함 ❌

#### Todo (할일)
- **표시 조건**: `dueDate === 선택된 날짜`
- **예시**:
  - 할일: "보고서 제출" (마감: 2026-02-20)
  - 2026-02-20 선택 시 → 표시 ✅
  - 다른 날짜 선택 시 → 표시 안 함 ❌

### 5. 작업 완료 처리 (공통)
- **주간 뷰**: 인라인 체크박스로 즉시 완료
- **월간 뷰**: Bottom Sheet 내 체크박스로 완료
- **보상**: XP만 지급 (코인 없음)
- **실시간 반영**: 완료 즉시 UI 업데이트

---

## 🎨 UI/UX 디자인

### 뷰 모드 토글

```tsx
// ViewToggle 컴포넌트
┌──────────────────────┐
│ [주간] [월간]        │  ← 세그먼트 컨트롤
└──────────────────────┘

// 주간 선택 시 (기본)
┌──────────────────────┐
│ [주간●] [월간]       │
└──────────────────────┘

// 월간 선택 시
┌──────────────────────┐
│ [주간] [월간●]       │
└──────────────────────┘
```

### 색상 시스템 (Duto Mint Clean)

#### 공통 색상

| 요소 | 색상 | Tailwind Class | 용도 |
|------|------|----------------|------|
| 오늘 날짜 | `primary` (#7DE6C3) | `bg-primary text-white` | 배경 강조 |
| Habit | `primary` (#7DE6C3) | `bg-primary/20 text-primary` | 습관 뱃지 |
| Todo | `accent` (#F19ED2) | `bg-accent/20 text-accent` | 할일 뱃지 |
| 완료 체크 | `accent` (#F19ED2) | `checked:bg-accent` | 완료 상태 |
| 선택된 뷰 | `primary` (#7DE6C3) | `bg-primary text-white` | 활성 탭 |
| 비선택 뷰 | `text-muted` (#64748B) | `text-text-muted` | 비활성 탭 |
| 날짜 헤더 | `background-surface` (#FFFFFF) | `bg-background-surface` | 섹션 헤더 |
| 구분선 | `border` (#DCEEE7) | `border-border` | 섹션 구분 |

#### 주간 뷰 전용 색상

| 요소 | 색상 | Tailwind Class |
|------|------|----------------|
| 날짜 섹션 배경 | `background-surface` (#FFFFFF) | `bg-background-surface` |
| 오늘 섹션 | `primary` (#7DE6C3) | `bg-primary/10 border-l-4 border-primary` |
| 빈 날짜 | `text-muted` (#64748B) | `text-text-muted` |
| 작업 카드 | `background` (#F7F9F2) | `bg-background` |

#### 월간 뷰 전용 색상

| 요소 | 색상 | Tailwind Class |
|------|------|----------------|
| 날짜 셀 | `background-surface` (#FFFFFF) | `bg-background-surface` |
| 작업 있는 날짜 | `primary` (#7DE6C3) | `border-2 border-primary` |
| 완료된 날짜 | `accent` (#F19ED2) | `bg-accent/20 border-accent` |

### 반응형 디자인
- **Mobile (< 640px)**:
  - 주간 뷰: 세로 스크롤
  - 월간 뷰: 7컬럼 그리드, 터치 최적화
- **Tablet/Desktop (≥ 640px)**:
  - 주간 뷰: 더 넓은 작업 카드
  - 월간 뷰: 7컬럼 그리드 (셀 크기 확대)

---

## 🔧 기술 스택

### 라이브러리 선택

#### 월간 뷰: react-calendar
- ✅ 번들 크기 ~20KB
- ✅ Tailwind 통합 용이
- ✅ TypeScript 지원
- ✅ MIT 라이선스

```bash
npm install react-calendar date-fns
```

#### 주간 뷰: Custom Component
- **date-fns** 활용하여 직접 구현
- 주 시작/종료일 계산
- 날짜 범위 생성
- 더 높은 커스터마이징 자유도

### 주요 유틸리티 함수

```typescript
// src/lib/calendar-utils.ts
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  addWeeks,
  subWeeks
} from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 주간 날짜 배열 생성
 */
export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // 월요일 시작
  const end = endOfWeek(date, { weekStartsOn: 1 });

  return eachDayOfInterval({ start, end });
}

/**
 * 주차 레이블 생성 (예: "2월 3주")
 */
export function getWeekLabel(date: Date): string {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const month = format(start, 'M월', { locale: ko });
  const weekOfMonth = Math.ceil(start.getDate() / 7);

  return `${month} ${weekOfMonth}주`;
}

/**
 * 주간 범위 레이블 (예: "2월 16일 - 2월 22일")
 */
export function getWeekRangeLabel(date: Date): string {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });

  return `${format(start, 'M월 d일', { locale: ko })} - ${format(end, 'M월 d일', { locale: ko })}`;
}

/**
 * 특정 날짜에 표시될 작업 필터링
 */
export function getTasksForDate(date: Date, tasks: Task[]): Task[] {
  const dayOfWeek = date.getDay();

  return tasks.filter(task => {
    if (task.type === "habit") {
      const inDateRange =
        task.startDate && task.endDate &&
        task.startDate <= date &&
        date <= task.endDate;
      const matchesFrequency = task.frequency?.includes(dayOfWeek) ?? false;
      return inDateRange && matchesFrequency;
    }

    if (task.type === "todo") {
      return task.dueDate && isSameDay(task.dueDate, date);
    }

    return false;
  });
}
```

---

## 📦 데이터 모델

### Task 타입 (기존 활용)

```typescript
interface Task {
  id: string;
  type: "habit" | "todo";
  title: string;
  description: string;
  difficulty: Difficulty;
  projectId?: string;

  // Calendar 필터링에 사용
  startDate?: Date;    // Habit: 시작일
  endDate?: Date;      // Habit: 종료일
  dueDate?: Date;      // Todo: 마감일
  frequency?: number[]; // Habit: [0=일, 1=월, ..., 6=토]

  completed: boolean;
  rewardClaimed: boolean;
}
```

### 뷰 모드 상태 관리

```typescript
// src/store/useCalendarStore.ts (신규)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ViewMode = 'week' | 'month';

interface CalendarStore {
  viewMode: ViewMode;
  currentDate: Date;

  setViewMode: (mode: ViewMode) => void;
  setCurrentDate: (date: Date) => void;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToToday: () => void;
}

export const useCalendarStore = create<CalendarStore>()(
  persist(
    (set) => ({
      viewMode: 'week',  // 기본값: 주간 뷰
      currentDate: new Date(),

      setViewMode: (mode) => set({ viewMode: mode }),
      setCurrentDate: (date) => set({ currentDate: date }),

      goToPreviousWeek: () => set((state) => ({
        currentDate: subWeeks(state.currentDate, 1)
      })),

      goToNextWeek: () => set((state) => ({
        currentDate: addWeeks(state.currentDate, 1)
      })),

      goToPreviousMonth: () => set((state) => ({
        currentDate: new Date(
          state.currentDate.getFullYear(),
          state.currentDate.getMonth() - 1,
          1
        )
      })),

      goToNextMonth: () => set((state) => ({
        currentDate: new Date(
          state.currentDate.getFullYear(),
          state.currentDate.getMonth() + 1,
          1
        )
      })),

      goToToday: () => set({ currentDate: new Date() })
    }),
    {
      name: 'calendar-storage',
      partialize: (state) => ({ viewMode: state.viewMode })
    }
  )
);
```

---

## 🚀 구현 계획

### Phase 1: 기본 UI 및 뷰 전환 (3-4시간)

#### **Task 1.1: 라이브러리 설치 및 설정**
- **Duration**: 30분
- **Files**: `package.json`, `tailwind.config.ts`
- **Deliverables**:
  ```bash
  npm install react-calendar date-fns
  npm install --save-dev @types/react-calendar
  ```

#### **Task 1.2: CalendarStore 생성**
- **Duration**: 1시간
- **Files**: `src/store/useCalendarStore.ts`
- **Deliverables**:
  - viewMode 상태 관리
  - currentDate 상태 관리
  - 네비게이션 함수들
  - localStorage persist

#### **Task 1.3: ViewToggle 컴포넌트**
- **Duration**: 1시간
- **Files**: `src/components/ViewToggle.tsx`
- **Deliverables**:
  - 주간/월간 세그먼트 컨트롤
  - Duto Mint Clean 색상 적용
  - 선택 상태 시각화

**구현 예시**:
```tsx
// src/components/ViewToggle.tsx
'use client';

import { useCalendarStore } from '@/store/useCalendarStore';
import { useTranslations } from 'next-intl';

export default function ViewToggle() {
  const t = useTranslations('calendar');
  const { viewMode, setViewMode } = useCalendarStore();

  return (
    <div className="flex gap-2 p-1 bg-background rounded-lg">
      <button
        onClick={() => setViewMode('week')}
        className={`px-4 py-2 rounded-md font-medium transition-all ${
          viewMode === 'week'
            ? 'bg-primary text-white'
            : 'text-text-muted hover:text-text'
        }`}
      >
        {t('viewMode.week')}
      </button>
      <button
        onClick={() => setViewMode('month')}
        className={`px-4 py-2 rounded-md font-medium transition-all ${
          viewMode === 'month'
            ? 'bg-primary text-white'
            : 'text-text-muted hover:text-text'
        }`}
      >
        {t('viewMode.month')}
      </button>
    </div>
  );
}
```

#### **Task 1.4: Calendar 페이지 기본 구조**
- **Duration**: 1시간
- **Files**: `src/app/[locale]/calendar/page.tsx`
- **Deliverables**:
  - 페이지 라우트 설정
  - ViewToggle + 조건부 뷰 렌더링
  - TopAppBar + BottomNavigation

**구현 예시**:
```tsx
// src/app/[locale]/calendar/page.tsx
'use client';

import { useTranslations } from 'next-intl';
import { useCalendarStore } from '@/store/useCalendarStore';
import TopAppBar from '@/components/TopAppBar';
import ViewToggle from '@/components/ViewToggle';
import WeeklyView from '@/components/WeeklyView';
import MonthlyView from '@/components/MonthlyView';
import BottomNavigation from '@/components/BottomNavigation';

export default function CalendarPage() {
  const t = useTranslations('calendar');
  const { viewMode } = useCalendarStore();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopAppBar title={t('title')} />

      {/* View Toggle */}
      <div className="p-4 bg-background-surface border-b border-border">
        <ViewToggle />
      </div>

      {/* Conditional View Rendering */}
      <main className="flex-1 overflow-y-auto pb-20">
        {viewMode === 'week' ? <WeeklyView /> : <MonthlyView />}
      </main>

      <BottomNavigation />
    </div>
  );
}
```

---

### Phase 2: 주간 뷰 구현 (4-5시간) - 우선

#### **Task 2.1: WeeklyView 컴포넌트**
- **Duration**: 2시간
- **Files**: `src/components/WeeklyView.tsx`
- **Deliverables**:
  - 주간 네비게이션 (이전/다음 주)
  - 주차 레이블 표시
  - 일주일 날짜 배열 생성
  - 날짜별 섹션 렌더링

**구현 예시**:
```tsx
// src/components/WeeklyView.tsx
'use client';

import { useMemo } from 'react';
import { format, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useTranslations } from 'next-intl';
import { useCalendarStore } from '@/store/useCalendarStore';
import { useTaskStore } from '@/store/useTaskStore';
import {
  getWeekDays,
  getWeekLabel,
  getWeekRangeLabel,
  getTasksForDate
} from '@/lib/calendar-utils';
import DaySection from '@/components/DaySection';

export default function WeeklyView() {
  const t = useTranslations('calendar');
  const { currentDate, goToPreviousWeek, goToNextWeek } = useCalendarStore();
  const tasks = useTaskStore((state) => state.tasks);

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
  const weekLabel = useMemo(() => getWeekLabel(currentDate), [currentDate]);
  const rangeLabel = useMemo(() => getWeekRangeLabel(currentDate), [currentDate]);

  return (
    <div className="flex flex-col h-full">
      {/* Week Navigation */}
      <div className="sticky top-0 bg-background-surface border-b border-border p-4 z-10">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={goToPreviousWeek}
            className="p-2 hover:bg-background rounded-lg transition-colors"
          >
            ◀
          </button>
          <div className="text-center">
            <div className="text-sm text-text-muted">{weekLabel}</div>
            <div className="text-lg font-bold text-text">{rangeLabel}</div>
          </div>
          <button
            onClick={goToNextWeek}
            className="p-2 hover:bg-background rounded-lg transition-colors"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Day Sections */}
      <div className="flex-1 overflow-y-auto">
        {weekDays.map((date) => {
          const tasksForDate = getTasksForDate(date, tasks);
          const isToday = isSameDay(date, new Date());

          return (
            <DaySection
              key={date.toISOString()}
              date={date}
              tasks={tasksForDate}
              isToday={isToday}
            />
          );
        })}
      </div>
    </div>
  );
}
```

#### **Task 2.2: DaySection 컴포넌트**
- **Duration**: 2시간
- **Files**: `src/components/DaySection.tsx`
- **Deliverables**:
  - 날짜 헤더 (요일, 날짜, 작업 개수)
  - 작업 목록 (인라인 체크박스)
  - 빈 날짜 축소 표시
  - 오늘 강조 스타일

**구현 예시**:
```tsx
// src/components/DaySection.tsx
'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Task } from '@/types';
import { useTaskStore } from '@/store/useTaskStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import TaskCard from '@/components/TaskCard';

interface DaySectionProps {
  date: Date;
  tasks: Task[];
  isToday: boolean;
}

export default function DaySection({ date, tasks, isToday }: DaySectionProps) {
  const toggleTask = useTaskStore((state) => state.toggleTask);
  const completeTaskXPOnly = usePlayerStore((state) => state.completeTaskXPOnly);

  const dayLabel = format(date, 'EEE', { locale: ko });
  const dateLabel = format(date, 'M/d', { locale: ko });

  const handleToggle = (task: Task) => {
    toggleTask(task.id);
    if (!task.completed) {
      completeTaskXPOnly(task.difficulty);
    }
  };

  // 빈 날짜 축소 표시
  if (tasks.length === 0) {
    return (
      <div className="border-b border-border p-3 bg-background-surface">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`font-bold ${isToday ? 'text-primary' : 'text-text'}`}>
              {dayLabel} {dateLabel}
            </span>
            {isToday && (
              <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                오늘
              </span>
            )}
          </div>
          <span className="text-sm text-text-muted">작업 없음</span>
        </div>
      </div>
    );
  }

  // 작업 있는 날짜
  return (
    <div
      className={`border-b border-border p-4 ${
        isToday ? 'bg-primary/10 border-l-4 border-l-primary' : 'bg-background-surface'
      }`}
    >
      {/* Date Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`font-bold text-lg ${isToday ? 'text-primary' : 'text-text'}`}>
            {dayLabel} {dateLabel}
          </span>
          {isToday && (
            <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
              오늘
            </span>
          )}
        </div>
        <span className="text-sm text-text-muted">{tasks.length}개</span>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggle={() => handleToggle(task)}
          />
        ))}
      </div>
    </div>
  );
}
```

#### **Task 2.3: TaskCard 컴포넌트**
- **Duration**: 1시간
- **Files**: `src/components/TaskCard.tsx`
- **Deliverables**:
  - 작업 제목, 타입, XP 표시
  - 인라인 체크박스
  - 완료 상태 스타일
  - Duto Mint Clean 색상

**구현 예시**:
```tsx
// src/components/TaskCard.tsx
import { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onToggle: () => void;
}

export default function TaskCard({ task, onToggle }: TaskCardProps) {
  return (
    <div className="bg-background border border-border rounded-lg p-3 flex items-start gap-3 hover:shadow-md transition-shadow">
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={task.completed}
        onChange={onToggle}
        className="mt-1 w-5 h-5 rounded border-2 border-primary checked:bg-accent cursor-pointer"
      />

      {/* Task Info */}
      <div className="flex-1">
        <h3
          className={`font-medium ${
            task.completed ? 'line-through text-text-muted' : 'text-text'
          }`}
        >
          {task.title}
        </h3>

        <div className="flex items-center gap-2 mt-1">
          {/* Type Badge */}
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              task.type === 'habit'
                ? 'bg-primary/20 text-primary'
                : 'bg-accent/20 text-accent'
            }`}
          >
            {task.type === 'habit' ? '🔁 습관' : '📅 할일'}
          </span>

          {/* XP Badge */}
          <span className="text-xs text-text-muted">
            +{task.difficulty * 10} XP
          </span>
        </div>
      </div>
    </div>
  );
}
```

---

### Phase 3: 월간 뷰 구현 (3-4시간)

#### **Task 3.1: MonthlyView 컴포넌트**
- **Duration**: 2시간
- **Files**: `src/components/MonthlyView.tsx`
- **Deliverables**:
  - react-calendar 통합
  - 월 네비게이션
  - 날짜 셀 커스터마이징
  - 작업 인디케이터

**구현 예시**:
```tsx
// src/components/MonthlyView.tsx
'use client';

import { useState } from 'react';
import Calendar from 'react-calendar';
import { useCalendarStore } from '@/store/useCalendarStore';
import { useTaskStore } from '@/store/useTaskStore';
import { getTasksForDate, getDateTileClass } from '@/lib/calendar-utils';
import DateTaskSheet from '@/components/DateTaskSheet';
import 'react-calendar/dist/Calendar.css';

export default function MonthlyView() {
  const { currentDate, setCurrentDate } = useCalendarStore();
  const tasks = useTaskStore((state) => state.tasks);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setCurrentDate(date);
    setIsSheetOpen(true);
  };

  return (
    <>
      <div className="p-4">
        <Calendar
          onChange={handleDateClick}
          value={currentDate}
          locale="ko-KR"

          // 날짜 셀 커스텀 클래스
          tileClassName={({ date, view }) => {
            if (view !== 'month') return '';
            return getDateTileClass(date, tasks);
          }}

          // 날짜 셀 인디케이터
          tileContent={({ date, view }) => {
            if (view !== 'month') return null;

            const tasksForDate = getTasksForDate(date, tasks);
            if (tasksForDate.length === 0) return null;

            return (
              <div className="flex items-center justify-center gap-0.5 mt-1">
                {tasksForDate.slice(0, 3).map((task, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full ${
                      task.type === 'habit' ? 'bg-primary' : 'bg-accent'
                    }`}
                  />
                ))}
                {tasksForDate.length > 3 && (
                  <span className="text-[10px] text-text-muted">
                    +{tasksForDate.length - 3}
                  </span>
                )}
              </div>
            );
          }}

          // 요일 헤더
          formatShortWeekday={(locale, date) => {
            const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
            return weekdays[date.getDay()];
          }}

          // 월 레이블
          formatMonthYear={(locale, date) => {
            return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
          }}

          // 네비게이션
          prevLabel="◀"
          nextLabel="▶"
          prev2Label={null}
          next2Label={null}

          showNeighboringMonth={true}
          className="border-none shadow-none w-full"
        />
      </div>

      {/* Date Task Sheet */}
      {selectedDate && (
        <DateTaskSheet
          date={selectedDate}
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
        />
      )}
    </>
  );
}
```

#### **Task 3.2: DateTaskSheet 컴포넌트**
- **Duration**: 1.5시간
- **Files**: `src/components/DateTaskSheet.tsx`
- **Deliverables**:
  - Bottom Sheet UI
  - 선택된 날짜의 작업 목록
  - 완료 처리
  - 애니메이션

**구현 예시**: (Phase 2의 TaskCard 재사용)
```tsx
// src/components/DateTaskSheet.tsx
'use client';

import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { getTasksForDate } from '@/lib/calendar-utils';
import { useTaskStore } from '@/store/useTaskStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import TaskCard from '@/components/TaskCard';

interface DateTaskSheetProps {
  date: Date;
  isOpen: boolean;
  onClose: () => void;
}

export default function DateTaskSheet({ date, isOpen, onClose }: DateTaskSheetProps) {
  const t = useTranslations('calendar');
  const tasks = useTaskStore((state) => state.tasks);
  const toggleTask = useTaskStore((state) => state.toggleTask);
  const completeTaskXPOnly = usePlayerStore((state) => state.completeTaskXPOnly);

  const tasksForDate = getTasksForDate(date, tasks);
  const dateLabel = format(date, 'M월 d일 (EEE)', { locale: ko });

  const handleToggle = (task) => {
    toggleTask(task.id);
    if (!task.completed) {
      completeTaskXPOnly(task.difficulty);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-background-surface rounded-t-3xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-background-surface border-b border-border p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-text">{dateLabel}</h2>
              <button onClick={onClose} className="text-text-muted hover:text-text">
                ✕
              </button>
            </div>

            {/* Task List */}
            <div className="p-4 space-y-3">
              {tasksForDate.length === 0 ? (
                <div className="text-center py-8 text-text-muted">
                  {t('noTasks')}
                </div>
              ) : (
                tasksForDate.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={() => handleToggle(task)}
                  />
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

#### **Task 3.3: react-calendar CSS 커스터마이징**
- **Duration**: 30분
- **Files**: `src/app/globals.css`
- **Deliverables**:
  - Duto Mint Clean 색상 적용
  - 날짜 셀 스타일링
  - 호버/선택 상태

**CSS**: (기존 계획서의 CSS 재사용)

---

### Phase 4: 통합 및 최적화 (2-3시간)

#### **Task 4.1: i18n 추가**
- **Duration**: 1시간
- **Files**: `messages/ko.json`, `messages/en.json`
- **Deliverables**:
  - **⚠️ i18n-generator agent 사용 필수**
  - 캘린더 관련 번역 키

**필요한 번역 키**:
```json
{
  "calendar": {
    "title": "달력",
    "viewMode": {
      "week": "주간",
      "month": "월간"
    },
    "today": "오늘",
    "noTasks": "작업이 없습니다",
    "taskCount": "{count}개"
  },
  "nav": {
    "calendar": "달력"
  }
}
```

#### **Task 4.2: 성능 최적화**
- **Duration**: 1시간
- **Deliverables**:
  - `useMemo`로 날짜 계산 메모이제이션
  - `React.memo`로 컴포넌트 최적화
  - 작업 필터링 캐싱

**최적화 예시**:
```tsx
// WeeklyView.tsx
const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

// DaySection을 React.memo로 감싸기
const DaySection = React.memo(({ date, tasks, isToday }: DaySectionProps) => {
  // ...
});
```

#### **Task 4.3: BottomNavigation 업데이트**
- **Duration**: 30분
- **Files**: `src/components/BottomNavigation.tsx`
- **Deliverables**:
  - 캘린더 메뉴 아이콘 추가

---

## 🔗 통합 포인트

### 1. TaskStore 공유
- WeeklyView, MonthlyView 모두 동일한 `useTaskStore` 사용
- 작업 생성/수정은 QuestDetailSheet 활용

### 2. PlayerStore 통합
```tsx
// usePlayerStore.ts에 추가 필요
completeTaskXPOnly: (difficulty: Difficulty) => {
  const exp = calculateExp(difficulty);
  const leveledUp = applyExperience(exp);
  return { exp, leveledUp };
}
```

### 3. QuestDetailSheet 연동 (향후)
- 주간 뷰: DaySection에서 "+" 버튼 클릭
- 월간 뷰: DateTaskSheet에서 "작업 추가" 버튼
- 선택된 날짜를 dueDate/startDate로 자동 설정

---

## ✅ 수락 기준

### MVP (필수)
- [ ] react-calendar, date-fns 설치
- [ ] 주간/월간 뷰 토글 버튼
- [ ] **기본 뷰: 주간** ✅
- [ ] 주간 뷰: 일주일 날짜별 작업 목록
- [ ] 주간 뷰: 인라인 체크박스 완료 처리
- [ ] 주간 뷰: 오늘 강조
- [ ] 주간 뷰: 좌우 네비게이션 (이전/다음 주)
- [ ] 월간 뷰: react-calendar 통합
- [ ] 월간 뷰: 날짜 클릭 → Bottom Sheet
- [ ] 월간 뷰: 작업 인디케이터 표시
- [ ] Duto Mint Clean 색상 적용
- [ ] i18n 지원 (ko/en)
- [ ] 반응형 디자인
- [ ] localStorage에 뷰 모드 저장
- [ ] TypeScript strict 준수
- [ ] 빌드 성공

### 권장사항
- [ ] 주간 뷰: 빈 날짜 축소 표시
- [ ] 주간 뷰: 작업 추가 버튼
- [ ] 월간 뷰: 완료 상태 시각화
- [ ] 애니메이션 (뷰 전환, Bottom Sheet)
- [ ] 로딩 상태 표시
- [ ] 접근성 (ARIA, 키보드 네비게이션)

### 고급 기능 (선택)
- [ ] 주간 뷰: 스와이프 제스처
- [ ] 월간 뷰: 주간 뷰로 바로 이동
- [ ] 통계 (주간/월간 완료율)
- [ ] 프로젝트 필터

---

## 📊 성공 지표

### 기능
- ✅ 주간 뷰 기본 표시 (100%)
- ✅ 뷰 모드 전환 (<100ms)
- ✅ 작업 완료 실시간 반영 (<100ms)
- ✅ localStorage 선호도 저장

### 품질
- ✅ TypeScript strict 준수
- ✅ ESLint 에러 0건
- ✅ 번들 크기 최적화 (<50KB 추가)
- ✅ 접근성 (WCAG 2.1 AA)

### UX
- ✅ 직관적인 뷰 전환
- ✅ 주간 뷰 빠른 작업 완료 (<2초)
- ✅ 월간 뷰 한눈에 패턴 파악
- ✅ 모바일 터치 최적화

---

## 📚 참고 자료

### 라이브러리 문서
- **react-calendar**: https://github.com/wojtekmaj/react-calendar
- **date-fns**: https://date-fns.org/

### 프로젝트 문서
- 색상: `agents/color-system/color-palette.md`
- 번역: `agents/i18n-generator/prompt.md`
- 디자인: `docs/calendar.png`

---

## 🔍 구현 체크리스트

### Phase 1 (기본 UI + 토글)
- [ ] react-calendar, date-fns 설치
- [ ] CalendarStore 생성
- [ ] ViewToggle 컴포넌트
- [ ] Calendar 페이지 기본 구조

### Phase 2 (주간 뷰 - 우선)
- [ ] WeeklyView 컴포넌트
- [ ] DaySection 컴포넌트
- [ ] TaskCard 컴포넌트
- [ ] 완료 처리 통합

### Phase 3 (월간 뷰)
- [ ] MonthlyView 컴포넌트
- [ ] DateTaskSheet 컴포넌트
- [ ] react-calendar CSS 커스터마이징

### Phase 4 (통합 & 최적화)
- [ ] i18n 번역 (i18n-generator agent)
- [ ] 성능 최적화 (메모이제이션)
- [ ] BottomNavigation 업데이트

---

**Last Updated**: 2026-02-16
**Status**: 계획 단계
**선택 라이브러리**: react-calendar (월간) + Custom (주간) ✅
**기본 뷰**: 주간 (Weekly View) ✅
**Estimated Effort**: 12-16시간 (MVP)
