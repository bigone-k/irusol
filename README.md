# Irusol - Gamified Habit Tracker 🎮✨

RPG 요소가 있는 습관 관리 앱입니다. 습관을 완료하면 경험치를 얻고, 레벨업하며 성장하세요!

**Enjoy game and manage habit!**

## ✨ 주요 기능

### 🎯 습관 관리
- **Habits** - 자유롭게 여러 번 체크 가능한 습관
- **Dailies** - 매일 반복되는 일일 작업
- **To Do's** - 한 번 완료하면 되는 할일

### 🎮 RPG 게이미피케이션
- **레벨 시스템** - 작업을 완료하면 경험치 획득
- **체력/마나 바** - RPG 스타일의 스탯 관리
- **보상** - 젬과 골드 획득
- **목표 시스템** - 초보자 목표 완료
- **픽셀아트 캐릭터** - 귀여운 아바타

### 💾 데이터 관리
- **로컬 저장** - 브라우저에 데이터 자동 저장
- **상태 관리** - Zustand를 통한 효율적인 상태 관리

## 🚀 시작하기

### 의존성 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 앱을 사용하세요.

### 프로덕션 빌드

```bash
npm run build
npm start
```

## 📦 기술 스택

- **Next.js 15** - React 프레임워크
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 스타일링
- **Framer Motion** - 부드러운 애니메이션
- **Zustand** - 경량 상태 관리
- **React Icons** - 아이콘 라이브러리

## 🌐 Vercel 배포

### 방법 1: Vercel CLI 사용

```bash
# Vercel CLI 설치
npm install -g vercel

# 프로젝트 배포
vercel
```

### 방법 2: GitHub 연동

1. GitHub 저장소에 푸시
2. [Vercel](https://vercel.com) 접속
3. "Import Project" 클릭
4. GitHub 저장소 선택
5. 자동 배포 완료!

## 📁 프로젝트 구조

```
irusol/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # 루트 레이아웃
│   │   ├── page.tsx            # 메인 페이지
│   │   └── globals.css         # 전역 스타일
│   ├── components/             # React 컴포넌트
│   │   ├── CharacterCard.tsx   # 캐릭터 카드
│   │   ├── StatsBars.tsx       # 스탯 바 (Health, Exp, Mana)
│   │   ├── ObjectiveCard.tsx   # 목표 카드
│   │   ├── TabNavigation.tsx   # 하단 탭 네비게이션
│   │   ├── TaskList.tsx        # 작업 리스트
│   │   └── AddTaskButton.tsx   # 작업 추가 버튼
│   ├── store/                  # Zustand 스토어
│   │   ├── usePlayerStore.ts   # 플레이어 상태
│   │   └── useTaskStore.ts     # 작업 상태
│   └── types/                  # TypeScript 타입
│       └── index.ts
├── ref/                        # 참고 이미지
└── public/                     # 정적 파일
```

## 🎮 사용 방법

### 1. 습관/작업 추가
- 오른쪽 하단의 **+** 버튼 클릭
- 제목과 설명 입력
- "Add Task" 버튼 클릭

### 2. 작업 완료
- 작업 왼쪽의 체크박스 클릭
- 경험치 +10, 골드 +1 획득
- 레벨업 시 체력 +5, 최대 경험치 증가

### 3. 레벨 시스템
- **레벨 1**: 시작 레벨
- **레벨 10**: 마나 시스템 해금
- 레벨업마다 캐릭터가 강해짐!

### 4. 탭 전환
- 하단 네비게이션으로 탭 이동
- Habits, Dailies, To Do's, Rewards, Social

## 🎨 커스터마이징

### 플레이어 초기 스탯 변경
`src/store/usePlayerStore.ts`의 `initialStats`:
```typescript
const initialStats: PlayerStats = {
  level: 1,
  health: 50,
  maxHealth: 50,
  experience: 12,
  maxExperience: 25,
  // ...
};
```

### 경험치 보상 조정
`src/components/TaskList.tsx`의 `handleToggle`:
```typescript
addExperience(10); // 작업 완료 시 획득 경험치
addGold(1);        // 작업 완료 시 획득 골드
```

### 색상 테마 변경
`src/app/globals.css`와 Tailwind 클래스 수정

## 📝 다음 단계

- [ ] 픽셀아트 캐릭터 이미지 추가
- [ ] 일일/주간 리셋 기능
- [ ] 보상 상점 구현
- [ ] 업적 시스템
- [ ] 친구 기능 (Social)
- [ ] 다크 모드
- [ ] 모바일 최적화
- [ ] 데이터 내보내기/가져오기
- [ ] 통계 페이지

## 🐛 알려진 이슈

- 현재 로컬 스토리지만 지원 (서버 동기화 미지원)
- Mana 기능은 레벨 10부터 활성화되지만 아직 사용처 없음
- Social 탭 미구현

## 📄 라이선스

MIT

---

**Inspired by Habitica** - 습관을 게임처럼 즐겁게! 🎉
