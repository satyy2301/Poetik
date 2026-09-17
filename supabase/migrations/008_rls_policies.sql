-- Sprint 7: Comprehensive RLS audit and policies
-- See docs/RLS_POLICIES.md for human-readable rules

-- ---------------------------------------------------------------------------
-- user_lessons
-- ---------------------------------------------------------------------------
ALTER TABLE user_lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own lessons" ON user_lessons;
CREATE POLICY "Users read own lessons" ON user_lessons
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own lessons" ON user_lessons;
CREATE POLICY "Users manage own lessons" ON user_lessons
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- user_progress
-- ---------------------------------------------------------------------------
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own progress" ON user_progress;
CREATE POLICY "Users read own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own progress" ON user_progress;
CREATE POLICY "Users manage own progress" ON user_progress
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- lessons & quizzes (public read)
-- ---------------------------------------------------------------------------
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lessons are public" ON lessons;
CREATE POLICY "Lessons are public" ON lessons FOR SELECT USING (true);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Quizzes are public" ON quizzes;
CREATE POLICY "Quizzes are public" ON quizzes FOR SELECT USING (true);

-- ---------------------------------------------------------------------------
-- followers (strengthen existing)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Everyone can view followers" ON followers;
CREATE POLICY "Everyone can view followers" ON followers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can follow others" ON followers;
CREATE POLICY "Users can follow others" ON followers
  FOR INSERT WITH CHECK (auth.uid() = follower_id AND follower_id != followee_id);

DROP POLICY IF EXISTS "Users can unfollow others" ON followers;
CREATE POLICY "Users can unfollow others" ON followers
  FOR DELETE USING (auth.uid() = follower_id);

-- ---------------------------------------------------------------------------
-- playlists
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own playlists" ON playlists;
CREATE POLICY "Users can view own or public playlists" ON playlists
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

DROP POLICY IF EXISTS "Users can create their own playlists" ON playlists;
CREATE POLICY "Users can create own playlists" ON playlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own playlists" ON playlists;
CREATE POLICY "Users can update own playlists" ON playlists
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own playlists" ON playlists;
CREATE POLICY "Users can delete own playlists" ON playlists
  FOR DELETE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- user favorites (poems & poets)
-- ---------------------------------------------------------------------------
ALTER TABLE user_favorite_poems ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorite_poets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own favorite poems" ON user_favorite_poems;
CREATE POLICY "Users manage own favorite poems" ON user_favorite_poems
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own favorite poets" ON user_favorite_poets;
CREATE POLICY "Users manage own favorite poets" ON user_favorite_poets
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- community_posts
-- ---------------------------------------------------------------------------
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Posts are publicly readable" ON community_posts;
CREATE POLICY "Posts are publicly readable" ON community_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users create own posts" ON community_posts;
CREATE POLICY "Users create own posts" ON community_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own posts" ON community_posts;
CREATE POLICY "Users update own posts" ON community_posts
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own posts" ON community_posts;
CREATE POLICY "Users delete own posts" ON community_posts
  FOR DELETE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- messages (sender/receiver only)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users read own messages" ON messages;
CREATE POLICY "Users read own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users send messages" ON messages;
CREATE POLICY "Users send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users update own messages" ON messages;
CREATE POLICY "Users update own messages" ON messages
  FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- ---------------------------------------------------------------------------
-- typing_status
-- ---------------------------------------------------------------------------
ALTER TABLE typing_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own typing status" ON typing_status;
CREATE POLICY "Users manage own typing status" ON typing_status
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read typing directed at them" ON typing_status;
CREATE POLICY "Users read typing directed at them" ON typing_status
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = other_user_id);
