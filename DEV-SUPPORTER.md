# DEV-SUPPORTER.md

## 활성화된 도구

| 이름 | 유형 | 활성화 명령 |
|------|------|-----------|
| karpathy-guidelines | Skill | `/andrej-karpathy-skills:karpathy-guidelines` |
| typescript-lsp | Plugin | TypeScript 파일 편집 시 자동 |
| sequential-thinking | MCP | `--seq` 또는 복잡 분석 시 |
| context7 | MCP | `--c7` 또는 라이브러리 문서 조회 시 |
| playwright | Plugin | `/ralph-loop:ralph-loop` 또는 `npm run test:e2e` |
| planning-with-files | Plugin | `/planning-with-files:planning-with-files` |
| ralph-loop | Plugin | `/ralph-loop:ralph-loop` |

---

## 도구별 이 프로젝트 적용 가이드

**⚠️ karpathy-guidelines — 코드 변경 전·후 반드시 실행**
> 실행 명령: `/andrej-karpathy-skills:karpathy-guidelines`
- 코드 작성 **전**: "이 변경이 정말 필요한가?" 점검
- `src/app/[locale]/` 페이지 수정 시 상위 `layout.tsx` 변경 자제
- 커스텀 훅 분리는 2+ 컴포넌트에서 공유할 때만 (현재 store 직접 사용 패턴 준수)
- Zustand store action 추가 시 기존 `persist` 스키마 호환 확인
- 코드 작성 **후**: 불필요한 props·추상화 제거 재점검

**typescript-lsp** — TypeScript 심볼 탐색 (Search 대신 우선 사용)
- 모든 컴포넌트가 `'use client'` Client Component — locale store/persist 사용 구조
- 라우팅: `src/app/[locale]/` App Router, locale dynamic segment 진입점 주의
- 타입 정의 위치: `src/types/index.ts` (Task, Goal, Project, PlayerStats)

**⚠️ sequential-thinking — 신규 기능·버그 수정 시 반드시 사용**
> 실행 명령: `--seq` 또는 `--think-hard`
- `useTaskStore` → `rewards.ts` → `usePlayerStore` 보상 연동 흐름 분석 시
- `evolution.ts` / `rewards.ts` 로직 변경 시 파급 범위 (레벨업·진화 단계) 추적
- Zustand store 간 의존성 있는 상태 변경 설계 시
- `middleware.ts` locale 라우팅 동작 추적 시

**context7** — 라이브러리 공식 문서 (버전 불확실 시 반드시 조회)
> 실행 명령: `--c7`
- Next.js 15.1.3 · React 19.0.0 · TypeScript 5 · Tailwind CSS 3.4.1
- Zustand 5.0.2 · next-intl 4.8.2 · Framer Motion 11.15.0 · date-fns 4.1.0
- Next.js 15 Server Actions·App Router 문서 우선 (단, 이 프로젝트는 전체 Client Component)

**planning-with-files** — 신규 페이지 그룹·대형 기능 추가 시만 사용
> 실행 명령: `/planning-with-files:planning-with-files`
- 산출물 경로: `docs/file-work/{branch명}_{YYYYMMDD_HHMMSS}_{파일종류}.md`
- 신규 locale 라우트 추가, 대형 store 리팩토링, 인증 시스템 구현 시

**playwright** — 핵심 사용자 플로우 E2E 테스트 (Happy Path만)
> 실행 명령: `npm run test:e2e` / `npm run test:e2e:ui`
- 테스트 위치: `e2e/` 디렉토리, 파일명: `[도메인]-[시나리오].spec.ts`
- Happy Path만 대상 — 에러·예외 케이스는 단위 테스트에서
- Jest `--coverage` 수치에 미집계 — 커버리지 별도 관리

**ralph-loop** — 빌드·테스트 실패 반복 수정
> 실행 명령: `/ralph-loop:ralph-loop`
- `npm run build` 실패 시 성공까지 자동 반복

---

## 작업 유형별 필수 절차

> ⚠️ 모든 작업은 karpathy-guidelines 실행으로 시작하고 종료한다.

### 일반 코드 수정
1. `/andrej-karpathy-skills:karpathy-guidelines` — 변경 범위 점검
2. typescript-lsp 로 심볼 탐색 + 참조 확인
3. (라이브러리 API 불확실 시) `--c7` 로 context7 조회
4. 완료 후 `/andrej-karpathy-skills:karpathy-guidelines` 재실행

### 버그 수정
1. `--seq` 로 sequential-thinking — 근본 원인 분석
2. typescript-lsp 로 관련 코드 추적
3. 수정 범위 최소화 — 버그만 픽스, 리팩토링 금지
4. `/andrej-karpathy-skills:karpathy-guidelines` — 범위 초과 여부 확인

### 신규 기능 구현
1. `/andrej-karpathy-skills:karpathy-guidelines` — 과잉설계 방지
2. `--seq` 로 sequential-thinking — 구현 전략 수립 (store 의존성 포함)
3. typescript-lsp 로 구현, (라이브러리 문서 필요 시) `--c7` 병행
4. 완료 후 `/andrej-karpathy-skills:karpathy-guidelines` 재실행

### 보상·레벨업 로직 수정 (프로젝트 특화)
1. `--think-hard --seq` — `rewards.ts` → `usePlayerStore` → `evolution.ts` 파급 분석
2. typescript-lsp 로 `useTaskStore`, `useGoalStore`, `CharacterCard`, `StatsBars` 참조 추적
3. 변경 범위: `src/lib/` + 관련 store만 — 컴포넌트 직접 수정 자제

### 컴포넌트 개발
1. `/andrej-karpathy-skills:karpathy-guidelines` — 과잉 추상화 방지
2. `--c7` 로 React 19·Tailwind CSS 문서 조회
3. typescript-lsp 로 Props 타입·참조 확인
4. 완료 후 `/andrej-karpathy-skills:karpathy-guidelines` 재실행

### 리팩토링
1. `/andrej-karpathy-skills:karpathy-guidelines` — 변경 범위 한정
2. typescript-lsp 로 참조 관계 파악
3. `--seq` 로 sequential-thinking — 영향도 분석 (store 간 의존성 포함)
4. 완료 후 `/andrej-karpathy-skills:karpathy-guidelines` 재실행

### 신규 페이지 그룹·대형 기능 (planning-with-files)
1. `/andrej-karpathy-skills:karpathy-guidelines` — 과잉설계 방지
2. `/planning-with-files:planning-with-files` — 설계 계획 (`docs/file-work/` 저장)
3. `--seq` 로 sequential-thinking — 구현 전략 수립
4. typescript-lsp 로 구현
5. 완료 후 `/andrej-karpathy-skills:karpathy-guidelines` 재실행

### E2E 테스트 작성 (Happy Path)
1. typescript-lsp 로 페이지 경로 + 핵심 UI 인터랙션 파악
2. `--seq` 로 sequential-thinking — 핵심 사용자 플로우(Happy Path) 식별
3. `e2e/` 디렉토리에 Playwright 테스트 작성 (`[도메인]-[시나리오].spec.ts`)
4. `npm run test:e2e` 실행 확인

### 빌드·테스트 안정화 (ralph-loop)
1. `npm run build` 실패 시 → `/ralph-loop:ralph-loop`
2. 안정화 완료 후 `/andrej-karpathy-skills:karpathy-guidelines` 재실행

---

## 작업 완료 기준 ⚠️

```bash
npm run build    # .next/ 디렉토리 생성 + 빌드 에러 없음 확인 필수
npm run lint     # ESLint 오류 없음
```
