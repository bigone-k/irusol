# DuTo MVP 미구현 기능 목록

> project-plan.md와 대조한 누락 기능 정리
> 분석 일자: 2026-02-07

---

## 📊 전체 요약

### 구현 현황
- ✅ **완료**: 핵심 화면 구조, 캐릭터 시스템, 보상 계산, 다국어
- ⚠️ **부분 완료**: 통계 산출, 보상 지급 연동
- ❌ **미구현**: streak 시스템, DailyLog/DailyCheck, 7일 통계, 수정 기능

### 구현률
```
MVP 핵심 루프 (A섹션): 60% (6/10)
MVP 캐릭터 (B섹션): 100% (4/4)
MVP 화면 (5개): 90% (일부 기능 누락)
데이터 모델: 75% (DailyLog/DailyCheck 누락)
```

---

## 🚨 P0: MVP 필수 기능 (즉시 구현 필요)

### 1. DailyCheck/DailyLog 데이터 모델 구현

**현재 상태**:
- types/index.ts에 정의 없음
- 관련 store 미구현
- Daily 단위 기록 시스템 부재

**구현 필요 사항**:

#### 1.1 타입 정의 추가
```typescript
// src/types/index.ts에 추가

export interface DailyLog {
  id: string;
  date: string; // YYYY-MM-DD 형식
  totalChecks: number;
  completedChecks: number;
  totalExp: number;
  totalCoins: number;
  createdAt: Date;
}

export interface DailyCheck {
  id: string;
  taskId: string;
  date: string; // YYYY-MM-DD 형식
  completed: boolean;
  streak: number;
  createdAt: Date;
}
```

#### 1.2 Store 생성
```typescript
// src/store/useDailyStore.ts 생성 필요

- DailyLog CRUD
- DailyCheck CRUD
- 날짜별 조회 함수
- 통계 집계 함수
```

**영향 범위**:
- streak 계산의 기반
- 7일 통계의 데이터 소스
- Today 체크 기록 저장

---

### 2. streak(연속일) 계산 시스템

**현재 상태**:
- Task 타입에 `streak?: number` 필드만 존재
- 계산 로직 완전 미구현
- DailyCheck 기록 없어 계산 불가능

**구현 필요 사항**:

#### 2.1 streak 계산 로직
```typescript
// src/lib/streak.ts 생성 필요

interface StreakResult {
  currentStreak: number;
  maxStreak: number;
  lastCheckDate: string;
}

// 함수 구현 필요:
- calculateStreak(taskId: string, dailyChecks: DailyCheck[]): StreakResult
- updateStreakOnCheck(taskId: string, date: string): void
- resetStreakIfBroken(taskId: string): void
```

#### 2.2 streak 계산 규칙
```yaml
연속일 카운트:
  - 연속으로 완료한 날짜 수
  - 1일 건너뛰면 0으로 리셋
  - Habit 타입에만 적용

업데이트 시점:
  - Today 체크 완료 시
  - 자정 넘어갈 때 검증

표시 위치:
  - Today 화면 각 Task 옆
  - Task 상세 정보
  - Character/Stats 화면
```

**영향 범위**:
- Today 체크 로직 수정
- Task 타입 UI 업데이트
- 통계 화면 추가 항목

---

### 3. Today 체크 → 보상 지급 연동

**현재 상태**:
- ✅ `usePlayerStore.completeTask(difficulty)` 존재
- ✅ `useTaskStore.toggleTask(id)` 존재
- ❌ 두 함수가 연동되지 않음
- ❌ 보상 결과 UI 표시 없음

**구현 필요 사항**:

#### 3.1 Today 화면 수정
```typescript
// src/app/[locale]/today/page.tsx

현재:
const handleCheck = (id: string) => {
  toggleTask(id);
};

수정 필요:
const handleCheck = (id: string) => {
  const task = tasks.find(t => t.id === id);
  if (!task || task.completed) return;

  // 1. Task 완료 처리
  toggleTask(id);

  // 2. 보상 지급
  const result = completeTask(task.difficulty);

  // 3. DailyCheck 기록
  createDailyCheck({
    taskId: id,
    date: getTodayString(),
    completed: true,
  });

  // 4. streak 업데이트
  updateStreakOnCheck(id, getTodayString());

  // 5. 보상 결과 표시
  showRewardResult(result);
};
```

