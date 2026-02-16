# Calendar 화면 구현 계획서

## 📅 개요

**목표**: 월별 달력 UI를 통해 습관(Habit)과 할일(Todo)을 날짜별로 시각화하고 완료 처리할 수 있는 캘린더 페이지 구현

**경로**: `/{locale}/calendar`

**디자인 참고**: `docs/calendar.png`

---

## 🎯 핵심 기능

### 1. 월별 달력 표시
- **월 단위 네비게이션**: 이전/다음 달 이동
- **현재 날짜 강조**: 오늘 날짜 시각적 표시
- **요일 헤더**: 일~토 요일 표시
- **날짜 셀**: 각 날짜에 작업 인디케이터 표시

### 2. 작업 필터링 로직

#### Habit (습관)
- **표시 조건**:
  - `startDate ≤ 선택된 날짜 ≤ endDate`
  - **AND** 선택된 날짜의 요일이 `frequency` 배열에 포함
- **예시**:
  - 습관: "운동하기" (2026-02-01 ~ 2026-02-28, 월/수/금)
  - 2026-02-17(월) 선택 시 → 표시 ✅
  - 2026-02-18(화) 선택 시 → 표시 안 함 ❌

#### Todo (할일)
- **표시 조건**: `dueDate === 선택된 날짜`
- **예시**:
  - 할일: "보고서 제출" (마감: 2026-02-20)
  - 2026-02-20 선택 시 → 표시 ✅
  - 다른 날짜 선택 시 → 표시 안 함 ❌

### 3. 날짜 선택 및 작업 관리
- **날짜 클릭**: Bottom Sheet로 해당 날짜의 작업 목록 표시
- **작업 카드**: 각 습관/할일을 카드 형태로 표시
- **체크박스**: 완료 처리 (XP 지급)
- **작업 추가**: 선택된 날짜 기준으로 새 작업 생성

### 4. 시각적 인디케이터
- **작업 개수 뱃지**: 날짜 셀에 해당 날짜의 작업 개수 표시
- **완료 상태**: 모든 작업 완료 시 시각적 표시 (예: 초록색 점)
- **작업 타입**: Habit/Todo 구분 색상 (Primary/Accent)

---

## 🎨 UI/UX 디자인

### 레이아웃 구조

```
┌─────────────────────────────────┐
│ TopAppBar: "달력"               │
├─────────────────────────────────┤
│  ◀  2026년 2월  ▶              │  ← 월 네비게이션
├─────────────────────────────────┤
│ 일  월  화  수  목  금  토      │  ← 요일 헤더
├─────────────────────────────────┤
│                    1    2    3  │
│  4    5    6    7    8    9   10│
│ 11   12   13   14   15   16   17│  ← 날짜 그리드
│ 18   19   20   21   22   23   24│     (작업 인디케이터 포함)
│ 25   26   27   28               │
├─────────────────────────────────┤
│ BottomNavigation                │
└─────────────────────────────────┘

[날짜 클릭 시 Bottom Sheet]
┌─────────────────────────────────┐
│ 2월 17일 (월)              [X]  │
├─────────────────────────────────┤
│ ☐ 운동하기 (습관)              │
│   🔁 매주 월/수/금              │
│   +10 XP                        │
├─────────────────────────────────┤
│ ☐ 보고서 작성 (할일)           │
│   📅 2월 17일 마감              │
│   +10 XP                        │
├─────────────────────────────────┤
│ [+ 새 작업 추가]                │
└─────────────────────────────────┘
```

### 색상 시스템 (Duto Mint Clean)

