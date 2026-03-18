# 로그인 페이지 개선 및 Auth 플로우 완성 계획서

## Context

Phase 2 Supabase 코드 구현이 완료되어 Google OAuth 로그인 기본 플로우가 동작합니다.
하지만 로그인 페이지 UI가 최소한이고, 로그아웃 기능이 없으며, 여러 버그와 UX 문제가 있습니다.
이 작업은 로그인/인증 경험을 **프로덕션 수준**으로 완성하는 것이 목표입니다.

---

## 발견된 문제점

| # | 문제 | 위치 | 심각도 |
|---|------|------|--------|
| 1 | 로그아웃 버튼 없음 | `Sidebar.tsx` | Critical |
| 2 | Auth callback locale 하드코딩 (`/ko/goals`) | `auth/callback/route.ts` L8, L40 | Bug |
| 3 | 로그인 페이지에 TopAppBar/BottomNav 표시 | `layout.tsx` | UX |
| 4 | Auth 상태 관리 store 없음 | - | Missing |
| 5 | 로그인 실패 시 에러 미표시 | `login/page.tsx` | UX |
| 6 | 로딩 상태 없음 (버튼 중복 클릭 가능) | `login/page.tsx` | UX |
| 7 | `hover:bg-gray-50` 팔레트 위반 | `login/page.tsx` L35 | Style |

---

## 구현 순서 (의존성 기반)

### Step 1: `src/store/useAuthStore.ts` (신규)

Auth 상태 관리 Zustand store. `persist` 미사용 (세션은 Supabase 쿠키 기반).

```typescript
interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean  // computed: user !== null
  init: () => () => void    // returns unsubscribe
  signOut: () => Promise<void>
}
```

- `init()`: `supabase.auth.getUser()` 초기 상태 → `onAuthStateChange` 구독
- `signOut()`: `supabase.auth.signOut()` → `window.location.href = '/login'` (full reload)
- `createClient()` from `src/lib/supabase/client.ts` 사용

### Step 2: `src/components/AuthProvider.tsx` (신규)

`'use client'` 컴포넌트. `useEffect`에서 `useAuthStore.init()` 호출 + cleanup.
children만 반환 (렌더링 없음). `layout.tsx`의 `NextIntlClientProvider` 내부에 배치.

### Step 3: `src/components/AppShell.tsx` (신규)

로그인 페이지에서 TopAppBar/BottomNavigation 숨기기 위한 조건부 렌더링 래퍼.

```typescript
'use client'
import { usePathname } from '@/i18n/routing'

const AUTH_ROUTES = ['/login']

export default function AppShell({ children }) {
  const pathname = usePathname()  // locale prefix 제거된 경로
  const isAuthPage = AUTH_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))

  if (isAuthPage) {
    return <main className="min-h-screen bg-background">{children}</main>
  }

  return (
    // 기존 layout 구조: TopAppBar + main + BottomNavigation + ToastContainer
    // AbsencePenaltyChecker도 여기로 이동
  )
}
```

### Step 4: `src/app/[locale]/layout.tsx` (수정)

기존 직접 렌더링 → AuthProvider + AppShell 래핑으로 변경.

```tsx
<NextIntlClientProvider messages={messages}>
  <AuthProvider>
    <AppShell>{children}</AppShell>
  </AuthProvider>
</NextIntlClientProvider>
```

- TopAppBar, BottomNavigation, ToastContainer, AbsencePenaltyChecker → AppShell로 이동
- `<html>`, `<body>` 태그는 layout에 유지

### Step 5: `src/app/auth/callback/route.ts` (수정)

locale 하드코딩 수정:
- `login/page.tsx`에서 `redirectTo`에 `?locale=${locale}` 추가 (useLocale 사용)
- callback에서 `searchParams.get('locale') ?? 'ko'` 읽어서 동적 리다이렉트
- 성공: `/${locale}/goals`, 실패: `/${locale}/login?error=auth`

### Step 6: `src/app/[locale]/login/page.tsx` (수정)

