# Irusol - 시스템 구성도

## System Architecture Diagram

```mermaid
---
config:
  layout: dagre
  theme: neutral
  look: handDrawn
---
flowchart LR
    USER["👤 사용자"]
    IOS["📱 iOS App"]
    AND["🤖 Android App"]
    subgraph VERCEL["Vercel"]
        direction TB
        CDN["Vercel Edge<br/>CDN + SSL"]
        subgraph NEXT["Next.js 15"]
            direction TB
            MW["Middleware<br/>(Auth Guard ·<br/>i18n Routing)"]
            APP["App Router<br/>(SSR + CSR)"]
            CB["/auth/callback<br/>(OAuth Route)"]
        end
    end
    subgraph BROWSER["Browser Runtime"]
        direction TB
        SPA["React 19 SPA<br/>(Client Components)"]
        ZUSTAND[("Zustand<br/>State")]
        LS[("localStorage<br/>(persist)")]
        SYNC["sync.ts<br/>(DB 동기화)"]
    end
    subgraph SUPABASE["Supabase Cloud"]
        direction TB
        AUTH["Auth Service<br/>(JWT · Session)"]
        PG[("PostgreSQL<br/>(RLS 적용)")]
        STORAGE["Storage<br/>(예정)"]
    end
    GOOGLE["Google<br/>Identity Platform"]
    subgraph FUTURE["추후 확장 (예정)"]
        direction TB
        API_SERVER["API Server<br/>(REST / GraphQL)"]
        PUSH["Push Service<br/>(FCM · APNs)"]
    end
    USER -->|"HTTPS"| CDN
    CDN --> MW
    MW -->|"세션 확인"| AUTH
    MW --> APP
    MW --> CB
    CB -->|"code 교환"| AUTH
    APP --> BROWSER

    SPA <--> ZUSTAND
    ZUSTAND <-->|"auto-persist"| LS
    SPA --> SYNC
    SYNC <-->|"supabase-js<br/>(REST API)"| PG
    SPA -->|"auth 상태"| AUTH

    AUTH <-->|"OAuth 2.0<br/>PKCE"| GOOGLE
    IOS -.->|"HTTPS<br/>(예정)"| CDN
    AND -.->|"HTTPS<br/>(예정)"| CDN
    IOS -.-> API_SERVER
    AND -.-> API_SERVER
    API_SERVER -.-> PG
    PUSH -.->|"알림"| IOS
    PUSH -.->|"알림"| AND
    classDef vercelStyle fill:#F3E5F5,stroke:#9C27B0,stroke-width:2px,color:#4A148C
    classDef browserStyle fill:#E3F2FD,stroke:#2196F3,stroke-width:2px,color:#0D47A1
    classDef supabaseStyle fill:#E8F5E9,stroke:#4CAF50,stroke-width:2px,color:#1B5E20
    classDef googleStyle fill:#FFF3E0,stroke:#FF9800,stroke-width:2px,color:#E65100
    classDef futureStyle fill:#F5F5F5,stroke:#BDBDBD,stroke-width:2px,stroke-dasharray:5 5,color:#9E9E9E
    classDef dbStyle fill:#FFF8E1,stroke:#FFC107,stroke-width:2px,color:#F57F17
    classDef userStyle fill:#FFFFFF,stroke:#333,stroke-width:2px,color:#333

    class CDN,MW,APP,CB vercelStyle
    class SPA,SYNC browserStyle
    class AUTH supabaseStyle
    class STORAGE supabaseStyle
    class GOOGLE googleStyle
    class IOS,AND,API_SERVER,PUSH futureStyle
    class PG,ZUSTAND,LS dbStyle
    class USER userStyle
```

### 범례

| 색상 | 영역 | 설명 |
|------|------|------|
| 🟣 보라 | Vercel | CDN, Middleware, App Router, OAuth Callback |
| 🔵 파랑 | Browser | React SPA, sync 모듈 |
| 🟢 초록 | Supabase | Auth Service, Storage |
| 🟡 노랑 | DB / Store | PostgreSQL(RLS), Zustand, localStorage |
| 🟠 주황 | External | Google Identity Platform |
| ⬜ 회색 점선 | 예정 | iOS App, Android App, API Server, Push Service |

| 선 종류 | 의미 |
|---------|------|
| 실선 (`→`) | 현재 구현된 연결 |
| 점선 (`-.->`) | 추후 구현 예정 |

### Supabase DB ERD

