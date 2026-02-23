# Irusol Project - Claude Code Instructions

## Project Overview

**Irusol**는 RPG 게이미피케이션 요소가 있는 습관 관리 웹 애플리케이션입니다. 사용자가 습관과 목표를 관리하면서 캐릭터를 성장시키는 게임형 생산성 도구입니다.

### 핵심 컨셉
- **Gamification**: 습관 완료 → 경험치 획득 → 레벨업 → 보상
- **RPG Elements**: 체력/마나 바, 레벨 시스템, 골드/젬 획득
- **Habit Tracking**: Habits, Dailies, To Do's, Goals, Projects
- **Local-First**: 브라우저 로컬 스토리지 기반 데이터 관리
- **Multilingual**: 한국어/영어 지원 (next-intl)

---

## Technical Stack

### Core Framework
- **Next.js 15.1.3** - React 프레임워크 (App Router)
- **React 19.0.0** - UI 라이브러리
- **TypeScript 5** - 타입 안전성

### State Management & Animation
- **Zustand 5.0.2** - 경량 상태 관리 라이브러리
- **Framer Motion 11.15.0** - 애니메이션 라이브러리

### Styling & UI
- **Tailwind CSS 3.4.1** - 유틸리티 기반 CSS 프레임워크
- **React Icons 5.4.0** - 아이콘 라이브러리
- **react-calendar 6.0.0** - 달력 컴포넌트

### Internationalization
- **next-intl 4.8.2** - Next.js 다국어 지원 라이브러리

### Date Utilities
- **date-fns 4.x** - 날짜 처리 유틸리티

### Testing
- **Playwright 1.x** - E2E 테스트 프레임워크

### Build & Development Tools
- **Node.js >=22.0.0** - 런타임 요구사항
- **ESLint 9** - 코드 린팅
- **PostCSS 8** - CSS 전처리
- **Autoprefixer 10** - CSS vendor prefix 자동화

---

## Project Architecture

