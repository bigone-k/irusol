## 요구사항

1. 인증 후처리 (PK 연동 및 프로필 생성)
구글 로그인을 하면 auth.users에는 계정이 생기지만, 서비스에서 사용할 별도의 profiles 테이블(닉네임, 아바타 등)이 필요합니다.

Trigger & Function: 구글 가입이 일어나는 순간, DB 내부에서 트리거를 발생시켜 public.profiles 테이블에 자동으로 행을 생성해주는 SQL 로직이 필요합니다. (이걸 안 하면 매번 수동으로 유저 정보를 생성해야 합니다.)

2. Soft Delete (부드러운 삭제) 설계
실무에서는 유저가 '삭제' 버튼을 눌렀을 때 데이터를 DB에서 즉시 지우지 않는 경우가 많습니다.

방법: is_deleted 또는 deleted_at 컬럼을 만들어서 상태만 변경합니다. 실수로 지운 데이터를 복구하거나, 탈퇴한 유저의 정보를 법적 근거에 따라 일정 기간 보관해야 할 때 필수적입니다.

3. 속도 최적화: 인덱스(Index) 설정
처음에는 데이터가 적어 빠르지만, 게시글이 수천 개가 넘어가면 검색(select)이 느려집니다.

방법: 자주 검색 조건으로 쓰이는 컬럼(예: author_id, created_at)에는 Index를 미리 생성해두세요. 엑셀의 색인처럼 데이터를 찾는 속도를 비약적으로 높여줍니다.

4. Middleware를 통한 페이지 보호
클라이언트 코드에서만 로그인 체크를 하면 페이지가 잠깐 보였다가 사라지는 '깜빡임' 현상이 생깁니다.

Next.js Middleware: 서버 레벨에서 쿠키를 검사해, 로그인 안 한 유저가 대시보드 접근 시 /login으로 즉시 리다이렉트시키는 처리가 필요합니다.

5. TypeScript 타입 동기화 (강력 추천)
Supabase의 장점 중 하나는 내 DB 구조를 그대로 TypeScript 타입으로 뽑아낼 수 있다는 점입니다.

Supabase CLI: npx supabase gen types typescript --project-id ... 명령어를 통해 DB 테이블 타입을 생성하세요. 코드 작성 시 오타 방지와 자동 완성이 되어 개발 속도가 2배 이상 빨라집니다.

6. 실시간(Realtime) 기능 활용 여부
Next.js 환경에서 채팅이나 알림, 실시간 대시보드가 필요하다면 이 설정을 체크해야 합니다.

Replication 설정: 기본적으로 테이블은 실시간이 꺼져 있습니다. 대시보드에서 해당 테이블의 'Realtime' 옵션을 켜줘야 브라우저에서 변경 사항을 즉시 감지할 수 있습니다.

7. 환경별 분리 (Development vs Production)
로컬에서 개발할 때와 실제 배포했을 때의 URL이 다릅니다.

Redirect URL 설정: 구글 로그인 후 돌아올 주소를 localhost:3000뿐만 아니라, 나중에 배포할 myapp.vercel.app 주소도 Supabase Auth 설정에 추가해둬야 합니다.

8. 시스템 관리자 권한 부여 방식 (Role 설계)
"시스템 관리자는 모든 권한"을 갖게 하기 위해 구체적인 방법이 필요합니다.

Admin 컬럼 추가: profiles 테이블에 is_admin (boolean) 컬럼을 만들거나, 별도의 user_roles 테이블을 만들어 관리자를 구분하는 로직이 필요합니다.

RLS 조건 추가: RLS 정책 작성 시 OR (SELECT is_admin FROM profiles WHERE id = auth.uid()) 조건을 붙여 관리자 통로를 열어줘야 합니다.


## Next.js + Supabase 전체 아키텍처
앱의 전체적인 데이터 흐름과 보안 구조는 다음과 같이 구성됩니다.

```md
[ 유저 브라우저 (Client) ]
       │
       ├─ 1. 로그인 요청 (Google OAuth) ──────────┐
       │                                          ▼
[ Next.js 서버 (App Router) ]                [ Supabase 인프라 ]
       │                                          │
       ├─ 2. Middleware 검증 (Route 보호)         ├─ [ Auth (GoTrue) ]
       │    - JWT 쿠키 확인, 미인증 시 튕겨냄     │    - 토큰 발급 & 구글 연동
       │                                          │    - ⚡ Trigger: 가입 시 프로필 자동 생성
       ├─ 3. 데이터 요청 (Server/Client)          │
       │    - 생성된 TS 타입으로 안전하게 개발    │
       │    - JWT 토큰을 헤더에 담아 전송 ────────┼─ [ Database (PostgreSQL) ]
       │                                          │    - 🔒 RLS 필터링 (일반 유저 vs 관리자)
       ├─ 4. 실시간 구독 (Client Component)       │    - 🗄️ Tables (profiles, posts 등)
       │    - WebSocket 연결 ─────────────────────┼─ [ Realtime ]
       │                                          │    - 변경 사항 브로드캐스트
       ▼                                          │    - 🚀 속도 최적화: Indexing 적용
[ 화면 렌더링 ]                                   │    - 🗑️ 상태 관리: Soft Delete (is_deleted)
```

