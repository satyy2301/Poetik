-- Sprint 7: Rate limiting, abuse reports, spam flags

CREATE TABLE IF NOT EXISTS rate_limit_buckets (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL DEFAULT date_trunc('hour', NOW()),
  request_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, action, window_start)
);

CREATE TABLE IF NOT EXISTS abuse_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('poem', 'user', 'message', 'comment')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blocked_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_abuse_reports_status ON abuse_reports(status);
CREATE INDEX IF NOT EXISTS idx_rate_limit_user ON rate_limit_buckets(user_id);

ALTER TABLE abuse_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users submit reports" ON abuse_reports;
CREATE POLICY "Users submit reports" ON abuse_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users read own reports" ON abuse_reports;
CREATE POLICY "Users read own reports" ON abuse_reports
  FOR SELECT USING (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Admins read all reports" ON abuse_reports;
CREATE POLICY "Admins read all reports" ON abuse_reports
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins update reports" ON abuse_reports;
CREATE POLICY "Admins update reports" ON abuse_reports
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_action TEXT,
  p_max_requests INTEGER DEFAULT 10,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window TIMESTAMPTZ;
  v_count INTEGER;
BEGIN
  v_window := date_trunc('hour', NOW());

  INSERT INTO rate_limit_buckets (user_id, action, window_start, request_count)
  VALUES (p_user_id, p_action, v_window, 1)
  ON CONFLICT (user_id, action, window_start)
  DO UPDATE SET request_count = rate_limit_buckets.request_count + 1
  RETURNING request_count INTO v_count;

  RETURN v_count <= p_max_requests;
END;
$$;

CREATE OR REPLACE FUNCTION is_user_blocked(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM blocked_users WHERE user_id = p_user_id);
END;
$$;

GRANT EXECUTE ON FUNCTION check_rate_limit(UUID, TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_blocked(UUID) TO authenticated;
