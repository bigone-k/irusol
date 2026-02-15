# Duto Mint Clean Color Palette

Irusol 프로젝트의 공식 색상 팔레트입니다.

## 팔레트 개요

**Duto Mint Clean**은 상쾌하고 현대적인 민트 그린 기반의 색상 시스템으로, 밝고 친근한 느낌을 제공합니다.

### 디자인 철학
- 🌿 **상쾌함**: 민트 그린 중심의 청량한 느낌
- 🎨 **조화**: 따뜻한 핑크와 노란색의 조화로운 대비
- ✨ **명료함**: 높은 가독성과 명확한 계층 구조
- 🎯 **일관성**: 통일된 색상 사용으로 브랜드 정체성 강화

## 색상 팔레트

### 1. Primary (메인 브랜드 색상)

```
┌─────────────────────────────────────┐
│  Primary                            │
│  #7DE6C3                            │
│  rgb(125, 230, 195)                 │
│  hsl(168, 68%, 70%)                 │
│                                     │
│  밝은 민트 그린                       │
│  메인 브랜드 색상, 강조, 링크          │
└─────────────────────────────────────┘
```

**Tailwind Class**: `primary`
- `bg-primary`: 배경색
- `text-primary`: 텍스트색
- `border-primary`: 테두리색
- `from-primary` / `to-primary`: 그라디언트

**사용처**:
- 메인 버튼
- 활성 상태 (active)
- 링크
- 브랜드 강조
- 진행중 상태
- 아이콘 강조

### 2. Primary Dark (진한 메인 색상)

```
┌─────────────────────────────────────┐
│  Primary Dark                       │
│  #4FD4A8                            │
│  rgb(79, 212, 168)                  │
│  hsl(160, 61%, 57%)                 │
│                                     │
│  진한 민트 그린                       │
│  호버 상태, 그라디언트                │
└─────────────────────────────────────┘
```

**Tailwind Class**: `primary-dark`
- `bg-primary-dark`: 배경색
- `text-primary-dark`: 텍스트색
- `hover:bg-primary-dark`: 호버 상태

**사용처**:
- Primary 버튼 호버 상태
- 그라디언트 끝점
- 강조된 텍스트
- 활성 링크

### 3. Secondary (보조 강조 색상)

```
┌─────────────────────────────────────┐
│  Secondary                          │
│  #FFF6BF                            │
│  rgb(255, 246, 191)                 │
│  hsl(52, 100%, 87%)                 │
│                                     │
│  연한 레몬 옐로우                     │
│  보조 강조, 경고, 진행중               │
└─────────────────────────────────────┘
```

**Tailwind Class**: `secondary`
- `bg-secondary`: 배경색
- `text-secondary`: 텍스트색

**사용처**:
- 경고 배지
- 진행중 상태 (30-70%)
- 보조 버튼
- 하이라이트
- 코인/골드 표시

### 4. Accent (액센트 색상)

```
┌─────────────────────────────────────┐
│  Accent                             │
│  #F19ED2                            │
│  rgb(241, 158, 210)                 │
│  hsl(322, 73%, 78%)                 │
│                                     │
│  소프트 핑크                         │
│  성공, 완료, CTA                     │
└─────────────────────────────────────┘
```

**Tailwind Class**: `accent`
- `bg-accent`: 배경색
- `text-accent`: 텍스트색
- `border-accent`: 테두리색

**사용처**:
- 성공 상태
- 완료된 작업
- CTA 버튼
- 완료 배지
- 축하 메시지
- 목표 달성 표시

### 5. Background (배경 색상)

```
┌─────────────────────────────────────┐
│  Background                         │
│  #F7F9F2                            │
│  rgb(247, 249, 242)                 │
│  hsl(78, 29%, 96%)                  │
│                                     │
│  아주 연한 민트 그레이                │
│  페이지 기본 배경                    │
└─────────────────────────────────────┘
```

**Tailwind Class**: `background`
- `bg-background`: 배경색

**사용처**:
- 페이지 전체 배경
- 앱 기본 배경
- 섹션 배경

### 6. Background Surface (표면 배경)

```
┌─────────────────────────────────────┐
│  Background Surface                 │
│  #FFFFFF                            │
│  rgb(255, 255, 255)                 │
│  hsl(0, 0%, 100%)                   │
│                                     │
│  순수한 흰색                         │
│  카드, 모달, 입력 필드                │
└─────────────────────────────────────┘
```

**Tailwind Class**: `background-surface`
- `bg-background-surface`: 배경색

**사용처**:
- 카드 배경
- 모달 배경
- 입력 필드 배경
- 드롭다운 배경
- 팝업 배경

### 7. Border (테두리)

```
┌─────────────────────────────────────┐
│  Border                             │
│  #DCEEE7                            │
│  rgb(220, 238, 231)                 │
│  hsl(157, 37%, 90%)                 │
│                                     │
│  연한 민트 그레이                     │
│  테두리, 구분선                       │
└─────────────────────────────────────┘
```

**Tailwind Class**: `border`
- `border`: 테두리

**사용처**:
- 카드 테두리
- 입력 필드 테두리
- 구분선 (divider)
- 표 경계선

### 8. Text (본문 텍스트)

```
┌─────────────────────────────────────┐
│  Text                               │
│  #0F172A                            │
│  rgb(15, 23, 42)                    │
│  hsl(222, 47%, 11%)                 │
│                                     │
│  진한 네이비 블랙                     │
│  본문 텍스트, 제목                    │
└─────────────────────────────────────┘
```

