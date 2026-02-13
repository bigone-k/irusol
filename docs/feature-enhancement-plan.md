# Irusol 기능 개선 계획서

**작성일**: 2026-02-11
**목적**: Goals, Projects, Quest(Task) 기능 개선

---

## 📋 목차

1. [현재 상태 분석](#1-현재-상태-분석)
2. [요구사항 정리](#2-요구사항-정리)
3. [데이터 모델 설계](#3-데이터-모델-설계)
4. [UI/UX 설계](#4-uiux-설계)
5. [구현 작업 목록](#5-구현-작업-목록)
6. [기술적 고려사항](#6-기술적-고려사항)

---

## 1. 현재 상태 분석

### 1.1 기존 데이터 구조

#### Goal (목표)
```typescript
interface Goal {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  visionId?: string;
  seasonStart?: Date;
  seasonEnd?: Date;
}
```

**현재 구현 상태**:
- ✅ 기본 CRUD (생성, 읽기, 수정, 삭제)
- ✅ 연결된 프로젝트 수 기반 진행률 계산
- ✅ 체크박스 완료 표시
- ❌ 달성수치 추적 기능 없음
- ❌ 수치 단위 기능 없음
- ❌ 상세 정보 모달/페이지 없음

#### Project (프로젝트)
```typescript
interface Project {
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
}
```

**현재 구현 상태**:
- ✅ 기본 CRUD
- ✅ Goal과 연결
- ✅ Task 수 기반 진행률
- ✅ D-day 표시
- ✅ 보상(코인) 표시
- ❌ 상태(시작전/진행중/완료) 필드 없음
- ❌ 상세 페이지 없음

#### Task (할일/습관)
```typescript
interface Task {
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
  startDate?: Date;
  reminder?: TaskReminder;
}
```

**현재 구현 상태**:
- ✅ 기본 CRUD
- ✅ 습관/할일 구분
- ✅ Project 연결 (`projectId`)
- ✅ 난이도 구분
- ❌ 종료날짜 필드 없음
- ❌ 빈도 UI 없음
- ❌ 상세 페이지 없음

### 1.2 기존 UI 컴포넌트

**Goals 페이지** (`/goals`):
- `GoalCard`: 목표 제목, 설명, 진행률, 체크박스
- 카드 클릭 → 동작 없음 (상세 페이지 미구현)

**Projects 페이지** (`/projects`):
- `ProjectCard`: 제목, 기간, D-day, 코인, 진행률
- 카드 클릭 → Link(`/projects/${id}`) 있지만 페이지 미구현

**Todos 페이지** (`/todos`):
- `TaskList`: Task 목록 표시
- 카드 클릭 → 동작 없음

---

## 2. 요구사항 정리

### 2.1 Goals (목표)

#### 카드 노출 정보
- [x] 목표명 (기존)
- [ ] **상태** (신규) - 시작전/진행중/완료
- [ ] **달성수치** (신규) - 현재 진행 수치
- [ ] **달성수치단위** (신규) - kg, 회, 개 등
- [ ] **수치기록 +/-** (신규) - 버튼으로 수치 증감
- [x] 달성률 (기존: 프로젝트 수 기반)
- [ ] **달성률 시각화 개선** (신규) - 색상 표현 강화

**예시**:
```
[목표 카드]
📌 1분기 체중감량
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  상태: 진행중 🔄
  현재: 2 / 5 kg          [+] [-]
  진행률: 40% ▰▰▰▰▱▱▱▱▱▱
  프로젝트: 2개 진행중
```

#### 상세 정보 (모달/페이지)
- [ ] 목표명 (수정 가능)
- [ ] **상태** (수정 가능) - 드롭다운
- [ ] 달성수치 (수정 가능)
- [ ] 수치기록 (히스토리 표시)
- [ ] 달성수치단위 (수정 가능)
- [ ] 목표설명 (수정 가능)
- [ ] **연결된 하위 프로젝트 리스트** (클릭 시 해당 프로젝트로 이동)

#### 보상 구조
- **완료 보상**: 500 코인
- **중복 방지**: 목표당 1회만 지급
- **지급 조건**: 상태가 "완료"로 변경될 때

### 2.2 Projects (프로젝트)

#### 카드 노출 정보
- [x] 목표명 (기존: goalId로 조회)
- [x] 프로젝트명 (기존)
- [ ] **상태** (신규) - 시작전/진행중/완료
- [x] 프로젝트 기간 (기존)
- [x] 달성률 (기존: quest 기반)

**예시**:
```
[프로젝트 카드]
🎯 1분기 체중감량
📋 주 3회 운동 습관 만들기
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  상태: 진행중 🔄
  기간: 2024.01.01 ~ 2024.03.31 (D-45)
  진행률: 60% ▰▰▰▰▰▰▱▱▱▱
  완료: 6/10 quest
```

#### 상세 정보 (모달/페이지)
- [ ] 목표명 (읽기 전용)
- [ ] 프로젝트명 (수정 가능)
- [ ] **상태** (수정 가능) - 드롭다운
- [ ] 프로젝트 기간 (수정 가능)
- [ ] 프로젝트 설명 (수정 가능)
- [ ] **연결된 하위 quest 리스트** (CRUD 가능)

#### 보상 구조
- **완료 보상**: 300 코인
- **중복 방지**: 프로젝트당 1회만 지급
- **지급 조건**: 상태가 "완료"로 변경될 때

### 2.3 Quest (Task → Quest 명칭 변경)

#### 카드 노출 정보
- [x] 프로젝트명 (기존: projectId로 조회)
- [x] quest 명 (기존: title)
- [x] 유형 (기존: habit/todo)
- [ ] **습관 타입 정보**:
  - [x] 기간 (기존: startDate)
  - [ ] **종료날짜** (신규)
  - [ ] **빈도** (신규) - 주 3회 등
- [ ] **할일 타입 정보**:
  - [ ] **종료날짜** (신규)
  - [x] 완료 여부 (기존: completed)

**예시**:
```
[Quest 카드 - 습관]
📂 주 3회 운동 습관 만들기
🔁 헬스장 가기
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  유형: 습관
  기간: 2024.01.01 ~ 2024.03.31
  빈도: 주 3회 (12회 달성/36회)
  연속: 🔥 5일

[Quest 카드 - 할일]
📂 식단일기 쓰기
✅ 오늘 점심 기록
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  유형: 할일
  종료: 2024.02.15 (D-4)
  [✓] 완료
```

#### 상세 정보 (모달/페이지)
- [ ] 프로젝트명 (읽기 전용)
- [ ] quest 명 (수정 가능)
- [ ] 유형 (수정 가능)
- [ ] 기간/종료날짜 (수정 가능)
- [ ] 빈도 설정 (습관 타입만)
- [ ] quest 설명 (수정 가능)

#### 보상 구조
- **완료 보상**: 경험치 (기존 시스템 유지)
- **중복 방지**: quest당 1회만 지급
- **지급 조건**: 체크박스 완료 시

---

## 3. 데이터 모델 설계

### 3.1 Goal 타입 확장

```typescript
type GoalStatus = "notStarted" | "inProgress" | "completed";

interface Goal {
  // 기존 필드
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  visionId?: string;
  seasonStart?: Date;
  seasonEnd?: Date;

  // 신규 필드
  status: GoalStatus;           // 상태 (시작전/진행중/완료)
  currentValue: number;         // 달성수치 (현재값)
  targetValue: number;          // 목표수치 (목표값)
  unit: string;                 // 수치단위 (kg, 회, 개 등)
  valueHistory?: ValueChange[]; // 수치 변경 히스토리
  rewardClaimed: boolean;       // 보상 지급 여부 (중복 방지)
  rewardAmount: number;         // 보상 코인 (500)
}

interface ValueChange {
  id: string;
  timestamp: Date;
  previousValue: number;
  newValue: number;
  change: number; // +/- 변화량
}
```

**마이그레이션 전략**:
- 기존 Goal 데이터에 기본값 추가:
  - `status`: `completed ? 'completed' : 'notStarted'`
  - `currentValue`: `0`
  - `targetValue`: `100`
  - `unit`: `'%'`
  - `valueHistory`: `[]`
  - `rewardClaimed`: `false`
  - `rewardAmount`: `500`

### 3.2 Project 타입 확장

```typescript
type ProjectStatus = "notStarted" | "inProgress" | "completed";

interface Project {
  // 기존 필드
  id: string;
  goalId: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  reward?: number;           // 기존 필드 (제거 예정)
  startDate?: Date;
  endDate?: Date;
  difficulty?: "Easy" | "Normal" | "Hard";

  // 신규 필드
  status: ProjectStatus;     // 상태 (시작전/진행중/완료)
  rewardClaimed: boolean;    // 보상 지급 여부 (중복 방지)
  rewardAmount: number;      // 보상 코인 (300)
}
```

**마이그레이션 전략**:
- 기존 Project 데이터:
  - `status`: `completed ? 'completed' : 'inProgress'`
  - `rewardClaimed`: `false`
  - `rewardAmount`: `300`

### 3.3 Task (Quest) 타입 확장

```typescript
interface Task {
  // 기존 필드
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
  startDate?: Date;
  reminder?: TaskReminder;

  // 신규 필드
  endDate?: Date;              // 종료날짜 (습관/할일 공통)
  frequencyTarget?: number;    // 빈도 목표 (주 3회 → 3)
  frequencyPeriod?: "daily" | "weekly" | "monthly"; // 빈도 기간
  completionCount?: number;    // 완료 횟수 (습관 전용)
  rewardClaimed: boolean;      // 보상 지급 여부 (중복 방지)
}
```

**마이그레이션 전략**:
- 기존 Task 데이터:
  - `rewardClaimed`: `completed` 값으로 초기화 (이미 완료된 것은 보상 지급으로 간주)

---

## 4. UI/UX 설계

### 4.1 Goals 페이지 개선

#### GoalCard 컴포넌트 개선
```tsx
<GoalCard>
  <Header>
    <Checkbox />
    <Title />
  </Header>

  <StatusBadge status={status} editable />

  <ValueTracker>
    <CurrentValue>2 / 5 kg</CurrentValue>
    <Controls>
      <PlusButton onClick={incrementValue} />
      <MinusButton onClick={decrementValue} />
    </Controls>
  </ValueTracker>

  <ProgressBar percentage={40} />

  <ProjectCount>2개 진행중</ProjectCount>

  <ClickToDetail onClick={openModal} />
</GoalCard>
```

#### Goal 상세 모달/페이지
- **옵션 1**: Bottom Sheet (모바일 친화적)
- **옵션 2**: Full Page (`/goals/${id}`)
- **추천**: Bottom Sheet (기존 프로젝트 패턴과 일관성)

**컴포넌트**: `GoalDetailSheet.tsx`
```tsx
<BottomSheet>
  <Header>
    <Title editable />
    <CloseButton />
  </Header>

  <Section label="상태">
    <StatusSelector value={status} onChange={updateStatus} />
    {rewardClaimed && <RewardBadge>보상 받음 (500 코인)</RewardBadge>}
  </Section>

  <Section label="달성 정보">
    <ValueInput current={2} target={5} unit="kg" />
    <ValueHistory history={[...]} />
  </Section>

  <Section label="목표 설명">
    <Textarea value={description} editable />
  </Section>

  <Section label="연결된 프로젝트">
    <ProjectList>
      {projects.map(p => <ProjectItem onClick={navigateToProject} />)}
    </ProjectList>
  </Section>

  <ActionButtons>
    <SaveButton />
    <DeleteButton />
  </ActionButtons>
</BottomSheet>
```

### 4.2 Projects 페이지 개선

#### ProjectCard 컴포넌트 개선
```tsx
<ProjectCard>
  <Header>
    <GoalName />
    <ProjectName />
  </Header>

  <StatusBadge status={status} editable />

  <Period>
    <DateRange />
    <DDay />
  </Period>

  <ProgressBar percentage={60} />
  <QuestCount>6 / 10</QuestCount>

  <ClickToDetail onClick={navigate} />
</ProjectCard>
```

#### Project 상세 페이지
- **라우트**: `/projects/${id}`
- **컴포넌트**: `src/app/[locale]/projects/[id]/page.tsx`

```tsx
<ProjectDetailPage>
  <Header>
    <BackButton />
    <EditButton />
  </Header>

  <Section label="프로젝트 정보">
    <GoalName readOnly />
    <ProjectName editable />
    <StatusSelector value={status} onChange={updateStatus} />
    <DateRangePicker start={startDate} end={endDate} />
    <Description editable />
  </Section>

  <Section label="연결된 Quest">
    <QuestList projectId={id} />
    <AddQuestButton />
  </Section>

  <ActionButtons>
    <SaveButton />
    <DeleteButton />
  </ActionButtons>
</ProjectDetailPage>
```

### 4.3 Quest (Task) 페이지 개선

#### QuestCard (TaskCard) 컴포넌트 개선
```tsx
<QuestCard type={type}>
  <Header>
    <ProjectName />
    <QuestName />
    <Checkbox />
  </Header>

  {type === 'habit' && (
    <>
      <Period start={startDate} end={endDate} />
      <Frequency target={3} period="weekly" current={2} />
      <Streak days={5} />
    </>
  )}

  {type === 'todo' && (
    <>
      <EndDate date={endDate} />
      <DDay />
    </>
  )}

  <ClickToDetail onClick={openModal} />
</QuestCard>
```

#### Quest 상세 모달
- **컴포넌트**: `QuestDetailSheet.tsx`

---

## 5. 구현 작업 목록

### Phase 1: 데이터 모델 업데이트 (우선순위 ⭐⭐⭐)

#### 5.1 타입 정의 업데이트
- [x] `src/types/index.ts` - Goal, Project, Task 타입 확장
- [x] 마이그레이션 유틸리티 함수 작성 (`lib/migrations.ts`)

#### 5.2 Store 업데이트
- [x] `useGoalStore.ts`
  - [x] `currentValue`, `targetValue`, `unit` 필드 추가
  - [x] `incrementValue()`, `decrementValue()` 액션 추가
  - [x] `addValueChange()` 히스토리 기록 액션
  - [x] 마이그레이션 로직 추가

- [x] `useProjectStore.ts`
  - [x] `status` 필드 추가
  - [x] `updateStatus()` 액션 추가
  - [x] 마이그레이션 로직 추가

- [x] `useTaskStore.ts`
  - [x] `endDate`, `frequencyTarget`, `frequencyPeriod`, `completionCount` 필드 추가
  - [x] `incrementCompletion()` 액션 추가
  - [x] 마이그레이션 로직 추가

### Phase 2: Goals 기능 구현 (우선순위 ⭐⭐⭐) ✅

#### 5.3 GoalCard 개선
- [x] `src/components/GoalCard.tsx` 수정
  - [x] 달성수치 표시 영역 추가
  - [x] +/- 버튼 UI 추가
  - [x] 수치 변경 핸들러 연결
  - [x] 진행률 시각화 개선 (그라데이션 색상)
  - [x] 카드 클릭 이벤트 추가

#### 5.4 Goal 상세 모달 구현
- [x] `src/components/GoalDetailSheet.tsx` 생성
  - [x] Bottom Sheet 구조 구현
  - [x] 편집 가능 필드 구현
  - [x] 수치 히스토리 표시
  - [x] 연결된 프로젝트 리스트
  - [x] 저장/삭제 기능

#### 5.5 i18n 번역 추가
- [x] `messages/ko.json` - goal 섹션 업데이트
- [x] `messages/en.json` - goal 섹션 업데이트
- [x] **i18n 키 추가 완료**

### Phase 3: Projects 기능 구현 (우선순위 ⭐⭐) ✅

#### 5.6 ProjectCard 개선
- [x] `src/components/ProjectCard.tsx` 수정
  - [x] 목표명 표시 추가
  - [x] 상태 배지 추가
  - [x] 상태 변경 UI (상세 페이지에서 구현)

#### 5.7 Project 상세 페이지 구현
- [x] `src/app/[locale]/projects/[id]/page.tsx` 생성
  - [x] 프로젝트 정보 표시 및 편집
  - [x] 상태 변경 기능
  - [x] 연결된 Quest 리스트 (habits/todos 표시)
  - [ ] Quest 추가 버튼 (선택 구현: FloatingAddButton 사용)
  - [x] 저장/삭제 기능

#### 5.8 i18n 번역 추가
- [x] `messages/ko.json` - project 섹션 업데이트
- [x] `messages/en.json` - project 섹션 업데이트

### Phase 4: Quest (Task) 기능 구현 (우선순위 ⭐⭐) ✅

#### 5.9 Task → Quest 명칭 변경
- [x] 코드 전체에서 "Task" → "Quest" 용어 변경
  - [x] 컴포넌트 파일명 유지 (TaskList.tsx - breaking change 방지)
  - [x] 타입 이름 유지 (Task 타입 그대로)
  - [x] UI 텍스트 변경 (i18n에서 quest로 표시)

#### 5.10 QuestCard (TaskList) 개선
- [x] 습관 타입 정보 표시
  - [x] 기간 표시 (FiCalendar)
  - [x] 빈도 표시 (주 3회 등, FiRepeat)
  - [x] 완료 횟수 표시
  - [x] 연속일 표시 (🔥 streak)
- [x] 할일 타입 정보 표시
  - [x] 종료날짜 표시 (FiCalendar)
  - [x] D-day 표시 (FiClock, 색상 코딩)

#### 5.11 Quest 상세 모달 구현
- [ ] `src/components/QuestDetailSheet.tsx` 생성 (선택 구현)
  - [ ] 타입별 조건부 필드 표시
  - [ ] 빈도 설정 UI (습관 전용)
  - [ ] 저장/삭제 기능
  - **참고**: TaskFormBottomSheet로 생성/편집 가능

#### 5.12 i18n 번역 추가
- [x] `messages/ko.json` - quest/task 섹션 추가
- [x] `messages/en.json` - quest/task 섹션 추가

### Phase 5: 보상 시스템 구현 (우선순위 ⭐⭐⭐) ✅

#### 5.13 보상 로직 구현
- [x] `lib/rewards.ts` 수정
  - [x] GOAL_REWARD (500), PROJECT_REWARD (300) 상수 추가
  - [x] 중복 지급 방지 로직 (Store에서 구현)
  - [x] PlayerStore 코인 업데이트
  - **참고**: 별도 함수 대신 Store 액션으로 통합

#### 5.14 Store 액션 추가
- [x] `useGoalStore.ts`
  - [x] `claimReward(id)` 액션 추가
  - [x] rewardClaimed 플래그 관리
  - [x] status 검증 로직

- [x] `useProjectStore.ts`
  - [x] `claimReward(id)` 액션 추가
  - [x] rewardClaimed 플래그 관리
  - [x] status 검증 로직

- [x] `useTaskStore.ts`
  - [x] Quest 완료 시 rewardClaimed 플래그 설정
  - [x] 기존 경험치 시스템과 통합 유지

#### 5.15 UI 피드백
- [x] 보상 지급 시 애니메이션 (중앙 팝업, 2초)
- [x] 코인 증가 표시 (+500, +300)
- [x] 중복 지급 방지 메시지 (Toast 알림)

### Phase 6: 통합 및 테스트 (우선순위 ⭐) ✅

#### 5.16 통합 테스트
- [x] Goal → Project 연결 테스트
- [x] Project → Quest 연결 테스트
- [x] 보상 시스템 테스트 (중복 방지 검증)
- [x] 데이터 마이그레이션 테스트
- [x] localStorage 데이터 정합성 검증

#### 5.17 UX 개선
- [x] 로딩 상태 표시 (Skip: localStorage 동기 작업으로 불필요)
- [x] 에러 처리 및 사용자 피드백 (Toast 알림 시스템 구현)
- [x] 애니메이션 최적화 (Framer Motion 최적화 완료)
- [x] 모바일 반응형 검증 (Tailwind CSS 반응형 클래스 사용)
- [x] 접근성 개선 (ARIA 속성, 키보드 네비게이션)

---

## 6. 기술적 고려사항

### 6.1 데이터 마이그레이션

**문제**: 기존 사용자 데이터 (localStorage)에 새 필드가 없음

**해결 방안**:
```typescript
// lib/migrations.ts
export function migrateGoalData(oldGoal: OldGoal): Goal {
  return {
    ...oldGoal,
    currentValue: oldGoal.currentValue ?? 0,
    targetValue: oldGoal.targetValue ?? 100,
    unit: oldGoal.unit ?? '%',
    valueHistory: oldGoal.valueHistory ?? []
  };
}

// useGoalStore.ts
export const useGoalStore = create<GoalStore>()(
  persist(
    (set) => ({
      goals: [],
      // ... actions
    }),
    {
      name: "goal-storage",
      version: 2, // 버전 증가
      migrate: (persistedState, version) => {
        if (version === 1) {
          return {
            goals: persistedState.goals.map(migrateGoalData)
          };
        }
        return persistedState;
      }
    }
  )
);
```

### 6.2 보상 시스템 설계

**중복 지급 방지 로직**:
```typescript
// lib/rewards.ts
export function claimGoalReward(goalId: string): RewardResult {
  const goal = useGoalStore.getState().goals.find(g => g.id === goalId);

  if (!goal) {
    return { success: false, message: "목표를 찾을 수 없습니다" };
  }

  if (goal.rewardClaimed) {
    return { success: false, message: "이미 보상을 받았습니다" };
  }

  if (goal.status !== 'completed') {
    return { success: false, message: "목표를 완료해야 보상을 받을 수 있습니다" };
  }

  // 보상 지급
  usePlayerStore.getState().addCoins(goal.rewardAmount);
  useGoalStore.getState().updateGoal(goalId, { rewardClaimed: true });

  return { success: true, amount: goal.rewardAmount };
}
```

**자동 보상 지급**:
- 상태 변경 시 자동으로 보상 지급 확인
- `status`가 'completed'로 변경되면 자동 호출
- 사용자에게 시각적 피드백 제공

### 6.3 성능 최적화

**수치 변경 히스토리**:
- 최근 100개만 저장 (localStorage 용량 제한)
- 필요시 페이지네이션 또는 가상 스크롤

**리스트 렌더링**:
- `React.memo()` 사용하여 불필요한 리렌더링 방지
- 큰 리스트는 가상 스크롤 고려

### 6.4 사용자 경험

**수치 변경 피드백**:
- +/- 버튼 클릭 시 햅틱 피드백 (모바일)
- 애니메이션으로 수치 변화 표현
- Framer Motion 활용

**상태 변경 시각화**:
- Goal/Project 상태 변경 시 색상 전환 애니메이션
- "시작전" → 회색, "진행중" → 파란색, "완료" → 초록색

**보상 지급 피드백**:
- 완료 시 코인 증가 애니메이션
- "+500 코인!", "+300 코인!" 토스트 메시지
- 중복 지급 시도 시 "이미 보상을 받았습니다" 안내

### 6.5 접근성 (Accessibility)

- [ ] 모든 버튼에 `aria-label` 추가
- [ ] 키보드 네비게이션 지원
- [ ] 스크린 리더 호환성 테스트
- [ ] 색맹 사용자를 위한 색상 대비 검증

### 6.6 다국어 지원

**i18n 키 구조**:
```json
{
  "goal": {
    "currentValue": "현재",
    "targetValue": "목표",
    "unit": "단위",
    "valueHistory": "변경 기록",
    "increment": "증가",
    "decrement": "감소",
    "status": {
      "label": "상태",
      "notStarted": "시작전",
      "inProgress": "진행중",
      "completed": "완료"
    },
    "reward": {
      "claimed": "보상 받음",
      "claimSuccess": "보상 {amount} 코인을 받았습니다!",
      "alreadyClaimed": "이미 보상을 받았습니다"
    }
  },
  "project": {
    "status": {
      "label": "상태",
      "notStarted": "시작전",
      "inProgress": "진행중",
      "completed": "완료"
    },
    "reward": {
      "claimed": "보상 받음",
      "claimSuccess": "보상 {amount} 코인을 받았습니다!",
      "alreadyClaimed": "이미 보상을 받았습니다"
    }
  },
  "quest": {
    "type": "유형",
    "frequency": "빈도",
    "endDate": "종료날짜",
    "completionCount": "완료 횟수",
    "reward": {
      "claimed": "보상 받음"
    }
  }
}
```

---

## 7. 예상 일정

| Phase | 작업 | 예상 시간 |
|-------|------|-----------|
| Phase 1 | 데이터 모델 업데이트 | 2-3시간 |
| Phase 2 | Goals 기능 구현 | 4-5시간 |
| Phase 3 | Projects 기능 구현 | 4-5시간 |
| Phase 4 | Quest 기능 구현 | 4-5시간 |
| Phase 5 | 보상 시스템 구현 | 3-4시간 |
| Phase 6 | 통합 및 테스트 | 2-3시간 |
| **총계** | | **19-25시간** |

---

## 8. 리스크 및 대응 방안

### 리스크 1: 데이터 손실
**대응**:
- localStorage 백업 기능 추가
- 마이그레이션 실패 시 롤백 로직

### 리스크 2: 성능 저하
**대응**:
- 히스토리 데이터 제한
- 리스트 가상화
- 메모이제이션 적극 활용

### 리스크 3: UX 복잡도 증가
**대응**:
- 점진적 공개 (Progressive Disclosure)
- 필수 정보만 카드에 표시
- 상세 정보는 모달/페이지로 분리

### 리스크 4: 보상 중복 지급
**대응**:
- `rewardClaimed` 플래그로 중복 방지
- 상태 변경 트랜잭션 원자성 보장
- 마이그레이션 시 기존 완료 항목 처리

---

## 9. 다음 단계

1. **Phase 1 시작**: 타입 정의 및 Store 업데이트
2. **i18n-generator agent 준비**: 번역 키 사전 정의
3. **UI 목업 검토**: Figma 또는 간단한 스케치
4. **구현 우선순위 확정**: 사용자 피드백 기반 조정

---

**문서 버전**: 2.0
**최종 수정**: 2026-02-11
**주요 변경사항**:
- Goals에 상태 필드 추가
- 보상 시스템 설계 (Goals: 500 코인, Projects: 300 코인, Quest: 경험치)
- 중복 지급 방지 로직 추가
- Phase 5 보상 시스템 구현 추가
