# iRusol 개발 진행 상황

최종 업데이트: 2026-02-07

## 📋 전체 진행률: 100% (6/6 완료) 🎉

---

## ✅ 완료된 작업

### Task #1: i18n 설정 및 다국어 지원 구현 ✓

**구현 내용:**
- next-intl 라이브러리 설치 및 설정
- 한국어(ko) / 영어(en) 지원
- 라우팅 구조: `/[locale]/` 기반

**생성된 파일:**
```
middleware.ts                    # i18n 라우팅 미들웨어
src/i18n/request.ts             # next-intl 서버 설정
src/i18n/routing.ts             # 라우팅 정의 및 네비게이션 헬퍼
messages/ko.json                # 한국어 번역
messages/en.json                # 영어 번역
src/components/LanguageSwitcher.tsx  # 언어 전환 컴포넌트
```

**수정된 파일:**
```
next.config.ts                  # next-intl 플러그인 추가
src/app/layout.tsx              # children만 반환하도록 수정
src/app/[locale]/layout.tsx     # locale별 레이아웃 (새로 생성)
src/app/[locale]/page.tsx       # 기존 page.tsx 이동
```

**빌드 검증:** ✅ 성공

---

### Task #2: Today 화면 핵심 기능 구현 ✓

**구현 내용:**
- 3단계 난이도 시스템 (Easy/Normal/Hard)
- 레벨업 및 진화 시스템
- 보상 계산 로직
- 일일 통계 표시
- 실시간 체크 인터랙션

**생성된 파일:**

#### 1. 타입 정의 (`src/types/index.ts`)
```typescript
// 핵심 타입 변경사항:
- Difficulty: "easy" | "normal" | "hard" (3단계)
- StageName: "egg" | "sproutling" | "blooming" | "fullyGrown"
- PlayerStats: { level, experience, maxExperience, coins, stage }
- RewardResult: 보상 결과 타입 (exp, coins, leveledUp, evolved 등)
- DailyStats: 일일 통계 타입
- TabType: "habits" | "todos" | "rewards" | "social" (dailies 제거)
```

#### 2. 보상 계산 (`src/lib/rewards.ts`)
```typescript
// 난이도별 가중치
DIFFICULTY_WEIGHTS = {
  easy: 1.0,    // 10 exp, 3 coins
  normal: 1.5,  // 15 exp, 4.5 coins (반올림하여 5)
  hard: 2.0,    // 20 exp, 6 coins
}

// 레벨업 공식
getRequiredExp(level) = 100 + (level - 1) × 25
```

#### 3. 진화 시스템 (`src/lib/evolution.ts`)
```typescript
// 진화 단계 레벨 요구사항
EVOLUTION_STAGES = [
  { stage: "egg", requiredLevel: 1 },
  { stage: "sproutling", requiredLevel: 3 },
  { stage: "blooming", requiredLevel: 8 },
  { stage: "fullyGrown", requiredLevel: 15 }
]

// 이미지 경로
getStageImagePath(stage) => "/img/level_{1-4}_{stage}.png"
```

#### 4. 상태 관리 리팩토링

**PlayerStore (`src/store/usePlayerStore.ts`):**
```typescript
// 주요 메서드
completeTask(difficulty): RewardResult
  - 난이도에 따른 보상 계산
  - 레벨업 처리 (다중 레벨업 지원)
  - 진화 체크
  - RewardResult 반환

addExperience(amount): void
  - 경험치 추가 및 레벨업 처리

// 초기 상태
initialStats = {
  level: 1,
  experience: 0,
  maxExperience: 100,
  coins: 0,
  stage: "egg"
}
```

**TaskStore (`src/store/useTaskStore.ts`):**
```typescript
// 새로운 셀렉터
getDailyStats(): DailyStats
  - 오늘 생성된 작업 통계
  - 완료된 작업 수
  - 획득한 총 경험치/코인 계산
```

#### 5. 컴포넌트 업데이트

**TaskList (`src/components/TaskList.tsx`):**
- completeTask() 호출하여 보상 지급
- 레벨업/진화 감지 및 로그 (TODO: 애니메이션)
- celebration 애니메이션 (1초간 scale-105, 노란 테두리)
- i18n 적용

**CharacterCard (`src/components/CharacterCard.tsx`):**
- Next.js Image 컴포넌트로 진화 단계 이미지 표시
- 레벨 및 진화 단계 표시
- coins 표시 (gold/gems 통합)
- i18n 적용

