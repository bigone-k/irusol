# Color System Migration Checklist

레거시 색상 시스템에서 Duto Mint Clean으로 마이그레이션하는 체크리스트입니다.

## 사전 준비

### 1. 레거시 색상 검색

```bash
# 모든 레거시 색상 패턴 검색
grep -r "bg-purple-\|bg-blue-\|bg-cyan-\|bg-green-\|bg-yellow-\|bg-orange-\|bg-pink-\|bg-gray-\|text-purple-\|text-blue-\|text-cyan-\|text-green-\|text-yellow-\|text-orange-\|text-pink-\|text-gray-\|border-purple-\|border-blue-\|border-cyan-\|border-green-\|border-yellow-\|border-orange-\|border-pink-\|border-gray-\|from-purple-\|from-blue-\|from-cyan-\|from-green-\|from-yellow-\|from-orange-\|from-pink-\|to-purple-\|to-blue-\|to-cyan-\|to-green-\|to-yellow-\|to-orange-\|to-pink-" src --include="*.tsx" --include="*.ts"
```

### 2. 빌드 캐시 정리

```bash
# Next.js 빌드 캐시 제거
rm -rf .next

# 노드 모듈 재설치 (선택사항)
npm install
```

## 마이그레이션 매핑

### 배경색 (Background)

| 레거시 | 새 색상 | 용도 |
|--------|---------|------|
| `bg-purple-500` | `bg-primary` | 메인 배경 |
| `bg-purple-600` | `bg-primary-dark` | 진한 배경 |
| `bg-blue-500` | `bg-primary` | 메인 배경 |
| `bg-cyan-500` | `bg-primary-dark` | 진한 배경 |
| `bg-green-500` | `bg-accent` | 성공 배경 |
| `bg-green-400` | `bg-accent` | 성공 배경 |
| `bg-green-100` | `bg-accent/10` | 연한 성공 배경 |
| `bg-yellow-500` | `bg-secondary` | 경고 배경 |
| `bg-yellow-400` | `bg-secondary` | 경고 배경 |
| `bg-orange-500` | `bg-secondary` | 경고 배경 |
| `bg-pink-500` | `bg-accent` | 강조 배경 |
| `bg-gray-50` | `bg-background` | 페이지 배경 |
| `bg-gray-100` | `bg-track` | 트랙 배경 |
| `bg-gray-200` | `bg-track` | 트랙 배경 |
| `bg-gray-300` | `bg-border` | 구분선 |
| `bg-white` | `bg-background-surface` | 카드 배경 |

### 텍스트 색상 (Text)

| 레거시 | 새 색상 | 용도 |
|--------|---------|------|
| `text-purple-600` | `text-primary` | 메인 텍스트 강조 |
| `text-purple-500` | `text-primary` | 메인 텍스트 강조 |
| `text-blue-600` | `text-primary` | 링크 |
| `text-blue-500` | `text-primary` | 링크 |
| `text-cyan-600` | `text-primary-dark` | 진한 강조 |
| `text-green-600` | `text-accent` | 성공 텍스트 |
| `text-green-700` | `text-accent` | 성공 텍스트 |
| `text-yellow-600` | `text-accent` | 강조 텍스트 |
| `text-yellow-700` | `text-accent` | 강조 텍스트 |
| `text-orange-600` | `text-text-muted` | 경고 텍스트 |
| `text-orange-500` | `text-text-muted` | 경고 텍스트 |
| `text-pink-600` | `text-accent` | 강조 텍스트 |
| `text-gray-900` | `text-text` | 본문 텍스트 |
| `text-gray-800` | `text-text` | 본문 텍스트 |
| `text-gray-700` | `text-text` | 본문 텍스트 |
| `text-gray-600` | `text-text-muted` | 보조 텍스트 |
| `text-gray-500` | `text-text-muted` | 보조 텍스트 |
| `text-gray-400` | `text-text-muted` | 보조 텍스트 |

### 테두리 색상 (Border)

| 레거시 | 새 색상 | 용도 |
|--------|---------|------|
| `border-purple-500` | `border-primary` | 메인 테두리 |
| `border-blue-500` | `border-primary` | 메인 테두리 |
| `border-green-200` | `border-accent` | 성공 테두리 |
| `border-green-600` | `border-accent` | 성공 테두리 |
| `border-yellow-400` | `border` | 기본 테두리 |
| `border-gray-200` | `border` | 기본 테두리 |
| `border-gray-300` | `border` | 기본 테두리 |

