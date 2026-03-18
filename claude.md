# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Irusol**는 RPG 게이미피케이션 요소가 있는 습관 관리 웹 애플리케이션입니다. 사용자가 습관과 목표를 관리하면서 캐릭터를 성장시키는 게임형 생산성 도구입니다.

- **Gamification**: 습관 완료 → 경험치 획득 → 레벨업 → 보상
- **Local-First**: 브라우저 로컬 스토리지 기반 (서버 없음)
- **Multilingual**: 한국어/영어 지원 (next-intl)

---

## Commands

```bash
npm run dev           # 개발 서버 시작
npm run build         # 프로덕션 빌드
npm run lint          # ESLint 실행
npm run test:e2e      # Playwright E2E 테스트
npm run test:e2e:ui   # Playwright UI 모드
npm run test:e2e:headed  # 브라우저 표시 모드
```

---

## Architecture

### Stack
- **Next.js 15** App Router + **React 19** + **TypeScript**
- **Zustand** (상태 관리) + **Framer Motion** (애니메이션)
- **Tailwind CSS** + **next-intl** (i18n) + **date-fns**
- **Playwright** (E2E 테스트만 존재, 단위 테스트 없음)

### Directory Structure
```
src/
├── app/[locale]/     # Next.js App Router (locale-based routing)
├── components/       # React 컴포넌트
│   └── calendar/     # 달력 전용 컴포넌트 하위 디렉토리
├── store/            # Zustand stores (usePlayerStore, useTaskStore, etc.)
├── lib/              # 비즈니스 로직 (evolution.ts, rewards.ts, migrations.ts)
├── i18n/             # next-intl 설정
└── types/            # TypeScript 타입 (src/types/index.ts)
messages/             # 번역 파일 (ko.json, en.json)
agents/               # Claude Code 에이전트 (color-system, i18n-generator)
```

### Data Flow
```
User Action → Component → Zustand Store Action → State Update → localStorage (auto-persist) → Re-render
```

모든 store는 Zustand `persist` 미들웨어로 localStorage에 자동 저장됩니다.

### Key Business Logic (`src/lib/`)
- **evolution.ts**: 레벨업 로직. Base XP 25, 레벨마다 +5 XP 증가. 진화 단계: `egg → sproutling → blooming → fullyGrown`
- **rewards.ts**: 태스크/목표 완료 시 XP + Coins 계산 (난이도 기반)
- **migrations.ts**: localStorage 스키마 변경 시 자동 마이그레이션

### Core Types (`src/types/index.ts`)
- **Task**: `type: "habit" | "todo"`, `frequency[]`, `completedDates[]`, `streak`, `difficulty`, `rewardClaimed`
- **Goal**: `status: GoalStatus`, `currentValue/targetValue/unit` (수치 추적), `visionId`
- **Project**: `goalId`로 목표에 연결
- **PlayerStats**: `level`, `experience`, `maxExperience`, `coins`, `stage`

---

## CRITICAL: Agents Must Be Used

### 1. i18n-generator Agent (번역 필수)

**모든 번역 추가/수정은 반드시 `agents/i18n-generator/` agent를 사용해야 합니다.**

```bash
# 새 번역 생성
"agents/i18n-generator의 prompt.md를 참조하여 다음 키를 번역해주세요:
- key: 'feature.action', context: 'UI 설명', uiElement: 'button'"
```

- Korean: `agents/i18n-generator/korean-dictionary.md` 기반 순수 우리말 우선
- 직접 번역 작성 금지 — agent 통해서만

### 2. color-system Agent (색상 필수)

**모든 UI 작업은 `agents/color-system/` agent를 참조하여 Duto Mint Clean 팔레트를 사용해야 합니다.**

#### Duto Mint Clean 팔레트 (tailwind.config.ts에 정의됨)

| 토큰 | 값 | 용도 |
|------|-----|------|
| `primary` | #7DE6C3 | 메인 브랜드, 강조, 링크 |
| `primary-dark` | #4FD4A8 | 호버 상태 |
| `primary-light` | #A8F0D9 | 연한 강조 |
| `secondary` | #FFF6BF | 경고, 진행중 |
| `accent` | #F19ED2 | 성공, 완료, CTA |
| `background` | #F7F9F2 | 페이지 배경 |
| `background-surface` | #FFFFFF | 카드, 모달 |
| `border` | #DCEEE7 | 테두리 |
| `text` | #0F172A | 본문 |
| `text-muted` | #64748B | 보조 텍스트 |
| `track` | #E5E7EB | 진행바 배경, 비활성 |

```tsx
// ✅ CORRECT
<div className="bg-primary text-white">
<div className="bg-accent text-white">       // 성공/완료
<div className="bg-secondary text-text">    // 경고/진행중

// ❌ NEVER USE
<div className="bg-purple-500">
<div className="bg-blue-600">
<div className="bg-gray-100">
```

**커스텀 z-index**: `z-app-bar`(30), `z-nav`(20), `z-fab`(40), `z-modal`(50)

**CSS 컴포넌트 클래스** (`globals.css`): `.gummy-card`, `.gummy-progress-track`, `.gummy-progress-bar`

---

## Code Patterns

### Zustand Store 패턴
```typescript
export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      data: [],
      addData: (item) => set((state) => ({ data: [...state.data, item] })),
      updateData: (id, updates) => set((state) => ({
        data: state.data.map(item => item.id === id ? { ...item, ...updates } : item)
      })),
    }),
    { name: 'store-name' }
  )
)
```

### Component 구조 순서
1. Imports
2. Interface Props 정의
3. `const t = useTranslations('namespace')`
4. Store 호출
5. Local state
6. Event handlers (`handle` prefix)
7. Return JSX

### i18n 사용
```tsx
import { useTranslations } from 'next-intl'
const t = useTranslations('namespace')
return <h1>{t('key')}</h1>
```

---

## Known Limitations
- 서버 사이드 데이터 동기화 없음 (localStorage only)
- 사용자 인증 없음
- Mana 시스템 미구현
- 일/주 자동 리셋 미구현

---

@DEV-SUPPORTER.md

## ⚠️ 작업 시작 전 필수 — 도구 사용 규칙

### 필수 (매 작업마다)
- **모든 코드 변경 전·후**: `/andrej-karpathy-skills:karpathy-guidelines`
- **신규 기능·버그 수정**: `--seq` 또는 `--think-hard` (sequential-thinking)

### 상황별 필수
- **라이브러리 API 불확실 시**: `--c7` (context7) — 추측 금지, 문서 조회 후 구현
- **코드 탐색**: typescript-lsp 우선 사용 — Search/Grep 대신 심볼 기반 탐색

### 반복 작업
- **빌드·테스트 실패 반복 수정**: `/ralph-loop:ralph-loop`
- **대규모 설계·신규 도메인 추가**: `/planning-with-files:planning-with-files`

작업 유형별 상세 절차 → DEV-SUPPORTER.md 참조

---

*Last Updated: 2026-03-18*
