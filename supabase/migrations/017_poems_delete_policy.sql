-- Owners can delete their own poems. Without a DELETE policy, RLS drops the
-- statement and PostgREST still returns success with zero rows.

DROP POLICY IF EXISTS "Users can delete own poems" ON poems;
CREATE POLICY "Users can delete own poems" ON poems
  FOR DELETE USING (
    author_id = auth.uid()
    OR author_id IN (SELECT id FROM authors WHERE user_id = auth.uid())
  );

-- Cascades into favorites and playlist rows are also checked against RLS.
-- A poem saved by someone else would otherwise block the owner's delete.
CREATE OR REPLACE FUNCTION delete_own_poem(target_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  DELETE FROM poems
  WHERE id = target_id
    AND (
      author_id = auth.uid()
      OR author_id IN (SELECT id FROM authors WHERE user_id = auth.uid())
    )
  RETURNING id INTO deleted_id;

  IF deleted_id IS NULL THEN
    RAISE EXCEPTION 'Poem was not deleted';
  END IF;

  RETURN deleted_id;
END;
$$;

GRANT EXECUTE ON FUNCTION delete_own_poem(UUID) TO authenticated;