## 사전 준비 (수동 설정 필요)

코드 구현 전에 GCP와 Supabase에서 직접 설정해야 할 항목입니다.

### GCP (Google Cloud Platform) — OAuth 설정

1. [GCP Console](https://console.cloud.google.com/) → 프로젝트 생성/선택
2. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Authorized redirect URIs 추가:
   - `https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`
5. 생성 후 획득하는 키:

| 키 | 설명 | 입력 위치 |
|---|---|---|
| `GOOGLE_CLIENT_ID` | OAuth 클라이언트 ID | Supabase Dashboard → Auth → Providers → Google |
| `GOOGLE_CLIENT_SECRET` | OAuth 클라이언트 시크릿 | Supabase Dashboard → Auth → Providers → Google |

> GCP에서 얻은 키는 Supabase Dashboard에 입력하므로, `.env`에 직접 넣지 않습니다.

### Supabase 프로젝트 설정

1. [Supabase Dashboard](https://supabase.com/dashboard) → New Project 생성
2. **Project Settings → API** 에서 획득:

| 키 | 설명 | 입력 위치 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 프로젝트 URL (예: `https://xxxxx.supabase.co`) | `.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 브라우저용 Public anon key | `.env.local` |
| `SUPABASE_PROJECT_ID` (선택) | CLI 타입 생성용 | `.env.local` |

3. **Authentication → Providers → Google** 활성화 → GCP 키 입력
4. **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000`
   - Redirect URLs 추가:
     - `http://localhost:3000/auth/callback`
     - `https://your-domain.vercel.app/auth/callback` (배포 시)

### `.env.local` 파일 (프로젝트 루트에 생성)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...your-anon-key

# (선택) Supabase CLI - 타입 생성용
SUPABASE_PROJECT_ID=your-project-id
```

---

## 단계별 구현 페이즈 (Implementation Phases)

의존성이 꼬이지 않고 가장 매끄럽게 개발할 수 있는 순서입니다.

### Phase 1: DB 스키마 및 보안 기초 공사 ✅ 완료

> **정본(Source of Truth)**: [`docs/supabase_schema.sql`](./supabase_schema.sql)
> **롤백**: [`docs/supabase_rollback.sql`](./supabase_rollback.sql)
>
> 테이블 6개, 가입 트리거, RLS 정책, 인덱스 모두 Supabase SQL Editor에서 적용 완료.

---

### Phase 2: Next.js 연동 및 타입 세팅 (코드 구현)

Next.js와 Supabase를 연결하고 개발 생산성을 끌어올리는 단계입니다.

#### 2-1. 패키지 설치

```bash
npm install @supabase/ssr @supabase/supabase-js
```

#### 2-2. Supabase 클라이언트 유틸리티 생성

| 파일 (신규) | 용도 |
|---|---|
| `src/lib/supabase/client.ts` | 브라우저용 Supabase 클라이언트 (Client Component에서 사용) |
| `src/lib/supabase/server.ts` | 서버용 Supabase 클라이언트 (Server Component/Route Handler) |
| `src/lib/supabase/middleware.ts` | Middleware용 Supabase 클라이언트 |

#### 2-3. Middleware 수정 (요구사항 4) — `middleware.ts`

현재 next-intl locale 라우팅만 처리 → Supabase Auth 세션 검증 통합:

```
요청 → Supabase 세션 갱신 → 미인증 + 보호 경로 → /{locale}/login 리다이렉트
                            → 인증됨 or 공개 경로 → next-intl locale 라우팅 계속
```

- **보호 경로**: `/goals`, `/projects`, `/calendar`, `/character`, `/stats`, `/settings`
- **공개 경로**: `/login`, `/auth/callback`

#### 2-4. Auth Callback Route (신규)

`src/app/auth/callback/route.ts` — Google OAuth 콜백 처리 (code → session 교환)

#### 2-5. 로그인 페이지 (신규)

`src/app/[locale]/login/page.tsx` — Google 로그인 버튼 (Duto Mint Clean 팔레트 적용)

#### 2-6. TypeScript 타입 생성 (요구사항 5)

```bash
npx supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > src/types/supabase.ts
```

---

### Phase 3: 데이터 레이어 전환 및 비즈니스 로직

실제 데이터를 주고받으며 기존 localStorage 구조를 Supabase와 연동하는 핵심 단계입니다.

#### 전략: Hybrid (비로그인=localStorage, 로그인=Supabase)

- **비로그인 상태**: 기존 localStorage 동작 그대로 유지 (게스트 모드)
- **로그인 상태**: Supabase DB를 primary data source로 사용
- **첫 로그인 시**: localStorage 데이터를 Supabase로 1회 마이그레이션

#### 3-1. 인증 상태 관리 Store (신규)

`src/store/useAuthStore.ts`:
- `user`, `session`, `isAuthenticated`, `isLoading` 상태
- `signInWithGoogle()`, `signOut()` 액션
- Supabase `onAuthStateChange` 구독

#### 3-2. Store 확장

각 Zustand store의 action을 확장하여:
- 로그인 시 → Supabase CRUD 호출 → 로컬 state 반영
- 비로그인 시 → 기존 localStorage persist 동작 유지

#### 3-3. localStorage → Supabase 마이그레이션 (신규)

`src/lib/supabase/migrate-local-data.ts`:
- 첫 로그인 감지 → localStorage 데이터 읽기 → Supabase bulk insert → localStorage 클리어 (선택)

---

### Phase 4: 실시간 기능 및 최적화 (요구사항 6 — 후순위)

서비스를 실제 운영하기 좋게 다듬는 마무리 단계입니다.

#### 4-1. Realtime 연동 (요구사항 6)

Supabase 대시보드에서 실시간이 필요한 테이블의 Replication을 켜고,
Next.js 클라이언트 컴포넌트에서 `supabase.channel().on('postgres_changes', ...)` 구독 로직 추가.

#### 4-2. 추가 최적화

- Soft Delete 쿼리 필터 통합 (`deleted_at IS NULL` 기본 적용)
- 인덱스 효과 모니터링 및 추가 튜닝
- 에러 핸들링 및 오프라인 대응

---

## 수정 대상 파일 요약

| 파일 | 변경 내용 | Phase |
|---|---|---|
| `package.json` | `@supabase/ssr`, `@supabase/supabase-js` 추가 | 2 |
| `.env.local` (신규) | Supabase URL, Anon Key | 2 |
| `.gitignore` | `.env.local` 추가 확인 | 2 |
| `middleware.ts` | Auth 세션 검증 + next-intl 통합 | 2 |
| `src/lib/supabase/client.ts` (신규) | 브라우저 Supabase 클라이언트 | 2 |
| `src/lib/supabase/server.ts` (신규) | 서버 Supabase 클라이언트 | 2 |
| `src/lib/supabase/middleware.ts` (신규) | Middleware Supabase 클라이언트 | 2 |
| `src/app/auth/callback/route.ts` (신규) | OAuth 콜백 | 2 |
| `src/app/[locale]/login/page.tsx` (신규) | 로그인 페이지 | 2 |
| `src/types/supabase.ts` (신규) | Supabase 자동생성 타입 | 2 |
| `src/store/useAuthStore.ts` (신규) | 인증 상태 관리 | 3 |
| `src/lib/supabase/migrate-local-data.ts` (신규) | localStorage → DB 마이그레이션 | 3 |
| 기존 stores (`useTaskStore` 등) | Supabase CRUD 연동 | 3 |

---

### 온보딩 플래그 마이그레이션

> profiles 테이블에 `is_onboarded` 컬럼 추가. 기존 사용자는 온보딩 완료로 처리.

```sql
-- 1. 컬럼 추가
ALTER TABLE public.profiles ADD COLUMN is_onboarded BOOLEAN DEFAULT false;

-- 2. 기존 사용자는 온보딩 완료로 처리
UPDATE public.profiles SET is_onboarded = true WHERE created_at < now();
```

**롤백:**
```sql
ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_onboarded;
```

---

## 검증 방법

1. `npm run build` — 빌드 에러 없음
2. `npm run lint` — ESLint 통과
3. 비로그인 → 기존 localStorage 동작 확인 (게스트 모드)
4. Google 로그인 → Supabase `profiles` + `player_stats` 자동 생성 확인
5. 로그인 상태에서 데이터 CRUD → Supabase DB 반영 확인
6. 비인증 사용자가 보호 경로 접근 → `/login` 리다이렉트 확인