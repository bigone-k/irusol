# i18n Generator Agent 사용 가이드

## 빠른 시작

### 1. Agent 사용하기

Claude Code에서 Task tool을 사용하여 agent를 호출합니다:

```typescript
// 새로운 번역 생성
"agents/i18n-generator 폴더의 prompt.md를 참조하여 다음 키에 대한 번역을 생성해주세요:
- key: 'profile.settings'
- context: '사용자 프로필 설정 페이지 제목'
- uiElement: 'page title'"
```

### 2. 일괄 번역 요청

```typescript
"agents/i18n-generator 폴더의 prompt.md를 참조하여 다음 섹션에 대한 번역을 생성해주세요:
section: 'profile'
keys: ['settings', 'edit', 'save', 'avatar', 'name', 'bio']
context: '사용자 프로필 관리 화면'"
```

### 3. 기존 번역 검토

```typescript
"agents/i18n-generator 폴더의 prompt.md를 참조하여 messages/ko.json 파일의 'character' 섹션을 검토하고 개선 제안을 해주세요"
```

## 사용 예시

### 예시 1: 새로운 기능 추가

**상황**: 사용자 프로필 기능 추가

```bash
# Agent 호출
"i18n-generator agent를 사용하여 다음 번역을 생성해주세요:

section: profile
keys:
  - settings: 프로필 설정 페이지 제목
  - edit: 프로필 수정 버튼
  - save: 저장 버튼
  - avatar: 프로필 이미지 라벨
  - name: 이름 입력칸 라벨
  - bio: 자기소개 입력칸 라벨
  - uploadAvatar: 이미지 업로드 버튼
  - deleteAccount: 계정 삭제 버튼"
```

**예상 출력**:
```json
{
  "ko": {
    "profile": {
      "settings": "프로필 설정",
      "edit": "프로필 고치기",
      "save": "저장",
      "avatar": "프로필 사진",
      "name": "이름",
      "bio": "자기소개",
      "uploadAvatar": "사진 올리기",
      "deleteAccount": "계정 지우기"
    }
  },
  "en": {
    "profile": {
      "settings": "Profile Settings",
      "edit": "Edit Profile",
      "save": "Save",
      "avatar": "Profile Picture",
      "name": "Name",
      "bio": "Bio",
      "uploadAvatar": "Upload Picture",
      "deleteAccount": "Delete Account"
    }
  }
}
```

### 예시 2: 기존 번역 개선

**상황**: "태스크" 같은 외래어가 포함된 번역 발견

```bash
# 현재 번역 (개선 필요)
{
  "task": {
    "create": "태스크 생성",
    "list": "태스크 리스트"
  }
}

# Agent 호출
"i18n-generator agent를 사용하여 위 번역을 순수 우리말로 개선해주세요"
```

**예상 출력**:
```json
{
  "improvements": [
    {
      "key": "task.create",
      "current": "태스크 생성",
      "improved": "작업 만들기",
      "reason": "외래어 '태스크' → '작업', 한자어 '생성' → 순수 우리말 '만들기'"
    },
    {
      "key": "task.list",
      "current": "태스크 리스트",
      "improved": "작업 목록",
      "reason": "외래어 '태스크' → '작업', 외래어 '리스트' → '목록'"
    }
  ]
}
```

### 예시 3: 일관성 검사

```bash
# Agent 호출
"i18n-generator agent를 사용하여 messages/ko.json과 messages/en.json의 일관성을 검사해주세요"
```

**예상 출력**:
```json
{
  "inconsistencies": [
    {
      "concept": "create action",
      "variations": {
        "ko": ["만들기", "생성", "추가"],
        "en": ["Create", "Add", "New"]
      },
      "suggestion": {
        "ko": "만들기 (순수 우리말 우선)",
        "en": "Create (새 항목 생성 시)"
      }
    }
  ]
}
```

## 워크플로우 패턴

### 패턴 1: 새 기능 개발

```
1. 기능 개발 완료
2. UI에서 필요한 텍스트 키 식별
3. Agent에 번역 요청
4. messages/ko.json, messages/en.json에 병합
5. UI에서 테스트
```

### 패턴 2: 번역 품질 개선

```
1. 기존 번역 파일 검토
2. Agent에 개선 요청
3. 개선 사항 검토
4. 승인된 개선 사항 적용
5. 전체 UI 테스트
```

### 패턴 3: 일관성 유지

```
1. 정기적으로 일관성 검사 실행 (주간/월간)
2. Agent가 식별한 불일치 검토
3. 표준 용어 결정
4. 사전 업데이트
5. 전체 번역 업데이트
```

## CLI 통합 (선택사항)

프로젝트에 스크립트를 추가하여 더 쉽게 사용할 수 있습니다:

```json
// package.json
{
  "scripts": {
    "i18n:generate": "node scripts/generate-i18n.js",
    "i18n:validate": "node scripts/validate-i18n.js"
  }
}
```

## 사전 업데이트

새로운 용어가 필요한 경우:

1. `korean-dictionary.md` 또는 `english-dictionary.md` 편집
2. 표준 용어 추가
3. Agent를 다시 호출하여 일관성 있는 번역 생성

## 팁과 요령

### 💡 Tip 1: 문맥 명확히 하기
```bash
# 나쁜 예 ❌
"'complete'를 번역해주세요"

# 좋은 예 ✅
"'complete'를 번역해주세요. 컨텍스트: 작업 완료 버튼"
```

### 💡 Tip 2: 일괄 처리
```bash
# 비효율적 ❌
각 키마다 개별 요청

# 효율적 ✅
관련된 키들을 한 번에 요청
```

### 💡 Tip 3: 사전 먼저 확인
```bash
# 번역 요청 전에
1. korean-dictionary.md 확인
2. english-dictionary.md 확인
3. 표준 용어 있으면 사용
4. 없으면 agent에게 요청하고 사전에 추가
```

## 문제 해결

### Q: Agent가 순수 우리말을 사용하지 않아요
**A**: `korean-dictionary.md`를 명시적으로 참조하도록 요청하세요:
```
"korean-dictionary.md를 참조하여 순수 우리말로 번역해주세요"
```

### Q: 번역이 부자연스러워요
**A**: 문맥과 UI 요소 타입을 더 자세히 설명하세요:
```
"버튼에 표시될 짧은 동작어로 번역해주세요"
```

### Q: 일관성 없는 번역이 생겨요
**A**: 정기적으로 일관성 검사를 실행하세요:
```
"전체 번역 파일의 일관성을 검사하고 표준화 제안을 해주세요"
```

## 다음 단계

1. ✅ Agent 구조 이해
2. ✅ 사전 파일 검토
3. ✅ 첫 번역 생성 시도
4. 📋 프로젝트에 통합
5. 🔄 정기적인 품질 검사

## 참고 자료

- [README.md](./README.md) - Agent 개요
- [prompt.md](./prompt.md) - Agent 프롬프트
- [korean-dictionary.md](./korean-dictionary.md) - 한국어 사전
- [english-dictionary.md](./english-dictionary.md) - 영어 사전
