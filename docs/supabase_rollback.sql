-- ============================================================
-- Irusol Supabase Rollback
-- supabase_schema.sql의 전체 롤백 스크립트입니다.
-- 생성의 역순으로 실행됩니다. (의존성 고려)
-- ⚠️ 주의: 모든 데이터가 삭제됩니다!
-- ============================================================

-- ============================================================
-- 0. 마이그레이션 컬럼 롤백
-- ============================================================

ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_onboarded;

-- ============================================================
-- 1. 인덱스 삭제
-- ============================================================

DROP INDEX IF EXISTS public.idx_tasks_deleted_at;
DROP INDEX IF EXISTS public.idx_tasks_created_at;
DROP INDEX IF EXISTS public.idx_tasks_user_id;
DROP INDEX IF EXISTS public.idx_projects_deleted_at;
DROP INDEX IF EXISTS public.idx_projects_goal_id;
DROP INDEX IF EXISTS public.idx_projects_user_id;
DROP INDEX IF EXISTS public.idx_goals_deleted_at;
DROP INDEX IF EXISTS public.idx_goals_user_id;
DROP INDEX IF EXISTS public.idx_visions_user_id;
DROP INDEX IF EXISTS public.idx_player_stats_user_id;

-- ============================================================
-- 2. GRANT 권한 회수 + RLS 정책 삭제
-- ============================================================

REVOKE ALL ON public.tasks FROM authenticated;
REVOKE ALL ON public.projects FROM authenticated;
REVOKE ALL ON public.goals FROM authenticated;
REVOKE ALL ON public.visions FROM authenticated;
REVOKE ALL ON public.player_stats FROM authenticated;
REVOKE ALL ON public.profiles FROM authenticated;

-- tasks
DROP POLICY IF EXISTS "tasks_update" ON public.tasks;
DROP POLICY IF EXISTS "tasks_insert" ON public.tasks;
DROP POLICY IF EXISTS "tasks_select" ON public.tasks;

-- projects
DROP POLICY IF EXISTS "projects_update" ON public.projects;
DROP POLICY IF EXISTS "projects_insert" ON public.projects;
DROP POLICY IF EXISTS "projects_select" ON public.projects;

-- goals
DROP POLICY IF EXISTS "goals_update" ON public.goals;
DROP POLICY IF EXISTS "goals_insert" ON public.goals;
DROP POLICY IF EXISTS "goals_select" ON public.goals;

-- visions
DROP POLICY IF EXISTS "visions_update" ON public.visions;
DROP POLICY IF EXISTS "visions_insert" ON public.visions;
DROP POLICY IF EXISTS "visions_select" ON public.visions;

-- player_stats
DROP POLICY IF EXISTS "player_stats_update" ON public.player_stats;
DROP POLICY IF EXISTS "player_stats_insert" ON public.player_stats;
DROP POLICY IF EXISTS "player_stats_select" ON public.player_stats;

-- profiles
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;

-- ============================================================
-- 3. RLS 비활성화
-- ============================================================

ALTER TABLE IF EXISTS public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.visions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.player_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. 트리거 및 함수 삭제
-- ============================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ============================================================
-- 5. 테이블 삭제 (FK 역순: 자식 → 부모)
-- ============================================================

DROP TABLE IF EXISTS public.tasks;
DROP TABLE IF EXISTS public.projects;
DROP TABLE IF EXISTS public.goals;
DROP TABLE IF EXISTS public.visions;
DROP TABLE IF EXISTS public.player_stats;
DROP TABLE IF EXISTS public.profiles;
