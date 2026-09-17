-- Fix notifications schema drift and ensure favorites tables exist

-- ---------------------------------------------------------------------------
-- notifications: older deployments may lack title/body/data
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('follow', 'message', 'like', 'comment', 'playlist', 'system')),
  title TEXT NOT NULL DEFAULT 'Notification',
  body TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS body TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

UPDATE notifications SET title = COALESCE(title, type, 'Notification') WHERE title IS NULL;
UPDATE notifications SET body = COALESCE(body, '') WHERE body IS NULL;
UPDATE notifications SET data = COALESCE(data, '{}'::jsonb) WHERE data IS NULL;
UPDATE notifications SET read = COALESCE(read, false) WHERE read IS NULL;
UPDATE notifications SET created_at = COALESCE(created_at, NOW()) WHERE created_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id) WHERE read = false;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own notifications" ON notifications;
CREATE POLICY "Users read own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own notifications" ON notifications;
CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System inserts notifications" ON notifications;
CREATE POLICY "System inserts notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- favorites tables (app uses user_favorite_poems; legacy code used favorites)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_favorite_poems (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  poem_id UUID NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, poem_id)
);

CREATE TABLE IF NOT EXISTS user_favorite_poets (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  poet_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, poet_id)
);

CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  poem_id UUID NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, poem_id)
);

CREATE INDEX IF NOT EXISTS idx_user_favorite_poems_user ON user_favorite_poems(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorite_poets_user ON user_favorite_poets(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);

ALTER TABLE user_favorite_poems ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorite_poets ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own favorite poems" ON user_favorite_poems;
CREATE POLICY "Users manage own favorite poems" ON user_favorite_poems
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own favorite poets" ON user_favorite_poets;
CREATE POLICY "Users manage own favorite poets" ON user_favorite_poets
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
CREATE POLICY "Users can view their own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add to their favorites" ON favorites;
CREATE POLICY "Users can add to their favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove from their favorites" ON favorites;
CREATE POLICY "Users can remove from their favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- notification helper + follow trigger (idempotent)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_body TEXT DEFAULT NULL,
  p_data JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, body, data)
  VALUES (p_user_id, p_type, p_title, p_body, p_data);
END;
$$;

CREATE OR REPLACE FUNCTION notify_on_follow()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  follower_name TEXT;
BEGIN
  SELECT name INTO follower_name FROM authors WHERE id = NEW.follower_id;
  PERFORM create_notification(
    NEW.followee_id,
    'follow',
    'New follower',
    COALESCE(follower_name, 'Someone') || ' started following you',
    jsonb_build_object('follower_id', NEW.follower_id)
  );
  BEGIN
    INSERT INTO activity_events (user_id, event_type, target_type, target_id, metadata)
    VALUES (NEW.follower_id, 'followed', 'user', NEW.followee_id, '{}'::jsonb);
  EXCEPTION
    WHEN undefined_table THEN
      NULL;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_follow ON followers;
CREATE TRIGGER trg_notify_follow
  AFTER INSERT ON followers
  FOR EACH ROW EXECUTE FUNCTION notify_on_follow();

GRANT EXECUTE ON FUNCTION create_notification(UUID, TEXT, TEXT, TEXT, JSONB) TO authenticated;