### Directory Structure
```
irusol/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Root redirect
│   │   ├── globals.css               # 전역 스타일 (Playful Gummy 테마 포함)
│   │   └── [locale]/                 # Locale-based routing
│   │       ├── layout.tsx            # Locale layout
│   │       ├── page.tsx              # Dashboard (main)
│   │       ├── calendar/page.tsx     # Calendar view
│   │       ├── character/page.tsx    # Character page
│   │       ├── goals/page.tsx        # Goals management
│   │       ├── projects/page.tsx     # Projects management
│   │       ├── projects/[id]/page.tsx # Project detail
│   │       ├── quest/page.tsx        # Quest management
│   │       ├── settings/             # Settings pages
│   │       │   └── language/page.tsx # Language settings
│   │       └── stats/page.tsx        # Statistics
│   │
│   ├── components/                   # React components
│   │   ├── AddTaskButton.tsx         # Task creation button
│   │   ├── BottomNavigation.tsx      # Bottom nav bar
│   │   ├── BottomSheetModal.tsx      # 하단 시트 모달 베이스
│   │   ├── CharacterCard.tsx         # Character display
│   │   ├── EmptyState.tsx            # 빈 상태 표시
│   │   ├── FloatingAddButton.tsx     # Floating action button
│   │   ├── FormInput.tsx             # 폼 입력 필드
│   │   ├── FormTextarea.tsx          # 폼 텍스트영역
│   │   ├── GoalCard.tsx              # 목표 카드
│   │   ├── GoalDetailSheet.tsx       # 목표 상세 시트
│   │   ├── GoalForm.tsx              # Goal creation form
│   │   ├── LanguageSwitcher.tsx      # Language selector
│   │   ├── ObjectiveCard.tsx         # Objective display
│   │   ├── Onboarding.tsx            # Onboarding flow
│   │   ├── PlayerDashboard.tsx       # Player stats dashboard
│   │   ├── ProgressBar.tsx           # 진행바 컴포넌트
│   │   ├── ProjectCard.tsx           # 프로젝트 카드
│   │   ├── ProjectForm.tsx           # Project creation form
│   │   ├── QuestDetailSheet.tsx      # 퀘스트 상세 시트
│   │   ├── Sidebar.tsx               # Desktop sidebar
│   │   ├── StatsBars.tsx             # HP/XP/Mana bars
│   │   ├── StatusBadge.tsx           # 상태 배지
│   │   ├── TabNavigation.tsx         # Tab navigation
│   │   ├── TaskFormBottomSheet.tsx   # 태스크 생성/수정 하단 시트
│   │   ├── TaskList.tsx              # Task list component
│   │   ├── ToastContainer.tsx        # 토스트 알림 컨테이너
│   │   ├── TopAppBar.tsx             # Top app bar
│   │   ├── ViewToggle.tsx            # 뷰 전환 토글
│   │   ├── VisionCard.tsx            # 비전 카드
│   │   ├── VisionFormBottomSheet.tsx # 비전 생성/수정 하단 시트
│   │   └── calendar/                 # 달력 관련 컴포넌트
│   │       ├── DateTaskSheet.tsx     # 날짜별 태스크 시트
│   │       ├── DaySection.tsx        # 일별 섹션
│   │       ├── MonthlyView.tsx       # 월간 뷰
│   │       ├── TaskCard.tsx          # 달력용 태스크 카드
│   │       └── WeeklyView.tsx        # 주간 뷰
│   │
│   ├── store/                        # Zustand stores
│   │   ├── usePlayerStore.ts         # Player stats & level
│   │   ├── useTaskStore.ts           # Tasks (habits/todos)
│   │   ├── useGoalStore.ts           # Goals management
│   │   ├── useProjectStore.ts        # Projects management
│   │   ├── useOnboardingStore.ts     # Onboarding state
│   │   ├── useCalendarStore.ts       # Calendar view state
│   │   ├── useToastStore.ts          # Toast notifications
│   │   └── useVisionStore.ts         # Vision board state
│   │
│   ├── lib/                          # Utility libraries
│   │   ├── evolution.ts              # Level-up logic
│   │   ├── rewards.ts                # Reward calculation
│   │   ├── calendar-utils.ts         # 달력 유틸리티
│   │   └── migrations.ts             # localStorage 마이그레이션
│   │
│   ├── styles/                       # 추가 스타일
│   │   └── react-calendar.css        # react-calendar 커스텀 스타일
│   │
│   ├── i18n/                         # Internationalization
│   │   ├── request.ts                # i18n request handler
│   │   └── routing.ts                # i18n routing config
│   │
│   └── types/                        # TypeScript types
│       └── index.ts                  # Global type definitions
│
├── messages/                         # i18n translation files
│   ├── en.json                       # English translations
│   └── ko.json                       # Korean translations
│
├── e2e/                              # E2E 테스트
│   └── language-settings.spec.ts    # 언어 설정 테스트
│
├── ref/                              # 디자인 레퍼런스 이미지
│
├── agents/                           # Claude Code 에이전트
│   ├── color-system/                 # 색상 시스템 에이전트
│   └── i18n-generator/              # 번역 생성 에이전트
│
├── docs/                             # 프로젝트 문서
│
├── middleware.ts                     # Next.js 미들웨어 (i18n 라우팅)
├── playwright.config.ts              # Playwright 설정
└── public/                           # Static assets
```

### Data Flow Architecture

```
User Action
    ↓
Component Event Handler
    ↓
Zustand Store Action
    ↓
State Update (immutable)
    ↓
localStorage Sync (persist middleware)
    ↓
React Re-render (subscribed components)
```

### State Management Strategy

#### Store Separation
- **usePlayerStore**: Player-related state (level, XP, coins, evolution stage)
- **useTaskStore**: Task management (habits, todos)
- **useGoalStore**: Goal tracking and progress
- **useProjectStore**: Project organization
- **useOnboardingStore**: First-time user experience
- **useCalendarStore**: Calendar view and date selection state
- **useToastStore**: Toast notification queue management
- **useVisionStore**: Vision board items

#### Persistence
- All stores use `persist` middleware
- Data saved to localStorage with store-specific keys
- Automatic hydration on app load

---

## Core Features & Business Logic

### 1. Leveling & Evolution System (`lib/evolution.ts`)
- **Base XP**: 25 (레벨 1)
- **XP Growth**: 각 레벨마다 `+5 XP` 증가
  - Level 2: 30 XP, Level 3: 35 XP, Level 10: 70 XP
