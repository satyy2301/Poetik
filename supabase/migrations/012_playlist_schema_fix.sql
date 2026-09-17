-- Align playlists / playlist_poems with app expectations

ALTER TABLE playlists ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE playlist_poems ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
ALTER TABLE playlist_poems ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

UPDATE playlist_poems SET id = gen_random_uuid() WHERE id IS NULL;
UPDATE playlist_poems SET created_at = COALESCE(created_at, NOW()) WHERE created_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_playlist_poems_id ON playlist_poems(id);

ALTER TABLE playlist_poems ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view playlist poems for their playlists" ON playlist_poems;
CREATE POLICY "Users can view playlist poems for their playlists" ON playlist_poems
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_poems.playlist_id
      AND (playlists.user_id = auth.uid() OR playlists.is_public = true)
    )
  );

DROP POLICY IF EXISTS "Users can add poems to their playlists" ON playlist_poems;
CREATE POLICY "Users can add poems to their playlists" ON playlist_poems
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_poems.playlist_id
      AND playlists.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can remove poems from their playlists" ON playlist_poems;
CREATE POLICY "Users can remove poems from their playlists" ON playlist_poems
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_poems.playlist_id
      AND playlists.user_id = auth.uid()
    )
  );
