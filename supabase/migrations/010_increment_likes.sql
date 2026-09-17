-- RPC to increment poem like_count (used by poemService, ProfileScreen)

ALTER TABLE poems ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE OR REPLACE FUNCTION increment_likes(poem_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE poems
  SET like_count = COALESCE(like_count, 0) + 1,
      updated_at = NOW()
  WHERE id = poem_id;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_likes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_likes(UUID) TO anon;
