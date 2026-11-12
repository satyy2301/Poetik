-- Random position for the read feed. Keyset pagination on this column
-- walks the catalog without sorting the whole table on every request.

ALTER TABLE poems ADD COLUMN IF NOT EXISTS shuffle_key double precision;

UPDATE poems SET shuffle_key = random() WHERE shuffle_key IS NULL;

ALTER TABLE poems ALTER COLUMN shuffle_key SET DEFAULT random();

ALTER TABLE poems ALTER COLUMN shuffle_key SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_poems_public_shuffle
  ON poems (shuffle_key)
  WHERE visibility = 'public';