**디자인 참고**: [irusol-landing.vercel.app](https://irusol-landing.vercel.app) 첫 화면 (스크롤 전)

#### 레이아웃 구성 (모바일 세로 배치)

랜딩 페이지의 가로 2단 레이아웃을 모바일(max-w-md)에 맞게 세로 배치로 재구성.

```
┌─────────────────────────────┐
│  (민트·연노랑 수채화 배경)     │
│                             │
│     [DuTo 마스코트 이미지]    │
│   duto_mascot_transparent.png│
│         (w-48, 중앙)         │
│                             │
│   ┌─ 태그 ──────────────┐   │
│   │ 게임같은 목표·루틴 앱  │   │
│   └─────────────────────┘   │
│                             │
│   캐릭터 성장으로  ← primary  │
│   꾸준함을 만들어요 ← text    │
│                             │
│   큰 꿈을 오늘의 퀘스트로...  │
│                             │
│   내 인생 첫 캐릭터가         │
│   기다리고 있어요 🥚          │
│                             │
│   [  Google로 시작하기  ]    │
│                             │
│   이용약관 동의 안내          │
│                             │
│   (에러 배너 — 조건부)        │
└─────────────────────────────┘
```

#### 디자인 상세

1. **배경**: `bg-background` 위에 상단 민트+연노랑 그라데이션 영역 (CSS gradient)
   - `bg-gradient-to-b from-primary-light/30 via-secondary/20 to-background`
   - 랜딩 페이지의 수채화 웨이브 느낌을 그라데이션으로 근사
2. **마스코트**: `public/img/duto_mascot_transparent.png` 사용 (next/image)
   - 크기: `w-48 h-auto`, 중앙 정렬, 하단 약간 겹침 효과
3. **태그**: `게임같은 목표·루틴 앱` — 작은 pill 뱃지 (`bg-background-surface border border-border`)
4. **헤딩**: 2줄 — 1줄 `text-primary font-bold text-2xl` + 2줄 `text-text font-bold text-2xl`
5. **부제**: `text-text-muted text-sm`
6. **CTA 문구**: `text-text font-medium` + 🥚 이모지
7. **Google 버튼**: 기존 유지 + `hover:bg-background` (팔레트 수정)
8. **로딩 상태**: `useState` → 버튼 disabled + 스피너 + `t('loading')` 텍스트
9. **에러 표시**: `useSearchParams()`로 `?error=auth` 읽기 → 에러 배너 (`bg-accent/10 text-accent border-accent`)
10. **locale 전달**: `useLocale()` → `redirectTo`에 `?locale=${locale}` 포함

#### 번역 키 (기존 login 네임스페이스 확장)

| 키 | 한국어 | English |
|---|--------|---------|
| `login.tag` | 게임같은 목표·루틴 앱 | Gamified Goal & Routine App |
| `login.headingGreen` | 캐릭터 성장으로 | Build consistency |
| `login.headingBlack` | 꾸준함을 만들어요 | by growing your character |
| `login.subtitle` | 큰 꿈을 오늘의 퀘스트로, 하루하루 쌓이는 성장 기록 | Turn big dreams into daily quests, track your growth day by day |
| `login.cta` | 내 인생 첫 캐릭터가 기다리고 있어요 | Your first character is waiting for you |
| `login.googleButton` | Google로 시작하기 | Continue with Google |
| `login.terms` | 로그인하면 서비스 이용약관에 동의하게 됩니다 | By signing in, you agree to our Terms of Service |
| `login.error` | 로그인에 실패했어요. 다시 시도해 주세요. | Login failed. Please try again. |
| `login.loading` | 접속 중... | Signing in... |

#### 사용 에셋

| 파일 | 용도 |
|------|------|
| `public/img/duto_mascot_transparent.png` | 메인 마스코트 이미지 |

### Step 7: `src/components/Sidebar.tsx` (수정)

로그아웃 버튼 추가:
- `useAuthStore`에서 `signOut`, `isAuthenticated` 가져오기
- `FiLogOut` 아이콘 + `t('sidebar.logout')` 텍스트
- Footer 영역 (version 위)에 배치
- 인증된 경우에만 표시
- 스타일: `text-accent hover:bg-accent/10` (분홍 — destructive action 시각 표현)

### Step 8: 번역 추가 (`messages/ko.json`, `messages/en.json`)

Step 6의 번역 키 테이블 참조 (login 네임스페이스 전체 교체).

추가 키:

| 키 | 한국어 | English |
|---|--------|---------|
| `sidebar.logout` | 나가기 | Sign Out |

---

## 수정 대상 파일 요약

| 파일 | 작업 | Step |
|------|------|------|
| `src/store/useAuthStore.ts` | 신규 | 1 |
| `src/components/AuthProvider.tsx` | 신규 | 2 |
| `src/components/AppShell.tsx` | 신규 | 3 |
| `src/app/[locale]/layout.tsx` | 수정 | 4 |
| `src/app/auth/callback/route.ts` | 수정 | 5 |
| `src/app/[locale]/login/page.tsx` | 수정 | 6 |
| `src/components/Sidebar.tsx` | 수정 | 7 |
| `messages/ko.json` | 수정 | 8 |
| `messages/en.json` | 수정 | 8 |

---

## 검증 방법

1. `npm run build` — 빌드 에러 없음
2. `npm run lint` — ESLint 통과
3. `/login` 페이지 → TopAppBar/BottomNav 미표시 확인
4. Google 로그인 클릭 → 로딩 상태 표시 확인
5. OAuth 성공 → `/{locale}/goals`로 리다이렉트 (locale 동적)
6. OAuth 실패 → `/{locale}/login?error=auth` → 에러 메시지 표시
7. Sidebar → 로그아웃 버튼 표시 → 클릭 시 `/login`으로 이동
8. 비인증 상태로 보호 경로 접근 → `/login` 리다이렉트