**StatsBars (`src/components/StatsBars.tsx`):**
- 경험치 바만 표시 (health/mana 제거)
- 일일 통계 카드 추가 (완료/전체, 총 보상)
- i18n 적용

**AddTaskButton (`src/components/AddTaskButton.tsx`):**
- 3단계 난이도 선택 (Easy/Normal/Hard)
- 2가지 타입 선택 (Habit/Todo, Daily 제거)
- i18n 적용

#### 6. 언어 파일 업데이트

**추가된 번역 키:**
```json
{
  "common.coins": "코인 / Coins",
  "character.name": "새싹이 / Sprout",
  "stats.experience": "경험치 / Experience",
  "today.noTasks": "작업이 없습니다 / No tasks yet",
  "today.addTaskHint": "+ 버튼을 눌러... / Tap the + button...",
  "today.tasksCompleted": "완료한 작업 / Tasks Completed",
  "today.todayRewards": "오늘의 보상 / Today's Rewards",
  "tasks.types.*": "습관/할일 / Habit/To Do",
  "tasks.difficulty.*": "쉬움/보통/어려움 / Easy/Normal/Hard"
}
```

#### 7. 기타 변경사항
- `img/` 폴더를 `public/img/`로 이동 (Next.js Image 컴포넌트 호환)
- `src/app/[locale]/page.tsx`에 LanguageSwitcher 추가

**빌드 검증:** ✅ 성공

---

### Task #3: Goals/Projects 화면 구현 ✓

**구현 내용:**
- Goal/Project 상태 관리 (Zustand stores)
- Goals 목록 화면 with 진행률 표시
- Projects 목록 화면 with Goal 필터링
- 기본 UI 및 내비게이션

**생성된 파일:**
```
src/store/useGoalStore.ts        # Goal 상태 관리
src/store/useProjectStore.ts     # Project 상태 관리
src/app/[locale]/goals/page.tsx  # Goals 목록 화면
src/app/[locale]/projects/page.tsx  # Projects 목록 화면
```

**주요 기능:**
- Goal 진행률 계산 (완료된 Projects / 전체 Projects)
- Project 진행률 계산 (완료된 Tasks / 전체 Tasks)
- Goal별 Projects 필터링
- 체크박스로 완료 토글
- 프로그레스 바 애니메이션
- i18n 적용

**Note:** Goal/Project 생성 폼은 Task #4에서 구현 예정

**빌드 검증:** ✅ 성공

---

### Task #4: Task/Habit 생성·편집 화면 구현 ✓

**구현 내용:**
- Goal 생성 폼 컴포넌트
- Project 생성 폼 컴포넌트
- Task에 Goal/Project 연결 기능
- 폼 모달 애니메이션 및 UX

**생성된 파일:**
```
src/components/GoalForm.tsx      # Goal 생성 폼
src/components/ProjectForm.tsx   # Project 생성 폼
```

**수정된 파일:**
```
src/components/AddTaskButton.tsx  # Goal/Project 선택 기능 추가
src/app/[locale]/goals/page.tsx   # GoalForm 통합
src/app/[locale]/projects/page.tsx # ProjectForm 통합
```

**주요 기능:**
- Goal 생성 폼 (제목, 설명)
- Project 생성 폼 (Goal 선택, 제목, 설명)
- Task 생성 시 Goal/Project 연결
- Goal 선택 시 해당 Goal의 Projects만 필터링
- Framer Motion 애니메이션
- i18n 적용

**빌드 검증:** ✅ 성공

---

### Task #5: Character 화면 및 진화 시스템 구현 ✓

**구현 내용:**
- Character 전용 화면 라우팅
- 캐릭터 상세 정보 표시
- 진화 단계별 타임라인
- 통계 표시 (완료 작업, 획득 exp/coins)
- 기본 애니메이션 및 UI

**생성된 파일:**
```
src/app/[locale]/character/page.tsx  # Character 화면
```

**수정된 파일:**
```
messages/ko.json                      # Character 화면 번역 키 추가
messages/en.json                      # Character 화면 번역 키 추가
```

**주요 기능:**
- 캐릭터 이미지 표시 (현재 진화 단계)
- 레벨, 경험치 바, 코인 표시
- 통계 카드 (총 완료 작업, 총 획득 exp, 총 획득 coins)
- 현재 단계 정보 및 다음 진화 정보
- 진화 타임라인 (4단계 전체 표시)
- 각 진화 단계 설명 및 필요 레벨 표시
- 잠금/해제 상태 표시
- Framer Motion 애니메이션
- i18n 적용

