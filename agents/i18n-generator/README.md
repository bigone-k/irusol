# 언어팩 생성 Agent

## 목적
프로젝트의 다국어 지원을 위한 언어팩(i18n) 자동 생성 agent입니다.

## 언어별 규칙

### 한국어 (ko)
- **순수 우리말 원칙**: 외래어나 한자어 대신 순수 우리말을 우선 사용
- **사전 참조**: 순수 우리말이 없는 경우 `korean-dictionary.md`의 표준 용어 사용
- **자연스러운 표현**: 문법적으로 자연스러운 한국어 표현 사용

### 영어 (en)
- **사전 기반**: `english-dictionary.md`에 명시된 표준 용어 사용
- **간결한 표현**: 명확하고 간결한 영어 표현 사용
- **일관성**: 동일한 개념에 대해 일관된 용어 사용

## 사용 방법

### Agent 호출
```bash
# Claude Code에서
/task "언어팩 생성" --agent i18n-generator
```

### 입력 형식
```json
{
  "keys": ["common.save", "task.create"],
  "context": "작업 생성 화면의 저장 버튼"
}
```

### 출력 형식
```json
{
  "ko": {
    "common": {
      "save": "저장"
    },
    "task": {
      "create": "작업 만들기"
    }
  },
  "en": {
    "common": {
      "save": "Save"
    },
    "task": {
      "create": "Create Task"
    }
  }
}
```

## 파일 구조
```
agents/i18n-generator/
├── README.md                 # 이 파일
├── korean-dictionary.md      # 한국어 순수 우리말 사전
├── english-dictionary.md     # 영어 표준 용어 사전
└── prompt.md                 # Agent 프롬프트
```

## 품질 기준
- ✅ 순수 우리말 사용 (한국어)
- ✅ 사전 용어 준수
- ✅ 문맥에 맞는 자연스러운 표현
- ✅ 일관된 용어 사용
- ✅ 간결하고 명확한 표현
