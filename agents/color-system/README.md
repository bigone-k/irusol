# Color System Agent

Irusol 프로젝트의 **Duto Mint Clean 색상 시스템**을 관리하는 전문 agent입니다.

## 목적

모든 UI 개발 시 일관된 색상 팔레트를 사용하여 브랜드 정체성을 유지하고 사용자 경험을 향상시킵니다.

## 주요 기능

- ✅ Duto Mint Clean 색상 팔레트 가이드
- ✅ Tailwind CSS 색상 클래스 매핑
- ✅ 의미적 색상 사용 가이드 (상태별 색상)
- ✅ 레거시 색상 감지 및 마이그레이션
- ✅ 색상 접근성 검증

## Agent 파일 구조

```
agents/color-system/
├── README.md              # Agent 개요 (현재 파일)
├── prompt.md              # Agent 프롬프트 (필수 참조)
├── color-palette.md       # Duto Mint Clean 팔레트 정의
├── usage-guide.md         # 사용 가이드 및 예시
└── migration-checklist.md # 색상 마이그레이션 체크리스트
```

## 사용 시점

### ✅ 항상 사용해야 하는 경우

- 새로운 UI 컴포넌트 개발 시
- 페이지 레이아웃 작업 시
- 기존 컴포넌트 수정 시
- 색상 관련 스타일 추가 시
- 상태 표시 UI (성공/실패/경고 등) 구현 시

### ⚠️ 주의사항

- **절대 레거시 색상 사용 금지**
  - `purple-*`, `blue-*`, `green-*`, `yellow-*`, `orange-*`, `pink-*`, `cyan-*` 사용 금지
  - gray-* 대신 `text-*`, `border`, `track` 사용

- **Duto Mint Clean 팔레트만 사용**
  - `primary`, `secondary`, `accent`, `background`, `border`, `text`, `track`

## 빠른 참조

### 기본 색상
- **Primary**: `bg-primary` / `text-primary` - 메인 브랜드 색상 (#7DE6C3)
- **Secondary**: `bg-secondary` - 강조 색상 (#FFF6BF)
- **Accent**: `bg-accent` - 성공/완료 색상 (#F19ED2)

### 중립 색상
- **Background**: `bg-background` / `bg-background-surface`
- **Border**: `border` / `border-accent`
- **Text**: `text-text` / `text-text-muted`
- **Track**: `bg-track` - 진행바 배경 등

### 상태별 색상
- ✅ 성공/완료: `bg-accent`, `text-accent`
- 🔄 진행중: `bg-primary`, `text-primary`
- ⚠️ 경고/대기: `bg-secondary`, `text-text-muted`
- ℹ️ 정보: `bg-primary/10`, `text-primary`

## 자세한 내용

모든 UI 개발 전 **반드시** `prompt.md`를 참조하세요.

```bash
# Agent 호출 예시
"agents/color-system의 prompt.md를 참조하여 버튼 컴포넌트를 만들어주세요"
```

## 관련 문서

- `color-palette.md` - 전체 색상 팔레트 정의
- `usage-guide.md` - 실전 사용 예시
- `migration-checklist.md` - 색상 마이그레이션 가이드

---

*Last Updated: 2026-02-15*
