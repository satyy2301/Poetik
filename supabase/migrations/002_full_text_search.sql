-- Sprint 1: Full-text search for poems

ALTER TABLE poems ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION poems_search_vector_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.content, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.themes, ' '), '')), 'C');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS poems_search_vector_trigger ON poems;
CREATE TRIGGER poems_search_vector_trigger
  BEFORE INSERT OR UPDATE OF title, content, themes ON poems
  FOR EACH ROW
  EXECUTE FUNCTION poems_search_vector_update();

UPDATE poems
SET search_vector =
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(content, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(array_to_string(themes, ' '), '')), 'C')
WHERE search_vector IS NULL;

CREATE INDEX IF NOT EXISTS idx_poems_search_vector ON poems USING GIN(search_vector);

CREATE OR REPLACE FUNCTION search_poems(
  search_query TEXT,
  form_filter TEXT DEFAULT NULL,
  theme_filter TEXT DEFAULT NULL,
  author_filter UUID DEFAULT NULL,
  result_limit INT DEFAULT 20
)
RETURNS SETOF poems
LANGUAGE sql
STABLE
AS $$
  SELECT p.*
  FROM poems p
  WHERE p.visibility = 'public'
    AND (
      search_query IS NULL
      OR btrim(search_query) = ''
      OR p.search_vector @@ websearch_to_tsquery('english', search_query)
      OR p.title ILIKE '%' || search_query || '%'
      OR p.content ILIKE '%' || search_query || '%'
    )
    AND (form_filter IS NULL OR p.form ILIKE form_filter)
    AND (theme_filter IS NULL OR theme_filter = ANY(p.themes))
    AND (author_filter IS NULL OR p.author_id = author_filter)
  ORDER BY
    CASE
      WHEN search_query IS NOT NULL AND btrim(search_query) <> ''
      THEN ts_rank(p.search_vector, websearch_to_tsquery('english', search_query))
      ELSE 0
    END DESC,
    p.created_at DESC
  LIMIT result_limit;
$$;