| 요소 | 색상 | 용도 |
|------|------|------|
| 오늘 날짜 | `primary` (#7DE6C3) | 배경 강조 |
| Habit 인디케이터 | `primary` (#7DE6C3) | 습관 표시 |
| Todo 인디케이터 | `accent` (#F19ED2) | 할일 표시 |
| 완료된 날짜 | `accent` (#F19ED2) | 모든 작업 완료 |
| 선택된 날짜 | `primary-dark` (#4FD4A8) | 호버/선택 상태 |
| 날짜 셀 배경 | `background-surface` (#FFFFFF) | 기본 배경 |
| 테두리 | `border` (#DCEEE7) | 구분선 |
| 텍스트 | `text` (#0F172A) | 날짜 숫자 |
| 다른 달 날짜 | `text-muted` (#64748B) | 이전/다음 달 |

### 반응형 디자인
- **Mobile (< 640px)**: 1주일 7컬럼 그리드
- **Tablet/Desktop (≥ 640px)**: 1주일 7컬럼 그리드 (셀 크기 확대)

---

## 🔧 기술 스택

### 추천 캘린더 라이브러리

#### Option 1: react-calendar (추천) ✅
```bash
npm install react-calendar
```

**장점**:
- ✅ 가볍고 빠름 (번들 크기 작음)
- ✅ 커스터마이징 용이
- ✅ TypeScript 지원
- ✅ 접근성 준수 (ARIA)
- ✅ Tailwind CSS와 호환

**사용법**:
```tsx
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

<Calendar
  onChange={setSelectedDate}
  value={selectedDate}
  tileContent={({ date }) => <TaskIndicator date={date} />}
  tileClassName={({ date }) => getDateClassName(date)}
/>
```

#### Option 2: date-fns (날짜 유틸리티)
```bash
npm install date-fns
```

**용도**: 커스텀 캘린더 구현 시 날짜 계산
- 월 시작/종료일 계산
- 요일 판별
- 날짜 포맷팅

---

## 📦 데이터 모델

### Task 타입 (기존 활용)

```typescript
interface Task {
  id: string;
  type: "habit" | "todo";
  title: string;
  description: string;
  difficulty: Difficulty;
  projectId?: string;

  // Calendar 필터링에 사용
  startDate?: Date;    // Habit: 시작일
  endDate?: Date;      // Habit: 종료일
  dueDate?: Date;      // Todo: 마감일
  frequency?: number[]; // Habit: [0=일, 1=월, ..., 6=토]

  completed: boolean;
  rewardClaimed: boolean;
}
```

### 캘린더 전용 유틸리티 함수

```typescript
// 특정 날짜에 표시될 작업 필터링
function getTasksForDate(date: Date, tasks: Task[]): Task[] {
  const dayOfWeek = date.getDay(); // 0=일, 1=월, ..., 6=토

  return tasks.filter(task => {
    if (task.type === "habit") {
      // 기간 내 + 요일 일치
      const inDateRange = task.startDate <= date && date <= task.endDate;
      const matchesFrequency = task.frequency?.includes(dayOfWeek);
      return inDateRange && matchesFrequency;
    }

    if (task.type === "todo") {
      // 마감일 일치
      return isSameDay(task.dueDate, date);
    }

    return false;
  });
}

// 날짜 셀 스타일 결정
function getDateTileClass(date: Date, tasks: Task[]): string {
  const tasksForDate = getTasksForDate(date, tasks);
  const allCompleted = tasksForDate.length > 0 &&
                       tasksForDate.every(t => t.completed);

  if (isToday(date)) return "bg-primary text-white";
  if (allCompleted) return "bg-accent/20 border-accent";
  if (tasksForDate.length > 0) return "border-primary";
  return "";
}
```

---

## 🚀 구현 계획

### Phase 1: 기본 캘린더 UI (4-6시간)

**Task 1.1: 캘린더 컴포넌트 생성**
- Duration: 2시간
- Files: `src/components/CalendarView.tsx`
- Deliverables:
  - react-calendar 설치 및 설정
  - 월 네비게이션 구현
  - 기본 날짜 그리드 표시
  - Duto Mint Clean 색상 적용

**Task 1.2: 날짜 필터링 로직**
- Duration: 2시간
- Files: `src/lib/calendar-utils.ts`
- Deliverables:
  - `getTasksForDate()` 함수 구현
  - Habit/Todo 필터링 로직
  - 요일 판별 로직
  - 날짜 비교 유틸리티

**Task 1.3: 작업 인디케이터**
- Duration: 2시간
- Files: `src/components/TaskIndicator.tsx`
- Deliverables:
  - 날짜 셀에 작업 개수 뱃지 표시
  - 작업 타입별 색상 구분
  - 완료 상태 시각화

### Phase 2: 날짜별 작업 상세 (3-4시간)

**Task 2.1: DateTaskSheet 컴포넌트**
- Duration: 2시간
- Files: `src/components/DateTaskSheet.tsx`
- Deliverables:
  - Bottom Sheet 형태 구현
  - 선택된 날짜의 작업 목록 표시
  - 작업 카드 UI (제목, 타입, 난이도, XP)

**Task 2.2: 완료 처리 통합**
- Duration: 1시간
- Files: `DateTaskSheet.tsx`, `useTaskStore.ts`
- Deliverables:
  - 체크박스로 완료 토글
  - XP 지급 (기존 로직 활용)
  - 완료 상태 실시간 업데이트

**Task 2.3: 작업 추가 기능**
- Duration: 1시간
- Files: `DateTaskSheet.tsx`
- Deliverables:
  - "새 작업 추가" 버튼
  - QuestDetailSheet 열기 (create 모드)
  - 선택된 날짜를 dueDate/startDate로 자동 설정

### Phase 3: 페이지 통합 및 최적화 (2-3시간)

**Task 3.1: Calendar 페이지 생성**
- Duration: 1시간
- Files: `src/app/[locale]/calendar/page.tsx`
- Deliverables:
  - 페이지 라우트 설정
  - TopAppBar + CalendarView + BottomNavigation 구성
  - 네비게이션에 캘린더 메뉴 추가

**Task 3.2: i18n 추가**
- Duration: 1시간
- Files: `messages/ko.json`, `messages/en.json`
- Deliverables:
  - **⚠️ i18n-generator agent 사용 필수**
  - 캘린더 관련 번역 키 추가
  - 요일, 월, 작업 관련 텍스트

**Task 3.3: 성능 최적화**
- Duration: 1시간
- Deliverables:
  - 날짜 필터링 메모이제이션
  - 불필요한 리렌더링 방지
  - 작업 목록 캐싱

### Phase 4: 고급 기능 (선택사항, 3-4시간)

**Task 4.1: 주간 뷰 추가**
- 월간/주간 토글 기능
- 주간 작업 밀도 시각화

**Task 4.2: 작업 통계**
- 월별 완료율 표시
- 연속 달성 일수 (Streak) 표시

**Task 4.3: 드래그 앤 드롭**
- 작업을 다른 날짜로 이동
- dueDate/startDate 업데이트

---

## 🔗 통합 포인트

### Quest/Task 기능과의 연계

1. **TaskStore 공유**
   - 동일한 `useTaskStore` 사용
   - Calendar는 읽기 전용 뷰로 활용

2. **QuestDetailSheet 재사용**
   - Calendar에서 작업 추가 시 기존 컴포넌트 활용
   - 날짜 자동 설정 기능 추가

3. **보상 시스템**
   - Calendar 완료 처리 시 XP만 지급 (기존 로직)
   - `completeTaskXPOnly()` 함수 활용

4. **프로젝트/목표 필터**
   - (선택) 특정 프로젝트의 작업만 캘린더에 표시
   - 필터 토글 UI 추가

---

## 📝 필요한 번역 키

**⚠️ 반드시 i18n-generator agent 사용**

```json
{
  "calendar": {
    "title": "달력",
    "today": "오늘",
    "addTask": "작업 추가",
    "noTasks": "작업이 없습니다",
    "tasksForDate": "{date}의 작업",
    "weekdays": {
      "sun": "일",
      "mon": "월",
      "tue": "화",
      "wed": "수",
      "thu": "목",
      "fri": "금",
      "sat": "토"
    },
    "months": {
      "jan": "1월",
      "feb": "2월",
      // ... (생략)
    },
    "stats": {
      "completionRate": "완료율",
      "totalTasks": "전체 작업"
    }
  }
}
```

---

## ✅ 수락 기준

### MVP (필수)
- [ ] 월별 달력 표시 (react-calendar)
- [ ] 오늘 날짜 강조
- [ ] 날짜별 작업 필터링 (Habit/Todo 로직)
- [ ] 날짜 클릭 → Bottom Sheet로 작업 목록 표시
- [ ] 작업 완료 체크박스 (XP 지급)
- [ ] 작업 개수 인디케이터 표시
- [ ] Duto Mint Clean 색상 적용
- [ ] i18n 지원 (ko/en)
- [ ] 반응형 디자인

### 권장사항
- [ ] 작업 추가 기능 (선택된 날짜 기준)
- [ ] 완료 상태 시각화 (모든 작업 완료 시)
- [ ] 월 네비게이션 애니메이션
- [ ] 로딩 상태 표시

### 고급 기능 (선택)
- [ ] 주간 뷰 토글
- [ ] 월별 통계 (완료율)
- [ ] 프로젝트 필터
- [ ] 드래그 앤 드롭 일정 변경

---

## 📊 성공 지표

### 기능
- ✅ 습관/할일 정확한 날짜 매칭
- ✅ 완료 처리 실시간 반영
- ✅ 네비게이션 부드러운 전환

### 품질
- ✅ TypeScript strict 준수
- ✅ 접근성 (ARIA, 키보드 네비게이션)
- ✅ 성능 (60fps 스크롤)
- ✅ 번들 크기 최적화

### UX
- ✅ 직관적인 날짜 선택
- ✅ 작업 상태 명확한 시각화
- ✅ 빠른 완료 처리 (<500ms)

---

## 📚 참고 자료

### 라이브러리 문서
- **react-calendar**: https://github.com/wojtekmaj/react-calendar
- **date-fns**: https://date-fns.org/

### 디자인 참고
- 이미지: `docs/calendar.png`
- 색상: `agents/color-system/color-palette.md`
- 번역: `agents/i18n-generator/prompt.md`

---

**Last Updated**: 2026-02-16
**Status**: 계획 단계
**Estimated Effort**: 9-13시간 (MVP), +3-4시간 (고급 기능)
