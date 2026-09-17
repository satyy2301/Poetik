-- Align social table FKs: followers -> auth.users, favorite poets -> authors

-- Backfill authors.user_id for legacy rows where id matched auth user
UPDATE authors a
SET user_id = a.id
WHERE a.user_id IS NULL
  AND a.canonical = false
  AND EXISTS (SELECT 1 FROM auth.users u WHERE u.id = a.id);

-- Backfill user_id from public.users when author id differs but username matches
UPDATE authors a
SET user_id = u.id
FROM public.users u
WHERE a.user_id IS NULL
  AND a.canonical = false
  AND lower(a.name) = lower(u.username);

-- ---------------------------------------------------------------------------
-- followers: repoint from public.users to auth.users
-- ---------------------------------------------------------------------------
ALTER TABLE followers DROP CONSTRAINT IF EXISTS followers_followee_id_fkey;
ALTER TABLE followers DROP CONSTRAINT IF EXISTS followers_follower_id_fkey;

ALTER TABLE followers
  ADD CONSTRAINT followers_follower_id_fkey
  FOREIGN KEY (follower_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE followers
  ADD CONSTRAINT followers_followee_id_fkey
  FOREIGN KEY (followee_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ---------------------------------------------------------------------------
-- user_favorite_poets: repoint poet_id from users to authors
-- ---------------------------------------------------------------------------
ALTER TABLE user_favorite_poets DROP CONSTRAINT IF EXISTS user_favorite_poets_poet_id_fkey;

-- Remap poet_id values that stored auth user ids to matching author rows
UPDATE user_favorite_poets ufp
SET poet_id = a.id
FROM authors a
WHERE a.user_id = ufp.poet_id
  AND ufp.poet_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM authors x WHERE x.id = ufp.poet_id);

-- Drop rows that cannot be mapped to an author
DELETE FROM user_favorite_poets ufp
WHERE NOT EXISTS (SELECT 1 FROM authors a WHERE a.id = ufp.poet_id);

ALTER TABLE user_favorite_poets
  ADD CONSTRAINT user_favorite_poets_poet_id_fkey
  FOREIGN KEY (poet_id) REFERENCES authors(id) ON DELETE CASCADE;

-- Ensure user_id on favorites tables references auth.users
ALTER TABLE user_favorite_poets DROP CONSTRAINT IF EXISTS user_favorite_poets_user_id_fkey;
ALTER TABLE user_favorite_poems DROP CONSTRAINT IF EXISTS user_favorite_poems_user_id_fkey;

ALTER TABLE user_favorite_poets
  ADD CONSTRAINT user_favorite_poets_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_favorite_poems
  ADD CONSTRAINT user_favorite_poems_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