- **Evolution Stages** (StageName): `egg` → `sproutling` → `blooming` → `fullyGrown`
- **PlayerStats**: `level`, `experience`, `maxExperience`, `coins`, `stage`

### 2. Reward System (`lib/rewards.ts`)
- **Task Completion**: XP + Coins (난이도에 따라 변동)
- **Goal Completion**: Variable rewards (`rewardAmount` 필드)
- **Level Up**: Stage evolution trigger

### 3. Task Types (`type: "habit" | "todo"`)
- **Habits**: 반복 가능한 태스크, `frequency[]`, `startDate`, `endDate`
- **Todos**: 일회성 완료 태스크, `dueDate`
- **공통 필드**: `streak`, `completedDates[]`, `rewardClaimed`, `difficulty`

### 4. Goal & Project Types
- **Goal**: `status: GoalStatus`, `currentValue/targetValue/unit` (수치 추적), `visionId`
- **Project**: `goalId`로 목표에 연결, `status: ProjectStatus`
- **Vision**: 장기 비전 보드 (`useVisionStore`)

### 5. Calendar System (`lib/calendar-utils.ts`)
- 주간/월간 뷰 지원
- 날짜별 태스크 필터링
- react-calendar 기반 커스텀 스타일 적용

### 6. Data Migration (`lib/migrations.ts`)
- localStorage 스키마 변경 시 자동 마이그레이션 처리

---

## Development Guidelines

### Code Style

#### TypeScript
- **Strict Mode**: Enabled
- **Type Definitions**: Define in `src/types/index.ts`
- **Explicit Types**: Prefer explicit return types for functions
- **No `any`**: Use proper types or `unknown`

#### React Patterns
- **Functional Components**: Use function declarations
- **Hooks**: Follow React Hooks rules
- **Custom Hooks**: Prefix with `use`
- **Event Handlers**: Prefix with `handle`

```typescript
// ✅ Good
export default function TaskList() {
  const handleTaskComplete = (taskId: string) => {
    // ...
  }

  return <div>...</div>
}

// ❌ Avoid
const TaskList = () => {
  // ...
}
```

#### Zustand Store Pattern
```typescript
interface StoreState {
  // State
  data: DataType[]

  // Actions
  addData: (item: DataType) => void
  updateData: (id: string, updates: Partial<DataType>) => void
  deleteData: (id: string) => void
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      data: [],

      addData: (item) => set((state) => ({
        data: [...state.data, item]
      })),

      updateData: (id, updates) => set((state) => ({
        data: state.data.map(item =>
          item.id === id ? { ...item, ...updates } : item
        )
      })),

      deleteData: (id) => set((state) => ({
        data: state.data.filter(item => item.id !== id)
      }))
    }),
    { name: 'store-name' }
  )
)
```

#### Component Structure
```typescript
// 1. Imports
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { usePlayerStore } from '@/store/usePlayerStore'

// 2. Type Definitions
interface Props {
  // ...
}

// 3. Component
export default function Component({ ...props }: Props) {
  // 3.1. Translations
  const t = useTranslations('namespace')

  // 3.2. Store
  const { data, actions } = useStore()

  // 3.3. Local State
  const [localState, setLocalState] = useState()

  // 3.4. Event Handlers
  const handleClick = () => {
    // ...
  }

  // 3.5. Render
  return (
    <div>...</div>
  )
}
```

### Naming Conventions

#### Files
- **Components**: PascalCase (`PlayerDashboard.tsx`)
- **Stores**: camelCase with `use` prefix (`usePlayerStore.ts`)
- **Utilities**: camelCase (`rewards.ts`)
- **Types**: camelCase (`index.ts`)
- **Pages**: lowercase (`page.tsx`, `layout.tsx`)

#### Variables & Functions
- **Components**: PascalCase
- **Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Event Handlers**: `handle` prefix
- **Boolean Variables**: `is/has/should` prefix

#### CSS Classes (Tailwind)
- Use utility-first approach
- Group related utilities
- Extract repeated patterns to components

```tsx
// ✅ Good
<div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">

// ❌ Avoid custom CSS unless necessary
<div className="custom-card">
```

### Internationalization (i18n)

#### Translation Keys Structure
```json
{
  "namespace": {
    "key": "Translation"
  }
}
```

