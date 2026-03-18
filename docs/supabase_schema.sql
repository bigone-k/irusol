-- ============================================================
-- Irusol Supabase Schema
-- Supabase SQL Editor에서 순서대로 실행하세요.
-- ============================================================

-- ============================================================
-- 1. 테이블 생성 (FK 의존성 순서)
-- ============================================================

-- 1-1. profiles (auth.users 연동)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nickname TEXT,
  avatar_url TEXT,
  is_onboarded BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 1-2. player_stats (usePlayerStore 매핑)
CREATE TABLE public.player_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  max_experience INTEGER DEFAULT 100,
  coins INTEGER DEFAULT 0,
  stage TEXT DEFAULT 'egg',
  hp INTEGER DEFAULT 50,
  max_hp INTEGER DEFAULT 50,
  today_earned_xp INTEGER DEFAULT 0,
  today_earned_coins INTEGER DEFAULT 0,
  today_date TEXT DEFAULT '',
  last_visit_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 1-3. visions (useVisionStore 매핑)
CREATE TABLE public.visions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 1-4. goals (useGoalStore 매핑)
CREATE TABLE public.goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  vision_id UUID REFERENCES public.visions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'notStarted',
  completed BOOLEAN DEFAULT false,
  current_value NUMERIC DEFAULT 0,
  target_value NUMERIC DEFAULT 0,
  unit TEXT DEFAULT '',
  season_start TEXT,
  season_end TEXT,
  value_history JSONB DEFAULT '[]',
  reward_claimed BOOLEAN DEFAULT false,
  reward_amount INTEGER DEFAULT 0,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 1-5. projects (useProjectStore 매핑)
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'notStarted',
  completed BOOLEAN DEFAULT false,
  reward INTEGER,
  start_date TEXT,
  end_date TEXT,
  reward_claimed BOOLEAN DEFAULT false,
  reward_amount INTEGER DEFAULT 0,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 1-6. tasks (useTaskStore 매핑)
CREATE TABLE public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'todo',
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  streak INTEGER DEFAULT 0,
  frequency INTEGER[] DEFAULT '{}',
  frequency_target INTEGER,
  frequency_period TEXT,
  completion_count INTEGER DEFAULT 0,
  completed_dates TEXT[] DEFAULT '{}',
  recurrence TEXT,
  target_days INTEGER,
  reminder TEXT,
  start_date TEXT,
  end_date TEXT,
  due_date TEXT,
  reward_claimed BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. 가입 트리거 (Google OAuth 가입 시 자동 실행)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- 프로필 자동 생성
  INSERT INTO public.profiles (id, nickname, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Adventurer'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  -- 초기 캐릭터 스탯 자동 생성
  INSERT INTO public.player_stats (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2-1. 기존 auth.users 동기화 (rollback 후 재생성 시 필요)
-- 트리거는 INSERT 시에만 발동하므로, 기존 유저는 수동 생성
-- ============================================================

INSERT INTO public.profiles (id, nickname, avatar_url)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'name', 'Adventurer'),
  raw_user_meta_data->>'avatar_url'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.player_stats (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.player_stats)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- 3. RLS 활성화 + GRANT 권한 부여
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- authenticated 역할에 테이블 접근 권한 부여 (RLS 정책과 별도)
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.player_stats TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.visions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.goals TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.projects TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.tasks TO authenticated;

-- ============================================================
-- 4. RLS 정책 — profiles
-- ============================================================

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- 5. RLS 정책 — player_stats
-- ============================================================

CREATE POLICY "player_stats_select" ON public.player_stats
  FOR SELECT USING (
    user_id = auth.uid() AND deleted_at IS NULL
  );

CREATE POLICY "player_stats_insert" ON public.player_stats
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "player_stats_update" ON public.player_stats
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 6. RLS 정책 — visions
-- ============================================================

CREATE POLICY "visions_select" ON public.visions
  FOR SELECT USING (
    user_id = auth.uid() AND deleted_at IS NULL
  );

CREATE POLICY "visions_insert" ON public.visions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "visions_update" ON public.visions
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 7. RLS 정책 — goals
-- ============================================================

CREATE POLICY "goals_select" ON public.goals
  FOR SELECT USING (
    user_id = auth.uid() AND deleted_at IS NULL
  );

CREATE POLICY "goals_insert" ON public.goals
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "goals_update" ON public.goals
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 8. RLS 정책 — projects
-- ============================================================

CREATE POLICY "projects_select" ON public.projects
  FOR SELECT USING (
    user_id = auth.uid() AND deleted_at IS NULL
  );

CREATE POLICY "projects_insert" ON public.projects
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "projects_update" ON public.projects
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 9. RLS 정책 — tasks
-- ============================================================

CREATE POLICY "tasks_select" ON public.tasks
  FOR SELECT USING (
    user_id = auth.uid() AND deleted_at IS NULL
  );

CREATE POLICY "tasks_insert" ON public.tasks
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "tasks_update" ON public.tasks
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 10. 인덱스 (검색 최적화)
-- ============================================================

CREATE INDEX idx_player_stats_user_id ON public.player_stats(user_id);
CREATE INDEX idx_visions_user_id ON public.visions(user_id);
CREATE INDEX idx_goals_user_id ON public.goals(user_id);
CREATE INDEX idx_goals_deleted_at ON public.goals(deleted_at);
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_goal_id ON public.projects(goal_id);
CREATE INDEX idx_projects_deleted_at ON public.projects(deleted_at);
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_created_at ON public.tasks(created_at);
CREATE INDEX idx_tasks_deleted_at ON public.tasks(deleted_at);