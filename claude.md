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

### Internationalization
- **next-intl 4.8.2** - Next.js 다국어 지원 라이브러리

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
│   │   └── [locale]/                 # Locale-based routing
│   │       ├── layout.tsx            # Locale layout
│   │       ├── page.tsx              # Dashboard (main)
│   │       ├── character/page.tsx    # Character page
│   │       ├── goals/page.tsx        # Goals management
│   │       ├── projects/page.tsx     # Projects management
│   │       ├── settings/             # Settings pages
│   │       ├── stats/page.tsx        # Statistics
│   │       ├── today/page.tsx        # Today's tasks
│   │       └── todos/page.tsx        # To-do list
│   │
│   ├── components/                   # React components
│   │   ├── AddTaskButton.tsx         # Task creation button
│   │   ├── BottomNavigation.tsx      # Bottom nav bar
│   │   ├── CharacterCard.tsx         # Character display
│   │   ├── FloatingAddButton.tsx     # Floating action button
│   │   ├── GoalForm.tsx              # Goal creation form
│   │   ├── LanguageSwitcher.tsx      # Language selector
│   │   ├── ObjectiveCard.tsx         # Objective display
│   │   ├── Onboarding.tsx            # Onboarding flow
│   │   ├── PlayerDashboard.tsx       # Player stats dashboard
│   │   ├── ProjectForm.tsx           # Project creation form
│   │   ├── Sidebar.tsx               # Desktop sidebar
│   │   ├── StatsBars.tsx             # HP/XP/Mana bars
│   │   ├── TabNavigation.tsx         # Tab navigation
│   │   ├── TaskList.tsx              # Task list component
│   │   └── TopAppBar.tsx             # Top app bar
│   │
│   ├── store/                        # Zustand stores
│   │   ├── usePlayerStore.ts         # Player stats & level
│   │   ├── useTaskStore.ts           # Tasks (habits/dailies/todos)
│   │   ├── useGoalStore.ts           # Goals management
│   │   ├── useProjectStore.ts        # Projects management
│   │   └── useOnboardingStore.ts     # Onboarding state
│   │
│   ├── lib/                          # Utility libraries
│   │   ├── evolution.ts              # Level-up logic
│   │   └── rewards.ts                # Reward calculation
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
- **usePlayerStore**: Player-related state (level, HP, XP, mana, gold, gems)
- **useTaskStore**: Task management (habits, dailies, todos)
- **useGoalStore**: Goal tracking and progress
- **useProjectStore**: Project organization
- **useOnboardingStore**: First-time user experience

#### Persistence
- All stores use `persist` middleware
- Data saved to localStorage with store-specific keys
- Automatic hydration on app load

---

## Core Features & Business Logic

### 1. Leveling System (`lib/evolution.ts`)
- **Base XP**: 25 (레벨 1)
- **XP Growth**: 각 레벨마다 `+5 XP` 증가
  - Level 2: 30 XP
  - Level 3: 35 XP
  - Level 10: 70 XP
- **Level Up Rewards**:
  - Health +5
  - Max Health +5
  - Experience resets to 0

### 2. Reward System (`lib/rewards.ts`)
- **Task Completion**: +10 XP, +1 Gold
- **Goal Completion**: Variable rewards based on goal type
- **Level Up**: Health restoration, stat increases

### 3. Task Types
- **Habits**: Repeatable tasks, multiple completions per day
- **Dailies**: Daily recurring tasks with reset logic
- **To Do's**: One-time completion tasks
- **Goals**: Long-term objectives with progress tracking
- **Projects**: Grouped task collections

### 4. Mana System
- **Unlock Level**: Level 10
- **Usage**: Currently decorative (future feature)
- **Max Mana**: Increases with level

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

## Testing Strategy

### Manual Testing Checklist
- [ ] Task creation and completion
- [ ] XP gain and level up
- [ ] HP/Mana bar display
- [ ] Goal progress tracking
- [ ] Project organization
- [ ] Language switching
- [ ] localStorage persistence
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
1. **Tailwind-first**: Use Tailwind utilities before custom CSS
2. **Framer Motion**: Use for animations when needed
3. **Accessibility**: Include proper ARIA labels and keyboard navigation
4. **Responsive**: Mobile-first design approach

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

*Last Updated: 2026-02-08*
