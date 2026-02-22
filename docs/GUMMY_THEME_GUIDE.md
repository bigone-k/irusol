# 🎨 Playful Gummy + Neo-Mint Theme Guide

**Irusol** 프로젝트에 적용된 **Playful Gummy + Neo-Mint Hybrid** 테마 가이드입니다.

## 📋 목차

1. [테마 개요](#테마-개요)
2. [적용된 컴포넌트](#적용된-컴포넌트)
3. [디자인 시스템](#디자인-시스템)
4. [사용 가능한 클래스](#사용-가능한-클래스)
5. [애니메이션 가이드](#애니메이션-가이드)
6. [향후 확장 계획](#향후-확장-계획)

---

## 테마 개요

### 🌟 핵심 컨셉

**Playful Gummy + Neo-Mint Hybrid**는 2026년 트렌드를 반영한 테마로, 다음과 같은 특징을 가지고 있습니다:

- **Neo-Mint**: 2026년 핵심 컬러 트렌드 (#7DE6C3)
- **Playful Gummy**: 젤리처럼 부드럽고 통통 튀는 3D UI
- **Soft Shadows**: 블록이 아닌 부드러운 그림자 효과
- **Glossy Effect**: 윤기나는 표면 느낌
- **Micro-Delight**: 상호작용 시 즐거운 애니메이션

### ✅ 2026 트렌드 적용

이 테마는 다음 3가지 주요 2026 트렌드를 통합합니다:

1. **Neo-Mint (핵심 색상)**: 올해의 컬러 트렌드
2. **Playful Gummy**: 젤리/풍선 같은 UI 요소
3. **Micro-Delight 애니메이션**: 부드럽고 즐거운 상호작용

---

## 적용된 컴포넌트

### ✅ 업데이트 완료

#### 1. **StatsBars.tsx**
- Gummy 진행바 (HP/XP)
- 부드러운 bounce 애니메이션
- 통계 카드에 backdrop blur 효과

#### 2. **CharacterCard.tsx**
- 3D 깊이감 있는 아바타 박스
- Glossy 효과 (윤기나는 표면)
- Float 애니메이션 (부드럽게 떠있는 느낌)
- Gummy 배지 (Stage, Coins)

#### 3. **PlayerDashboard.tsx**
- CharacterCard + StatsBars 통합 스타일
- 일관된 Gummy 테마 적용

#### 4. **FloatingAddButton.tsx**
- 3D Gummy 버튼
- Pulse glow 애니메이션
- 호버 시 회전 + 확대 효과

#### 5. **GoalCard.tsx**
- Gummy 카드 스타일
- 진행바에 3D 효과
- +/- 버튼에 Glossy 효과

---

## 디자인 시스템

### 🎨 컬러 팔레트 (Duto Mint Clean 유지)

```typescript
// Primary (Neo-Mint)
primary: '#7DE6C3'        // 메인 민트
primary-dark: '#4FD4A8'   // 다크 민트
primary-light: '#A8F0D9'  // 라이트 민트 (새로 추가)

// Secondary (경고/진행중)
secondary: '#FFF6BF'      // 밝은 노랑
secondary-dark: '#FFE88A' // 다크 노랑 (새로 추가)

// Accent (성공/완료)
accent: '#F19ED2'         // 핑크
accent-dark: '#E77FBF'    // 다크 핑크 (새로 추가)

// Neutral
background: '#F7F9F2'
background-surface: '#FFFFFF'
border: '#DCEEE7'
text: '#0F172A'
text-muted: '#64748B'
track: '#E5E7EB'
```

### 📦 Gummy Shadows

```css
/* 기본 Gummy 그림자 */
shadow-gummy: 부드러운 민트 그림자
shadow-gummy-lg: 큰 민트 그림자
shadow-gummy-accent: 핑크 그림자
shadow-gummy-secondary: 노랑 그림자
shadow-gummy-float: 떠있는 효과 그림자
```

### 🎭 애니메이션

```css
/* Keyframe Animations */
animate-bounce-soft: 부드러운 바운스 (2초)
animate-pop-in: 팝업 등장 효과 (0.4초)
animate-jelly: 젤리 흔들림 (0.6초)
animate-pulse-glow: 맥박처럼 빛나기 (2초)
```

---

## 사용 가능한 클래스

### 🧩 Component Classes

#### 1. **Gummy Card**
```tsx
<div className="gummy-card">
  {/* 기본 3D 카드 스타일 */}
</div>
```
- 자동 그림자 효과
- 호버 시 살짝 떠오름
- 부드러운 rounded-2xl

#### 2. **Gummy Progress Bar**
```tsx
<div className="gummy-progress-track">
  <div className="gummy-progress-bar text-primary" style={{ width: '70%' }}>
  </div>
</div>
```
- 유리 같은 트랙 배경
- 윤기나는 진행바
- 내부/외부 그림자로 3D 효과

#### 3. **Gummy Button**
```tsx
<button className="gummy-button bg-primary text-white">
  클릭
</button>
```
- 통통 튀는 버튼
- 호버 시 위로 이동
- 클릭 시 눌림 효과

#### 4. **Gummy Badge**
```tsx
<span className="gummy-badge bg-accent/20">
  배지
</span>
```
- 부드러운 배경 blur
- 그림자 효과
- 호버 시 확대

### 🌟 Effect Classes

#### 1. **Glossy (윤기)**
```tsx
<div className="glossy">
  {/* 윤기나는 표면 효과 */}
</div>
```
- 상단 50%에 흰색 그라데이션 오버레이
- 젤리 같은 느낌

#### 2. **Float Gentle (부드러운 떠있음)**
```tsx
<div className="float-gentle">
  {/* 3초마다 부드럽게 위아래 움직임 */}
</div>
```

#### 3. **Jelly Bounce (젤리 흔들림)**
```tsx
<div className="jelly-bounce">
  {/* 호버 시 젤리처럼 흔들림 */}
</div>
```

---

## 애니메이션 가이드

### 🎬 Framer Motion 패턴

#### 1. **카드 등장 애니메이션**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {/* 카드 컨텐츠 */}
</motion.div>
```

#### 2. **호버 효과 (통통 튀기)**
```tsx
<motion.div
  whileHover={{ scale: 1.05, y: -2 }}
  whileTap={{ scale: 0.98 }}
>
  {/* 인터랙티브 요소 */}
</motion.div>
```

#### 3. **진행바 애니메이션 (Bounce Easing)**
```tsx
<motion.div
  initial={{ width: 0 }}
  animate={{ width: `${percent}%` }}
  transition={{
    duration: 0.8,
    ease: [0.68, -0.55, 0.265, 1.55] // Bounce easing
  }}
/>
```

#### 4. **버튼 회전 + 확대**
```tsx
<motion.button
  whileHover={{
    scale: 1.15,
    y: -4,
    rotate: 90
  }}
  whileTap={{ scale: 0.9 }}
>
  <FiPlus />
</motion.button>
```

---

## 향후 확장 계획

### 🚀 Phase 1 (완료)
- ✅ Tailwind 설정 업데이트
- ✅ globals.css Gummy 클래스 추가
- ✅ 주요 컴포넌트 5개 업데이트

### 🎯 Phase 2 (추천)
다음 컴포넌트들에 Gummy 테마 적용:

1. **ProjectCard.tsx**: 프로젝트 카드 Gummy 스타일
2. **ObjectiveCard.tsx**: 퀘스트 카드 3D 효과
3. **VisionCard.tsx**: 비전 카드 Glossy 효과
4. **TaskList.tsx**: 태스크 아이템 Gummy 배지
5. **BottomNavigation.tsx**: 네비게이션 아이콘 Gummy 버튼
6. **TopAppBar.tsx**: 앱바 Glassmorphism 효과
7. **FormInput.tsx/FormTextarea.tsx**: 입력 필드 Gummy 스타일
8. **BottomSheetModal.tsx**: 모달 Gummy 카드

### 🎨 Phase 3 (고급 기능)
1. **다크모드 Gummy**: 어두운 배경에서의 Gummy 효과
2. **파티클 효과**: 레벨업 시 반짝이는 파티클
3. **리퀴드 효과**: HP/XP 바에 물결 애니메이션
4. **3D 캐릭터**: Three.js로 3D 캐릭터 렌더링

---

## 💡 사용 팁

### DO ✅

1. **일관성 유지**: 모든 카드에 `gummy-card` 사용
2. **적절한 애니메이션**: 중요한 상호작용에만 애니메이션 적용
3. **컬러 팔레트 준수**: 정의된 색상만 사용
4. **접근성 고려**: 애니메이션이 너무 강하지 않게

### DON'T ❌

1. **과도한 애니메이션**: 모든 요소에 애니메이션 남발 금지
2. **레거시 색상 사용**: purple-*, blue-* 등 사용 금지
3. **하드코딩된 색상**: 항상 Tailwind 변수 사용
4. **플랫 디자인**: Gummy 테마는 3D 깊이감이 중요

---

## 🔧 트러블슈팅

### 1. 그림자가 보이지 않음
→ `tailwind.config.ts`의 `boxShadow` 설정 확인

### 2. 애니메이션이 작동하지 않음
→ `framer-motion` 패키지 설치 확인: `npm install framer-motion`

### 3. Glossy 효과가 보이지 않음
→ 부모 요소에 `position: relative` 확인 (`.glossy`는 `::before` 사용)

### 4. 진행바가 깨짐
→ `.gummy-progress-track`는 `overflow-hidden` 필요

---

## 📚 참고 자료

### 2026 Design Trends
- [Figma - Top Web Design Trends for 2026](https://www.figma.com/resource-library/web-design-trends/)
- [Updivision - UI Color Trends to Watch in 2026](https://updivision.com/blog/post/ui-color-trends-to-watch-in-2026)
- [Medium - 2026 UX/UI Design Trends](https://medium.com/@tanmayvatsa1507/2026-ux-ui-design-trends-that-will-be-everywhere-0cb83b572319)

### Neobrutalism & Playful Design
- [NN/G - Neobrutalism Definition](https://www.nngroup.com/articles/neobrutalism/)
- [Bejamas - Neubrutalism Web Design Trend](https://bejamas.com/blog/neubrutalism-web-design-trend)

---

**Last Updated**: 2026-02-21
**Theme Version**: 1.0.0
**Author**: Claude Code + Irusol Team