### 그라디언트 (Gradient)

| 레거시 | 새 색상 | 용도 |
|--------|---------|------|
| `from-purple-500 to-pink-500` | `from-primary to-primary-dark` | 메인 그라디언트 |
| `from-blue-400 to-cyan-500` | `from-primary to-primary-dark` | 메인 그라디언트 |
| `from-yellow-400 to-orange-400` | `from-primary to-accent` | 축하 그라디언트 |
| `from-purple-50 to-blue-50` | `from-background to-background-surface` | 배경 그라디언트 |

### 호버 상태 (Hover)

| 레거시 | 새 색상 | 용도 |
|--------|---------|------|
| `hover:bg-purple-600` | `hover:bg-primary-dark` | 버튼 호버 |
| `hover:bg-blue-600` | `hover:bg-primary-dark` | 버튼 호버 |
| `hover:bg-gray-100` | `hover:bg-primary/5` | 카드 호버 |
| `hover:bg-gray-50` | `hover:bg-track` | 미세한 호버 |

### 포커스 상태 (Focus)

| 레거시 | 새 색상 | 용도 |
|--------|---------|------|
| `focus:ring-purple-500` | `focus:ring-primary` | 포커스 링 |
| `focus:ring-blue-500` | `focus:ring-primary` | 포커스 링 |
| `focus:border-purple-500` | `focus:border-primary` | 포커스 테두리 |
| `focus:border-blue-500` | `focus:border-primary` | 포커스 테두리 |

## 단계별 마이그레이션

### Phase 1: Tailwind Config 업데이트

```bash
# tailwind.config.ts 확인
cat tailwind.config.ts
```

```typescript
// Duto Mint Clean 팔레트 추가 확인
colors: {
  primary: {
    DEFAULT: '#7DE6C3',
    dark: '#4FD4A8',
  },
  secondary: {
    DEFAULT: '#FFF6BF',
  },
  accent: {
    DEFAULT: '#F19ED2',
  },
  background: {
    DEFAULT: '#F7F9F2',
    surface: '#FFFFFF',
  },
  border: {
    DEFAULT: '#DCEEE7',
  },
  text: {
    DEFAULT: '#0F172A',
    muted: '#64748B',
  },
  track: '#E5E7EB',
}
```

### Phase 2: 컴포넌트 마이그레이션

#### 우선순위 1: 핵심 UI 컴포넌트

```bash
# 버튼, 카드, 폼 등 핵심 컴포넌트
- src/components/AddTaskButton.tsx
- src/components/FloatingAddButton.tsx
- src/components/StatusBadge.tsx
- src/components/ProgressBar.tsx
- src/components/FormInput.tsx
- src/components/FormTextarea.tsx
```

#### 우선순위 2: 레이아웃 컴포넌트

```bash
- src/components/TopAppBar.tsx
- src/components/BottomNavigation.tsx
- src/components/Sidebar.tsx
- src/components/TabNavigation.tsx
```

#### 우선순위 3: 기능 컴포넌트

```bash
- src/components/GoalCard.tsx
- src/components/ProjectCard.tsx
- src/components/CharacterCard.tsx
- src/components/TaskList.tsx
- src/components/PlayerDashboard.tsx
```

#### 우선순위 4: 페이지 파일

```bash
- src/app/[locale]/layout.tsx
- src/app/[locale]/character/page.tsx
- src/app/[locale]/projects/page.tsx
- src/app/[locale]/projects/[id]/page.tsx
```

### Phase 3: 배치 변경

#### 스크립트로 일괄 변경