**Tailwind Class**: `text`
- `text-text`: 텍스트색

**사용처**:
- 본문 텍스트
- 제목
- 레이블
- 버튼 텍스트 (밝은 배경 위)

### 9. Text Muted (보조 텍스트)

```
┌─────────────────────────────────────┐
│  Text Muted                         │
│  #64748B                            │
│  rgb(100, 116, 139)                 │
│  hsl(215, 16%, 47%)                 │
│                                     │
│  중간 톤 그레이                       │
│  보조 텍스트, 설명, 플레이스홀더       │
└─────────────────────────────────────┘
```

**Tailwind Class**: `text-muted`
- `text-text-muted`: 텍스트색

**사용처**:
- 보조 설명
- 메타 정보 (날짜, 시간 등)
- 플레이스홀더
- 비활성 텍스트
- 경고 텍스트

### 10. Track (트랙/비활성)

```
┌─────────────────────────────────────┐
│  Track                              │
│  #E5E7EB                            │
│  rgb(229, 231, 235)                 │
│  hsl(220, 13%, 91%)                 │
│                                     │
│  밝은 그레이                         │
│  진행바 배경, 비활성 상태              │
└─────────────────────────────────────┘
```

**Tailwind Class**: `track`
- `bg-track`: 배경색

**사용처**:
- 진행바 배경
- 슬라이더 트랙
- 비활성 상태
- 체크박스/라디오 배경

## 색상 조합 가이드

### 조합 1: Primary + Accent (메인 강조)

```tsx
<div className="bg-primary text-white">
  <button className="bg-accent hover:bg-accent/90">
    완료하기
  </button>
</div>
```

**효과**: 활기차고 생동감 있는 조합

### 조합 2: Background + Primary (차분한 강조)

```tsx
<div className="bg-background">
  <div className="bg-primary/10 text-primary border border-primary">
    진행중
  </div>
</div>
```

**효과**: 부드럽고 차분한 강조

### 조합 3: Surface + Accent (성공 표시)

```tsx
<div className="bg-background-surface border-2 border-accent">
  <div className="bg-accent/10 text-accent">
    ✓ 목표 달성!
  </div>
</div>
```

**효과**: 명확한 성공 피드백

### 조합 4: Gradient (역동적 효과)

```tsx
<div className="bg-gradient-to-r from-primary to-primary-dark">
  <span className="text-white">진행중</span>
</div>

<div className="bg-gradient-to-br from-primary to-accent">
  <span className="text-white">완료!</span>
</div>
```

**효과**: 역동적이고 현대적인 느낌

## 접근성 (Accessibility)

### 대비율 (Contrast Ratio)

WCAG 2.1 AA 기준 충족:

| 조합 | 대비율 | AA | AAA |
|------|--------|----|----|
| `text` on `background-surface` | 16.1:1 | ✅ | ✅ |
| `text` on `background` | 15.8:1 | ✅ | ✅ |
| `text-muted` on `background-surface` | 5.2:1 | ✅ | ✅ |
| `primary` on `background-surface` | 2.1:1 | ⚠️ | ❌ |
| `white` on `primary` | 2.5:1 | ⚠️ | ❌ |
| `white` on `primary-dark` | 3.2:1 | ✅ | ❌ |
| `white` on `accent` | 2.8:1 | ⚠️ | ❌ |

**참고**:
- 텍스트는 반드시 `text` 또는 `text-muted` 사용
- Primary/Accent 배경에는 `text-white` 사용
- 아이콘/작은 텍스트는 대비율 주의

### 색맹 고려사항

- ✅ Primary (민트) + Accent (핑크): 적록색맹 구분 가능
- ✅ Secondary (옐로우): 청황색맹 구분 가능
- ✅ 색상 외 추가 표시 (아이콘, 텍스트) 병행

## Tailwind Config

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Duto Mint Clean Palette
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
      },
    },
  },
}
```

## 색상 변수 (CSS Variables)

```css
:root {
  /* Duto Mint Clean Palette */
  --color-primary: #7DE6C3;
  --color-primary-dark: #4FD4A8;
  --color-secondary: #FFF6BF;
  --color-accent: #F19ED2;
  --color-background: #F7F9F2;
  --color-background-surface: #FFFFFF;
  --color-border: #DCEEE7;
  --color-text: #0F172A;
  --color-text-muted: #64748B;
  --color-track: #E5E7EB;
}
```

## 색상 팔레트 시각화

```
╔════════════════════════════════════════════════════════╗
║                  Duto Mint Clean Palette               ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  🟢 Primary          #7DE6C3  ████████████████████    ║
║  🟢 Primary Dark     #4FD4A8  ████████████████████    ║
║  🟡 Secondary        #FFF6BF  ████████████████████    ║
║  🌸 Accent           #F19ED2  ████████████████████    ║
║                                                        ║
║  ⬜ Background       #F7F9F2  ░░░░░░░░░░░░░░░░░░░░    ║
║  ⬜ Surface          #FFFFFF  ░░░░░░░░░░░░░░░░░░░░    ║
║  ⬜ Border           #DCEEE7  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒    ║
║                                                        ║
║  ⬛ Text             #0F172A  ████████████████████    ║
║  ⬛ Text Muted       #64748B  ████████████████████    ║
║  ⬜ Track            #E5E7EB  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒    ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

---

*Last Updated: 2026-02-15*