```mermaid
---
config:
  look: handDrawn
  theme: neutral
  layout: elk
---
erDiagram
	direction LR
	auth_users {
		uuid id PK "Supabase 내장"  
		text email  "nullable (Anonymous)"  
		jsonb raw_user_meta_data  "Google name, avatar 등"  
		boolean is_anonymous  "게스트 여부"  
		timestamptz created_at  ""  
		timestamptz updated_at  ""  
	}

	auth_identities {
		uuid id PK "Supabase 내장"  
		uuid user_id FK "→ auth.users.id"  
		text provider  "google, anonymous"  
		text provider_id  "Google sub ID"  
		jsonb identity_data  ""  
		timestamptz created_at  ""  
	}

	auth_sessions {
		uuid id PK "Supabase 내장"  
		uuid user_id FK "→ auth.users.id"  
		text token  "JWT"  
		timestamptz created_at  ""  
		timestamptz expires_at  ""  
	}

	profiles {
		uuid id PK,FK "→ auth.users.id"  
		text nickname  "표시 이름"  
		boolean is_onboarded  "온보딩 완료 여부"  
		timestamptz created_at  ""  
		timestamptz updated_at  ""  
	}

	player_stats {
		uuid id PK ""  
		uuid user_id FK,UK "→ auth.users.id"  
		int level  "기본값 1"  
		int experience  "현재 경험치"  
		int max_experience  "레벨업 필요 경험치"  
		int coins  "보유 코인"  
		text stage  "egg | sproutling | blooming | fullyGrown"  
		int hp  "체력"  
		int max_hp  "최대 체력"  
		int today_earned_xp  "오늘 획득 XP"  
		int today_earned_coins  "오늘 획득 코인"  
		text today_date  "YYYY-MM-DD"  
		timestamptz last_visit_at  "마지막 접속"  
	}

	visions {
		uuid id PK ""  
		uuid user_id FK "→ auth.users.id"  
		text title  ""  
		text description  "nullable"  
		text image_url  "nullable"  
		timestamptz created_at  ""  
		timestamptz updated_at  ""  
		timestamptz deleted_at  "soft delete"  
	}

	goals {
		uuid id PK ""  
		uuid user_id FK "→ auth.users.id"  
		uuid vision_id FK "→ visions.id (nullable)"  
		text title  ""  
		text description  "nullable"  
		text status  "notStarted | inProgress | completed"  
		boolean completed  ""  
		numeric current_value  "현재 수치"  
		numeric target_value  "목표 수치"  
		text unit  "% | 권 | km 등"  
		jsonb value_history  "ValueChange 배열"  
		boolean reward_claimed  ""  
		int reward_amount  "기본값 500"  
		timestamptz created_at  ""  
		timestamptz deleted_at  "soft delete"  
	}

	projects {
		uuid id PK ""  
		uuid user_id FK "→ auth.users.id"  
		uuid goal_id FK "→ goals.id (nullable)"  
		text title  ""  
		text description  "nullable"  
		text status  "notStarted | inProgress | completed"  
		boolean completed  ""  
		int reward  "nullable"  
		boolean reward_claimed  ""  
		int reward_amount  "기본값 300"  
		timestamptz created_at  ""  
		timestamptz deleted_at  "soft delete"  
	}

	tasks {
		uuid id PK ""  
		uuid user_id FK "→ auth.users.id"  
		uuid goal_id FK "→ goals.id (nullable)"  
		uuid project_id FK "→ projects.id (nullable)"  
		text type  "habit | todo"  
		text title  ""  
		text description  "nullable"  
		boolean completed  ""  
		int streak  "연속 완료 일수"  
		jsonb frequency  "요일 배열 [0-6]"  
		int frequency_target  "nullable"  
		text frequency_period  "daily | weekly | monthly"  
		int completion_count  "누적 완료 횟수"  
		jsonb completed_dates  "YYYY-MM-DD 배열"  
		date start_date  "습관 시작일"  
		date end_date  "습관 종료일"  
		date due_date  "할일 마감일"  
		boolean reward_claimed  ""  
		timestamptz created_at  ""  
		timestamptz deleted_at  "soft delete"  
	}

	auth_users||--o{auth_identities:"has providers"
	auth_users||--o{auth_sessions:"has sessions"
	auth_users||--||profiles:"1:1"
	auth_users||--||player_stats:"1:1"
	auth_users||--o{visions:"owns"
	auth_users||--o{goals:"owns"
	auth_users||--o{projects:"owns"
	auth_users||--o{tasks:"owns"
	visions||--o{goals:"contains"
	goals||--o{projects:"contains"
	goals||--o{tasks:"contains"
	projects||--o{tasks:"contains"
```

#### RLS 정책 요약

| 테이블 | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| `profiles` | `id = auth.uid()` | trigger on signup | `id = auth.uid()` | - |
| `player_stats` | `user_id = auth.uid()` | trigger on signup | `user_id = auth.uid()` | - |
| `visions` | `user_id = auth.uid()` | `user_id = auth.uid()` | `user_id = auth.uid()` | soft delete |
| `goals` | `user_id = auth.uid()` | `user_id = auth.uid()` | `user_id = auth.uid()` | soft delete |
| `projects` | `user_id = auth.uid()` | `user_id = auth.uid()` | `user_id = auth.uid()` | soft delete |
| `tasks` | `user_id = auth.uid()` | `user_id = auth.uid()` | `user_id = auth.uid()` | soft delete |

> - 모든 public 테이블에 `user_id = auth.uid()` RLS 정책 적용
> - `profiles`, `player_stats`는 회원가입 시 DB trigger로 자동 생성
> - 삭제는 soft delete (`deleted_at` 타임스탬프) 방식 — 실제 row 삭제 없음