#### 3.2 보상 결과 UI
```typescript
// src/components/RewardResult.tsx 생성 필요

표시 내용:
- 획득 Exp/Coins
- 레벨업 여부 (leveledUp: true)
- 진화 여부 (evolved: true)
- 새 레벨/스테이지

표시 방식:
- Toast 알림 or
- 모달 팝업 (애니메이션 포함)
```

**영향 범위**:
- Today 화면 체크 로직 전면 수정
- 새 컴포넌트 생성 (RewardResult)
- useDailyStore 연동

---

### 4. 7일 달성률 통계

**현재 상태**:
- ✅ `getDailyStats()` → 오늘만 계산
- ❌ 7일 데이터 조회 불가
- ❌ 달성률 계산 로직 없음

**구현 필요 사항**:

#### 4.1 7일 통계 함수
```typescript
// src/store/useDailyStore.ts에 추가

interface WeeklyStats {
  totalDays: number; // 7
  completedDays: number; // 체크한 날 수
  achievementRate: number; // 완료율 (%)
  dailyLogs: DailyLog[]; // 7일간 기록
}

getWeeklyStats(): WeeklyStats {
  const today = new Date();
  const last7Days = getLast7Days(today);

  const logs = dailyLogs.filter(log =>
    last7Days.includes(log.date)
  );

  const completedDays = logs.filter(log =>
    log.completedChecks > 0
  ).length;

  return {
    totalDays: 7,
    completedDays,
    achievementRate: Math.round((completedDays / 7) * 100),
    dailyLogs: logs,
  };
}
```

#### 4.2 UI 표시
```typescript
// Today 화면 하단 통계 영역

현재:
- 오늘 완료 개수 / 전체 개수

추가 필요:
- 최근 7일 달성률: 85%
- 그래프 (선택사항)
```

**영향 범위**:
- useDailyStore 함수 추가
- Today 화면 통계 영역 확장
- DailyLog 데이터 의존

---

## ⚠️ P1: MVP 권장 기능

### 5. Task/Habit 수정 기능

**현재 상태**:
- ✅ `addTask()`, `deleteTask()` 존재
- ❌ `updateTask()` 미구현
- ❌ 수정 UI 없음

**구현 필요 사항**:

#### 5.1 Store 함수 추가
```typescript
// src/store/useTaskStore.ts

updateTask: (id: string, updates: Partial<Task>) => {
  set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, ...updates } : task
    ),
  }));
}
```

#### 5.2 수정 UI
```typescript
// Tasks 화면에 Edit 버튼 추가
// 또는 Task 클릭 시 수정 폼 표시
// AddTaskButton 컴포넌트 재사용 (edit mode)
```

**영향 범위**:
- useTaskStore 수정
- Tasks 화면 UI 업데이트
- 수정 모드 상태 관리

---

### 6. 레벨업/진화 알림 UI

**현재 상태**:
- ✅ `completeTask()` → `RewardResult` 반환
- ❌ 레벨업/진화 알림 표시 없음
- ❌ 애니메이션 없음

**구현 필요 사항**:

#### 6.1 알림 컴포넌트
```typescript
// src/components/LevelUpNotification.tsx

표시 내용:
- 레벨업: "Level Up! Lv 5 → Lv 6"
- 진화: "진화! Sproutling → Blooming"
- 캐릭터 이미지 변화 애니메이션

표시 방식:
- 중앙 모달 or 풀스크린 애니메이션
- 축하 이펙트 (confetti 등)
- 3초 후 자동 닫힘
```

#### 6.2 통합
```typescript
// Today 화면 handleCheck()에서 호출

if (result.leveledUp) {
  showLevelUpNotification(result);
}

if (result.evolved) {
  showEvolutionAnimation(result);
}
```

**영향 범위**:
- 새 컴포넌트 생성
- 애니메이션 라이브러리 (framer-motion 활용)
- Today 화면 연동

---

## 📦 P2: MVP+ 기능 (선택)

### 7. Goal/Project 수정/삭제

**현재 상태**:
- ✅ `addGoal()`, `toggleGoal()` 존재
- ✅ `addProject()`, `toggleProject()` 존재
- ❌ 수정/삭제 함수 없음

**구현 필요 사항**:
```typescript
// useGoalStore
updateGoal(id, updates)
deleteGoal(id)

// useProjectStore
updateProject(id, updates)
deleteProject(id)

// UI
- Goals 화면 Edit/Delete 버튼
- Projects 화면 Edit/Delete 버튼
```

---

### 8. 진화 애니메이션

**현재 상태**:
- ✅ 진화 이미지 4단계 준비 완료
- ❌ 진화 전환 애니메이션 없음