```bash
# 배경색 변경
find src -name "*.tsx" -type f -exec sed -i '' \
  -e 's/bg-purple-500/bg-primary/g' \
  -e 's/bg-purple-600/bg-primary-dark/g' \
  -e 's/bg-blue-500/bg-primary/g' \
  -e 's/bg-green-500/bg-accent/g' \
  -e 's/bg-green-100/bg-accent\/10/g' \
  -e 's/bg-yellow-500/bg-secondary/g' \
  -e 's/bg-gray-50/bg-background/g' \
  -e 's/bg-gray-100/bg-track/g' \
  -e 's/bg-gray-200/bg-track/g' \
  -e 's/bg-white/bg-background-surface/g' \
  {} \;

# 텍스트 색상 변경
find src -name "*.tsx" -type f -exec sed -i '' \
  -e 's/text-purple-600/text-primary/g' \
  -e 's/text-blue-600/text-primary/g' \
  -e 's/text-green-600/text-accent/g' \
  -e 's/text-gray-900/text-text/g' \
  -e 's/text-gray-800/text-text/g' \
  -e 's/text-gray-700/text-text/g' \
  -e 's/text-gray-600/text-text-muted/g' \
  -e 's/text-gray-500/text-text-muted/g' \
  {} \;

# 테두리 색상 변경
find src -name "*.tsx" -type f -exec sed -i '' \
  -e 's/border-purple-500/border-primary/g' \
  -e 's/border-green-200/border-accent/g' \
  -e 's/border-gray-200/border/g' \
  -e 's/border-gray-300/border/g' \
  {} \;

# 포커스 링 변경
find src -name "*.tsx" -type f -exec sed -i '' \
  -e 's/focus:ring-purple-500/focus:ring-primary/g' \
  -e 's/focus:ring-blue-500/focus:ring-primary/g' \
  -e 's/focus:border-purple-500/focus:border-primary/g' \
  -e 's/focus:border-blue-500/focus:border-primary/g' \
  {} \;
```

### Phase 4: 검증

```bash
# 1. 레거시 색상 검색 (남은 것이 있는지 확인)
grep -r "bg-purple-\|bg-blue-\|bg-gray-" src --include="*.tsx" | wc -l

# 2. 빌드 테스트
npm run build

# 3. 타입 체크
npm run type-check

# 4. Lint 체크
npm run lint
```

## 검증 체크리스트

### 자동 검증

- [ ] 레거시 색상 패턴 0개 확인
- [ ] TypeScript 컴파일 성공
- [ ] ESLint 통과
- [ ] 빌드 성공

### 수동 검증

- [ ] 모든 페이지 시각적 확인
- [ ] 버튼 호버/포커스 상태 확인
- [ ] 카드 테두리 및 배경 확인
- [ ] 진행바 색상 확인
- [ ] 상태 배지 색상 확인
- [ ] 입력 필드 포커스 링 확인
- [ ] 모달/토스트 색상 확인
- [ ] 다크모드 (향후) 확인

## 문제 해결

### 문제 1: 빌드 실패

```bash
# 빌드 캐시 삭제 후 재시도
rm -rf .next
npm run build
```

### 문제 2: 색상이 반영되지 않음

```bash
# 브라우저 캐시 클리어
# Chrome: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)
# Firefox: Cmd+Shift+R (Mac) / Ctrl+F5 (Windows)

# 개발 서버 재시작
npm run dev
```

### 문제 3: 일부 컴포넌트만 색상이 다름

```bash
# 해당 컴포넌트 검색
grep -n "bg-purple-\|bg-blue-\|bg-gray-" src/components/ComponentName.tsx

# 수동으로 매핑 테이블 참조하여 수정
```

## Git 커밋

마이그레이션 완료 후:

```bash
# 변경사항 확인
git status
git diff --stat

# 스테이징
git add .

# 커밋
git commit -m "feat: Migrate to Duto Mint Clean color palette

- Update all components and pages with new color system
- Replace legacy purple/blue/green/gray colors
- Apply consistent semantic color usage
- Build verification successful

Refs: agents/color-system/"

# 푸시 (선택사항)
git push origin main
```

## 유지보수

### 정기 검사

```bash
# 월 1회 레거시 색상 검색
grep -r "bg-purple-\|bg-blue-\|bg-gray-" src --include="*.tsx"

# 새 컴포넌트 생성 시 color-system agent 참조 확인
```

### 새 팀원 온보딩

1. `agents/color-system/README.md` 읽기
2. `agents/color-system/prompt.md` 숙지
3. `agents/color-system/usage-guide.md` 예시 확인
4. 첫 PR 전 `migration-checklist.md` 검증

---

*Last Updated: 2026-02-15*
