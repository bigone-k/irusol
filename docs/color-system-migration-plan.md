# 🎨 Irusol 색상 시스템 마이그레이션 계획서

**작성일**: 2026-02-15
**목적**: RPG 테마 기반 일관된 색상 시스템 구축
**참조**: `docs/color.md`, `docs/colors.png`

---

## 📋 목차

1. [현황 분석](#현황-분석)
2. [목표 색상 시스템](#목표-색상-시스템)
3. [작업 범위](#작업-범위)
4. [단계별 실행 계획](#단계별-실행-계획)
5. [컴포넌트별 마이그레이션 가이드](#컴포넌트별-마이그레이션-가이드)
6. [검증 체크리스트](#검증-체크리스트)
7. [롤백 계획](#롤백-계획)

---

## 1. 현황 분석

### 1.1 현재 색상 사용 문제점

#### ❌ 일관성 부족
- **사용 중인 색상**: Blue, Cyan, Purple, Red, Yellow, Green, Orange, Pink, Gray (총 9개)
- **문제**: 브랜드 정체성 없음, 시각적 혼란
- **영향**: 사용자 경험 저하, 유지보수 어려움

#### ❌ 하드코딩된 색상값
```tsx
// 현재: 하드코딩된 Tailwind 클래스
<div className="bg-blue-500 border-purple-200">

// 문제: 색상 변경 시 전체 파일 수정 필요
// 예상 수정 파일: 25개 이상
```

#### ❌ Tailwind 커스텀 색상 미활용
```typescript
// tailwind.config.ts - 현재 상태
theme: {
  extend: {
    colors: {
      // ❌ 색상 정의 없음
    }
  }
}
```

#### ❌ 상태별 색상 불일치
| 상태 | GoalCard | ProjectCard | StatusBadge |
|------|---------|-------------|------------|
| Not Started | - | `border-blue-200` | `bg-gray-200` |
| In Progress | - | - | `bg-blue-500` |
| Completed | `border-green-300` | `border-green-300` | `bg-green-500` |

### 1.2 색상 분포 현황

```
사용 빈도별:
- Blue/Cyan   : 12개 사용처 (프로젝트, 버튼, 포커스)
- Purple      : 10개 사용처 (목표, 배지, 네비게이션)
- Green       : 8개 사용처 (완료 상태, 진행률)
- Gray        : 8개 사용처 (비활성, 배경, 텍스트)
- Red         : 6개 사용처 (위험, 감소, 진행률)
- Yellow/Orange: 5개 사용처 (경험치, 경고, 진행률)
- Pink        : 3개 사용처 (스테이지, 진행률)
```

---

## 2. 목표 색상 시스템

### 2.1 Duto Palette (Mint Clean) 적용

**출처**: `docs/colors.png`, `docs/color.md`

#### 🎨 Core Colors (주요 색상)
```typescript
Primary (민트):
  - Default: #7DE6C3
  - Dark: #4FD4A8
  - 용도: CTA, 선택 상태, 진행 중 표시

Secondary (버터):
  - Default: #FFF6BF
  - 용도: 칩, 필터, 가벼운 하이라이트 (CTA 제외)

Accent (소프트 블룸 핑크):
  - Default: #F19ED2
  - 용도: 보상, 완료, 배지 전용
  - 제약: 화면의 5% 이하만 사용
```

#### 🖼️ UI Base Colors (기본 UI)
```typescript
Background:
  - Cream: #F7F9F2 (기본 배경)
  - Surface: #FFFFFF (카드, 모달)

Border:
  - Default: #DCEEE7 (1px 보더)
  - 원칙: 그림자 최소화

Track:
  - Default: #E5E7EB (프로그레스 배경)
```

#### 📝 Text Colors (텍스트)
```typescript
Text:
  - Default: #0F172A
  - Muted: #64748B
```

### 2.2 색상 사용 원칙

#### ✅ Primary (민트) 사용 규칙
- **허용**: CTA 버튼, 활성 상태, 진행 중 표시, 선택된 항목
- **금지**: 배경 전체, 텍스트 (가독성 저하)
- **비율**: 화면의 10-15%

#### ✅ Secondary (버터) 사용 규칙
- **허용**: 칩, 필터, 하이라이트, 호버 상태
- **금지**: CTA 버튼 (혼란 방지)
- **비율**: 화면의 5-10%

#### ✅ Accent (핑크) 사용 규칙
- **허용**: 완료 배지, 보상 표시, 특별한 이벤트
- **금지**: 일반 버튼, 배경
- **비율**: 화면의 5% 이하 (강조 효과)

#### ✅ Background (크림/화이트) 사용 규칙
- **Cream**: 전체 페이지 배경
- **White**: 카드, 모달, 폼 요소
- **Border**: 최소화, 1px만 사용

---

## 3. 작업 범위

### 3.1 수정 대상 파일 (총 28개)

#### Phase 1: 핵심 설정 (1개)
- `tailwind.config.ts` - 커스텀 색상 정의

#### Phase 2: 컴포넌트 (25개)
```
src/components/
├── AddTaskButton.tsx          ✅ 버튼 (Primary)
├── BottomNavigation.tsx       ✅ 네비게이션 (Primary)
├── CharacterCard.tsx          ✅ 카드 (Primary/Accent)
├── EmptyState.tsx             ✅ 상태 (Muted)
├── FloatingAddButton.tsx      ✅ FAB (Primary)
├── FormInput.tsx              ✅ 폼 (Primary 포커스)
├── FormTextarea.tsx           ✅ 폼 (Primary 포커스)
├── GoalCard.tsx               ✅ 카드 (Primary/Accent)
├── GoalForm.tsx               ✅ 폼 (Primary)
├── ObjectiveCard.tsx          ✅ 카드 (Secondary)
├── Onboarding.tsx             ✅ 온보딩 (Primary)
├── PlayerDashboard.tsx        ✅ 대시보드 (Primary)
├── ProgressBar.tsx            ✅ 진행률 (Primary)
├── ProjectCard.tsx            ✅ 카드 (Primary)
├── ProjectForm.tsx            ✅ 폼 (Primary)
├── Sidebar.tsx                ✅ 사이드바 (Primary)
├── StatsBars.tsx              ✅ 통계 (Primary/Accent)
├── StatusBadge.tsx            ✅ 배지 (Primary/Secondary/Accent)
├── TabNavigation.tsx          ✅ 탭 (Primary)
├── TaskList.tsx               ✅ 리스트 (Primary/Secondary)
├── TopAppBar.tsx              ✅ 앱바 (Primary)
├── BottomSheetModal.tsx       ✅ 모달 (Surface)
└── VisionFormBottomSheet.tsx  ✅ 시트 (Primary)
```

#### Phase 3: 레이아웃 (2개)
- `src/app/layout.tsx` - 루트 배경
- `src/app/[locale]/layout.tsx` - 로케일 배경

### 3.2 제외 대상
- `messages/*.json` - 번역 파일 (색상 무관)
- `src/types/index.ts` - 타입 정의 (색상 무관)
- `src/store/*.ts` - 상태 관리 (색상 무관)
- `src/lib/*.ts` - 유틸리티 (색상 무관)

---

## 4. 단계별 실행 계획

### Phase 1: 기반 구축 (30분)

#### Step 1.1: Tailwind 설정
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Core
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

        // UI Base
        background: {
          DEFAULT: '#F7F9F2',
          surface: '#FFFFFF',
        },
        border: {
          DEFAULT: '#DCEEE7',
        },

        // Text
        text: {
          DEFAULT: '#0F172A',
          muted: '#64748B',
        },

        // Etc
        track: '#E5E7EB',
      },
    },
  },
}
```

#### Step 1.2: 색상 매핑 문서 작성
```markdown
기존 → 새 색상 매핑:

CTA/버튼:
- blue-500 → primary
- cyan-500 → primary-dark
- from-blue-500 to-cyan-500 → from-primary to-primary-dark

카드 경계:
- purple-200 → border
- blue-200 → border

완료 상태:
- green-300 → accent (핑크로 변경)
- green-50 → accent/10 (연한 핑크)

배지/칩:
- purple-100 → secondary
- blue-100 → secondary

비활성/배경:
- gray-200 → track
- gray-400 → text-muted
```

### Phase 2: 컴포넌트 마이그레이션 (3시간)

#### 🔹 우선순위 1 (핵심 UI - 45분)
1. **FloatingAddButton.tsx** (5분)
   - `from-blue-500 to-cyan-500` → `from-primary to-primary-dark`

2. **AddTaskButton.tsx** (5분)
   - `from-blue-500 to-cyan-500` → `from-primary to-primary-dark`

3. **StatusBadge.tsx** (10분)
   - Not Started: `bg-gray-200` → `bg-track`
   - In Progress: `bg-blue-500` → `bg-primary`
   - Completed: `bg-green-500` → `bg-accent`

4. **ProgressBar.tsx** (10분)
   - 기본값: `from-purple-500 to-pink-500` → `from-primary to-primary-dark`
   - 배경: `bg-gray-200` → `bg-track`

5. **BottomNavigation.tsx** (10분)
   - 활성 상태: `text-purple-600 bg-purple-50` → `text-primary bg-primary/10`

6. **TopAppBar.tsx** (5분)
   - 배경 확인 (변경 필요시 `bg-background-surface`)

#### 🔹 우선순위 2 (카드 컴포넌트 - 60분)
7. **GoalCard.tsx** (15분)
   - 경계: `border-purple-200` → `border`
   - 완료 경계: `border-green-300` → `border-accent`
   - 완료 배경: `bg-green-50` → `bg-accent/10`
   - 진행률 오버레이: Red/Yellow/Green → 그대로 유지 (통계적 의미)
   - 프로젝트 배지: `bg-purple-50 text-purple-600` → `bg-secondary text-text`

8. **ProjectCard.tsx** (15분)
   - 경계: `border-blue-200` → `border`
   - 완료 경계: `border-green-300` → `border-accent`
   - 완료 배경: `bg-green-50` → `bg-accent/10`
   - 진행률: `from-blue-500 to-cyan-500` → `from-primary to-primary-dark`

9. **CharacterCard.tsx** (15분)
   - 경계: `border-purple-200` → `border`
   - 경험치 바: `from-yellow-400 to-yellow-500` → `from-primary to-primary-dark`
   - 레벨업 이펙트: `bg-yellow-400` → `bg-accent`
   - 스테이지 배지: `bg-pink-100 text-pink-700` → `bg-accent/20 text-accent`

10. **PlayerDashboard.tsx** (10분)
    - 배경 확인 (변경 필요시 `bg-background-surface`)

11. **ObjectiveCard.tsx** (5분)
    - 배경: `bg-yellow-50` → `bg-secondary`
    - 텍스트: 색상 확인 및 조정

#### 🔹 우선순위 3 (폼 컴포넌트 - 30분)
12. **FormInput.tsx** (10분)
    - 포커스: `focus:ring-purple-500` → `focus:ring-primary`
    - 경계: `border-gray-300` → `border`

13. **FormTextarea.tsx** (10min)
    - 포커스: `focus:ring-purple-500` → `focus:ring-primary`
    - 경계: `border-gray-300` → `border`

14. **GoalForm.tsx** (5분)
    - 버튼: `from-blue-500 to-cyan-500` → `from-primary to-primary-dark`

15. **ProjectForm.tsx** (5min)
    - 버튼: `from-blue-500 to-cyan-500` → `from-primary to-primary-dark`

16. **VisionFormBottomSheet.tsx** (10분)
    - 버튼: 색상 확인 및 조정
    - 배경: `bg-white` → `bg-background-surface`

#### 🔹 우선순위 4 (기타 컴포넌트 - 45분)
17. **StatsBars.tsx** (15분)
    - 경험치 바: `from-blue-500 to-blue-400` → `from-primary to-primary-dark`
    - 일일통계 배경: `bg-purple-50` → `bg-secondary`

18. **TaskList.tsx** (10분)
    - 타입 배지: `bg-purple-100 text-purple-700` → `bg-secondary text-text`
    - 난이도 배지: `bg-blue-100 text-blue-700` → `bg-primary/20 text-primary-dark`

19. **TabNavigation.tsx** (5분)
    - 활성 탭: `border-purple-600` → `border-primary`

20. **Sidebar.tsx** (10분)
    - 활성 링크: `bg-purple-100 text-purple-700` → `bg-primary/10 text-primary-dark`

21. **Onboarding.tsx** (5분)
    - 버튼: 색상 확인 및 조정

22. **EmptyState.tsx** (5min)
    - 텍스트: `text-gray-400` → `text-muted`

23. **BottomSheetModal.tsx** (5min)
    - 배경: `bg-white` → `bg-background-surface`

### Phase 3: 레이아웃 & 글로벌 스타일 (15분)

24. **layout.tsx (루트)** (5분)
    - 배경: `bg-gray-100` → `bg-background`

25. **[locale]/layout.tsx** (5분)
    - 배경 확인 및 조정

26. **globals.css** (5분)
    - CSS 변수 확인
    - 배경 색상 조정

### Phase 4: 검증 & 테스트 (30분)

#### Step 4.1: 시각적 검증 (20분)
- 모든 페이지 확인 (Dashboard, Character, Goals, Projects, Today, Todos, Settings, Stats)
- 각 상태 확인 (Not Started, In Progress, Completed)
- 호버/포커스 상태 확인

#### Step 4.2: 접근성 검증 (10분)
- 색상 대비 확인 (텍스트/배경)
- 포커스 가시성 확인

---

## 5. 컴포넌트별 마이그레이션 가이드

### 5.1 버튼 컴포넌트

#### Before
```tsx
<button className="bg-blue-500 hover:bg-blue-600">
  Click
</button>
```

#### After
```tsx
<button className="bg-primary hover:bg-primary-dark">
  Click
</button>
```

#### 그래디언트 버튼
```tsx
// Before
<button className="bg-gradient-to-r from-blue-500 to-cyan-500">

// After
<button className="bg-gradient-to-r from-primary to-primary-dark">
```

### 5.2 카드 컴포넌트

#### Before
```tsx
<div className={`
  bg-white rounded-2xl p-5 shadow-md border-2
  ${completed ? 'border-green-300 bg-green-50' : 'border-purple-200'}
`}>
```

#### After
```tsx
<div className={`
  bg-background-surface rounded-2xl p-5 shadow-md border-2
  ${completed ? 'border-accent bg-accent/10' : 'border'}
`}>
```

### 5.3 배지 컴포넌트

#### Before
```tsx
<span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
  Badge
</span>
```

#### After
```tsx
<span className="bg-secondary text-text px-2 py-1 rounded">
  Badge
</span>
```

### 5.4 진행률 바

#### Before
```tsx
<div className="bg-gray-200 rounded-full h-2">
  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full" />
</div>
```

#### After
```tsx
<div className="bg-track rounded-full h-2">
  <div className="bg-gradient-to-r from-primary to-primary-dark h-full rounded-full" />
</div>
```

### 5.5 상태별 색상

#### Before
```tsx
const statusColors = {
  'not-started': 'bg-gray-200 text-gray-800',
  'in-progress': 'bg-blue-500 text-white',
  'completed': 'bg-green-500 text-white',
}
```

#### After
```tsx
const statusColors = {
  'not-started': 'bg-track text-text-muted',
  'in-progress': 'bg-primary text-white',
  'completed': 'bg-accent text-white',
}
```

---

## 6. 검증 체크리스트

### 6.1 시각적 검증

#### ✅ 페이지별 확인
- [ ] Dashboard (/)
- [ ] Character (/character)
- [ ] Goals (/goals)
- [ ] Projects (/projects)
- [ ] Today (/today)
- [ ] Todos (/todos)
- [ ] Settings (/settings)
- [ ] Stats (/stats)

#### ✅ 컴포넌트 상태
- [ ] Not Started 상태 (track 색상)
- [ ] In Progress 상태 (primary 색상)
- [ ] Completed 상태 (accent 핑크)
- [ ] Hover 상태 (primary-dark)
- [ ] Focus 상태 (ring-primary)
- [ ] Disabled 상태 (적절한 불투명도)

#### ✅ 색상 일관성
- [ ] CTA 버튼 (모두 primary)
- [ ] 카드 경계 (모두 border)
- [ ] 완료 표시 (모두 accent)
- [ ] 배지/칩 (secondary)
- [ ] 배경 (cream/surface)

### 6.2 기능 검증

#### ✅ 상호작용
- [ ] 버튼 클릭 가능
- [ ] 폼 입력 가능
- [ ] 네비게이션 동작
- [ ] 모달 열기/닫기
- [ ] 탭 전환

#### ✅ 반응형 디자인
- [ ] 모바일 (375px)
- [ ] 태블릿 (768px)
- [ ] 데스크톱 (1024px+)

### 6.3 접근성 검증

#### ✅ 색상 대비
- [ ] 텍스트/배경 대비 (WCAG AA: 4.5:1)
- [ ] 버튼 텍스트 대비
- [ ] 링크 가시성

#### ✅ 포커스 가시성
- [ ] 키보드 네비게이션
- [ ] 포커스 링 표시
- [ ] 활성 상태 표시

---

## 7. 롤백 계획

### 7.1 Git 브랜치 전략
```bash
# 현재 브랜치 확인
git branch

# 새 브랜치 생성
git checkout -b feature/color-system-migration

# 작업 후 커밋
git add .
git commit -m "feat: Apply Duto Mint Clean color palette"

# 문제 발생 시 롤백
git checkout main
git branch -D feature/color-system-migration
```

### 7.2 단계별 커밋
```bash
# Phase 1: 설정
git commit -m "feat: Add custom color palette to Tailwind config"

# Phase 2: 컴포넌트 (우선순위별로 분리)
git commit -m "feat: Update core UI components with new color system"
git commit -m "feat: Update card components with new color system"
git commit -m "feat: Update form components with new color system"
git commit -m "feat: Update misc components with new color system"

# Phase 3: 레이아웃
git commit -m "feat: Update layouts with new background colors"

# Phase 4: 검증 완료
git commit -m "test: Verify color system migration"
```

### 7.3 긴급 롤백 가이드

#### 문제 발견 시
1. **즉시 중단**: 현재 작업 중단
2. **스크린샷**: 문제 상황 캡처
3. **Git 확인**: `git status` 실행
4. **롤백 실행**:
   ```bash
   # 커밋 안 한 경우
   git restore .

   # 커밋 한 경우
   git reset --hard HEAD~1

   # 여러 커밋 롤백
   git reset --hard <commit-hash>
   ```
5. **문제 분석**: 로그 확인 및 원인 파악
6. **수정 후 재시도**: 문제 해결 후 다시 진행

---

## 8. 예상 소요 시간

| Phase | 작업 | 예상 시간 |
|-------|------|----------|
| Phase 1 | Tailwind 설정 | 30분 |
| Phase 2 | 컴포넌트 마이그레이션 | 3시간 |
| Phase 3 | 레이아웃 & 글로벌 | 15분 |
| Phase 4 | 검증 & 테스트 | 30분 |
| **총계** | | **4시간 15분** |

### 버퍼 시간
- 예상 외 문제 해결: 30분
- 접근성 개선: 15분
- 문서화: 15분
- **총 버퍼**: 1시간

### 최종 예상 시간
**5시간 15분** (1일 작업)

---

## 9. 성공 기준

### ✅ 필수 달성 사항
1. **색상 일관성**: 모든 CTA가 primary 색상 사용
2. **완료 상태**: accent (핑크)로 통일
3. **배경 통일**: cream/surface만 사용
4. **접근성**: WCAG AA 준수

### ✅ 선택 달성 사항
1. **Dark Mode 준비**: 색상 변수화
2. **테마 확장**: 추가 색상 팔레트 준비

---

## 10. 참고 자료

- **색상 정의**: `docs/color.md`
- **시각 자료**: `docs/colors.png`
- **현황 분석**: 이 문서 섹션 1
- **Tailwind Docs**: https://tailwindcss.com/docs/customizing-colors

---

**작성자**: Claude Code
**최종 수정**: 2026-02-15

---

## 📌 다음 단계

1. ✅ **계획 검토**: 이 문서를 검토하고 피드백
2. ⏳ **Phase 1 시작**: Tailwind 설정부터 착수
3. ⏳ **단계별 진행**: 우선순위에 따라 순차 진행
4. ⏳ **검증 완료**: 모든 체크리스트 확인

---

**준비 완료! 승인 후 작업을 시작하겠습니다.** 🚀
