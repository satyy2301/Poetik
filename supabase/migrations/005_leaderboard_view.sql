-- Sprint 4: Leaderboard views and RPC

CREATE OR REPLACE VIEW leaderboard_all_time AS
SELECT
  up.user_id,
  COALESCE(a.name, 'Poet') AS display_name,
  COALESCE(up.xp, 0) AS xp,
  COALESCE(up.streak, 0) AS streak,
  RANK() OVER (ORDER BY COALESCE(up.xp, 0) DESC) AS rank
FROM user_progress up
LEFT JOIN authors a ON a.id = up.user_id
WHERE COALESCE(up.xp, 0) > 0;

CREATE OR REPLACE FUNCTION get_leaderboard(
  p_period TEXT DEFAULT 'all',
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  xp INTEGER,
  streak INTEGER,
  rank BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_period = 'weekly' THEN
    RETURN QUERY
    WITH period_xp AS (
      SELECT uqr.user_id, SUM(uqr.xp_earned)::INTEGER AS period_xp
      FROM user_quiz_results uqr
      WHERE uqr.completed_at >= NOW() - INTERVAL '7 days'
      GROUP BY uqr.user_id
      UNION ALL
      SELECT uc.user_id, SUM(uc.xp_earned)::INTEGER
      FROM user_challenges uc
      WHERE uc.completed_at >= NOW() - INTERVAL '7 days'
      GROUP BY uc.user_id
    ),
    aggregated AS (
      SELECT px.user_id, SUM(px.period_xp)::INTEGER AS xp
      FROM period_xp px
      GROUP BY px.user_id
      HAVING SUM(px.period_xp) > 0
    )
    SELECT
      ag.user_id,
      COALESCE(a.name, 'Poet') AS display_name,
      ag.xp,
      COALESCE(up.streak, 0) AS streak,
      RANK() OVER (ORDER BY ag.xp DESC) AS rank
    FROM aggregated ag
    LEFT JOIN authors a ON a.id = ag.user_id
    LEFT JOIN user_progress up ON up.user_id = ag.user_id
    ORDER BY ag.xp DESC
    LIMIT p_limit;

  ELSIF p_period = 'monthly' THEN
    RETURN QUERY
    WITH period_xp AS (
      SELECT uqr.user_id, SUM(uqr.xp_earned)::INTEGER AS period_xp
      FROM user_quiz_results uqr
      WHERE uqr.completed_at >= NOW() - INTERVAL '30 days'
      GROUP BY uqr.user_id
      UNION ALL
      SELECT uc.user_id, SUM(uc.xp_earned)::INTEGER
      FROM user_challenges uc
      WHERE uc.completed_at >= NOW() - INTERVAL '30 days'
      GROUP BY uc.user_id
    ),
    aggregated AS (
      SELECT px.user_id, SUM(px.period_xp)::INTEGER AS xp
      FROM period_xp px
      GROUP BY px.user_id
      HAVING SUM(px.period_xp) > 0
    )
    SELECT
      ag.user_id,
      COALESCE(a.name, 'Poet') AS display_name,
      ag.xp,
      COALESCE(up.streak, 0) AS streak,
      RANK() OVER (ORDER BY ag.xp DESC) AS rank
    FROM aggregated ag
    LEFT JOIN authors a ON a.id = ag.user_id
    LEFT JOIN user_progress up ON up.user_id = ag.user_id
    ORDER BY ag.xp DESC
    LIMIT p_limit;

  ELSE
    RETURN QUERY
    SELECT
      lat.user_id,
      lat.display_name,
      lat.xp::INTEGER,
      lat.streak::INTEGER,
      lat.rank
    FROM leaderboard_all_time lat
    ORDER BY lat.rank
    LIMIT p_limit;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION get_user_rank(
  p_user_id UUID,
  p_period TEXT DEFAULT 'all'
)
RETURNS TABLE (rank BIGINT, xp INTEGER, total_users BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_period = 'all' THEN
    RETURN QUERY
    SELECT
      lat.rank,
      lat.xp::INTEGER,
      (SELECT COUNT(*) FROM leaderboard_all_time)::BIGINT
    FROM leaderboard_all_time lat
    WHERE lat.user_id = p_user_id;
  ELSE
    RETURN QUERY
    SELECT
      lb.rank,
      lb.xp,
      (SELECT COUNT(*) FROM get_leaderboard(p_period, 10000))::BIGINT
    FROM get_leaderboard(p_period, 10000) lb
    WHERE lb.user_id = p_user_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION get_leaderboard(TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_rank(UUID, TEXT) TO authenticated;