#### Usage in Components
```tsx
import { useTranslations } from 'next-intl'

export default function Component() {
  const t = useTranslations('namespace')

  return <h1>{t('key')}</h1>
}
```

#### Adding New Translations

**⚠️ MANDATORY: Use i18n-generator Agent**

모든 번역 작업은 **반드시** `i18n-generator` agent를 사용해야 합니다.

##### Agent Location
```
agents/i18n-generator/
├── prompt.md              # Agent 프롬프트 (필수 참조)
├── korean-dictionary.md   # 한국어 순수 우리말 사전
├── english-dictionary.md  # 영어 표준 용어 사전
├── README.md             # Agent 개요
├── USAGE.md              # 상세 사용 가이드
└── .examples.json        # 사용 예시
```

##### Translation Workflow

**1. 새 번역 생성**
```bash
"agents/i18n-generator의 prompt.md를 참조하여 다음 키를 번역해주세요:
- key: 'feature.action'
- context: 'UI 컨텍스트 설명'
- uiElement: 'button/label/title/message'"
```

**2. 기존 번역 개선**
```bash
"agents/i18n-generator의 prompt.md를 참조하여
messages/ko.json의 '{section}' 섹션을 순수 우리말로 개선해주세요"
```

**3. 일괄 번역**
```bash
"agents/i18n-generator agent를 사용하여
{section} 섹션의 [{key1}, {key2}, ...] 키들을 번역해주세요"
```

##### Translation Standards

**Korean (ko)**
- ✅ **순수 우리말 우선**: 외래어/한자어 대신 순수 우리말 사용
- ✅ **사전 준수**: `korean-dictionary.md` 참조
- ✅ **자연스러운 표현**: 문법적으로 올바른 한국어
- ✅ **올바른 조사**: 받침 유무에 따른 적절한 조사 사용

**English (en)**
- ✅ **표준 용어**: `english-dictionary.md` 준수
- ✅ **일관성**: 동일 개념에 동일 용어 사용
- ✅ **명확성**: 간결하고 명확한 표현
- ✅ **UI 표준**: 업계 표준 UI 용어 준수

##### Quality Checklist
- [ ] i18n-generator agent 사용
- [ ] 순수 우리말 사용 (한국어)
- [ ] 사전 용어 준수
- [ ] 문맥에 맞는 자연스러운 표현
- [ ] messages/ko.json 업데이트
- [ ] messages/en.json 업데이트
- [ ] UI에서 테스트

---

## Design System

### 🎨 CRITICAL: Color System Agent Usage

**모든 UI 개발은 반드시 `color-system` agent를 참조하여 Duto Mint Clean 팔레트를 사용해야 합니다.**

#### Agent Location
```
agents/color-system/
├── README.md              # Agent 개요
├── prompt.md              # Agent 프롬프트 (필수 참조)
├── color-palette.md       # Duto Mint Clean 팔레트 정의
├── usage-guide.md         # 실전 사용 예시
└── migration-checklist.md # 색상 마이그레이션 가이드
```

#### Duto Mint Clean Color Palette (tailwind.config.ts)