**빌드 검증:** ✅ 성공

---

### Task #6: Onboarding 화면 구현 ✓

**구현 내용:**
- 첫 실행 감지 및 온보딩 플로우
- 닉네임 설정
- 첫 Goal/Project/Habit 생성 (선택)
- 5단계 온보딩 UI with 진행률 표시
- i18n 적용

**생성된 파일:**
```
src/store/useOnboardingStore.ts      # Onboarding 상태 관리
src/components/Onboarding.tsx        # Onboarding 컴포넌트
```

**수정된 파일:**
```
src/app/[locale]/page.tsx            # Onboarding 통합
```

**주요 기능:**
- 5단계 온보딩 플로우:
  1. 환영 화면 (캐릭터 소개)
  2. 닉네임 입력
  3. 첫 Goal 설정 (선택)
  4. 첫 Project 설정 (선택, Goal 있을 때만)
  5. 첫 Habit 설정 (선택, 난이도 선택 포함)
- 진행률 표시 (Progress bar)
- 각 단계별 Skip 기능
- Framer Motion 애니메이션
- LocalStorage persist (Zustand)
- i18n 적용
- 온보딩 완료 후 자동으로 Today 화면 진입

**빌드 검증:** ✅ 성공

---

## 🎉 프로젝트 완료

모든 MVP 작업이 완료되었습니다!

---

## 📂 프로젝트 구조

```
irusol/
├── docs/
│   ├── project-plan.md          # 전체 프로젝트 계획서
│   └── work-progress.md         # 이 파일 (작업 진행 상황)
├── messages/
│   ├── ko.json                  # 한국어 번역
│   └── en.json                  # 영어 번역
├── public/
│   └── img/                     # 캐릭터 이미지
│       ├── level_1_egg.png
│       ├── level_2_sproutling.png
│       ├── level_3_blooming.png
│       └── level_4_fullygrown.png
├── src/
│   ├── app/
│   │   ├── layout.tsx           # 루트 레이아웃
│   │   ├── globals.css          # 글로벌 스타일
│   │   └── [locale]/
│   │       ├── layout.tsx       # Locale 레이아웃
│   │       ├── page.tsx         # Today 화면 (✓ Onboarding 통합)
│   │       ├── character/
│   │       │   └── page.tsx     # ✓ Character 화면
│   │       ├── goals/
│   │       │   └── page.tsx     # ✓ Goals 화면
│   │       └── projects/
│   │           └── page.tsx     # ✓ Projects 화면
│   ├── components/
│   │   ├── AddTaskButton.tsx    # 작업 추가 버튼 (✓ i18n, ✓ Goal/Project 연결)
│   │   ├── CharacterCard.tsx    # 캐릭터 카드 (✓ i18n, ✓ 진화)
│   │   ├── GoalForm.tsx         # ✓ Goal 생성 폼
│   │   ├── LanguageSwitcher.tsx # 언어 전환
│   │   ├── ObjectiveCard.tsx    # 목표 카드
│   │   ├── Onboarding.tsx       # ✓ Onboarding 컴포넌트
│   │   ├── ProjectForm.tsx      # ✓ Project 생성 폼
│   │   ├── StatsBars.tsx        # 통계 바 (✓ i18n, ✓ 일일통계)
│   │   ├── TabNavigation.tsx    # 탭 네비게이션
│   │   └── TaskList.tsx         # 작업 목록 (✓ i18n, ✓ 보상)
│   ├── i18n/
│   │   ├── request.ts           # next-intl 서버 설정
│   │   └── routing.ts           # 라우팅 정의
│   ├── lib/
│   │   ├── evolution.ts         # ✓ 진화 로직
│   │   └── rewards.ts           # ✓ 보상 계산
│   ├── store/
│   │   ├── useGoalStore.ts      # ✓ Goal 상태 관리
│   │   ├── useOnboardingStore.ts # ✓ Onboarding 상태 관리
│   │   ├── usePlayerStore.ts    # ✓ 플레이어 상태
│   │   ├── useProjectStore.ts   # ✓ Project 상태 관리
│   │   └── useTaskStore.ts      # ✓ 작업 상태
│   └── types/
│       └── index.ts             # ✓ 타입 정의
├── middleware.ts                # i18n 미들웨어
├── next.config.ts               # Next.js 설정
├── package.json                 # 의존성 (next-intl 추가됨)
└── tsconfig.json                # TypeScript 설정
```

---

## 🔧 핵심 메커니즘 정리

