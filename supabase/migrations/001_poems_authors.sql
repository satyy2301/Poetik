-- Sprint 1: Poems, authors, poem_versions schema extensions
-- Run after database_schema.sql (base tables)

-- ---------------------------------------------------------------------------
-- Authors: support canonical (public domain) + user-linked poets
-- ---------------------------------------------------------------------------
ALTER TABLE authors ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE authors ADD COLUMN IF NOT EXISTS birth_year INTEGER;
ALTER TABLE authors ADD COLUMN IF NOT EXISTS death_year INTEGER;
ALTER TABLE authors ADD COLUMN IF NOT EXISTS canonical BOOLEAN NOT NULL DEFAULT false;

-- Drop FK so canonical authors can exist without auth.users rows
ALTER TABLE authors DROP CONSTRAINT IF EXISTS authors_id_fkey;

-- Backfill user_id for existing user-author rows
UPDATE authors
SET user_id = id, canonical = false
WHERE user_id IS NULL
  AND EXISTS (SELECT 1 FROM auth.users u WHERE u.id = authors.id);

ALTER TABLE authors ALTER COLUMN id SET DEFAULT gen_random_uuid();

CREATE INDEX IF NOT EXISTS idx_authors_user_id ON authors(user_id);
CREATE INDEX IF NOT EXISTS idx_authors_canonical ON authors(canonical);
CREATE INDEX IF NOT EXISTS idx_authors_name ON authors(name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_authors_user_id_unique ON authors(user_id) WHERE user_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Poems: visibility, ingestion metadata
-- ---------------------------------------------------------------------------
ALTER TABLE poems ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'public';
ALTER TABLE poems DROP CONSTRAINT IF EXISTS poems_visibility_check;
ALTER TABLE poems ADD CONSTRAINT poems_visibility_check
  CHECK (visibility IN ('public', 'pending', 'private', 'rejected'));

ALTER TABLE poems ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE poems ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE poems ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
ALTER TABLE poems ADD COLUMN IF NOT EXISTS line_count INTEGER;
ALTER TABLE poems ADD COLUMN IF NOT EXISTS word_count INTEGER;

CREATE INDEX IF NOT EXISTS idx_poems_visibility ON poems(visibility);
CREATE INDEX IF NOT EXISTS idx_poems_form ON poems(form);
CREATE INDEX IF NOT EXISTS idx_poems_like_count ON poems(like_count DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_poems_source_dedup
  ON poems(source, source_url)
  WHERE source IS NOT NULL AND source_url IS NOT NULL AND source_url <> '';

-- ---------------------------------------------------------------------------
-- Poem versions (moderation workflow)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS poem_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poem_id UUID REFERENCES poems(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_poem_versions_status ON poem_versions(status);
CREATE INDEX IF NOT EXISTS idx_poem_versions_poem_id ON poem_versions(poem_id);

-- ---------------------------------------------------------------------------
-- RLS: poems, authors, poem_versions
-- ---------------------------------------------------------------------------
ALTER TABLE poems ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE poem_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public poems are viewable" ON poems;
CREATE POLICY "Public poems are viewable" ON poems
  FOR SELECT USING (
    visibility = 'public'
    OR author_id = auth.uid()
    OR author_id IN (SELECT id FROM authors WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert own poems" ON poems;
CREATE POLICY "Users can insert own poems" ON poems
  FOR INSERT WITH CHECK (
    author_id = auth.uid()
    OR author_id IN (SELECT id FROM authors WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update own poems" ON poems;
CREATE POLICY "Users can update own poems" ON poems
  FOR UPDATE USING (
    author_id = auth.uid()
    OR author_id IN (SELECT id FROM authors WHERE user_id = auth.uid())
    OR visibility = 'pending'
  );

DROP POLICY IF EXISTS "Authors are publicly readable" ON authors;
CREATE POLICY "Authors are publicly readable" ON authors
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own author profile" ON authors;
CREATE POLICY "Users can insert own author profile" ON authors
  FOR INSERT WITH CHECK (user_id = auth.uid() OR id = auth.uid());

DROP POLICY IF EXISTS "Users can update own author profile" ON authors;
CREATE POLICY "Users can update own author profile" ON authors
  FOR UPDATE USING (user_id = auth.uid() OR id = auth.uid());

DROP POLICY IF EXISTS "Users can view own poem versions" ON poem_versions;
CREATE POLICY "Users can view own poem versions" ON poem_versions
  FOR SELECT USING (submitted_by = auth.uid());

DROP POLICY IF EXISTS "Users can submit poem versions" ON poem_versions;
CREATE POLICY "Users can submit poem versions" ON poem_versions
  FOR INSERT WITH CHECK (submitted_by = auth.uid());

DROP POLICY IF EXISTS "Pending versions readable" ON poem_versions;
CREATE POLICY "Pending versions readable" ON poem_versions
  FOR SELECT USING (status = 'pending' OR submitted_by = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can review versions" ON poem_versions;
CREATE POLICY "Authenticated users can review versions" ON poem_versions
  FOR UPDATE USING (auth.uid() IS NOT NULL);