**구현 필요 사항**:
```typescript
// 풀스크린 진화 애니메이션

단계:
1. 현재 캐릭터 이미지 확대
2. 빛 이펙트 (플래시)
3. 새 캐릭터로 교체
4. 축하 텍스트 표시
5. 3초 후 Today 화면 복귀

기술:
- framer-motion
- CSS keyframes
- SVG 이펙트
```

---

## 📁 생성 필요 파일 목록

### 타입 정의
```
src/types/index.ts (수정)
  - DailyLog 인터페이스 추가
  - DailyCheck 인터페이스 추가
```

### Store
```
src/store/useDailyStore.ts (생성)
  - DailyLog 관리
  - DailyCheck 관리
  - 통계 집계 함수
```

### 유틸리티
```
src/lib/streak.ts (생성)
  - calculateStreak()
  - updateStreakOnCheck()
  - resetStreakIfBroken()

src/lib/date.ts (생성)
  - getTodayString()
  - getLast7Days()
  - formatDate()
```

### 컴포넌트
```
src/components/RewardResult.tsx (생성)
  - 보상 결과 표시

src/components/LevelUpNotification.tsx (생성)
  - 레벨업 알림

src/components/EvolutionAnimation.tsx (생성)
  - 진화 애니메이션
```

---

## 📊 우선순위별 구현 순서

### Week 1: P0 필수 기능
```yaml
Day 1-2:
  - DailyLog/DailyCheck 타입 정의
  - useDailyStore 구현
  - date.ts 유틸리티 생성

Day 3-4:
  - streak.ts 로직 구현
  - Today 체크 → 보상 지급 연동
  - RewardResult 컴포넌트

Day 5:
  - 7일 통계 함수
  - Today 화면 통계 영역 확장
  - 테스트 및 검증
```

### Week 2: P1 권장 기능
```yaml
Day 1-2:
  - Task 수정 기능 (store + UI)
  - LevelUpNotification 컴포넌트

Day 3-4:
  - 레벨업/진화 알림 통합
  - 애니메이션 추가

Day 5:
  - 전체 기능 통합 테스트
  - 버그 수정
```

### Week 3: P2 선택 기능 (시간 허용 시)
```yaml
- Goal/Project 수정/삭제
- 진화 애니메이션
- 추가 통계 화면
```

---

## 🔍 검증 체크리스트

### P0 완료 기준
- [ ] DailyCheck 생성 및 조회 가능
- [ ] DailyLog 일별 집계 정상 동작
- [ ] streak 계산 정확성 (연속일, 리셋)
- [ ] Today 체크 → 보상 지급 → UI 표시 전체 플로우
- [ ] 7일 통계 정확성 검증
- [ ] 레벨업/진화 시 알림 표시

### P1 완료 기준
- [ ] Task 수정 기능 정상 동작
- [ ] 레벨업/진화 애니메이션 품질

### 전체 MVP 완료 기준
- [ ] project-plan.md의 MVP A섹션 100% 구현
- [ ] 5개 화면 모두 기능 완료
- [ ] 다국어 텍스트 누락 없음
- [ ] 모바일 반응형 정상 동작

---

## 📝 참고 사항

### 알려진 이슈 (project-plan.md 기준)
```yaml
기능:
  ❌ Today 체크 시스템 미구현
  ❌ 보상 지급 로직 미구현 (연동 누락)
  ❌ streak 계산 미구현
  ⚠️ 진화 시스템 부분 구현 (이미지만 준비, 애니메이션 없음)
  ❌ 통계 산출 미구현 (7일 통계)

데이터:
  ❌ DailyLog 엔티티 미구현
  ❌ DailyCheck 엔티티 미구현
  ⚠️ 로컬 스토리지만 지원 (백업 없음)

UI/UX:
  ⚠️ Onboarding 기본 구현 (개선 필요)
  ✅ Goals/Projects 목록 구현됨
  ❌ 진화 애니메이션 미구현
  ⚠️ 모바일 최적화 부족
```

### 기술 부채
```yaml
우선순위:
  High:
    - DailyCheck 트랜잭션 처리 (중복 체크 방지)
    - streak 계산 최적화
    - 날짜 처리 일관성 (timezone)

  Medium:
    - 로컬 스토리지 → IndexedDB 마이그레이션
    - 데이터 백업/복원 기능
    - 에러 핸들링 강화

  Low:
    - 코드 스플리팅
    - 번들 최적화
    - 접근성 개선
```

---

**최종 업데이트**: 2026-02-07
**다음 업데이트**: P0 완료 후
