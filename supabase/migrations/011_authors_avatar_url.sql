-- Add missing avatar_url column on authors (referenced by authorService)

ALTER TABLE authors ADD COLUMN IF NOT EXISTS avatar_url TEXT;