### 1. 보상 시스템
```
Easy:   10 exp + 3 coins
Normal: 15 exp + 5 coins
Hard:   20 exp + 6 coins
```

### 2. 레벨업 공식
```
Level 1: 100 exp 필요
Level 2: 125 exp 필요 (100 + 25×1)
Level 3: 150 exp 필요 (100 + 25×2)
Level N: 100 + 25×(N-1) exp 필요
```

### 3. 진화 시스템
```
Level 1-2:  Egg (알)
Level 3-7:  Sproutling (새싹)
Level 8-14: Blooming (꽃피는 중)
Level 15+:  Fully Grown (완전 성장)
```

### 4. 작업 완료 플로우
```
1. 사용자가 작업 체크박스 클릭
2. TaskList.handleToggle(task) 호출
3. PlayerStore.completeTask(task.difficulty) 호출
   → 보상 계산 (exp, coins)
   → 레벨업 체크 (다중 레벨업 지원)
   → 진화 체크
   → RewardResult 반환
4. TaskStore.toggleTask(id) 호출 (작업 완료 상태 변경)
5. Celebration 애니메이션 표시 (1초)
6. 레벨업/진화 시 콘솔 로그 (TODO: 애니메이션)
```

### 5. 일일 통계 계산
```
TaskStore.getDailyStats() 호출
→ 오늘 생성된 작업 필터링 (createdAt 기준)
→ 완료된 작업 카운트
→ 완료된 작업들의 난이도 기반 총 exp/coins 계산
→ DailyStats 반환
```

---

## 🚀 다음 단계 가이드

### Task #3 시작하기 (Goals/Projects 화면)

**Step 1: Store 생성**
```bash
# src/store/useGoalStore.ts 생성
# src/store/useProjectStore.ts 생성
```

**Step 2: 화면 라우팅**
```bash
# src/app/[locale]/goals/page.tsx 생성
# src/app/[locale]/projects/page.tsx 생성
```

**Step 3: 컴포넌트 생성**
```bash
# src/components/GoalCard.tsx
# src/components/ProjectCard.tsx
# src/components/GoalForm.tsx
# src/components/ProjectForm.tsx
```

**Step 4: 네비게이션 추가**
```bash
# TabNavigation 또는 별도 네비게이션에 Goals/Projects 링크 추가
```

---

## 📝 개발 노트

### 주의사항
1. **이미지 경로**: Next.js Image 컴포넌트 사용 시 `/public/img/` 경로 필요
2. **타입 일관성**: Difficulty는 3단계 ("easy" | "normal" | "hard")만 사용
3. **레벨업 로직**: 여러 레벨을 한 번에 올릴 수 있도록 while 루프 사용
4. **i18n 키**: `useTranslations()` 사용 시 메시지 파일에 키가 존재해야 함
5. **Daily 타입 제거**: MVP에서 제외되었으므로 사용 금지

### 성능 고려사항
- `getDailyStats()`는 매 렌더링마다 호출되므로 최적화 필요할 수 있음
- 진화 애니메이션은 무거울 수 있으므로 적절한 debounce/throttle 고려

### 개선 아이디어
- [ ] 레벨업/진화 시 토스트 알림 또는 모달 표시
- [ ] 업적/배지 시스템 추가
- [ ] 주간/월간 통계 그래프
- [ ] 테마 커스터마이징
- [ ] 사운드 효과

---

## ✅ 체크리스트

### 완료
- [x] Next.js 15 프로젝트 초기 설정
- [x] TypeScript 설정
- [x] Tailwind CSS 설정
- [x] Zustand 상태 관리
- [x] Framer Motion 애니메이션
- [x] next-intl 다국어 지원
- [x] 3단계 난이도 시스템
- [x] 레벨업 메커니즘
- [x] 진화 시스템
- [x] 보상 계산 로직
- [x] 일일 통계
- [x] 언어 전환 UI

### MVP 완료 항목
- [x] i18n 설정 및 다국어 지원
- [x] Today 화면 핵심 기능
- [x] Goals/Projects 화면
- [x] Task/Habit 생성·편집 화면
- [x] Character 화면 및 진화 시스템
- [x] Onboarding 화면

### 향후 개선 아이디어
- [ ] 레벨업 특수 애니메이션 (기본 애니메이션 구현됨)
- [ ] 진화 특수 애니메이션 (기본 애니메이션 구현됨)
- [ ] 업적 시스템
- [ ] 통계 그래프
- [ ] E2E 테스트

---

**마지막 빌드:** ✅ 성공 (2026-02-07)
**상태:** ✅ MVP 완료
