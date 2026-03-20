# 익명 로그인 (Guest Sign-In) 구현 계획

## 요구사항

| Phase | 설명 |
|-------|------|
| Phase 1 | 로그인 페이지에서 "게스트" 로그인 버튼 생성 (최대한 이쁜 걸로 진행) |
| Phase 2 | 게스트 로그인 시 기존 회원과 동일한 사용자 경험 유지 (UX/UI 차이 없음) |
| Phase 3 | TopAppBar 오른쪽에 "게스트" nickName 처리 |
| Phase 4 | 정식가입 기능 — "게스트"인 경우 OAuth(Google) 연동으로 정식 가입 (Supabase 자동 마이그레이션) |

> Supabase 참고: https://supabase.com/docs/guides/auth/auth-anonymous#access-control

---

## 사전 조건

- [ ] Supabase Dashboard > Authentication > Providers > **Anonymous Sign-In 활성화**
- [ ] DB trigger가 anonymous user 생성 시에도 `profiles` row 생성 확인 (`is_onboarded = false`)
- [ ] RLS 정책이 `auth.uid()` 기반이므로 anonymous user에도 동일 적용 확인

---

## 핵심 설계 결정

| 항목 | 결정 | 근거 |
|------|------|------|
| Middleware | 변경 불필요 | anonymous user도 정상 세션(user != null) 보유 |
| 온보딩 | 동일하게 진행 | "동일 UX" 요구사항 + 게임화 경험 필수 |
| 데이터 동기화 | 기존 로직 유지 | anonymous도 real user ID 보유, AuthProvider sync 그대로 동작 |
| 닉네임 | locale 기반 표시 | ko: "게스트", en: "Guest" (i18n 키 사용) |
| 계정 연동 후 | 자동 전환 | `onAuthStateChange` → `USER_UPDATED` → `is_anonymous=false` → UI 자동 갱신 |

---

## 구현 순서 (Phase 2 → 1 → 3 → 4)

> Auth Store를 먼저 수정해야 로그인/UI가 정상 동작하므로 Phase 2부터 시작

### Step 1: Auth Store 수정 (Phase 2)

**파일**: `src/store/useAuthStore.ts`

**변경 사항**:
- `AuthState` 인터페이스에 `isAnonymous: boolean` 추가
- `handleUser()` 내에서 `user.is_anonymous === true` 체크:
  - anonymous → `nickname: null`, `isAnonymous: true`, `tryFetchProfileNickname` 스킵
  - regular → 기존 로직 유지
- `signOut()`에서 `isAnonymous: false` 리셋
- 초기값 `isAnonymous: false`

**linkIdentity 후 자동 전환 흐름**:
```
linkIdentity() → OAuth redirect → callback → session update
→ onAuthStateChange(USER_UPDATED) → handleUser()
→ is_anonymous=false, nickname=Google이름 → UI 자동 갱신
```

---

### Step 2: 로그인 페이지 게스트 버튼 (Phase 1)

**파일**: `src/app/[locale]/login/page.tsx`

**변경 사항**:
- `handleGuestLogin` 함수 추가: `supabase.auth.signInAnonymously()` 호출
- 성공 시 `window.location.href = /${locale}/onboarding` (기존 회원과 동일 흐름)
- Google 버튼 아래에 구분선("또는") + 게스트 버튼 배치
- `FiUser` 아이콘 사용 (react-icons/fi)

**디자인 (Duto Mint Clean 팔레트)**:
```
[Google로 시작하기]          ← 기존 (bg-white border-border)
────── 또는 ──────
[둘러보기로 시작하기]        ← 신규 (bg-primary/10 border-primary/30 text-primary-dark)
```

---

### Step 3: TopAppBar 게스트 닉네임 표시 (Phase 3)

**파일**: `src/components/TopAppBar.tsx`

**변경 사항**:
- `useAuthStore`에서 `isAnonymous` 추가 구독
- 닉네임 로직: `displayName = isAnonymous ? t('sidebar.guest') : authNickname`
- 게스트 아바타 색상: `bg-text-muted` (일반 유저 `bg-primary`와 구분)

---

### Step 4: 계정 연동 (Phase 4)

**파일**: `src/components/TopAppBar.tsx`

**변경 사항**:
- `createClient` import 추가
- `handleLinkGoogle` 함수 추가:
  ```typescript
  supabase.auth.linkIdentity({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback?locale=${locale}&linking=true`
    }
  })
  ```
- 프로필 드롭다운 조건부 렌더링:

| 유저 타입 | 드롭다운 내용 |
|----------|-------------|
| 게스트 (anonymous) | 힌트 텍스트 + Google 연동 버튼 + 나가기 버튼 |
| 정식 회원 (regular) | 나가기 버튼만 (기존 동작) |

**파일**: `src/app/auth/callback/route.ts`

**변경 사항**:
- `linking=true` 쿼리 파라미터 감지
- linking이면 onboarding 체크 스킵 → 바로 `/${locale}/goals`로 리다이렉트

---

### Step 5: i18n 번역 추가

**파일**: `messages/ko.json`, `messages/en.json`

| 키 | ko | en |
|---|---|---|
| `login.or` | 또는 | or |
| `login.guestButton` | 둘러보기로 시작하기 | Start as Guest |
| `login.guestLoading` | 입장 중... | Entering... |
| `sidebar.guest` | 게스트 | Guest |
| `sidebar.guestHint` | 계정을 연동하면 데이터가 안전해요 | Link an account to keep your data safe |
| `sidebar.linkGoogle` | Google 계정 연동하기 | Link Google Account |

---

## 수정 파일 목록

| 파일 | 변경 내용 |
|------|----------|
| `src/store/useAuthStore.ts` | `isAnonymous` 필드 추가, handleUser 분기 |
| `src/app/[locale]/login/page.tsx` | 게스트 로그인 버튼 + 핸들러 |
| `src/components/TopAppBar.tsx` | 게스트 닉네임 + 계정 연동 버튼 |
| `src/app/auth/callback/route.ts` | linking 파라미터 처리 |
| `messages/ko.json` | 6개 번역 키 추가 |
| `messages/en.json` | 6개 번역 키 추가 |

## 변경 불필요 파일

| 파일 | 이유 |
|------|------|
| `src/middleware.ts` | anonymous user도 정상 세션 보유, 기존 로직으로 처리됨 |
| `src/components/AuthProvider.tsx` | anonymous user도 real user ID 보유, 기존 sync 로직 그대로 동작 |

---

## 검증 방법

```bash
npm run build    # 빌드 에러 없음
npm run lint     # ESLint 오류 없음
npm run dev      # 수동 테스트
```

### 수동 테스트 시나리오

- [ ] 게스트 버튼 클릭 → 온보딩 진입 확인
- [ ] 게스트로 습관/목표 생성 → 데이터 유지 확인
- [ ] TopAppBar에 "게스트" 표시 확인 (ko/en 전환 시 각각 확인)
- [ ] Google 계정 연동 클릭 → OAuth 진행 → 실명 전환 + 데이터 보존 확인
- [ ] 로그아웃 후 Google 재로그인 → 데이터 유지 확인
- [ ] 게스트 로그아웃 → 새 게스트 세션 → 별도 유저로 생성 확인

### 엣지 케이스

- 네트워크 오류 시 `signInAnonymously()` 실패 → 에러 배너 표시
- 게스트 상태에서 locale 전환 → 닉네임 자동 변경 확인
- 다중 탭에서 게스트 세션 공유 확인