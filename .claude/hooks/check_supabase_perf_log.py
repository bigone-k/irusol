#!/usr/bin/env python3
"""
PostToolUse hook: Supabase 호출이 포함된 파일 수정 시
perfLogger(withPerfLog / logPerf) 사용 여부를 체크합니다.

검출 대상:
  - supabase.from(  → DB CRUD
  - supabase.auth.  → Auth API
  - .select( / .upsert( / .update( / .insert(  → Supabase query

제외 대상:
  - perfLogger.ts 자체
  - API Route (perf-logs/route.ts)
  - supabase/client.ts, server.ts, middleware.ts (클라이언트 생성 파일)
"""

import json
import sys
import os
import re

# stdin에서 hook 이벤트 읽기
try:
    event = json.load(sys.stdin)
except (json.JSONDecodeError, EOError):
    sys.exit(0)

# 수정된 파일 경로 추출
tool_input = event.get("tool_input", {})
file_path = tool_input.get("file_path") or tool_input.get("filePath") or ""

if not file_path:
    sys.exit(0)

# .ts/.tsx 파일만 체크
if not file_path.endswith((".ts", ".tsx")):
    sys.exit(0)

# 제외 파일
EXCLUDE_PATTERNS = [
    "perfLogger.ts",
    "perf-logs/route.ts",
    "supabase/client.ts",
    "supabase/server.ts",
    "supabase/middleware.ts",
    "node_modules",
    ".next",
]

for pattern in EXCLUDE_PATTERNS:
    if pattern in file_path:
        sys.exit(0)

# 파일 읽기
if not os.path.exists(file_path):
    sys.exit(0)

try:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
except (IOError, UnicodeDecodeError):
    sys.exit(0)

# Supabase 호출 패턴 검출
SUPABASE_PATTERNS = [
    r"supabase\s*\.\s*from\s*\(",
    r"supabase\s*\.\s*auth\s*\.\s*(?!onAuthStateChange)",  # onAuthStateChange는 제외 (리스너)
    r"\.from\s*\(\s*['\"]",
    r"ctx\s*\.\s*supabase",
]

has_supabase_call = any(
    re.search(pattern, content) for pattern in SUPABASE_PATTERNS
)

if not has_supabase_call:
    sys.exit(0)

# perfLogger import 또는 직접 JSON 로그 패턴 (middleware 등 Edge Runtime)
has_perf_import = bool(
    re.search(r"from\s+['\"]@/lib/perfLogger['\"]", content)
    or re.search(r"require\s*\(\s*['\"]@/lib/perfLogger['\"]", content)
    or re.search(r"supabase_perf", content)  # 직접 JSON 로그 패턴
)

# perfLogger 사용 체크
has_perf_usage = bool(
    re.search(r"\bwithPerfLog\s*\(", content)
    or re.search(r"\blogPerf\s*\(", content)
    or re.search(r"supabase_perf", content)  # console.log(JSON.stringify({type:'supabase_perf',...}))
)

if has_perf_import and has_perf_usage:
    sys.exit(0)

# 경고 출력
warnings = []
if not has_perf_import:
    warnings.append("perfLogger import 누락 (import { withPerfLog, logPerf } from '@/lib/perfLogger')")
if not has_perf_usage:
    warnings.append("Supabase 호출에 withPerfLog/logPerf 미적용")

msg = f"⚠️ [{os.path.basename(file_path)}] Supabase 연동 코드에 성능 로그가 누락되었습니다.\n"
msg += "\n".join(f"  - {w}" for w in warnings)
msg += "\n  → 모든 Supabase 호출은 withPerfLog() 또는 logPerf()로 감싸야 합니다."

output = {
    "hookSpecificOutput": {
        "hookEventName": "PostToolUse",
        "additionalContext": msg
    }
}

print(json.dumps(output, ensure_ascii=False))
