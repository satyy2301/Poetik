-- Sprint 8: Block user RPC for abuse report actions

CREATE OR REPLACE FUNCTION block_user(p_user_id UUID, p_reason TEXT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO blocked_users (user_id, reason)
  VALUES (p_user_id, p_reason)
  ON CONFLICT (user_id) DO UPDATE SET reason = EXCLUDED.reason, blocked_at = NOW();
END;
$$;

GRANT EXECUTE ON FUNCTION block_user(UUID, TEXT) TO authenticated;
