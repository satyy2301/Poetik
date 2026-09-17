-- Sprint 4: Achievements & gamification

CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'trophy',
  criteria_type TEXT NOT NULL,
  criteria_value INTEGER NOT NULL DEFAULT 1,
  xp_reward INTEGER NOT NULL DEFAULT 25,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can read achievements" ON achievements;
CREATE POLICY "Everyone can read achievements" ON achievements
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users read own achievements" ON user_achievements;
CREATE POLICY "Users read own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users earn achievements" ON user_achievements;
CREATE POLICY "Users earn achievements" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Seed 20+ achievements
INSERT INTO achievements (key, name, description, icon, criteria_type, criteria_value, xp_reward) VALUES
  ('first_lesson', 'First Steps', 'Complete your first lesson', 'book', 'lessons_completed', 1, 25),
  ('lessons_3', 'Curious Mind', 'Complete 3 lessons', 'book', 'lessons_completed', 3, 50),
  ('lessons_5', 'Dedicated Learner', 'Complete 5 lessons', 'book', 'lessons_completed', 5, 75),
  ('lessons_10', 'Poetry Scholar', 'Complete 10 lessons', 'school', 'lessons_completed', 10, 100),
  ('lessons_20', 'Master of Verse', 'Complete 20 lessons', 'school', 'lessons_completed', 20, 200),
  ('streak_3', 'On a Roll', 'Maintain a 3-day streak', 'flame', 'streak', 3, 30),
  ('streak_7', 'Week Warrior', 'Maintain a 7-day streak', 'flame', 'streak', 7, 75),
  ('streak_14', 'Fortnight Poet', 'Maintain a 14-day streak', 'flame', 'streak', 14, 100),
  ('streak_30', 'Monthly Muse', 'Maintain a 30-day streak', 'flame', 'streak', 30, 200),
  ('streak_100', 'Century Streak', 'Maintain a 100-day streak', 'flame', 'streak', 100, 500),
  ('xp_100', 'Rising Star', 'Earn 100 total XP', 'star', 'xp', 100, 25),
  ('xp_500', 'Bright Spark', 'Earn 500 total XP', 'star', 'xp', 500, 75),
  ('xp_1000', 'XP Legend', 'Earn 1000 total XP', 'star', 'xp', 1000, 150),
  ('level_5', 'Level Five', 'Reach level 5', 'ribbon', 'level', 5, 50),
  ('level_10', 'Level Ten', 'Reach level 10', 'ribbon', 'level', 10, 100),
  ('level_20', 'Level Twenty', 'Reach level 20', 'ribbon', 'level', 20, 250),
  ('quiz_1', 'Quiz Taker', 'Complete your first quiz', 'help-circle', 'quizzes_completed', 1, 25),
  ('quiz_5', 'Quiz Whiz', 'Complete 5 quizzes', 'help-circle', 'quizzes_completed', 5, 75),
  ('quiz_perfect', 'Perfect Score', 'Score 100% on a quiz', 'checkmark-circle', 'quiz_perfect', 1, 100),
  ('challenge_1', 'Daily Writer', 'Complete your first daily challenge', 'create', 'challenges_completed', 1, 30),
  ('challenge_7', 'Challenge Champion', 'Complete 7 daily challenges', 'create', 'challenges_completed', 7, 100),
  ('challenge_30', 'Challenge Master', 'Complete 30 daily challenges', 'create', 'challenges_completed', 30, 250),
  ('all_lessons', 'Course Graduate', 'Complete every available lesson', 'medal', 'all_lessons', 1, 300)
ON CONFLICT (key) DO NOTHING;

-- Track streak milestones already awarded
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS streak_milestones_awarded INTEGER[] DEFAULT '{}';

CREATE TABLE IF NOT EXISTS lesson_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lesson_comments_lesson ON lesson_comments(lesson_id);

ALTER TABLE lesson_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can read lesson comments" ON lesson_comments;
CREATE POLICY "Everyone can read lesson comments" ON lesson_comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can post lesson comments" ON lesson_comments;
CREATE POLICY "Users can post lesson comments" ON lesson_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON lesson_comments;
CREATE POLICY "Users can delete own comments" ON lesson_comments
  FOR DELETE USING (auth.uid() = user_id);
