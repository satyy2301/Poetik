-- Sprint 2: Quizzes, challenges, progress enhancements

ALTER TABLE lessons ADD COLUMN IF NOT EXISTS prerequisite_lesson_id UUID REFERENCES lessons(id);

ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS last_activity_date DATE;
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS weekly_activity JSONB DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS user_quiz_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  answers JSONB DEFAULT '[]'::jsonb,
  xp_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, quiz_id, completed_at)
);

CREATE TABLE IF NOT EXISTS user_challenges (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES daily_challenges(id) ON DELETE CASCADE,
  submission TEXT NOT NULL,
  completed BOOLEAN DEFAULT true,
  xp_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, challenge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_quiz_results_user ON user_quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_user ON user_challenges(user_id);

ALTER TABLE user_quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own quiz results" ON user_quiz_results;
CREATE POLICY "Users read own quiz results" ON user_quiz_results
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users insert own quiz results" ON user_quiz_results;
CREATE POLICY "Users insert own quiz results" ON user_quiz_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own challenges" ON user_challenges;
CREATE POLICY "Users read own challenges" ON user_challenges
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users insert own challenges" ON user_challenges;
CREATE POLICY "Users insert own challenges" ON user_challenges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Everyone can read quizzes" ON quizzes;
CREATE POLICY "Everyone can read quizzes" ON quizzes FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION increment_xp(p_user_id UUID, xp_amount INTEGER)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO user_progress (user_id, xp, progress)
  VALUES (p_user_id, xp_amount, LEAST(1.0, xp_amount::float / 100.0))
  ON CONFLICT (user_id) DO UPDATE
  SET xp = COALESCE(user_progress.xp, 0) + xp_amount,
      progress = LEAST(1.0, (COALESCE(user_progress.xp, 0) + xp_amount)::float / 100.0);
END;
$$;
