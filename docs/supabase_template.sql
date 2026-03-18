-- ============================================================
-- MVP 템플릿(모듈) 자동 생성 함수
-- 온보딩 또는 앱 내에서 호출하여 Goal/Project/Tasks를 일괄 생성
--
-- 사용법:
--   SELECT apply_onboarding_template('A', auth.uid());
--   SELECT apply_onboarding_template('B', auth.uid());
--   SELECT apply_onboarding_template('C', auth.uid());
--   SELECT apply_onboarding_template('D', auth.uid());
--
-- D# 표기: 생성일(오늘) + #일
-- frequency: 0=일(Sun), 1=월(Mon), 2=화(Tue), 3=수(Wed), 4=목(Thu), 5=금(Fri), 6=토(Sat)
-- ============================================================

CREATE OR REPLACE FUNCTION public.apply_onboarding_template(
  p_template_key TEXT,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_goal_id UUID;
  v_project_id UUID;
  v_today DATE := CURRENT_DATE;
  v_3m_end TEXT := to_char(CURRENT_DATE + INTERVAL '3 months', 'YYYY-MM-DD');
  v_1m_end TEXT := to_char(CURRENT_DATE + INTERVAL '1 month', 'YYYY-MM-DD');
  v_today_text TEXT := to_char(CURRENT_DATE, 'YYYY-MM-DD');
BEGIN
  -- ============================================================
  -- 템플릿 A — 건강 (2kg 감량)
  -- ============================================================
  IF p_template_key = 'A' THEN

    -- Goal
    INSERT INTO public.goals (user_id, title, description, current_value, target_value, unit, season_start, season_end, status)
    VALUES (
      p_user_id,
      '[3개월] 2kg 감량하기',
      '꾸준한 운동 습관을 만들고 3개월 내 2kg 감량을 달성합니다.',
      0, 2, 'kg',
      v_today_text, v_3m_end,
      'notStarted'
    )
    RETURNING id INTO v_goal_id;

    -- Project
    INSERT INTO public.projects (user_id, goal_id, title, description, start_date, end_date, status)
    VALUES (
      p_user_id, v_goal_id,
      '[1개월] 운동 습관 만들기',
      '1개월 동안 ''주 3회 운동''을 습관화하는 데 집중합니다.',
      v_today_text, v_1m_end,
      'notStarted'
    )
    RETURNING id INTO v_project_id;

    -- TASK D0
    INSERT INTO public.tasks (user_id, goal_id, project_id, type, title, due_date)
    VALUES (p_user_id, v_goal_id, v_project_id, 'todo',
      '나에게 맞는 운동 유형 정하기(예: 헬스/요가/러닝 등)',
      to_char(v_today, 'YYYY-MM-DD'));

    -- TASK D1
    INSERT INTO public.tasks (user_id, goal_id, project_id, type, title, due_date)
    VALUES (p_user_id, v_goal_id, v_project_id, 'todo',
      '운동 등록하기(예: 헬스장 등록/요가원 등록/홈트 프로그램 선택 등)',
      to_char(v_today + 1, 'YYYY-MM-DD'));

    -- TASK D2
    INSERT INTO public.tasks (user_id, goal_id, project_id, type, title, due_date)
    VALUES (p_user_id, v_goal_id, v_project_id, 'todo',
      '운동 스케줄 정하기(예: 퇴근 후 바로 헬스장 가기)',
      to_char(v_today + 2, 'YYYY-MM-DD'));

    -- HABIT: 주 3회 운동하기 (Mon=1, Wed=3, Fri=5)
    INSERT INTO public.tasks (user_id, goal_id, project_id, type, title, frequency, start_date, end_date)
    VALUES (p_user_id, v_goal_id, v_project_id, 'habit',
      '주 3회 운동하기',
      '{1,3,5}',
      v_today_text, v_3m_end);

  -- ============================================================
  -- 템플릿 B — 마음건강 (취향리스트 → 10회 실행)
  -- ============================================================
  ELSIF p_template_key = 'B' THEN

    -- Goal
    INSERT INTO public.goals (user_id, title, description, current_value, target_value, unit, season_start, season_end, status)
    VALUES (
      p_user_id,
      '[3개월] 취향리스트 완성 후 10회 실행하기',
      '취향리스트를 만들고, 10회 실행합니다.',
      0, 10, '회',
      v_today_text, v_3m_end,
      'notStarted'
    )
    RETURNING id INTO v_goal_id;

    -- Project
    INSERT INTO public.projects (user_id, goal_id, title, description, start_date, end_date, status)
    VALUES (
      p_user_id, v_goal_id,
      '[1개월] 취향리스트 만들기',
      '나를 기분 좋게 하는 취향 리스트를 만들고 실행합니다.',
      v_today_text, v_1m_end,
      'notStarted'
    )
    RETURNING id INTO v_project_id;

    -- TASK D0
    INSERT INTO public.tasks (user_id, goal_id, project_id, type, title, due_date)
    VALUES (p_user_id, v_goal_id, v_project_id, 'todo',
      '최근 기분 좋았던 경험 3개 적기',
      to_char(v_today, 'YYYY-MM-DD'));

    -- TASK D1
    INSERT INTO public.tasks (user_id, goal_id, project_id, type, title, due_date)
    VALUES (p_user_id, v_goal_id, v_project_id, 'todo',
      '내가 좋아하는 것 20개 이상 적어보기',
      to_char(v_today + 1, 'YYYY-MM-DD'));

    -- TASK D3
    INSERT INTO public.tasks (user_id, goal_id, project_id, type, title, due_date)
    VALUES (p_user_id, v_goal_id, v_project_id, 'todo',
      '리스트를 카테고리로 묶고 부족한 부분 채워보기(예: 음식/장소/사람 등)',
      to_char(v_today + 3, 'YYYY-MM-DD'));

    -- TASK D4
    INSERT INTO public.tasks (user_id, goal_id, project_id, type, title, due_date)
    VALUES (p_user_id, v_goal_id, v_project_id, 'todo',
      '리스트에서 이번 달 ''해보기'' 후보 5개 고르기',
      to_char(v_today + 4, 'YYYY-MM-DD'));

    -- TASK D5
    INSERT INTO public.tasks (user_id, goal_id, project_id, type, title, due_date)
    VALUES (p_user_id, v_goal_id, v_project_id, 'todo',
      '후보 5개 중 2개를 확정하여 캘린더에 저장하기(언제/어디서/무엇을)',
      to_char(v_today + 5, 'YYYY-MM-DD'));

    -- TASK D16
    INSERT INTO public.tasks (user_id, goal_id, project_id, type, title, due_date)
    VALUES (p_user_id, v_goal_id, v_project_id, 'todo',
      '1개 실행하고 만족도와 기분 기록하기',
      to_char(v_today + 16, 'YYYY-MM-DD'));

    -- TASK D25
    INSERT INTO public.tasks (user_id, goal_id, project_id, type, title, due_date)
    VALUES (p_user_id, v_goal_id, v_project_id, 'todo',
      '1개 더 실행하고 만족도/기분 기록하기',
      to_char(v_today + 25, 'YYYY-MM-DD'));

    -- TASK D27
    INSERT INTO public.tasks (user_id, goal_id, project_id, type, title, due_date)
    VALUES (p_user_id, v_goal_id, v_project_id, 'todo',
      '취향리스트 완성하기',
      to_char(v_today + 27, 'YYYY-MM-DD'));

  -- ============================================================
  -- 템플릿 C — 독서 (3권 완독)
  -- ============================================================
  ELSIF p_template_key = 'C' THEN

    -- Goal
    INSERT INTO public.goals (user_id, title, description, current_value, target_value, unit, season_start, season_end, status)
    VALUES (
      p_user_id,
      '[3개월] 책 3권 완독하기',
      '책 읽는 습관을 만들고 책 3권을 완독합니다.',
      0, 3, '권',
      v_today_text, v_3m_end,
      'notStarted'
    )
    RETURNING id INTO v_goal_id;

    -- Project
    INSERT INTO public.projects (user_id, goal_id, title, description, start_date, end_date, status)
    VALUES (
      p_user_id, v_goal_id,
      '[1개월] 독서 루틴 만들기',
      '독서 환경을 세팅하고 꾸준히 읽는 습관을 만듭니다.',
      v_today_text, v_1m_end,
      'notStarted'
    )
    RETURNING id INTO v_project_id;

    -- TASK D0: 독서 가능 시간 정하기
    INSERT INTO public.tasks (user_id, goal_id, project_id, type, title, due_date)
    VALUES (p_user_id, v_goal_id, v_project_id, 'todo',
      '독서 가능 시간 정하기(예: 출퇴근 지하철/자기 전 등)',
      to_char(v_today, 'YYYY-MM-DD'));

    -- TASK D0: 읽을 책 1권 고르기
    INSERT INTO public.tasks (user_id, goal_id, project_id, type, title, due_date)
    VALUES (p_user_id, v_goal_id, v_project_id, 'todo',
      '읽을 책 1권 고르기',
      to_char(v_today, 'YYYY-MM-DD'));

    -- HABIT: 주 4회 5분 이상 독서 (TIMES_PER_WEEK)
    INSERT INTO public.tasks (user_id, goal_id, project_id, type, title, frequency_target, frequency_period, start_date, end_date)
    VALUES (p_user_id, v_goal_id, v_project_id, 'habit',
      '주 4회 5분 이상 독서',
      4, 'weekly',
      v_today_text, v_3m_end);

    -- TASK D25
    INSERT INTO public.tasks (user_id, goal_id, project_id, type, title, due_date)
    VALUES (p_user_id, v_goal_id, v_project_id, 'todo',
      '책 1권 완독',
      to_char(v_today + 25, 'YYYY-MM-DD'));

    -- TASK D27
    INSERT INTO public.tasks (user_id, goal_id, project_id, type, title, due_date)
    VALUES (p_user_id, v_goal_id, v_project_id, 'todo',
      '책 1권 감상평 1줄 써보기',
      to_char(v_today + 27, 'YYYY-MM-DD'));

  -- ============================================================
  -- 템플릿 D — 생활 (집밥 레시피 10개 모으기)
  -- ============================================================
  ELSIF p_template_key = 'D' THEN

    -- Goal
    INSERT INTO public.goals (user_id, title, description, current_value, target_value, unit, season_start, season_end, status)
    VALUES (
      p_user_id,
      '[3개월] 나만의 집밥 레시피 10개 모으기',
      '배달·외식을 줄이고 나를 위한 집밥 레시피를 10개 모아 정리합니다.',
      0, 10, '개',
      v_today_text, v_3m_end,
      'notStarted'
    )
    RETURNING id INTO v_goal_id;

    -- Project
    INSERT INTO public.projects (user_id, goal_id, title, description, start_date, end_date, status)
    VALUES (
      p_user_id, v_goal_id,
      '[1개월] 집밥 루틴 만들기 (주 2회)',
      '건강한 레시피를 찾고 집밥을 하는 습관을 만듭니다.',
      v_today_text, v_1m_end,
      'notStarted'
    )
    RETURNING id INTO v_project_id;

    -- HABIT: 주 2회 집밥 1끼 해먹기 (TIMES_PER_WEEK)
    INSERT INTO public.tasks (user_id, goal_id, project_id, type, title, frequency_target, frequency_period, start_date, end_date)
    VALUES (p_user_id, v_goal_id, v_project_id, 'habit',
      '주 2회 집밥 1끼 해먹기',
      2, 'weekly',
      v_today_text, v_3m_end);

    -- TASK D0
    INSERT INTO public.tasks (user_id, goal_id, project_id, type, title, due_date)
    VALUES (p_user_id, v_goal_id, v_project_id, 'todo',
      '건강하고 맛있는 레시피 10개 저장하기',
      to_char(v_today, 'YYYY-MM-DD'));

    -- TASK D3
    INSERT INTO public.tasks (user_id, goal_id, project_id, type, title, due_date)
    VALUES (p_user_id, v_goal_id, v_project_id, 'todo',
      '가장 쉬운 레시피 1개 해보기',
      to_char(v_today + 3, 'YYYY-MM-DD'));

    -- TASK D7
    INSERT INTO public.tasks (user_id, goal_id, project_id, type, title, due_date)
    VALUES (p_user_id, v_goal_id, v_project_id, 'todo',
      '레시피 1개를 내 입맛에 맞게 변형하고 ''나만의 레시피''로 기록하기',
      to_char(v_today + 7, 'YYYY-MM-DD'));

  ELSE
    RETURN jsonb_build_object('error', 'Invalid template key: ' || p_template_key);
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'template', p_template_key,
    'goal_id', v_goal_id,
    'project_id', v_project_id
  );
END;
$$;