**브랜드 색상**:
- `primary` / `primary-DEFAULT` (#7DE6C3) - 메인 브랜드 색상, 강조, 링크
- `primary-dark` (#4FD4A8) - 호버 상태
- `primary-light` (#A8F0D9) - 연한 강조
- `secondary` / `secondary-DEFAULT` (#FFF6BF) - 보조 강조, 경고, 진행중
- `secondary-dark` (#FFE88A) - 진한 보조
- `accent` / `accent-DEFAULT` (#F19ED2) - 성공, 완료, CTA
- `accent-dark` (#E77FBF) - 진한 강조

**중립 색상**:
- `background` (#F7F9F2) - 페이지 배경
- `background-surface` (#FFFFFF) - 카드, 모달 배경
- `border` (#DCEEE7) - 테두리, 구분선
- `text` (#0F172A) - 본문 텍스트
- `text-muted` (#64748B) - 보조 텍스트
- `track` (#E5E7EB) - 진행바 배경, 비활성

**커스텀 z-index**:
- `z-app-bar` (30) - 상단 앱바
- `z-nav` (20) - 하단 네비게이션
- `z-fab` (40) - 플로팅 버튼
- `z-modal` (50) - 모달/시트

**Playful Gummy 애니메이션**:
- `animate-bounce-soft` - 부드러운 바운스 (2s 반복)
- `animate-pop-in` - 팝인 효과 (0.4s)
- `animate-jelly` - 젤리 효과 (0.6s)
- `animate-pulse-glow` - 펄스 글로우 (2s 반복)

**CSS 컴포넌트 클래스** (`globals.css`):
- `.gummy-card` - 3D depth 카드 스타일
- `.gummy-progress-track` - 글로시 진행바 트랙
- `.gummy-progress-bar` - 글로시 진행바

#### Automatic Application Rules

**언제 Agent를 참조해야 하는가?**
- ✅ 새로운 UI 컴포넌트 개발 시
- ✅ 페이지 레이아웃 작업 시
- ✅ 기존 컴포넌트 수정 시
- ✅ 색상 관련 스타일 추가 시
- ✅ 상태 표시 UI (성공/실패/경고 등) 구현 시

#### Agent Invocation Pattern

작업 요청을 받으면 다음 패턴을 **자동으로** 적용:

```typescript
// 1. UI 개발 요청 수신
// 2. color-system agent의 prompt.md 참조
// 3. Duto Mint Clean 팔레트 사용
// 4. 레거시 색상 절대 사용 금지
// 5. 상태별 색상 올바르게 적용
```

#### Color Usage Examples

```tsx
// ✅ ALWAYS USE (Duto Mint Clean)
<div className="bg-primary text-white">           // 메인 색상
<div className="bg-accent text-white">            // 성공/완료
<div className="bg-secondary text-text">          // 경고/진행중
<div className="bg-background-surface border">   // 카드
<span className="text-text">                     // 본문
<span className="text-text-muted">               // 보조 텍스트
<div className="bg-track">                       // 진행바 배경

// ❌ NEVER USE (Legacy Colors)
<div className="bg-purple-500">                  // 절대 금지
<div className="bg-blue-600">                    // 절대 금지
<div className="bg-gray-100">                    // 절대 금지
<span className="text-green-600">                // 절대 금지
```

#### State Colors

```tsx
// ✅ 성공/완료
className="bg-accent text-white"
className="border-accent"

// 🔄 진행중/활성
className="bg-primary text-white"
className="text-primary"

// ⚠️ 경고/대기
className="bg-secondary text-text"
className="text-text-muted"

// ❌ 에러 (예외적으로 red 사용 가능)
className="bg-red-500 text-white"
className="text-red-600"
```

#### Quality Checklist
- [ ] color-system agent 참조
- [ ] 레거시 색상 사용 안 함 (purple-*, blue-*, gray-* 등)
- [ ] Duto Mint Clean 팔레트만 사용
- [ ] 상태별 색상 올바르게 적용
- [ ] 호버/포커스 상태 색상 정의
- [ ] 접근성 대비율 검증 (WCAG 2.1 AA)
- [ ] 빌드 성공 확인

#### No Manual Color Selection

**❌ 절대 금지**:
```tsx
// 직접 색상 선택 금지
<div className="bg-purple-500">  // ❌
<div className="bg-blue-600">    // ❌
<div className="bg-gray-100">    // ❌
```

**✅ 필수**:
```bash
# 항상 agent 참조
"agents/color-system의 prompt.md를 참조하여 버튼 컴포넌트를 만들어주세요"
```

---

## Testing Strategy

### E2E Tests (Playwright)
```bash
npm run test:e2e          # 전체 E2E 테스트
npm run test:e2e:ui       # UI 모드
npm run test:e2e:headed   # 브라우저 표시 모드
npm run test:e2e:report   # 테스트 리포트
```

- `e2e/language-settings.spec.ts` - 언어 설정 테스트

### Manual Testing Checklist
- [ ] Task creation and completion (habit/todo)
- [ ] XP gain and level up / evolution stage
- [ ] Quest progress bar display
- [ ] Goal progress tracking (currentValue/targetValue)
- [ ] Project organization
- [ ] Calendar view (weekly/monthly)
- [ ] Vision board
- [ ] Language switching
- [ ] Toast notifications
- [ ] localStorage persistence & migration
- [ ] Responsive layout (mobile/desktop)

### Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

---

## Build & Deployment

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
Currently no environment variables required (local-first app).

### Deployment Platform
- **Recommended**: Vercel (optimized for Next.js)
- **Alternative**: Any static hosting (Netlify, Cloudflare Pages)

---

## Known Limitations & Future Enhancements

### Current Limitations
- ❌ No server-side data sync
- ❌ No user authentication
- ❌ No data backup/restore
- ❌ Mana system not implemented
- ❌ Social features not implemented
- ❌ No daily/weekly reset automation

### Planned Features
- [ ] Cloud data sync
- [ ] User accounts & authentication
- [ ] Data export/import
- [ ] Daily reset automation
- [ ] Mana usage mechanics
- [ ] Achievement system
- [ ] Social features
- [ ] Dark mode
- [ ] Mobile app (PWA)
- [ ] Statistics & analytics

---

## Important Notes for Claude Code

### 🚨 CRITICAL: i18n-generator Agent Usage

**모든 번역 작업은 반드시 i18n-generator agent를 통해 수행해야 합니다.**

#### Automatic Application Rules

**언제 Agent를 사용해야 하는가?**
- ✅ 새로운 UI 텍스트 추가 시
- ✅ 기존 번역 수정 시
- ✅ 컴포넌트에 번역 키 추가 시
- ✅ 에러 메시지, 알림 메시지 추가 시
- ✅ 네비게이션, 버튼, 라벨 등 모든 UI 텍스트

#### Agent Invocation Pattern

작업 요청을 받으면 다음 패턴을 **자동으로** 적용:

```typescript
// 1. UI 텍스트 식별
// 2. i18n-generator agent 호출
// 3. 번역 생성
// 4. messages/ko.json, messages/en.json 업데이트
// 5. 컴포넌트에서 useTranslations 사용
```

#### Example Workflow

**사용자 요청**: "프로필 설정 페이지 만들어줘"

**Claude 자동 프로세스**:
1. ✅ 페이지 구조 설계
2. ✅ **i18n-generator agent로 번역 생성**
   ```
   "agents/i18n-generator의 prompt.md를 참조하여:
   section: profile
   keys: [settings, edit, save, avatar, name, bio]"
   ```
3. ✅ messages/ko.json, messages/en.json 업데이트
4. ✅ 컴포넌트에서 번역 사용
5. ✅ 구현 완료

#### No Manual Translation

**❌ 절대 금지**:
```json
// 직접 번역 작성 금지
{
  "profile": {
    "settings": "설정"  // ❌
  }
}
```

**✅ 필수**:
```bash
# 항상 agent 사용
"i18n-generator agent를 사용하여 profile.settings 키를 번역해주세요"
```

### When Adding Features
1. **Follow existing patterns**: Check similar components/stores before creating new ones
2. **Update types**: Add TypeScript types in `src/types/index.ts`
3. **Add translations**: **ALWAYS use i18n-generator agent** (see above)
4. **Test localStorage**: Ensure data persists correctly
5. **Consider mobile**: Test responsive design

### When Modifying State
1. **Use Zustand actions**: Don't modify state directly
2. **Immutable updates**: Use spread operators for nested updates
3. **localStorage sync**: Changes auto-save via persist middleware

### When Working with UI
1. **Color System**: **ALWAYS use color-system agent** and Duto Mint Clean palette (see Design System section)
2. **Tailwind-first**: Use Tailwind utilities before custom CSS
3. **Framer Motion**: Use for animations when needed
4. **Accessibility**: Include proper ARIA labels and keyboard navigation
5. **Responsive**: Mobile-first design approach

### Code Quality Standards
- ✅ TypeScript strict mode compliance
- ✅ ESLint rules adherence
- ✅ No console.log in production code
- ✅ Proper error handling
- ✅ Component reusability
- ✅ Performance optimization (memoization when needed)

---

## Contact & Resources

- **Framework Docs**: https://nextjs.org/docs
- **Zustand Docs**: https://docs.pmnd.rs/zustand
- **Tailwind Docs**: https://tailwindcss.com/docs
- **Framer Motion**: https://www.framer.com/motion
- **next-intl**: https://next-intl-docs.vercel.app

---

*Last Updated: 2026-02-23*
