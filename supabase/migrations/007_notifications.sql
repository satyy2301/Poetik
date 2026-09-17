-- Sprint 6: Notifications, messaging enhancements, activity, playlist sharing

-- Messages table (if not exists)
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'poem')),
  image_url TEXT,
  poem_id UUID REFERENCES poems(id) ON DELETE SET NULL,
  reactions JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT false,
  archived BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own messages" ON messages;
CREATE POLICY "Users read own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users send messages" ON messages;
CREATE POLICY "Users send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users update own messages" ON messages;
CREATE POLICY "Users update own messages" ON messages
  FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('follow', 'message', 'like', 'comment', 'playlist', 'system')),
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  push_enabled BOOLEAN DEFAULT true,
  follow_enabled BOOLEAN DEFAULT true,
  message_enabled BOOLEAN DEFAULT true,
  like_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own notification prefs" ON notification_preferences;
CREATE POLICY "Users manage own notification prefs" ON notification_preferences
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Activity feed events
CREATE TABLE IF NOT EXISTS activity_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('published', 'liked', 'followed', 'completed_lesson', 'shared_playlist')),
  target_type TEXT,
  target_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_events(user_id, created_at DESC);

ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone reads activity events" ON activity_events;
CREATE POLICY "Everyone reads activity events" ON activity_events
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users insert own activity" ON activity_events;
CREATE POLICY "Users insert own activity" ON activity_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Playlist sharing
ALTER TABLE playlists ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
ALTER TABLE playlists ADD COLUMN IF NOT EXISTS share_slug TEXT UNIQUE;
ALTER TABLE playlists ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0;
ALTER TABLE playlists ADD COLUMN IF NOT EXISTS play_count INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS playlist_followers (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, playlist_id)
);

ALTER TABLE playlist_followers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone reads playlist followers" ON playlist_followers;
CREATE POLICY "Everyone reads playlist followers" ON playlist_followers
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users follow playlists" ON playlist_followers;
CREATE POLICY "Users follow playlists" ON playlist_followers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users unfollow playlists" ON playlist_followers;
CREATE POLICY "Users unfollow playlists" ON playlist_followers
  FOR DELETE USING (auth.uid() = user_id);

-- Public playlist read policy
DROP POLICY IF EXISTS "Public playlists readable" ON playlists;
CREATE POLICY "Public playlists readable" ON playlists
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

-- Notification helper
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

-- Trigger: new follower notification
CREATE OR REPLACE FUNCTION notify_on_follow()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM create_notification(
    NEW.followee_id,
    'follow',
    'New follower',
    'Someone started following you',
    jsonb_build_object('follower_id', NEW.follower_id)
  );
  INSERT INTO activity_events (user_id, event_type, target_type, target_id, metadata)
  VALUES (NEW.follower_id, 'followed', 'user', NEW.followee_id, '{}'::jsonb);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_follow ON followers;
CREATE TRIGGER trg_notify_follow
  AFTER INSERT ON followers
  FOR EACH ROW EXECUTE FUNCTION notify_on_follow();

-- Trigger: new message notification
CREATE OR REPLACE FUNCTION notify_on_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM create_notification(
    NEW.receiver_id,
    'message',
    'New message',
    LEFT(NEW.content, 100),
    jsonb_build_object('sender_id', NEW.sender_id, 'message_id', NEW.id)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_message ON messages;
CREATE TRIGGER trg_notify_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION notify_on_message();

GRANT EXECUTE ON FUNCTION create_notification(UUID, TEXT, TEXT, TEXT, JSONB) TO authenticated;
