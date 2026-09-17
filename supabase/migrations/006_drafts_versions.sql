-- Sprint 5: Drafts and version history

CREATE TABLE IF NOT EXISTS poem_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT '',
  content TEXT DEFAULT '',
  form TEXT,
  themes TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS poem_draft_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  poem_id UUID REFERENCES poems(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  form TEXT,
  version_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_poem_drafts_user ON poem_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_poem_draft_versions_user ON poem_draft_versions(user_id);
CREATE INDEX IF NOT EXISTS idx_poem_draft_versions_poem ON poem_draft_versions(poem_id);

ALTER TABLE poem_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE poem_draft_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own drafts" ON poem_drafts;
CREATE POLICY "Users manage own drafts" ON poem_drafts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own draft versions" ON poem_draft_versions;
CREATE POLICY "Users read own draft versions" ON poem_draft_versions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own draft versions" ON poem_draft_versions;
CREATE POLICY "Users insert own draft versions" ON poem_draft_versions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
