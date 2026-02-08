# English Language Dictionary

## Principles
1. **Clarity**: Use clear, unambiguous terms
2. **Consistency**: Maintain consistent terminology throughout
3. **Brevity**: Prefer concise expressions
4. **Standard**: Follow industry-standard UI terminology

## Common Actions

| Korean | English | Context |
|--------|---------|---------|
| 저장 | Save | Save action |
| 취소 | Cancel | Cancel action |
| 삭제 | Delete | Delete action |
| 수정/고치기 | Edit | Edit action |
| 만들기 | Create | Create action |
| 돌아가기 | Back | Navigation |
| 다음 | Next | Navigation |
| 건너뛰기 | Skip | Skip action |
| 확인 | Confirm | Confirm action |
| 닫기 | Close | Close action |

## UI Elements

| Korean | English | Context |
|--------|---------|---------|
| 버튼 | Button | UI element |
| 목록 | List | UI element |
| 양식/입력창 | Form | UI element |
| 대화창 | Dialog | UI element |
| 알림 | Notification | UI element |
| 입력칸 | Field | Form element |
| 제목 | Title | Label |
| 설명 | Description | Label |

## Task-Related Terms

| Korean | English | Context |
|--------|---------|---------|
| 작업/할일 | Task | General task |
| 할일 | To-Do | Todo item |
| 습관 | Habit | Habit tracking |
| 목표 | Goal | Goal setting |
| 프로젝트 | Project | Project |
| 진행 | Progress | Progress status |
| 완료 | Completed | Completed status |
| 진행중 | Active | Active status |
| 멈춤/일시중지 | Paused | Paused status |
| 난이도 | Difficulty | Task difficulty |
| 쉬움 | Easy | Difficulty level |
| 보통 | Normal | Difficulty level |
| 어려움 | Hard | Difficulty level |
| 종류/타입 | Type | Task type |

## Character/Game Elements

| Korean | English | Context |
|--------|---------|---------|
| 캐릭터 | Character | Game character |
| 단계/레벨 | Level | Character level |
| 경험치 | Experience | Experience points |
| 코인/동전 | Coins | In-game currency |
| 자람/진화 | Evolution | Character evolution |
| 단계 | Stage | Evolution stage |
| 기록/통계 | Statistics | Stats display |
| 기운/체력 | Health | Health points |
| 보상 | Rewards | Game rewards |
| 알 | Egg | Evolution stage |
| 새싹 | Sproutling | Evolution stage |
| 꽃피는 중 | Blooming | Evolution stage |
| 완전 성장 | Fully Grown | Evolution stage |

## Time Expressions

| Korean | English | Context |
|--------|---------|---------|
| 오늘 | Today | Time period |
| 한 주 | Week | Time period |
| 달/개월 | Month(s) | Time period |
| 해/년 | Year | Time period |
| 기간 | Duration | Time span |

## Status Messages

| Korean | English | Context |
|--------|---------|---------|
| 이룸/성공 | Success | Success message |
| 실패 | Failed | Error message |
| 오류 | Error | Error message |
| 알림/경고 | Warning | Warning message |
| 안내 | Information | Info message |
| 작업이 없습니다 | No tasks yet | Empty state |
| 완료한 작업 | Tasks Completed | Completed count |

## Navigation

| Korean | English | Context |
|--------|---------|---------|
| 오늘 | Today | Nav item |
| 목표 | Goals | Nav item |
| 프로젝트 | Projects | Nav item |
| 할일 | To-Do | Nav item |
| 캐릭터 | Character | Nav item |
| 기록/통계 | Stats | Nav item |

## Onboarding

| Korean | English | Context |
|--------|---------|---------|
| 환영합니다 | Welcome | Greeting |
| 닉네임 | Nickname | User input |
| 시작하기 | Get Started | Action button |
| 설정 | Settings | Settings |
| 언어 설정 | Language Settings | Settings option |

## Writing Style Guidelines

### 1. Action Buttons
- Use verbs for action buttons
- ✅ "Save", "Create", "Delete"
- ❌ "Saving", "Creation", "Deletion"

### 2. Labels
- Use nouns for labels
- ✅ "Title", "Description", "Type"
- ❌ "Enter Title", "Add Description"

### 3. Status Messages
- Use complete sentences or clear phrases
- ✅ "No tasks yet"
- ❌ "No tasks"

### 4. Navigation
- Use simple, clear terms
- ✅ "Today", "Projects"
- ❌ "Today's Tasks", "My Projects"

### 5. Pluralization
- Use plural forms appropriately
- ✅ "Goals", "Projects", "Tasks"
- Context determines singular/plural

## Example Patterns

### Good ✅
```json
{
  "task": {
    "create": "Create Task",
    "edit": "Edit Task",
    "list": "Task List"
  },
  "common": {
    "save": "Save",
    "saveChanges": "Save Changes"
  }
}
```

### Bad ❌
```json
{
  "task": {
    "create": "Creating a Task",
    "edit": "Task Editing",
    "list": "The List of Tasks"
  },
  "common": {
    "save": "Saving",
    "saveChanges": "Save the Changes"
  }
}
```
